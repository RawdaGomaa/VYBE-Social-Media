import { useState } from "react";
import { Link } from "react-router";
import { getApiError } from "../../lib/api";
import { usersApi } from "../../lib/usersApi";
import type { User } from "../../context/AuthContext";
import { useCachedQuery } from "../../lib/queryCache";

export default function Community() {
  const [busy, setBusy] = useState("");
  const [actionError, setActionError] = useState("");
  const { data, loading, refreshing, error, setData } = useCachedQuery<User[]>(
    "community:suggestions",
    () => usersApi.getFollowSuggestions(1, 10),
    { staleTime: 120_000 },
  );
  const users = data ?? [];

  const toggleFollow = async (user: User) => {
    const id = user._id ?? user.id;
    if (!id) return;
    setBusy(id);
    setActionError("");
    try {
      await usersApi.toggleFollow(id);
      setData((current) => (current ?? []).map((item) => {
        const itemId = item._id ?? item.id;
        return itemId === id ? { ...item, isFollowing: !item.isFollowing } : item;
      }));
    } catch (e) {
      setActionError(getApiError(e));
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">People you may know</h1>
        {refreshing && users.length > 0 && <span className="text-xs text-gray-400">Updating…</span>}
      </div>
      {(actionError || error) && <div className="mb-4 rounded-xl bg-red-50 p-3 text-red-600">{actionError || error}</div>}

      {loading && !users.length ? <div className="p-8 text-center text-gray-500">Loading suggestions...</div> : (
        <div className="space-y-3">
          {users.map((user, index) => {
            const id = user._id ?? user.id ?? String(index);
            const canOpenProfile = Boolean(user._id ?? user.id);
            return (
              <div key={id} className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
                {canOpenProfile ? (
                  <Link to={`/users/${id}`} className="shrink-0">
                    <img src={user.photo ?? user.profilePhoto ?? user.image ?? "https://placehold.co/80x80?text=U"} className="h-12 w-12 rounded-full object-cover" alt="" />
                  </Link>
                ) : (
                  <img src={user.photo ?? user.profilePhoto ?? user.image ?? "https://placehold.co/80x80?text=U"} className="h-12 w-12 rounded-full object-cover" alt="" />
                )}
                <div className="min-w-0 flex-1">
                  {canOpenProfile ? (
                    <Link to={`/users/${id}`} className="block hover:text-[#8B5CF6]">
                      <p className="truncate font-semibold">{user.name ?? "User"}</p>
                      <p className="truncate text-sm text-gray-400">@{user.username ?? "username"}</p>
                    </Link>
                  ) : <><p className="truncate font-semibold">{user.name ?? "User"}</p><p className="truncate text-sm text-gray-400">@{user.username ?? "username"}</p></>}
                </div>
                <button onClick={() => toggleFollow(user)} disabled={busy === id} className="rounded-xl bg-[#8B5CF6] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                  {busy === id ? "..." : user.isFollowing ? "Unfollow" : "Follow"}
                </button>
              </div>
            );
          })}
          {!users.length && <div className="rounded-2xl bg-white p-8 text-center text-gray-500">No suggestions right now.</div>}
        </div>
      )}
    </div>
  );
}
