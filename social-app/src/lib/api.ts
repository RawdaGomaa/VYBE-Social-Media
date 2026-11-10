
import axios from "axios";

export const API_BASE_URL = "https://route-posts.routemisr.com";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
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
    return value.trim() ? [value.trim()] : [];
  }

  if (Array.isArray(value)) {
    return value.flatMap(extractMessages);
  }

  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;

    // Prefer common message fields.
    if (typeof obj.message === "string") {
      return extractMessages(obj.message);
    }

    if (typeof obj.msg === "string") {
      return extractMessages(obj.msg);
    }

    return Object.values(obj).flatMap(extractMessages);
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

    // Handle validation errors.
    const validationErrors = extractMessages(data?.errors);

    if (validationErrors.length > 0) {
      return [...new Set(validationErrors)].join(" - ");
    }

    // Handle API messages.
    const messages = extractMessages(data?.message);

    if (messages.length > 0) {
      return [...new Set(messages)].join(" - ");
    }

    // Handle HTTP status codes safely.
    const status = error.response?.status;

    if (status === 400) {
      return "Invalid request. Please check your information.";
    }

    if (status === 401) {
      return "Invalid email or password. Please try again.";
    }

    if (status === 403) {
      return "You are not allowed to perform this action.";
    }

    if (status === 404) {
      return "The requested resource was not found.";
    }

    if (status === 422) {
      return "Please check your submitted information.";
    }

    if (status !== undefined && status >= 500) {
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
  if (
    payload !== null &&
    typeof payload === "object" &&
    "data" in payload
  ) {
    const response = payload as { data?: T };
    return (response.data ?? payload) as T;
  }

  return payload as T;
}
