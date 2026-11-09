
import { useState } from "react";
import { Camera, GalleryAdd } from "iconsax-reactjs";
import { useAuth, type User } from "../../context/AuthContext";
import { usersApi } from "../../lib/usersApi";
import PostCard, { type Post } from "../../Components/PostCard/PostCard";
import { useCachedQuery } from "../../lib/queryCache";

export default function Profile() {
  const {
    user,
    uploadProfilePhoto,
    isUploadingProfilePhoto,
    profilePhotoUploadProgress,
    profilePhotoPreview,
  } = useAuth();

  const [photo, setPhoto] = useState<File | null>(null);
  const [error, setError] = useState("");
  const userId = user?._id ?? user?.id;

  const {
    data: cachedPosts,
    loading: loadingPosts,
    refreshing,
    error: postsError,
    refetch: refreshPosts,
  } = useCachedQuery<Post[]>(
    `profile-posts:${userId ?? "guest"}`,
    () => userId ? usersApi.getUserPosts<Post>(userId) : Promise.resolve([]),
    { enabled: Boolean(userId), staleTime: 90_000 },
  );

  const posts = cachedPosts ?? [];

  const handleUploadPhoto = async () => {
    if (!photo || isUploadingProfilePhoto) return;
    setError("");

    try {
      // AuthContext owns the complete operation. The upload keeps running across
      // navigation and publishes the selected profile photo as a post in the
      // background once the server confirms the new image.
      await uploadProfilePhoto(photo);
      setPhoto(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not upload photo");
    }
  };

  const profile = (user ?? {}) as User;
  const profilePhoto =
    profilePhotoPreview ??
    profile.photo ??
    profile.profilePhoto ??
    profile.image;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 py-8">
      <section className="premium-panel overflow-hidden !p-0">
        <div className="relative h-44 overflow-hidden bg-[radial-gradient(circle_at_78%_25%,#a792fb_0,transparent_33%),radial-gradient(circle_at_22%_75%,#6650b9_0,transparent_42%),linear-gradient(120deg,#242047,#4c388c)] sm:h-56">
          <span className="absolute right-10 top-7 text-[115px] font-black tracking-tighter text-white/10">
            VYBE
          </span>
          <div className="absolute bottom-5 left-7 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-bold text-white backdrop-blur">
            ✦ Your corner of the world
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 px-6 pb-6 pt-5 sm:flex-row sm:items-end">
          <div className="relative sm:-mt-16">
            {profilePhoto ? (
              <img
                src={profilePhoto}
                className="h-28 w-28 rounded-full object-cover ring-4 ring-[#F2ECFF]"
                alt="profile"
              />
            ) : (
              <img
                src="/female-avatar.svg"
                alt="Illustrated female profile avatar"
                className="h-28 w-28 rounded-full object-cover ring-4 ring-[#F2ECFF]"
              />
            )}

            <span className="absolute bottom-0 right-0 grid h-9 w-9 place-items-center rounded-full border-2 border-white bg-[#8B5CF6] text-white">
              <Camera size="18" />
            </span>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold">
              {profile.name ?? "My profile"}
            </h1>
            <p className="text-gray-500">
              @{profile.username ?? "username"}
            </p>
            <p className="mt-1 text-sm text-gray-400">
              {profile.email}
            </p>

            <div className="mt-3 flex justify-center gap-5 text-sm sm:justify-start">
              {typeof profile.followersCount === "number" && (
                <span>
                  <strong>{profile.followersCount}</strong> followers
                </span>
              )}
              {typeof profile.followingCount === "number" && (
                <span>
                  <strong>{profile.followingCount}</strong> following
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mx-6 mb-6 mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
          <label
            className={`inline-flex flex-1 items-center gap-3 rounded-2xl border border-dashed px-4 py-3 text-sm font-semibold transition ${
              isUploadingProfilePhoto
                ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400 opacity-60"
                : "cursor-pointer border-gray-300 bg-gray-50 text-gray-600 hover:border-[#8B5CF6] hover:bg-red-50/50 hover:text-[#8B5CF6]"
            }`}
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-white shadow-sm">
              <GalleryAdd size="20" />
            </span>

            <span className="min-w-0 flex-1 truncate">
              {isUploadingProfilePhoto
                ? `Uploading ${Math.max(1, profilePhotoUploadProgress)}%`
                : photo
                  ? photo.name
                  : "Choose a new profile photo"}
            </span>

            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={isUploadingProfilePhoto}
              onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
            />
          </label>

          <button
            onClick={handleUploadPhoto}
            disabled={!photo || isUploadingProfilePhoto}
            className="rounded-xl bg-[#8B5CF6] px-5 py-3 font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isUploadingProfilePhoto
              ? `${Math.max(1, profilePhotoUploadProgress)}%`
              : "Update photo"}
          </button>
        </div>

        {isUploadingProfilePhoto && (
          <div className="mt-3">
            <div className="mb-1 flex items-center justify-between text-xs font-semibold">
              <span className="text-gray-500">
                {profilePhotoUploadProgress >= 100
                  ? "Processing profile photo…"
                  : "Uploading profile photo…"}
              </span>
              <span className="text-[#8B5CF6]">
                {Math.max(1, profilePhotoUploadProgress)}%
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#6D5DF7] transition-all duration-300"
                style={{
                  width: `${Math.max(2, profilePhotoUploadProgress)}%`,
                }}
              />
            </div>
          </div>
        )}

        {error && (
          <p className="mt-3 text-sm text-red-500">{error}</p>
        )}
      </section>

      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg font-bold text-gray-700">My posts</h2>
        {refreshing && posts.length > 0 && (
          <span className="text-xs text-gray-400">Updating…</span>
        )}
      </div>

      {postsError && (
        <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
          {postsError}
        </div>
      )}

      {loadingPosts && !posts.length ? (
        <div className="rounded-2xl bg-white p-6 text-center text-gray-500">
          Loading posts...
        </div>
      ) : posts.length ? (
        posts.map((post, index) => (
          <PostCard
            key={post._id ?? post.id ?? index}
            post={post}
            onChanged={() => refreshPosts(true)}
          />
        ))
      ) : (
        <div className="rounded-2xl bg-white p-6 text-center text-gray-500">
          No posts yet.
        </div>
      )}
    </div>
  );
}
