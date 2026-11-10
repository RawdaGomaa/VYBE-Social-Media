
import axios from "axios";

export const API_BASE_URL = "https://route-posts.routemisr.com";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach authentication token to requests.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Check canceled requests.
export function isRequestCanceled(error: unknown): boolean {
  return (
    axios.isCancel(error) ||
    (axios.isAxiosError(error) && error.code === "ERR_CANCELED")
  );
}

// Safely extract messages from API responses.
function extractMessages(value: unknown): string[] {
  if (typeof value === "string") {
    return value.trim() ? [value.trim()] : [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => extractMessages(item));
  }

  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;

    if (typeof obj.message === "string") {
      return extractMessages(obj.message);
    }

    if (typeof obj.msg === "string") {
      return extractMessages(obj.msg);
    }

    return Object.values(obj).flatMap((item) =>
      extractMessages(item)
    );
  }

  return [];
}

// Get clean and user-friendly API error messages.
export function getApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | {
          message?: unknown;
          errors?: unknown;
        }
      | undefined;

    const status = error.response?.status;

    // Detect technical password validation errors.
    const rawResponse = JSON.stringify(data ?? "").toLowerCase();

    if (
      rawResponse.includes("password") &&
      (
        rawResponse.includes("required pattern") ||
        rawResponse.includes("fails to match") ||
        rawResponse.includes("regex")
      )
    ) {
      return "Invalid password format. Please check your password requirements.";
    }

    // Handle incorrect login credentials.
    if (status === 401) {
      return "Incorrect email or password. Please try again.";
    }

    // Handle validation errors.
    const validationErrors = extractMessages(data?.errors);

    if (validationErrors.length > 0) {
      return [...new Set(validationErrors)].join(" - ");
    }

    // Handle normal API messages.
    const messages = extractMessages(data?.message);

    if (messages.length > 0) {
      return [...new Set(messages)].join(" - ");
    }

    // Handle HTTP status codes.
    if (status === 400) {
      return "Invalid request. Please check your information.";
    }

    if (status === 403) {
      return "You are not allowed to perform this action.";
    }

    if (status === 404) {
      return "Account not found. Please check your details.";
    }

    if (status === 422) {
      return "Invalid information. Please check your input.";
    }

    if (status !== undefined && status >= 500) {
      return "Something went wrong on our server. Please try again later.";
    }

    if (error.code === "ERR_NETWORK") {
      return "Connection failed. Please check your internet connection.";
    }

    return "Unable to complete your request. Please try again.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

// Extract data from API responses.
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
