export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "https://car-rental-api.goit.study"
).replace(/\/+$/, "");

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readApiMessage(body: unknown, fallback: string): string {
  if (!isRecord(body)) return fallback;

  // The API's useful validation message is nested below the generic message.
  if (isRecord(body.validation)) {
    for (const detail of Object.values(body.validation)) {
      if (isRecord(detail) && typeof detail.message === "string" && detail.message.trim()) {
        return detail.message;
      }
    }
  }

  return typeof body.message === "string" && body.message.trim()
    ? body.message
    : fallback;
}

export function getErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  return error instanceof Error && error.message.trim() ? error.message : fallback;
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  try {
    const response = await fetch(`${API_URL}${path}`, { ...init, headers });
    const rawBody = await response.text();
    let body: unknown;

    try {
      body = rawBody ? JSON.parse(rawBody) : undefined;
    } catch {
      // Gateways may return HTML instead of the API's normal JSON error body.
      if (response.ok) {
        throw new ApiError(response.status, "The server returned an invalid response. Please try again.");
      }
    }

    if (!response.ok) {
      const fallback = response.status === 404
        ? "Car not found."
        : "The request could not be completed. Please try again.";
      throw new ApiError(response.status, readApiMessage(body, fallback));
    }

    if (body === undefined || body === null) {
      throw new ApiError(response.status, "The server returned an empty response. Please try again.");
    }

    return body as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (init.signal?.aborted || (error instanceof Error && error.name === "AbortError")) {
      throw error;
    }
    throw new ApiError(0, "Unable to reach the server. Check your connection and try again.");
  }
}
