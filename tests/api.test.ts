import assert from "node:assert/strict";
import test from "node:test";
import { ApiError, getErrorMessage } from "../src/lib/api/client";
import { createBookingRequest, getCar, getCars, getFilters } from "../src/lib/api/cars";

const car = {
  id: "sample-car-id",
  stockNumber: 6240,
  year: 2020,
  brand: "Kia",
  model: "Rio",
  type: "Sedan, Hatchback",
  img: "https://ac.goit.global/car-rental-task/9630-ai.jpg",
  description: "A comfortable city car.",
  fuelConsumption: "6.2",
  engine: "1.6L 4-cylinder",
  rentalPrice: "50",
  rentalCompany: "Economy Car Rentals",
  rentalConditions: ["Valid driver's license"],
  mileage: 6234,
  features: ["Rearview camera"],
  location: { city: "Kharkiv", country: "Ukraine", address: "321 Example Lane" },
  createdAt: "2026-02-16T22:00:36.188Z",
  updatedAt: "2026-02-16T22:00:39.547Z",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

test("catalog sends active backend filters, retains zero bounds, and normalizes numbers", async (t) => {
  const controller = new AbortController();
  t.mock.method(globalThis, "fetch", async (input: string, init: RequestInit) => {
    const url = new URL(input);
    assert.equal(url.pathname, "/cars");
    assert.deepEqual(Object.fromEntries(url.searchParams), {
      page: "2", perPage: "12", brand: "Land Rover", price: "80", minMileage: "0", maxMileage: "7000",
    });
    assert.equal(init.signal, controller.signal);
    return json({ cars: [car], totalCars: 13, totalPages: 2, page: 2, perPage: 12 });
  });
  const response = await getCars(
    { brand: "Land Rover", price: 80, minMileage: 0, maxMileage: 7000 },
    2,
    controller.signal,
  );
  assert.equal(response.cars[0].rentalPrice, 50);
  assert.equal(response.cars[0].fuelConsumption, 6.2);
  assert.equal(response.page, 2);
});

test("unset catalog filters are omitted and zero results remain successful", async (t) => {
  t.mock.method(globalThis, "fetch", async (input: string) => {
    assert.deepEqual(Object.fromEntries(new URL(input).searchParams), { page: "1", perPage: "12" });
    return json({ cars: [], totalCars: 0, totalPages: 0, page: 1, perPage: 12 });
  });
  assert.deepEqual((await getCars({ brand: "  " })).cars, []);
});

test("detail requests encode the identifier and opt out of server caching", async (t) => {
  t.mock.method(globalThis, "fetch", async (input: string, init: RequestInit) => {
    assert.ok(input.endsWith("/cars/id%2Fwith%20spaces"));
    assert.equal(init.cache, "no-store");
    return json({ ...car, fuelConsumption: 6.2 });
  });
  assert.equal((await getCar("id/with spaces")).fuelConsumption, 6.2);
});

test("filter metadata comes from the dedicated API endpoint", async (t) => {
  const filters = { brands: ["Kia", "Volvo"], price: { min: 30, max: 80 } };
  t.mock.method(globalThis, "fetch", async (input: string) => {
    assert.ok(input.endsWith("/cars/filters"));
    return json(filters);
  });
  assert.deepEqual(await getFilters(), filters);
});

test("invalid filter metadata is a recoverable API error", async (t) => {
  t.mock.method(globalThis, "fetch", async () => json({ brands: ["Kia"], price: { min: 80, max: 30 } }));
  await assert.rejects(getFilters(), (error: unknown) => error instanceof ApiError && error.status === 502);
});

test("booking posts only normalized documented fields and returns backend confirmation", async (t) => {
  t.mock.method(globalThis, "fetch", async (input: string, init: RequestInit) => {
    assert.ok(input.endsWith("/cars/sample-car-id/booking-requests"));
    assert.equal(init.method, "POST");
    assert.equal(new Headers(init.headers).get("Content-Type"), "application/json");
    assert.deepEqual(JSON.parse(String(init.body)), { name: "Олена", email: "olena@example.com" });
    return json({ message: "Your request was accepted." }, 201);
  });
  assert.deepEqual(
    await createBookingRequest(car.id, { name: " Олена ", email: " olena@example.com ", comment: "  " }),
    { message: "Your request was accepted." },
  );
});

test("HTTP validation errors preserve status and useful nested detail", async (t) => {
  t.mock.method(globalThis, "fetch", async () => json({
    message: "Validation failed",
    validation: { query: { message: "Maximum mileage must be at least the minimum." } },
  }, 400));
  await assert.rejects(getCars(), (error: unknown) => {
    assert.ok(error instanceof ApiError);
    assert.equal(error.status, 400);
    assert.equal(error.message, "Maximum mileage must be at least the minimum.");
    return true;
  });
});

test("missing detail preserves the 404 error for route-level handling", async (t) => {
  t.mock.method(globalThis, "fetch", async () => json({ message: "Car not found" }, 404));
  await assert.rejects(getCar("missing"), (error: unknown) => error instanceof ApiError && error.status === 404);
});

test("network failures become readable errors and cancellation stays cancellation", async (t) => {
  const fetchMock = t.mock.method(globalThis, "fetch", async () => { throw new TypeError("fetch failed"); });
  await assert.rejects(getCars(), (error: unknown) => error instanceof ApiError && error.status === 0);
  const abortError = new DOMException("Aborted", "AbortError");
  fetchMock.mock.mockImplementation(async () => { throw abortError; });
  await assert.rejects(getCars(), (error: unknown) => error === abortError);
});

test("malformed successful data and HTML errors never become empty catalog success", async (t) => {
  const fetchMock = t.mock.method(globalThis, "fetch", async () => new Response("<h1>Unavailable</h1>", { status: 503 }));
  await assert.rejects(getCars(), (error: unknown) => error instanceof ApiError && error.status === 503 && !error.message.includes("<h1>"));
  fetchMock.mock.mockImplementation(async () => json({ cars: [{ ...car, rentalPrice: "invalid" }] }));
  await assert.rejects(getCars(), (error: unknown) => error instanceof ApiError);
  assert.equal(getErrorMessage(null, "Try again"), "Try again");
});
