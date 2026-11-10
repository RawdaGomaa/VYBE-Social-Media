
import axios from "axios";

export const API_BASE_URL = "https://route-posts.routemisr.com";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export function isRequestCanceled(error: unknown): boolean {
  return (
    axios.isCancel(error) ||
    (axios.isAxiosError(error) && error.code === "ERR_CANCELED")
  );
}

// Safely extract messages from different API response formats.
function extractMessages(value: unknown): string[] {
  if (typeof value === "string") {
    return value.trim() ? [value] : [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => extractMessages(item));
  }

  if (value && typeof value === "object") {
    return Object.values(value).flatMap((item) =>
      extractMessages(item)
    );
  }

  return [];
}

export function getApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | {
          message?: unknown;
          errors?: unknown;
        }
      | undefined;

    // Handle validation errors whether they are arrays,
    // objects, or strings.
    const validationErrors = extractMessages(data?.errors);

    if (validationErrors.length > 0) {
      return [...new Set(validationErrors)].join(" - ");
    }

    // Handle normal API messages.
    const message = extractMessages(data?.message);

    if (message.length > 0) {
      return message.join(" - ");
    }

    if (error.response?.status === 401) {
      return "Invalid email or password. Please try again.";
    }

    if (error.response?.status === 404) {
      return "The requested resource was not found.";
    }

    if (error.response?.status >= 500) {
      return "Server error. Please try again later.";
    }

    if (error.code === "ERR_NETWORK") {
      return "Network error. Please check your internet connection.";
    }

    return error.message || "Request failed. Please try again.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

export function unwrapData<T>(payload: unknown): T {
  const p = payload as { data?: T };

  return (p?.data ?? payload) as T;
}
