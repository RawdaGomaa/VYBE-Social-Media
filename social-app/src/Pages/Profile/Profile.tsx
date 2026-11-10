
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
    <div className="mx-auto w-full max-w-5xl space-y-7 px-3 py-8 sm:px-5">

      {/* PROFILE CARD */}
      <section className="overflow-hidden rounded-[2rem] border border-violet-100 bg-white/90 shadow-[0_15px_50px_rgba(68,46,125,0.07)] backdrop-blur-xl transition-all duration-300 dark:border-white/10 dark:bg-[#1C1B32]/95 dark:shadow-[0_15px_50px_rgba(0,0,0,0.2)]">

        {/* COVER */}
        <div className="relative h-44 overflow-hidden bg-gradient-to-br from-[#211940] via-[#49347F] to-[#8B5CF6] sm:h-60">

          <div className="absolute -left-20 -top-28 h-72 w-72 rounded-full bg-violet-400/25 blur-[90px]" />

          <div className="absolute -bottom-32 right-0 h-80 w-80 rounded-full bg-purple-300/20 blur-[100px]" />

          <div className="absolute inset-0 bg-gradient-to-t from-[#211940]/40 to-transparent" />

          <span className="absolute right-5 top-4 select-none text-7xl font-black tracking-tighter text-white/[0.08] sm:right-10 sm:top-2 sm:text-[130px]">
            VYBE
          </span>

          <div className="absolute bottom-5 left-5 flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold text-white shadow-lg backdrop-blur-xl sm:left-8">
            <span className="text-violet-200">✦</span>
            Your corner of the world
          </div>
        </div>

        {/* PROFILE INFORMATION */}
        <div className="relative flex flex-col items-center gap-5 px-5 pb-7 pt-5 sm:flex-row sm:items-end sm:px-8">

          {/* AVATAR */}
          <div className="relative shrink-0 sm:-mt-20">

            <div className="rounded-full bg-gradient-to-br from-[#C4B5FD] via-[#8B5CF6] to-[#6D28D9] p-1 shadow-[0_10px_35px_rgba(139,92,246,0.25)]">

              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  className="h-28 w-28 rounded-full border-4 border-white object-cover dark:border-[#1C1B32] sm:h-36 sm:w-36"
                  alt="profile"
                />
              ) : (
                <img
                  src="/female-avatar.svg"
                  alt="Profile avatar"
                  className="h-28 w-28 rounded-full border-4 border-white object-cover dark:border-[#1C1B32] sm:h-36 sm:w-36"
                />
              )}
            </div>

            <span className="absolute bottom-1 right-1 grid h-10 w-10 place-items-center rounded-full border-[3px] border-white bg-gradient-to-br from-violet-500 to-purple-700 text-white shadow-lg dark:border-[#1C1B32]">
              <Camera size="19" />
            </span>
          </div>

          {/* USER DETAILS */}
          <div className="min-w-0 flex-1 text-center sm:pb-2 sm:text-left">

            <h1 className="text-2xl font-black tracking-tight text-[#211940] dark:text-[#F5F0FF] sm:text-3xl">
              {profile.name ?? "My profile"}
            </h1>

            <p className="mt-1 text-sm font-semibold text-violet-600 dark:text-violet-400">
              @{profile.username ?? "username"}
            </p>

            <p className="mt-2 break-all text-sm text-[#89859A] dark:text-[#AAA4BD]">
              {profile.email}
            </p>

            {/* FOLLOWERS */}
            <div className="mt-4 flex flex-wrap justify-center gap-3 sm:justify-start">

              {typeof profile.followersCount === "number" && (
                <div className="rounded-xl border border-violet-100 bg-[#F8F6FF] px-4 py-2 dark:border-white/10 dark:bg-[#25213A]">
                  <strong className="text-base font-extrabold text-[#211940] dark:text-white">
                    {profile.followersCount}
                  </strong>
                  <span className="ml-1.5 text-xs font-medium text-[#89859A] dark:text-[#AAA4BD]">
                    Followers
                  </span>
                </div>
              )}

              {typeof profile.followingCount === "number" && (
                <div className="rounded-xl border border-violet-100 bg-[#F8F6FF] px-4 py-2 dark:border-white/10 dark:bg-[#25213A]">
                  <strong className="text-base font-extrabold text-[#211940] dark:text-white">
                    {profile.followingCount}
                  </strong>
                  <span className="ml-1.5 text-xs font-medium text-[#89859A] dark:text-[#AAA4BD]">
                    Following
                  </span>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* PHOTO UPLOAD */}
        <div className="mx-5 mb-6 rounded-2xl border border-violet-100 bg-[#F9F7FF] p-4 dark:border-white/10 dark:bg-[#25213A] sm:mx-8">

          <div className="mb-4">
            <h3 className="font-extrabold text-[#29243C] dark:text-[#F5F0FF]">
              Profile photo
            </h3>
            <p className="mt-1 text-xs text-[#89859A] dark:text-[#AAA4BD]">
              Update your photo and let people recognize you.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

            <label
              className={`inline-flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-dashed px-4 py-3 transition-all duration-200 ${
                isUploadingProfilePhoto
                  ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400 opacity-60 dark:border-white/10 dark:bg-[#1C1B32]"
                  : "cursor-pointer border-violet-200 bg-white text-gray-600 hover:border-violet-400 hover:bg-violet-50 dark:border-white/10 dark:bg-[#1C1B32] dark:text-gray-300 dark:hover:border-violet-400 dark:hover:bg-violet-500/10"
              }`}
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
                <GalleryAdd size="21" />
              </span>

              <span className="min-w-0 flex-1 truncate text-sm font-semibold">
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
              type="button"
              onClick={handleUploadPhoto}
              disabled={!photo || isUploadingProfilePhoto}
              className="
                rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600
                px-6 py-3.5 text-sm font-bold text-white
                shadow-[0_8px_22px_rgba(139,92,246,0.2)]
                transition-all duration-200
                hover:-translate-y-0.5 hover:shadow-lg
                active:scale-[0.98]
                disabled:cursor-not-allowed disabled:opacity-50
              "
            >
              {isUploadingProfilePhoto
                ? `${Math.max(1, profilePhotoUploadProgress)}%`
                : "Update photo"}
            </button>

          </div>

          {/* UPLOAD PROGRESS */}
          {isUploadingProfilePhoto && (
            <div className="mt-5">

              <div className="mb-2 flex items-center justify-between gap-3 text-xs font-semibold">
                <span className="text-gray-500 dark:text-gray-400">
                  {profilePhotoUploadProgress >= 100
                    ? "Processing profile photo..."
                    : "Uploading profile photo..."}
                </span>

                <span className="text-violet-600 dark:text-violet-400">
                  {Math.max(1, profilePhotoUploadProgress)}%
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-violet-100 dark:bg-[#38304F]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 transition-all duration-300"
                  style={{
                    width: `${Math.max(2, profilePhotoUploadProgress)}%`,
                  }}
                />
              </div>

            </div>
          )}

          {/* UPLOAD ERROR */}
          {error && (
            <p className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-300">
              {error}
            </p>
          )}
        </div>
      </section>

      {/* POSTS HEADER */}
      <div className="flex items-center justify-between gap-3 px-1">

        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="h-6 w-1 rounded-full bg-gradient-to-b from-violet-500 to-purple-600" />
            <h2 className="text-xl font-black text-[#211940] dark:text-[#F5F0FF]">
              My posts
            </h2>
          </div>

          <p className="pl-3 text-xs text-[#89859A] dark:text-[#AAA4BD]">
            Your thoughts and shared moments.
          </p>
        </div>

        {refreshing && (
          <span className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-600 dark:bg-violet-500/10 dark:text-violet-300">
            Updating...
          </span>
        )}
      </div>

      {/* POSTS ERROR */}
      {postsError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-300">
          {postsError}
        </div>
      )}

      {/* POSTS LOADING */}
      {loadingPosts && !posts.length ? (
        <div className="rounded-3xl border border-violet-100 bg-white p-10 text-center shadow-sm dark:border-white/10 dark:bg-[#1C1B32]">

          <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-[3px] border-violet-200 border-t-violet-600 dark:border-violet-900 dark:border-t-violet-400" />

          <p className="text-sm font-semibold text-[#89859A] dark:text-[#AAA4BD]">
            Loading your posts...
          </p>
        </div>
      ) : posts.length ? (

        <div className="space-y-5">
          {posts.map((post, index) => (
            <PostCard
              key={post._id ?? post.id ?? index}
              post={post}
              onChanged={() => refreshPosts(true)}
            />
          ))}
        </div>

      ) : (

        /* EMPTY STATE */
        <div className="overflow-hidden rounded-[2rem] border border-violet-100 bg-white p-8 text-center shadow-[0_12px_35px_rgba(39,29,90,0.04)] dark:border-white/10 dark:bg-[#1C1B32] sm:p-12">

          <div className="mx-auto grid h-20 w-20 place-items-center rounded-[1.75rem] bg-gradient-to-br from-violet-100 to-purple-100 text-violet-600 dark:from-violet-500/15 dark:to-purple-500/15 dark:text-violet-300">
            <GalleryAdd size="36" />
          </div>

          <h3 className="mt-5 text-xl font-extrabold text-[#211940] dark:text-[#F5F0FF]">
            No posts yet
          </h3>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#89859A] dark:text-[#AAA4BD]">
            Your story starts here. Share your first moment with the VYBE community!
          </p>

        </div>
      )}

    </div>
  );
}
