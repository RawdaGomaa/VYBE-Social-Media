
import { Bookmark, Heart } from "iconsax-reactjs";
import PostCard, { type Post } from "../../Components/PostCard/PostCard";
import { usersApi } from "../../lib/usersApi";
import { useCachedQuery } from "../../lib/queryCache";

export default function Bookmarks() {
  const {
    data,
    loading,
    refreshing,
    error,
    refetch,
  } = useCachedQuery<Post[]>(
    "bookmarks",
    () => usersApi.getBookmarks<Post>(),
    { staleTime: 90_000 },
  );

  const posts = data ?? [];

  return (
    <main className="mx-auto min-h-[calc(100vh-80px)] w-full max-w-5xl space-y-6 px-4 py-8 sm:px-6">

      {/* Page Header */}
      <header>
        <span className="vybe-pill mb-3">
          ✦ Your personal collection
        </span>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-[#18152C] dark:text-[#F5F0FF] sm:text-4xl">
              Saved <span className="text-[#8B5CF6]">Posts</span>
            </h1>

            <p className="mt-2 text-sm text-[#89859A] dark:text-[#AAA4BD]">
              All the moments and stories you want to keep.
            </p>
          </div>

          {refreshing && posts.length > 0 && (
            <span className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-600 dark:bg-[#34294E] dark:text-violet-300">
              Updating...
            </span>
          )}
        </div>
      </header>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-300"
        >
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && !posts.length ? (
        <div className="space-y-5">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="animate-pulse rounded-3xl border border-violet-100 bg-white p-5 dark:border-[#383651] dark:bg-[#1B1C32]"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="h-11 w-11 rounded-full bg-violet-100 dark:bg-[#302A46]" />
                <div className="space-y-2">
                  <div className="h-3 w-28 rounded bg-violet-100 dark:bg-[#302A46]" />
                  <div className="h-3 w-20 rounded bg-violet-50 dark:bg-[#28243B]" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full rounded bg-violet-50 dark:bg-[#28243B]" />
                <div className="h-3 w-3/4 rounded bg-violet-50 dark:bg-[#28243B]" />
              </div>
            </div>
          ))}
        </div>
      ) : posts.length > 0 ? (
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
        /* Empty State */
        <section className="premium-panel flex flex-col items-center px-6 py-16 text-center">

          <div className="relative mb-5 grid h-20 w-20 place-items-center rounded-3xl bg-violet-100 text-[#8B5CF6] dark:bg-[#34294E]">
            <Bookmark size="36" variant="Bold" />

            <span className="absolute -right-2 -top-2 grid h-8 w-8 place-items-center rounded-xl border-4 border-white bg-[#8B5CF6] text-white dark:border-[#1B1C32]">
              <Heart size="15" variant="Bold" />
            </span>
          </div>

          <h2 className="text-xl font-black text-[#282040] dark:text-[#F1ECFF]">
            Nothing saved yet
          </h2>

          <p className="mt-2 max-w-sm text-sm leading-6 text-[#89859A] dark:text-[#AAA4BD]">
            When you find a post you love, save it and it will appear here.
            Your favorite moments deserve a place of their own.
          </p>

          <a
            href="/posts"
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#6950E8] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-violet-500/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            Explore posts
          </a>

        </section>
      )}

      <footer className="pb-4 text-center text-xs text-[#AAA4B6] dark:text-[#77738F]">
        VYBE · Keep the moments that matter.
      </footer>

    </main>
  );
}
