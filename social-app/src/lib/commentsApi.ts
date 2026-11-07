import { api, unwrapData } from "./api";

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

function makeCommentForm(content?: string, image?: File | null) {
  const formData = new FormData();
  if (content?.trim()) formData.append("content", content.trim());
  if (image) formData.append("image", image);
  return formData;
}

export const commentsApi = {
  async getPostComments<T>(postId: string, page = 1, limit = 10): Promise<T[]> {
    const response = await api.get(`/posts/${postId}/comments`, { params: { page, limit } });
    return extractList<T>(response.data, ["comments", "items", "results"]);
  },

  async createComment<T = unknown>(postId: string, content?: string, image?: File | null): Promise<T> {
    const response = await api.post(`/posts/${postId}/comments`, makeCommentForm(content, image));
    return extractItem<T>(response.data, ["comment", "item"]);
  },

  async getReplies<T>(postId: string, commentId: string, page = 1, limit = 10): Promise<T[]> {
    const response = await api.get(`/posts/${postId}/comments/${commentId}/replies`, { params: { page, limit } });
    return extractList<T>(response.data, ["replies", "comments", "items", "results"]);
  },

  async createReply<T = unknown>(postId: string, commentId: string, content?: string, image?: File | null): Promise<T> {
    const response = await api.post(`/posts/${postId}/comments/${commentId}/replies`, makeCommentForm(content, image));
    return extractItem<T>(response.data, ["reply", "comment", "item"]);
  },

  async updateComment<T = unknown>(postId: string, commentId: string, content?: string, image?: File | null): Promise<T> {
    const response = await api.put(`/posts/${postId}/comments/${commentId}`, makeCommentForm(content, image));
    return extractItem<T>(response.data, ["comment", "reply", "item"]);
  },

  async deleteComment(postId: string, commentId: string): Promise<void> {
    await api.delete(`/posts/${postId}/comments/${commentId}`);
  },

  async toggleLike(postId: string, commentId: string): Promise<void> {
    await api.put(`/posts/${postId}/comments/${commentId}/like`);
  },
};
