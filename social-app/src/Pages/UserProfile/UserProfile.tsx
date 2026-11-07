import { useState } from "react";
import { useParams } from "react-router";
import PostCard, { type Post } from "../../Components/PostCard/PostCard";
import type { User } from "../../context/AuthContext";
import { getApiError } from "../../lib/api";
import { usersApi } from "../../lib/usersApi";
import { useCachedQuery } from "../../lib/queryCache";

type ProfileBundle = { profile: User | null; posts: Post[] };

export default function UserProfile() {
  const { userId } = useParams();
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");

  const { data, loading, refreshing, error, setData, refetch } = useCachedQuery<ProfileBundle>(
    `user-profile:${userId ?? "missing"}`,
    async () => {
      if (!userId) return { profile: null, posts: [] };
      const [profile, posts] = await Promise.all([
        usersApi.getUserProfile(userId),
        usersApi.getUserPosts<Post>(userId),
      ]);
      return { profile, posts };
    },
    { enabled: Boolean(userId), staleTime: 120_000 },
  );

  const profile = data?.profile ?? null;
  const posts = data?.posts ?? [];

  const toggleFollow = async () => {
    if (!userId || !profile) return;
    setBusy(true);
    setActionError("");
    try {
      await usersApi.toggleFollow(userId);
      setData((current) => {
        if (!current?.profile) return current ?? { profile: null, posts: [] };
        const currentProfile = current.profile;
        return {
          ...current,
          profile: {
            ...currentProfile,
            isFollowing: !currentProfile.isFollowing,
            followersCount: typeof currentProfile.followersCount === "number"
              ? currentProfile.followersCount + (currentProfile.isFollowing ? -1 : 1)
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

  if (loading && !data) return <div className="mx-auto max-w-2xl p-8 text-center text-gray-500">Loading profile...</div>;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4 py-6">
      {(actionError || error) && <div className="rounded-xl bg-red-50 p-3 text-red-600">{actionError || error}</div>}

      {profile && (
        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <img src={profile.photo ?? profile.profilePhoto ?? profile.image ?? "https://placehold.co/160x160?text=U"} className="h-28 w-28 rounded-full object-cover" alt="profile" />
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold">{profile.name ?? "User"}</h1>
              <p className="text-gray-500">@{profile.username ?? "username"}</p>
              <div className="mt-3 flex justify-center gap-5 text-sm sm:justify-start">
                {typeof profile.followersCount === "number" && <span><strong>{profile.followersCount}</strong> followers</span>}
                {typeof profile.followingCount === "number" && <span><strong>{profile.followingCount}</strong> following</span>}
              </div>
            </div>
            <button onClick={toggleFollow} disabled={busy} className="rounded-xl bg-[#8B5CF6] px-5 py-2.5 font-semibold text-white disabled:opacity-50">
              {busy ? "Please wait..." : profile.isFollowing ? "Unfollow" : "Follow"}
            </button>
          </div>
        </section>
      )}

      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg font-bold text-gray-700">Posts</h2>
        {refreshing && posts.length > 0 && <span className="text-xs text-gray-400">Updating…</span>}
      </div>
      {posts.length ? posts.map((post, index) => (
        <PostCard key={post._id ?? post.id ?? index} post={post} onChanged={() => refetch(true)} />
      )) : <div className="rounded-2xl bg-white p-6 text-center text-gray-500">No posts yet.</div>}
    </div>
  );
}
