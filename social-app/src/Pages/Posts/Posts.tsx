
import { useMemo, useState, type FormEvent } from "react";
import {
  CloseCircle,
  GalleryAdd,
  Home2,
  People,
  Bookmark,
  Notification,
  Setting2,
  Profile2User,
  Heart,
  MagicStar,
  TrendUp,
} from "iconsax-reactjs";
import { Link, NavLink } from "react-router";
import { useAuth } from "../../context/AuthContext";
import PostCard, { type Post } from "../../Components/PostCard/PostCard";
import { postsApi } from "../../lib/postsApi";
import { useCachedQuery } from "../../lib/queryCache";
import { usePostUpload } from "../../context/PostUploadContext";

type FeedTab = "all" | "following" | "me";

const POSTS_STALE_TIME = 90_000;

export default function Posts() {
  const [only, setOnly] = useState<FeedTab>("all");
  const { user } = useAuth();

  const {
    body,
    setBody,
    image,
    setImage,
    preview,
    isPosting,
    uploadProgress,
    error: actionError,
    clearError,
    createPost,
  } = usePostUpload();

  const queryKey = `posts:${only}`;

  const fetcher = useMemo(() => {
    return () =>
      only === "all"
        ? postsApi.getAll<Post>(1, 20)
        : postsApi.getFeed<Post>({
            only,
            page: 1,
            limit: 20,
          });
  }, [only]);

  const {
    data: cachedPosts,
    loading,
    refreshing,
    error: queryError,
    refetch,
  } = useCachedQuery<Post[]>(queryKey, fetcher, {
    staleTime: POSTS_STALE_TIME,
  });

  const posts = cachedPosts ?? [];

  const submit = async (event: FormEvent) => {
    event.preventDefault();

    if (isPosting || (!body.trim() && !image)) return;

    clearError();

    try {
      await createPost();
    } catch {
      // The provider keeps the draft and exposes the API error.
    }
  };

  const sidebarLinks = [
    ["/posts", "Home", Home2],
    ["/community", "Community", People],
    ["/bookmarks", "Saved posts", Bookmark],
    ["/notifications", "Notifications", Notification],
    ["/profile", "My profile", Profile2User],
    ["/settings", "Settings", Setting2],
  ] as const;

  const cardClass =
    "rounded-[1.75rem] border border-violet-100/80 bg-white/90 shadow-[0_12px_35px_rgba(39,29,90,0.05)] backdrop-blur-xl transition-all duration-300 dark:border-white/10 dark:bg-[#1C1B32]/90 dark:shadow-[0_12px_35px_rgba(0,0,0,0.18)]";

  const mutedText =
    "text-[#89859A] dark:text-[#AAA4BD]";

  return (
    <div
      className="
        relative isolate mx-auto grid w-full max-w-[1410px]
        grid-cols-1 items-start gap-6
        pb-16 pt-8
        lg:grid-cols-[225px_minmax(0,1fr)]
        xl:grid-cols-[225px_minmax(0,1fr)_280px]
      "
    >
      {/* BACKGROUND GLOW */}
      <div className="pointer-events-none fixed -left-32 top-32 -z-10 h-80 w-80 rounded-full bg-violet-400/10 blur-[120px] dark:bg-violet-600/10" />

      <div className="pointer-events-none fixed -right-32 bottom-10 -z-10 h-80 w-80 rounded-full bg-purple-400/10 blur-[120px] dark:bg-purple-600/10" />

      {/* LEFT SIDEBAR */}
      <aside className="hidden space-y-4 lg:block">
        <div className={`${cardClass} overflow-hidden p-4`}>
          {/* USER INFO */}
          <div className="mb-6 flex items-center gap-3 rounded-2xl bg-gradient-to-br from-[#261e4c] via-[#49317f] to-[#8B5CF6] p-4 text-white shadow-lg shadow-violet-900/10">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-white/20 bg-white/20 text-lg font-black">
              {(user?.name?.[0] || "V").toUpperCase()}
            </span>

            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold">
                {user?.name || "Welcome back"}
              </p>
              <p className="truncate text-xs text-white/70">
                Your creative space
              </p>
            </div>
          </div>

          <p className="mb-3 px-3 text-[11px] font-extrabold uppercase tracking-[.2em] text-[#AAA4BA] dark:text-[#8982A4]">
            Your space
          </p>

          <div className="space-y-1">
            {sidebarLinks.map(([url, label, Icon]) => (
              <NavLink
                key={url}
                to={url}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-bold transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-violet-100 to-purple-100 text-[#7648E7] shadow-sm dark:from-violet-500/20 dark:to-purple-500/10 dark:text-[#C5A9FF]"
                      : "text-[#726C85] hover:translate-x-1 hover:bg-violet-50 hover:text-[#7648E7] dark:text-[#AAA4BD] dark:hover:bg-violet-500/10 dark:hover:text-violet-300"
                  }`
                }
              >
                <Icon size="21" />
                {label}
              </NavLink>
            ))}
          </div>
        </div>

        {/* INSPIRATION CARD */}
        <div className="relative overflow-hidden rounded-[25px] bg-gradient-to-br from-[#211940] via-[#392568] to-[#6845B8] p-5 text-white shadow-[0_15px_40px_rgba(36,23,82,0.16)]">
          <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-violet-300/20 blur-3xl" />

          <MagicStar
            size="27"
            className="relative mb-4 text-[#CDBDFF]"
          />

          <h3 className="relative text-lg font-black">
            Make your mark.
          </h3>

          <p className="relative mt-2 text-sm leading-6 text-white/70">
            Share a little of your world. Someone out there needs to hear it.
          </p>
        </div>
      </aside>

      {/* MAIN FEED */}
      <section className="min-w-0 space-y-5">

        {/* PAGE HEADER */}
        <div className="mb-7">
          <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#E9DFFF] bg-[#F2ECFF] px-4 py-2 text-xs font-bold text-[#8050D5] shadow-sm dark:border-[#534080] dark:bg-[#34294E] dark:text-[#D5BEFF]">
            ✦ Your daily dose of connection
          </span>

          <h1 className="text-3xl font-black tracking-tight text-[#18152C] sm:text-4xl dark:text-[#F5F0FF]">
            Your{" "}
            <span className="bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] bg-clip-text text-transparent">
              Feed
            </span>
          </h1>

          <p className={`mt-2 text-sm ${mutedText}`}>
            Discover stories, share your thoughts, and stay inspired.
          </p>
        </div>

        {/* CREATE POST */}
        <form
          onSubmit={submit}
          className={`${cardClass} overflow-hidden p-4 sm:p-5`}
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-sm font-black text-white shadow-md shadow-violet-500/20">
              {(user?.name?.[0] || "V").toUpperCase()}
            </div>

            <div>
              <p className="text-sm font-bold text-[#29243C] dark:text-[#F5F0FF]">
                Create something today
              </p>
              <p className={`text-xs ${mutedText}`}>
                Share your thoughts with your community
              </p>
            </div>
          </div>

          <textarea
            value={body}
            disabled={isPosting}
            onChange={(e) => setBody(e.target.value)}
            className="
              min-h-32 w-full resize-none rounded-2xl
              border border-transparent
              bg-[#F7F5FF] p-4
              text-sm leading-7 text-[#29243C]
              placeholder:text-[#A29AB4]
              outline-none transition-all duration-200
              focus:border-violet-300
              focus:bg-white
              focus:ring-4 focus:ring-violet-500/10
              disabled:cursor-not-allowed disabled:opacity-60
              dark:border-white/5
              dark:bg-[#25213A]
              dark:text-[#F5F0FF]
              dark:placeholder:text-[#8F88A9]
              dark:focus:border-violet-400/40
              dark:focus:bg-[#292540]
            "
            placeholder="What's on your mind?"
          />

          {/* IMAGE PREVIEW */}
          {preview && (
            <div className="relative mt-4 overflow-hidden rounded-2xl border border-violet-100 dark:border-white/10">
              <img
                src={preview}
                alt="Post preview"
                className="max-h-80 w-full object-cover"
              />

              <button
                type="button"
                onClick={() => setImage(null)}
                disabled={isPosting}
                className="
                  absolute right-3 top-3 grid h-9 w-9
                  place-items-center rounded-full
                  bg-black/60 text-white
                  backdrop-blur-md transition
                  hover:scale-110 hover:bg-red-500
                  disabled:cursor-not-allowed disabled:opacity-50
                "
                title="Remove image"
              >
                <CloseCircle size="22" />
              </button>
            </div>
          )}

          {/* UPLOAD PROGRESS */}
          {isPosting && (
            <div className="mt-4 rounded-2xl border border-violet-200/60 bg-violet-50/70 p-4 dark:border-violet-400/20 dark:bg-violet-500/10">
              <div className="mb-3 flex items-center justify-between gap-3 text-xs font-semibold text-gray-500 dark:text-gray-300">
                <span>
                  Uploading your post... You can move to another page.
                </span>

                <span className="shrink-0 font-bold text-violet-600 dark:text-violet-300">
                  {uploadProgress || 1}%
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-violet-100 dark:bg-[#37304E]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#6D5DF7] transition-all duration-300"
                  style={{
                    width: `${Math.max(2, uploadProgress)}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* CREATE POST ACTIONS */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">

            <label
              className={`
                inline-flex items-center gap-2 rounded-xl
                border px-3.5 py-2.5 text-sm font-bold
                shadow-sm transition-all duration-200
                ${
                  isPosting
                    ? "cursor-not-allowed border-gray-200 text-gray-300 opacity-60 dark:border-white/10"
                    : "cursor-pointer border-violet-100 bg-white text-gray-600 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-600 dark:border-white/10 dark:bg-[#25213A] dark:text-gray-300 dark:hover:bg-violet-500/10 dark:hover:text-violet-300"
                }
              `}
              aria-disabled={isPosting}
            >
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#F2ECFF] text-[#8B5CF6] dark:bg-violet-500/15 dark:text-violet-300">
                <GalleryAdd size="19" />
              </span>

              <span>{image ? "Change photo" : "Add photo"}</span>

              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={isPosting}
                onChange={(e) => {
                  if (isPosting) return;
                  setImage(e.target.files?.[0] ?? null);
                }}
              />
            </label>

            {image && (
              <span className={`mr-auto max-w-[190px] truncate text-xs ${mutedText}`}>
                {image.name}
              </span>
            )}

            <button
              type="submit"
              disabled={isPosting || (!body.trim() && !image)}
              className="
                rounded-xl bg-gradient-to-r
                from-[#8B5CF6] to-[#6D5DF7]
                px-7 py-3 text-sm font-bold text-white
                shadow-[0_7px_18px_rgba(139,92,246,0.24)]
                transition-all duration-200
                hover:-translate-y-0.5
                hover:shadow-[0_10px_24px_rgba(139,92,246,0.35)]
                active:scale-95
                disabled:translate-y-0 disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {isPosting
                ? `Posting${uploadProgress ? ` ${uploadProgress}%` : "..."}`
                : "Post"}
            </button>
          </div>
        </form>

        {/* FEED TABS */}
        <div className={`${cardClass} flex gap-2 p-2`}>
          {(
            [
              ["all", "All posts"],
              ["following", "Following"],
              ["me", "My posts"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setOnly(value)}
              aria-pressed={only === value}
              className={`
                flex-1 rounded-xl px-2 py-3
                text-xs font-bold transition-all duration-200 sm:text-sm
                ${
                  only === value
                    ? "bg-gradient-to-r from-[#8B5CF6] to-[#6950E8] text-white shadow-md shadow-violet-500/20"
                    : "text-gray-500 hover:bg-violet-50 hover:text-violet-700 dark:text-gray-400 dark:hover:bg-violet-500/10 dark:hover:text-violet-300"
                }
              `}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ERRORS */}
        {(actionError || queryError) && (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-300"
          >
            {actionError || queryError}
          </div>
        )}

        {/* POSTS LOADING */}
        {loading && !posts.length ? (
          <div className={`${cardClass} p-8 text-center`}>
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600 dark:border-violet-900 dark:border-t-violet-400" />

            <p className={`text-sm font-medium ${mutedText}`}>
              Loading posts...
            </p>
          </div>
        ) : posts.length ? (
          <>
            {refreshing && (
              <div className="h-1 overflow-hidden rounded-full bg-violet-100 dark:bg-violet-950">
                <div className="h-full w-1/3 animate-pulse rounded-full bg-violet-500/70" />
              </div>
            )}

            <div className="space-y-5">
              {posts.map((post, index) => (
                <PostCard
                  key={post._id ?? post.id ?? index}
                  post={post}
                  onChanged={() => refetch(true)}
                />
              ))}
            </div>
          </>
        ) : (
          <div className={`${cardClass} px-6 py-12 text-center`}>
            <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-violet-50 text-violet-500 dark:bg-violet-500/10 dark:text-violet-300">
              <People size="30" />
            </div>

            <h3 className="text-lg font-extrabold text-[#29243C] dark:text-[#F5F0FF]">
              No posts found
            </h3>

            <p className={`mt-2 text-sm ${mutedText}`}>
              Be the first to share something with your community.
            </p>
          </div>
        )}
      </section>

      {/* RIGHT SIDEBAR */}
      <aside className="hidden space-y-5 xl:block">

        {/* DISCOVER */}
        <section className={`${cardClass} p-5`}>
          <div className="mb-4 flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
              <TrendUp size="20" />
            </span>

            <h3 className="font-extrabold text-[#282040] dark:text-[#F5F0FF]">
              Discover VYBE
            </h3>
          </div>

          <p className={`text-sm leading-6 ${mutedText}`}>
            A little more connection, a little more inspiration, every day.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-violet-100 bg-[#F7F4FF] p-3 transition-all hover:-translate-y-1 hover:shadow-md dark:border-white/5 dark:bg-[#25213A]">
              <Heart size="20" className="text-[#9868EB]" />

              <p className="mt-2 text-xs font-bold text-[#635C78] dark:text-[#D3CBEA]">
                Connect
              </p>
            </div>

            <div className="rounded-2xl border border-violet-100 bg-[#F7F4FF] p-3 transition-all hover:-translate-y-1 hover:shadow-md dark:border-white/5 dark:bg-[#25213A]">
              <People size="20" className="text-[#9868EB]" />

              <p className="mt-2 text-xs font-bold text-[#635C78] dark:text-[#D3CBEA]">
                Explore
              </p>
            </div>
          </div>
        </section>

        {/* COMMUNITY */}
        <section className={`${cardClass} p-5`}>
          <h3 className="mb-2 font-extrabold text-[#282040] dark:text-[#F5F0FF]">
            Your community
          </h3>

          <p className={`mb-5 text-sm leading-6 ${mutedText}`}>
            Find people and fresh perspectives.
          </p>

          <Link
            to="/community"
            className="
              block rounded-xl
              bg-gradient-to-r from-violet-100 to-purple-100
              px-4 py-3 text-center text-sm font-extrabold
              text-[#7650D9] transition-all duration-200
              hover:-translate-y-0.5 hover:shadow-md
              dark:from-violet-500/20 dark:to-purple-500/10
              dark:text-violet-300
              dark:hover:from-violet-500/30 dark:hover:to-purple-500/20
            "
          >
            Explore community →
          </Link>
        </section>

        {/* FOOTER */}
        <div className="px-3 text-xs leading-6 text-[#AAA5B6] dark:text-[#77718F]">
          VYBE · Good things start with a conversation.
        </div>
      </aside>
    </div>
  );
}
