import type { Car } from "../types/car";

const integerFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatNumber(value: number): string {
  return integerFormatter.format(value).replaceAll(",", " ");
}

export function formatMileage(value: number): string {
  return `${formatNumber(value)} km`;
}

export function formatPrice(value: number): string {
  return priceFormatter.format(value);
}

export function formatLocation(location: Car["location"]): string {
  return [location.city, location.country].filter(Boolean).join(", ");
}
