import { api } from "./api";
import type { User } from "../context/AuthContext";

export type SignupPayload = {
  name: string;
  username: string;
  email: string;
  dateOfBirth: string;
  gender: "male" | "female";
  password: string;
  rePassword: string;
};

export type AuthResult = {
  token: string;
  user?: User;
};

function rootData(payload: unknown): Record<string, unknown> {
  if (!payload || typeof payload !== "object") return {};
  const root = payload as Record<string, unknown>;
  const nested = root.data;
  return nested && typeof nested === "object" ? nested as Record<string, unknown> : root;
}

function parseAuth(payload: unknown): AuthResult {
  const data = rootData(payload);
  const token = (data.token ?? data.accessToken) as string | undefined;
  const possibleUser = data.user ?? data.profile;

  if (!token) throw new Error("The API did not return an authentication token");

  return {
    token,
    user: possibleUser && typeof possibleUser === "object" ? possibleUser as User : undefined,
  };
}

export function extractUser(payload: unknown): User {
  const data = rootData(payload);
  const possibleUser = data.user ?? data.profile ?? data;
  return possibleUser as User;
}

export function extractUsers(payload: unknown): User[] {
  const data = rootData(payload);
  const list = data.users ?? data.suggestions ?? data.items ?? data.results ?? data;
  return Array.isArray(list) ? list as User[] : [];
}

export function extractList<T>(payload: unknown, keys: string[]): T[] {
  const data = rootData(payload);
  for (const key of keys) {
    const candidate = data[key];
    if (Array.isArray(candidate)) return candidate as T[];
  }
  return Array.isArray(data) ? data as unknown as T[] : [];
}

export const usersApi = {
  async signup(payload: SignupPayload): Promise<AuthResult> {
    const response = await api.post("/users/signup", payload);
    return parseAuth(response.data);
  },

  async signin(login: string, password: string): Promise<AuthResult> {
    const response = await api.post("/users/signin", { login, password });
    return parseAuth(response.data);
  },

  async changePassword(password: string, newPassword: string): Promise<AuthResult> {
    const response = await api.patch("/users/change-password", { password, newPassword });
    return parseAuth(response.data);
  },

  async uploadProfilePhoto(photo: File, onProgress?: (progress: number) => void): Promise<void> {
    const formData = new FormData();
    // Route Posts docs require multipart/form-data with the field name exactly `photo`.
    // Do not set Content-Type manually; Axios/browser must add the multipart boundary.
    formData.append("photo", photo, photo.name);

    await api.put("/users/upload-photo", formData, {
      // Image uploads can be slower than normal JSON requests. A short timeout was
      // causing valid uploads to be treated as failed around 10–20% on slower links.
      timeout: 180_000,
      onUploadProgress: onProgress
        ? (event) => {
            if (!event.total) return;
            const percent = Math.min(100, Math.max(1, Math.round((event.loaded * 100) / event.total)));
            onProgress(percent);
          }
        : undefined,
    });
    onProgress?.(100);
  },

  async getMyProfile(): Promise<User> {
    const response = await api.get("/users/profile-data");
    return extractUser(response.data);
  },

  async getBookmarks<T>(): Promise<T[]> {
    const response = await api.get("/users/bookmarks");
    return extractList<T>(response.data, ["posts", "bookmarks", "items", "results"]);
  },

  async getFollowSuggestions(page = 1, limit = 10): Promise<User[]> {
    const response = await api.get("/users/suggestions", { params: { page, limit } });
    return extractUsers(response.data);
  },

  async getUserProfile(userId: string): Promise<User> {
    const response = await api.get(`/users/${userId}/profile`);
    return extractUser(response.data);
  },

  async toggleFollow(userId: string): Promise<void> {
    await api.put(`/users/${userId}/follow`);
  },

  async getUserPosts<T>(userId: string): Promise<T[]> {
    const response = await api.get(`/users/${userId}/posts`);
    return extractList<T>(response.data, ["posts", "items", "results"]);
  },
};
