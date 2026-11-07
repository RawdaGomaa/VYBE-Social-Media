import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { getApiError, isRequestCanceled } from "../lib/api";
import { postsApi } from "../lib/postsApi";
import { invalidateCache, setCachedData } from "../lib/queryCache";
import type { Post } from "../Components/PostCard/PostCard";
import { useAuth } from "./AuthContext";

type PostUploadContextType = {
  body: string;
  setBody: (value: string) => void;
  image: File | null;
  setImage: (file: File | null) => void;
  preview: string;
  isPosting: boolean;
  uploadProgress: number;
  error: string;
  clearError: () => void;
  createPost: () => Promise<Post | null>;
};

const PostUploadContext = createContext<PostUploadContextType | undefined>(undefined);

function getPostId(post: Post | null | undefined) {
  return post?._id ?? post?.id ?? "";
}

export function PostUploadProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [body, setBody] = useState("");
  const [image, setImageState] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const previewRef = useRef<string | null>(null);
  const activeUploadRef = useRef<Promise<Post | null> | null>(null);
  const activeUploadControllerRef = useRef<AbortController | null>(null);

  const setImage = (file: File | null) => {
    if (isPosting) return;
    setImageState(file);
  };

  useEffect(() => {
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
      previewRef.current = null;
    }

    if (!image) {
      setPreview("");
      return;
    }

    const url = URL.createObjectURL(image);
    previewRef.current = url;
    setPreview(url);

    return () => {
      // Do not revoke here if an upload is still active; the provider stays mounted
      // across navigation and owns the preview lifecycle.
      if (!isPosting && previewRef.current === url) {
        URL.revokeObjectURL(url);
        previewRef.current = null;
      }
    };
  }, [image, isPosting]);

  useEffect(() => () => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
  }, []);

  useEffect(() => {
    const stopUploadOnLogout = () => {
      activeUploadControllerRef.current?.abort();
      activeUploadControllerRef.current = null;
      activeUploadRef.current = null;
      setIsPosting(false);
      setUploadProgress(0);
      setError("");
      setBody("");
      setImageState(null);
    };

    window.addEventListener("socially:logout", stopUploadOnLogout);
    return () => window.removeEventListener("socially:logout", stopUploadOnLogout);
  }, []);

  const createPost = async (): Promise<Post | null> => {
    if (activeUploadRef.current) return activeUploadRef.current;
    if (!body.trim() && !image) return null;

    const uploadBody = body;
    const uploadImage = image;

    setIsPosting(true);
    setUploadProgress(uploadImage ? 1 : 35);
    setError("");

    const controller = new AbortController();
    activeUploadControllerRef.current = controller;

    const task = (async () => {
      try {
        const created = await postsApi.create<Post>(uploadBody, uploadImage, (progress) => {
          setUploadProgress(progress);
        }, controller.signal);

        const createdId = getPostId(created);
        if (createdId) {
          const prepend = (current: Post[] | undefined) => {
            const list = current ?? [];
            return [created, ...list.filter((item) => getPostId(item) !== createdId)];
          };

          setCachedData<Post[]>("posts:all", prepend);
          setCachedData<Post[]>("posts:me", prepend);

          const userId = user?._id ?? user?.id;
          if (userId) setCachedData<Post[]>(`profile-posts:${userId}`, prepend);
        } else {
          // Some successful create responses do not include the post object.
          // Mark relevant lists stale so they refresh silently next time they are used.
          invalidateCache((key) => key === "posts:all" || key === "posts:me" || key.startsWith("profile-posts:"));
        }

        setUploadProgress(100);
        setBody("");
        setImageState(null);
        return created ?? null;
      } catch (err) {
        if (isRequestCanceled(err)) return null;
        setError(getApiError(err));
        throw err;
      } finally {
        setIsPosting(false);
        activeUploadRef.current = null;
        if (activeUploadControllerRef.current === controller) activeUploadControllerRef.current = null;
        // Let 100% render briefly, then reset the indicator.
        window.setTimeout(() => setUploadProgress(0), 300);
      }
    })();

    activeUploadRef.current = task;
    return task;
  };

  const value = useMemo<PostUploadContextType>(() => ({
    body,
    setBody,
    image,
    setImage,
    preview,
    isPosting,
    uploadProgress,
    error,
    clearError: () => setError(""),
    createPost,
  }), [body, image, preview, isPosting, uploadProgress, error]);

  return <PostUploadContext.Provider value={value}>{children}</PostUploadContext.Provider>;
}

export function usePostUpload() {
  const context = useContext(PostUploadContext);
  if (!context) throw new Error("usePostUpload must be used inside PostUploadProvider");
  return context;
}
