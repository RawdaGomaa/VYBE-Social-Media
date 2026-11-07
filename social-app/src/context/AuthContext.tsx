import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { getApiError, isRequestCanceled } from "../lib/api";
import { usersApi, type SignupPayload } from "../lib/usersApi";
import { postsApi } from "../lib/postsApi";
import { setCachedData } from "../lib/queryCache";
import { prepareProfilePhoto } from "../lib/imageUpload";
import type { Post } from "../Components/PostCard/PostCard";

export type User = {
  _id?: string;
  id?: string;
  name?: string;
  username?: string;
  email?: string;
  photo?: string;
  profilePhoto?: string;
  image?: string;
  dateOfBirth?: string;
  gender?: string;
  followersCount?: number;
  followingCount?: number;
  isFollowing?: boolean;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  token: string | null;
  login: (login: string, password: string) => Promise<void>;
  registerUser: (values: SignupPayload) => Promise<void>;
  changePassword: (password: string, newPassword: string) => Promise<void>;
  uploadProfilePhoto: (photo: File) => Promise<void>;
  isUploadingProfilePhoto: boolean;
  profilePhotoUploadProgress: number;
  profilePhotoPreview: string | null;
  logout: () => void;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const getPhoto = (profile?: User | null) => profile?.photo ?? profile?.profilePhoto ?? profile?.image ?? null;
const getUserId = (profile?: User | null) => profile?._id ?? profile?.id ?? "";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) as User : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(Boolean(token));
  const [isUploadingProfilePhoto, setIsUploadingProfilePhoto] = useState(false);
  const [profilePhotoUploadProgress, setProfilePhotoUploadProgress] = useState(0);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  const profilePhotoPreviewRef = useRef<string | null>(null);
  const activeProfilePhotoTaskRef = useRef<Promise<void> | null>(null);
  const profilePhotoPostControllerRef = useRef<AbortController | null>(null);

  const saveUser = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  const persistAuth = (newToken: string, newUser?: User) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    if (newUser) saveUser(newUser);
  };

  const refreshProfile = async () => {
    if (!localStorage.getItem("token")) return;
    try {
      const profile = await usersApi.getMyProfile();
      saveUser(profile);
    } catch {
      // Keep the cached user so a temporary network problem does not log the user out.
    }
  };

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    refreshProfile().finally(() => setLoading(false));
  }, [token]);

  const login = async (loginValue: string, password: string) => {
    try {
      const auth = await usersApi.signin(loginValue, password);
      persistAuth(auth.token, auth.user);
      await refreshProfile();
    } catch (error) {
      throw new Error(getApiError(error) === "Something went wrong" && error instanceof Error ? error.message : getApiError(error));
    }
  };

  const registerUser = async (values: SignupPayload) => {
    try {
      const auth = await usersApi.signup(values);
      persistAuth(auth.token, auth.user);
      await refreshProfile();
    } catch (error) {
      throw new Error(getApiError(error) === "Something went wrong" && error instanceof Error ? error.message : getApiError(error));
    }
  };

  const changePassword = async (password: string, newPassword: string) => {
    try {
      const auth = await usersApi.changePassword(password, newPassword);
      persistAuth(auth.token, auth.user);
      await refreshProfile();
    } catch (error) {
      throw new Error(getApiError(error) === "Something went wrong" && error instanceof Error ? error.message : getApiError(error));
    }
  };

  const clearProfilePhotoPreview = () => {
    if (profilePhotoPreviewRef.current) {
      URL.revokeObjectURL(profilePhotoPreviewRef.current);
      profilePhotoPreviewRef.current = null;
    }
    setProfilePhotoPreview(null);
  };

  const publishProfilePhotoPost = (photo: File, author: User) => {
    // Detached from the Profile page so navigation does not cancel it.
    // Logout, however, explicitly aborts this request.
    profilePhotoPostControllerRef.current?.abort();
    const controller = new AbortController();
    profilePhotoPostControllerRef.current = controller;

    void (async () => {
      try {
        const rawCreated = await postsApi.create<Post>("updated profile picture.", photo, undefined, controller.signal);
        const created: Post = {
          ...rawCreated,
          user: rawCreated?.user ?? rawCreated?.creator ?? author,
          creator: rawCreated?.creator ?? rawCreated?.user ?? author,
        };
        const createdId = created?._id ?? created?.id;
        if (!createdId) return;

        const prepend = (current: Post[] | undefined) => {
          const list = current ?? [];
          return [created, ...list.filter((item) => (item._id ?? item.id) !== createdId)];
        };

        setCachedData<Post[]>("posts:all", prepend);
        setCachedData<Post[]>("posts:me", prepend);
        const authorId = getUserId(author);
        if (authorId) setCachedData<Post[]>(`profile-posts:${authorId}`, prepend);
      } catch (error) {
        if (!isRequestCanceled(error)) {
          // Profile-photo upload has already succeeded. A post failure must never
          // return the photo controls to a permanent loading state.
          console.error("Could not publish profile photo post", error);
        }
      } finally {
        if (profilePhotoPostControllerRef.current === controller) {
          profilePhotoPostControllerRef.current = null;
        }
      }
    })();
  };

  const uploadProfilePhoto = (photo: File): Promise<void> => {
    if (activeProfilePhotoTaskRef.current) return activeProfilePhotoTaskRef.current;

    clearProfilePhotoPreview();
    const previewUrl = URL.createObjectURL(photo);
    profilePhotoPreviewRef.current = previewUrl;
    setProfilePhotoPreview(previewUrl);
    setIsUploadingProfilePhoto(true);
    setProfilePhotoUploadProgress(1);

    const previousUser = user;
    const previousPhoto = getPhoto(previousUser);

    const task = (async () => {
      try {
        // Large screenshots were the main reason uploads appeared to freeze around
        // a small percentage. Resize/compress the avatar before sending it.
        const uploadFile = await prepareProfilePhoto(photo);

        let reachedHundred = false;
        let uploadResolved = false;
        let uploadFailure: unknown = null;

        const uploadRequest = usersApi
          .uploadProfilePhoto(uploadFile, (progress) => {
            if (progress >= 100) reachedHundred = true;
            setProfilePhotoUploadProgress(progress);
          })
          .then(() => {
            uploadResolved = true;
            reachedHundred = true;
            setProfilePhotoUploadProgress(100);
          })
          .catch((error) => {
            uploadFailure = error;
          });

        // IMPORTANT: do not start the confirmation timeout while the browser is
        // still uploading bytes. The previous implementation stopped checking after
        // 30 seconds even at 14%, which produced a false "Could not confirm" error.
        // Wait for either the HTTP request to finish or all request bytes to reach
        // the server. The API request itself has a 3-minute network timeout.
        const transferStartedAt = Date.now();
        while (!uploadResolved && !reachedHundred && !uploadFailure) {
          if (Date.now() - transferStartedAt > 180_000) {
            throw new Error("The profile photo upload is taking too long. Please try a smaller image or check your connection.");
          }
          await sleep(250);
        }

        if (uploadFailure && !reachedHundred) throw uploadFailure;

        // Once bytes are on the server, /profile-data is the authoritative way to
        // confirm the photo because PUT /upload-photo intentionally returns no body
        // and can take a little longer while R2 finishes processing.
        let verifiedProfile: User | null = null;
        const verificationStartedAt = Date.now();
        while (Date.now() - verificationStartedAt < 45_000) {
          try {
            const profile = await usersApi.getMyProfile();
            const newPhoto = getPhoto(profile);
            if (newPhoto && newPhoto !== previousPhoto) {
              verifiedProfile = profile;
              break;
            }

            // A successful PUT is also valid confirmation. The image URL can remain
            // the same if the backend overwrites the same R2 object/cache key.
            if (uploadResolved) {
              verifiedProfile = profile;
              break;
            }
          } catch {
            // Keep checking for a short processing window.
          }
          await sleep(1_000);
        }

        // If upload reached 100% but its response is still open, give it a little
        // more time in parallel with one last profile-data read.
        if (!verifiedProfile && reachedHundred) {
          await Promise.race([uploadRequest, sleep(8_000)]);
          try {
            const profile = await usersApi.getMyProfile();
            const newPhoto = getPhoto(profile);
            if (newPhoto || uploadResolved) verifiedProfile = profile;
          } catch {
            // handled below
          }
        }

        if (!verifiedProfile) {
          if (uploadFailure) throw uploadFailure;
          throw new Error("The image reached the server, but the profile update could not be confirmed. Please try again.");
        }

        saveUser(verifiedProfile);
        setProfilePhotoUploadProgress(100);
        setIsUploadingProfilePhoto(false);
        clearProfilePhotoPreview();

        // Use the same optimized image for the automatic profile-photo post. This
        // keeps the second upload fast as well.
        publishProfilePhotoPost(uploadFile, verifiedProfile);
      } catch (error) {
        setIsUploadingProfilePhoto(false);
        setProfilePhotoUploadProgress(0);
        clearProfilePhotoPreview();
        throw new Error(getApiError(error));
      } finally {
        activeProfilePhotoTaskRef.current = null;
        window.setTimeout(() => setProfilePhotoUploadProgress(0), 500);
      }
    })();

    activeProfilePhotoTaskRef.current = task;
    return task;
  };

  const logout = () => {
    // Stop every post upload before removing auth. This includes both a normal
    // Create Post upload (handled by PostUploadProvider) and the automatic
    // profile-photo post running here.
    window.dispatchEvent(new Event("socially:logout"));
    profilePhotoPostControllerRef.current?.abort();
    profilePhotoPostControllerRef.current = null;

    clearProfilePhotoPreview();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      registerUser,
      changePassword,
      uploadProfilePhoto,
      isUploadingProfilePhoto,
      profilePhotoUploadProgress,
      profilePhotoPreview,
      logout,
      refreshProfile,
    }),
    [user, token, loading, isUploadingProfilePhoto, profilePhotoUploadProgress, profilePhotoPreview],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
