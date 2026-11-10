
import { useState } from "react";
import { useParams, Link } from "react-router";
import { People, UserAdd, UserTick } from "iconsax-reactjs";
import PostCard, { type Post } from "../../Components/PostCard/PostCard";
import type { User } from "../../context/AuthContext";
import { getApiError } from "../../lib/api";
import { usersApi } from "../../lib/usersApi";
import { useCachedQuery } from "../../lib/queryCache";

type ProfileBundle = {
  profile: User | null;
  posts: Post[];
};

export default function UserProfile() {
  const { userId } = useParams();

  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");

  const {
    data,
    loading,
    refreshing,
    error,
    setData,
    refetch,
  } = useCachedQuery<ProfileBundle>(
    `user-profile:${userId ?? "missing"}`,
    async () => {
      if (!userId) return { profile: null, posts: [] };

      const [profile, posts] = await Promise.all([
        usersApi.getUserProfile(userId),
        usersApi.getUserPosts<Post>(userId),
      ]);

      return { profile, posts };
    },
    {
      enabled: Boolean(userId),
      staleTime: 120_000,
    },
  );

  const profile = data?.profile ?? null;
  const posts = data?.posts ?? [];

  const toggleFollow = async () => {
    if (!userId || !profile || busy) return;

    setBusy(true);
    setActionError("");

    try {
      await usersApi.toggleFollow(userId);

      setData((current) => {
        if (!current?.profile) {
          return current ?? { profile: null, posts: [] };
        }

        const currentProfile = current.profile;

        return {
          ...current,
          profile: {
            ...currentProfile,
            isFollowing: !currentProfile.isFollowing,
            followersCount:
              typeof currentProfile.followersCount === "number"
                ? currentProfile.followersCount +
                  (currentProfile.isFollowing ? -1 : 1)
                : currentProfile.followersCount,
          },
        };
      });
    } catch (e) {
      setActionError(getApiError(e));
    } finally {
      setBusy(false);
    }
  };

  // Loading
  if (loading && !data) {
    return (
      <main className="mx-auto w-full max-w-5xl space-y-5 px-4 py-8">
        <div className="animate-pulse overflow-hidden rounded-3xl border border-violet-100 bg-white dark:border-[#383651] dark:bg-[#1B1C32]">
          <div className="h-44 bg-violet-100 dark:bg-[#302A46]" />
          <div className="flex flex-col items-center gap-4 p-6 sm:flex-row">
            <div className="h-28 w-28 rounded-full bg-violet-100 dark:bg-[#302A46]" />
            <div className="flex-1 space-y-3">
              <div className="h-5 w-40 rounded bg-violet-100 dark:bg-[#302A46]" />
              <div className="h-4 w-28 rounded bg-violet-50 dark:bg-[#28243B]" />
            </div>
          </div>
        </div>
        <div className="h-40 animate-pulse rounded-3xl bg-white dark:bg-[#1B1C32]" />
      </main>
    );
  }

  const photo =
    profile?.photo ??
    profile?.profilePhoto ??
    profile?.image ??
    "/female-avatar.svg";

  return (
    <main className="mx-auto min-h-[calc(100vh-80px)] w-full max-w-5xl space-y-6 px-4 py-8 sm:px-6">

      {/* Header */}
      <div>
        <span className="vybe-pill mb-3">
          ✦ Discover connections
        </span>

        <h1 className="text-3xl font-black tracking-tight text-[#18152C] dark:text-[#F5F0FF] sm:text-4xl">
          User <span className="text-[#8B5CF6]">Profile</span>
        </h1>

        <p className="mt-2 text-sm text-[#89859A] dark:text-[#AAA4BD]">
          Get to know people and explore their stories.
        </p>
      </div>

      {/* Errors */}
      {(actionError || error) && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-300"
        >
          {actionError || error}
        </div>
      )}

      {/* Profile */}
      {profile ? (
        <section className="premium-panel overflow-hidden !p-0">

          {/* Cover */}
          <div className="relative h-44 overflow-hidden bg-gradient-to-br from-[#211940] via-[#59419C] to-[#9272E8] sm:h-56">

            <div className="absolute -right-10 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-28 left-1/4 h-64 w-64 rounded-full bg-violet-300/20 blur-3xl" />

            <span className="absolute right-5 top-3 select-none text-7xl font-black tracking-tighter text-white/10 sm:right-10 sm:text-[115px]">
              VYBE
            </span>

            <span className="absolute bottom-5 left-6 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold text-white backdrop-blur-md">
              ✦ Member of VYBE
            </span>
          </div>

          {/* Profile Info */}
          <div className="relative flex flex-col items-center gap-5 px-5 pb-7 pt-5 sm:flex-row sm:items-end sm:px-8">

            {/* Avatar */}
            <div className="relative shrink-0 sm:-mt-20">
              <img
                src={photo}
                alt={profile.name ?? "User profile"}
                onError={(e) => {
                  e.currentTarget.src = "/female-avatar.svg";
                }}
                className="h-28 w-28 rounded-full border-4 border-white bg-white object-cover shadow-lg dark:border-[#1B1C32] dark:bg-[#1B1C32] sm:h-36 sm:w-36"
              />

              <span className="absolute bottom-2 right-2 h-4 w-4 rounded-full border-2 border-white bg-emerald-400 dark:border-[#1B1C32]" />
            </div>

            {/* User Details */}
            <div className="min-w-0 flex-1 text-center sm:pb-2 sm:text-left">
              <h2 className="truncate text-2xl font-black text-[#282040] dark:text-[#F1ECFF]">
                {profile.name ?? "User"}
              </h2>

              <p className="mt-1 truncate text-sm font-medium text-[#9189A4] dark:text-[#AAA4BD]">
                @{profile.username ?? "username"}
              </p>

              {/* Statistics */}
              <div className="mt-4 flex justify-center gap-5 sm:justify-start">
                {typeof profile.followersCount === "number" && (
                  <div className="text-center sm:text-left">
                    <p className="text-xl font-black text-[#282040] dark:text-[#F1ECFF]">
                      {profile.followersCount}
                    </p>
                    <p className="text-xs text-[#9891A9] dark:text-[#AAA4BD]">
                      Followers
                    </p>
                  </div>
                )}

                {typeof profile.followingCount === "number" && (
                  <div className="text-center sm:text-left">
                    <p className="text-xl font-black text-[#282040] dark:text-[#F1ECFF]">
                      {profile.followingCount}
                    </p>
                    <p className="text-xs text-[#9891A9] dark:text-[#AAA4BD]">
                      Following
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Follow Button */}
            <button
              type="button"
              onClick={toggleFollow}
              disabled={busy}
              className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-3 font-bold transition-all duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 sm:mb-2 sm:w-auto ${
                profile.isFollowing
                  ? "border border-violet-200 bg-violet-50 text-[#8050D5] hover:bg-violet-100 dark:border-[#594477] dark:bg-[#34294E] dark:text-[#D5BEFF] dark:hover:bg-[#42315C]"
                  : "bg-gradient-to-r from-[#8B5CF6] to-[#6950E8] text-white shadow-[0_8px_22px_rgba(139,92,246,.22)] hover:shadow-[0_12px_28px_rgba(139,92,246,.32)]"
              }`}
            >
              {busy ? (
                "Please wait..."
              ) : profile.isFollowing ? (
                <>
                  <UserTick size="19" />
                  Following
                </>
              ) : (
                <>
                  <UserAdd size="19" />
                  Follow
                </>
              )}
            </button>
          </div>
        </section>
      ) : (
        <section className="premium-panel flex flex-col items-center p-10 text-center">
          <People size="40" className="text-[#8B5CF6]" />
          <h2 className="mt-4 text-lg font-extrabold text-[#282040] dark:text-[#F1ECFF]">
            Profile not found
          </h2>
          <p className="mt-2 text-sm text-[#89859A] dark:text-[#AAA4BD]">
            This profile may no longer be available.
          </p>
          <Link
            to="/community"
            className="mt-5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#6950E8] px-5 py-3 text-sm font-bold text-white"
          >
            Explore community
          </Link>
        </section>
      )}

      {/* Posts Header */}
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-[#282040] dark:text-[#F1ECFF]">
              Posts
            </h2>
            <p className="mt-1 text-xs text-[#9891A9] dark:text-[#AAA4BD]">
              Explore what this person has shared.
            </p>
          </div>

          {refreshing && (
            <span className="text-xs font-semibold text-[#8B5CF6]">
              Updating...
            </span>
          )}
        </div>

        {/* Posts */}
        {posts.length > 0 ? (
          <div className="space-y-5">
            {posts.map((post, index) => (
              <PostCard
                key={post._id ?? post.id ?? index}
                post={post}
                onChanged={() => refetch(true)}
              />
            ))}
          </div>
        ) : (
          <div className="premium-panel flex flex-col items-center px-5 py-14 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-violet-100 text-[#8B5CF6] dark:bg-[#34294E]">
              <People size="30" />
            </div>

            <h3 className="mt-4 text-lg font-extrabold text-[#282040] dark:text-[#F1ECFF]">
              No posts yet
            </h3>

            <p className="mt-2 max-w-sm text-sm text-[#89859A] dark:text-[#AAA4BD]">
              There are no posts to show here right now.
            </p>
          </div>
        )}
      </section>

      <p className="pb-4 text-center text-xs text-[#AAA4B6] dark:text-[#77738F]">
        VYBE · Good things start with a conversation.
      </p>
    </main>
  );
}
