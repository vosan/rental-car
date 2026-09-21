import assert from "node:assert/strict";
import test from "node:test";
import { createEmptyFilterDraft, validateBooking, validateFilters } from "../src/lib/validation";
import { formatLocation, formatMileage, formatPrice } from "../src/lib/formatters";

test("empty filters stay absent, while a typed zero remains a valid bound", () => {
  const draft = createEmptyFilterDraft();
  assert.deepEqual(validateFilters(draft), { data: {}, errors: {} });
  assert.deepEqual(validateFilters({ ...draft, minMileage: "0" }).data, { minMileage: 0 });
  assert.deepEqual(validateFilters({ ...draft, maxMileage: "4000" }).data, { maxMileage: 4000 });
});

test("filter validation preserves case-sensitive brand and equal mileage bounds", () => {
  assert.deepEqual(validateFilters({ brand: " Land Rover ", price: "80", minMileage: "6234", maxMileage: "6234" }).data, {
    brand: "Land Rover", price: 80, minMileage: 6234, maxMileage: 6234,
  });
});

test("invalid numbers and reversed bounds prevent filter submission", () => {
  for (const minMileage of ["-1", "1.5", "1e3", "NaN", "4km", "Infinity", "9007199254740992"]) {
    const result = validateFilters({ ...createEmptyFilterDraft(), minMileage });
    assert.equal(result.data, null, minMileage);
    assert.ok(result.errors.minMileage);
  }
  const reversed = validateFilters({ ...createEmptyFilterDraft(), minMileage: "7000", maxMileage: "4000" });
  assert.equal(reversed.data, null);
  assert.ok(reversed.errors.maxMileage);
  assert.equal(validateFilters({ ...createEmptyFilterDraft(), price: "-30" }).data, null);
});

test("booking trims fields, supports international names, and omits blank comments", () => {
  for (const name of ["Олена Коваль", "李明", "José O’Neill", "Anne-Marie"]) {
    assert.deepEqual(validateBooking({ name: ` ${name} `, email: " test@example.com ", comment: " " }), {
      data: { name, email: "test@example.com" }, errors: {},
    });
  }
  assert.equal(validateBooking({ name: "Jane", email: "jane@example.com", comment: " With child seat " }).data?.comment, "With child seat");
});

test("booking catches missing or invalid name/email without requiring comments", () => {
  const missing = validateBooking({ name: " ", email: " " });
  assert.equal(missing.data, null);
  assert.ok(missing.errors.name);
  assert.ok(missing.errors.email);
  assert.equal(missing.errors.comment, undefined);
  assert.ok(validateBooking({ name: "123", email: "test@example.com" }).errors.name);
  for (const email of ["missing-at", "two@@example.com", "space @example.com", "user@host"]) {
    assert.ok(validateBooking({ name: "Jane", email }).errors.email, email);
  }
});

test("display formatting keeps design mileage grouping and dollar precision", () => {
  assert.equal(formatMileage(6234), "6 234 km");
  assert.equal(formatMileage(0), "0 km");
  assert.equal(formatPrice(50), "$50");
  assert.equal(formatPrice(50.5), "$50.5");
  assert.equal(formatLocation({ city: "Kyiv", country: "Ukraine", address: "Street 1" }), "Kyiv, Ukraine");
});
