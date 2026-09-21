import type { BookingInput, CarFilters } from "../types/car";

export interface FilterDraft {
  brand: string;
  price: string;
  minMileage: string;
  maxMileage: string;
}

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

export interface ValidationResult<T, Fields = T> {
  data: T | null;
  errors: FieldErrors<Fields>;
}

export function createEmptyFilterDraft(): FilterDraft {
  return { brand: "", price: "", minMileage: "", maxMileage: "" };
}

export function validateFilters(draft: FilterDraft): ValidationResult<CarFilters, FilterDraft> {
  const errors: FieldErrors<FilterDraft> = {};
  const filters: CarFilters = {};
  const brand = draft.brand.trim();
  if (brand) filters.brand = brand;

  const rawPrice = draft.price.trim();
  if (rawPrice) {
    const price = Number(rawPrice);
    if (!/^\d+(?:\.\d+)?$/.test(rawPrice) || !Number.isFinite(price) || price < 0) {
      errors.price = "Choose a valid price.";
    } else {
      filters.price = price;
    }
  }

  for (const field of ["minMileage", "maxMileage"] as const) {
    const value = draft[field].trim();
    if (!value) continue;

    if (!/^\d+$/.test(value) || !Number.isSafeInteger(Number(value))) {
      errors[field] = "Enter a whole number of kilometres, 0 or more.";
    } else {
      filters[field] = Number(value);
    }
  }

  if (
    filters.minMileage !== undefined &&
    filters.maxMileage !== undefined &&
    filters.maxMileage < filters.minMileage
  ) {
    errors.maxMileage = "Maximum mileage must be at least the minimum.";
  }

  return { data: Object.keys(errors).length ? null : filters, errors };
}

export function validateBooking(input: BookingInput): ValidationResult<BookingInput> {
  const errors: FieldErrors<BookingInput> = {};
  const name = input.name.trim();
  const email = input.email.trim();
  const comment = input.comment?.trim();

  if (!name) {
    errors.name = "Name is required.";
  } else if (!/\p{L}/u.test(name)) {
    errors.name = "Enter your name.";
  }

  if (!email) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  return {
    data: Object.keys(errors).length ? null : { name, email, ...(comment ? { comment } : {}) },
    errors,
  };
}
