import PostCard, { type Post } from "../../Components/PostCard/PostCard";
import { usersApi } from "../../lib/usersApi";
import { useCachedQuery } from "../../lib/queryCache";

export default function Bookmarks() {
  const { data, loading, refreshing, error, refetch } = useCachedQuery<Post[]>(
    "bookmarks",
    () => usersApi.getBookmarks<Post>(),
    { staleTime: 90_000 },
  );
  const posts = data ?? [];

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Saved posts</h1>
        {refreshing && posts.length > 0 && <span className="text-xs text-gray-400">Updating…</span>}
      </div>
      {error && <div className="rounded-xl bg-red-50 p-3 text-red-600">{error}</div>}
      {loading && !posts.length ? (
        <div className="p-8 text-center text-gray-500">Loading...</div>
      ) : posts.length ? (
        posts.map((post, index) => <PostCard key={post._id ?? post.id ?? index} post={post} onChanged={() => refetch(true)} />)
      ) : (
        <div className="rounded-2xl bg-white p-8 text-center text-gray-500">No saved posts.</div>
      )}
    </div>
  );
}
