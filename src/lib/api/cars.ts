import type {
  BookingInput,
  BookingResponse,
  Car,
  CarFilters,
  CarsResponse,
  FilterOptions,
} from "../../types/car";
import { ApiError, apiRequest } from "./client";

export const CARS_PER_PAGE = 12;

type CarResponse = Omit<Car, "rentalPrice" | "fuelConsumption"> & {
  rentalPrice: number | string;
  fuelConsumption: number | string;
};

type CarsApiResponse = Omit<CarsResponse, "cars"> & { cars: CarResponse[] };

function normalizeNumber(value: number | string): number {
  const parsed = typeof value === "string" && value.trim() ? Number(value) : value;
  if (typeof parsed !== "number" || !Number.isFinite(parsed) || parsed < 0) {
    throw new ApiError(502, "The server returned invalid car data. Please try again.");
  }
  return parsed;
}

function normalizeCar(car: CarResponse): Car {
  if (!car || typeof car !== "object" || typeof car.id !== "string") {
    throw new ApiError(502, "The server returned invalid car data. Please try again.");
  }
  return {
    ...car,
    rentalPrice: normalizeNumber(car.rentalPrice),
    fuelConsumption: normalizeNumber(car.fuelConsumption),
  };
}

export async function getCars(
  filters: CarFilters = {},
  page = 1,
  signal?: AbortSignal,
): Promise<CarsResponse> {
  const params = new URLSearchParams({ page: String(page), perPage: String(CARS_PER_PAGE) });

  if (filters.brand?.trim()) params.set("brand", filters.brand.trim());
  for (const key of ["price", "minMileage", "maxMileage"] as const) {
    if (filters[key] !== undefined) params.set(key, String(filters[key]));
  }

  const response = await apiRequest<CarsApiResponse>(`/cars?${params}`, { signal });
  if (!Array.isArray(response.cars)) {
    throw new ApiError(502, "The server returned invalid catalog data. Please try again.");
  }
  return { ...response, cars: response.cars.map(normalizeCar) };
}

export async function getCar(id: string, signal?: AbortSignal): Promise<Car> {
  const car = await apiRequest<CarResponse>(`/cars/${encodeURIComponent(id)}`, {
    cache: "no-store",
    signal,
  });
  return normalizeCar(car);
}

export async function getFilters(signal?: AbortSignal): Promise<FilterOptions> {
  const filters = await apiRequest<FilterOptions>("/cars/filters", { signal });
  if (
    !Array.isArray(filters.brands) ||
    !filters.brands.every((brand) => typeof brand === "string" && brand.trim()) ||
    !filters.price ||
    typeof filters.price.min !== "number" ||
    typeof filters.price.max !== "number" ||
    !Number.isFinite(filters.price.min) ||
    !Number.isFinite(filters.price.max) ||
    filters.price.min < 0 ||
    filters.price.max < filters.price.min
  ) {
    throw new ApiError(502, "The server returned invalid filter options. Please try again.");
  }
  return filters;
}

export async function createBookingRequest(
  carId: string,
  input: BookingInput,
  signal?: AbortSignal,
): Promise<BookingResponse> {
  const comment = input.comment?.trim();
  const payload: BookingInput = {
    name: input.name.trim(),
    email: input.email.trim(),
    ...(comment ? { comment } : {}),
  };
  const response = await apiRequest<BookingResponse>(
    `/cars/${encodeURIComponent(carId)}/booking-requests`,
    { method: "POST", body: JSON.stringify(payload), signal },
  );

  if (typeof response.message !== "string" || !response.message.trim()) {
    throw new ApiError(502, "The server did not confirm your booking request. Please try again.");
  }
  return response;
}
