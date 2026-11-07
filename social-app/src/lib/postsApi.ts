import { api, unwrapData } from "./api";

export type FeedParams = {
  only?: "following" | "me";
  hasImage?: boolean;
  page?: number;
  limit?: number;
  cursor?: string;
};

function extractList<T>(payload: unknown, keys: string[]): T[] {
  const data = unwrapData<Record<string, unknown>>(payload);
  for (const key of keys) {
    const value = data?.[key];
    if (Array.isArray(value)) return value as T[];
  }
  return Array.isArray(data) ? (data as unknown as T[]) : [];
}

function extractItem<T>(payload: unknown, keys: string[]): T {
  const data = unwrapData<Record<string, unknown>>(payload);
  for (const key of keys) {
    const value = data?.[key];
    if (value && typeof value === "object") return value as T;
  }
  return data as T;
}

function makePostForm(body?: string, image?: File | null) {
  const formData = new FormData();
  if (body?.trim()) formData.append("body", body.trim());
  if (image) formData.append("image", image);
  return formData;
}

export const postsApi = {
  async getAll<T>(page = 1, limit = 20): Promise<T[]> {
    const response = await api.get("/posts", { params: { page, limit } });
    return extractList<T>(response.data, ["posts", "items", "results"]);
  },

  async getFeed<T>(params: FeedParams = {}): Promise<T[]> {
    const response = await api.get("/posts/feed", { params });
    return extractList<T>(response.data, ["posts", "items", "results"]);
  },

  async create<T = unknown>(
    body?: string,
    image?: File | null,
    onProgress?: (progress: number) => void,
    signal?: AbortSignal,
  ): Promise<T> {
    const response = await api.post("/posts", makePostForm(body, image), {
      signal,
      onUploadProgress: onProgress
        ? (event) => {
            if (!event.total) return;
            const percent = Math.min(99, Math.max(1, Math.round((event.loaded * 100) / event.total)));
            onProgress(percent);
          }
        : undefined,
    });
    onProgress?.(100);
    return extractItem<T>(response.data, ["post", "item"]);
  },

  async getOne<T>(postId: string): Promise<T> {
    const response = await api.get(`/posts/${postId}`);
    return extractItem<T>(response.data, ["post", "item"]);
  },

  async getLikes<T>(postId: string, page = 1, limit = 20): Promise<T[]> {
    const response = await api.get(`/posts/${postId}/likes`, { params: { page, limit } });
    return extractList<T>(response.data, ["likes", "users", "items", "results"]);
  },

  async update<T = unknown>(postId: string, body?: string, image?: File | null): Promise<T> {
    const response = await api.put(`/posts/${postId}`, makePostForm(body, image));
    return extractItem<T>(response.data, ["post", "item"]);
  },

  async remove(postId: string): Promise<void> {
    await api.delete(`/posts/${postId}`);
  },

  async toggleLike(postId: string): Promise<void> {
    await api.put(`/posts/${postId}/like`);
  },

  async toggleBookmark(postId: string): Promise<void> {
    await api.put(`/posts/${postId}/bookmark`);
  },

  async share(postId: string, body: string): Promise<void> {
    await api.post(`/posts/${postId}/share`, { body: body.trim() });
  },
};
