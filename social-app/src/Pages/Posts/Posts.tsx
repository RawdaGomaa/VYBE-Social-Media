import { useMemo, useState } from "react";
import { CloseCircle, GalleryAdd, Home2, People, Bookmark, Notification, Setting2, Profile2User, Heart, MagicStar, TrendUp } from "iconsax-reactjs";
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
    return () => only === "all"
      ? postsApi.getAll<Post>(1, 20)
      : postsApi.getFeed<Post>({ only, page: 1, limit: 20 });
  }, [only]);

  const {
    data: cachedPosts,
    loading,
    refreshing,
    error: queryError,
    refetch,
  } = useCachedQuery<Post[]>(queryKey, fetcher, { staleTime: POSTS_STALE_TIME });

  const posts = cachedPosts ?? [];

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isPosting || (!body.trim() && !image)) return;
    clearError();
    try {
      await createPost();
    } catch {
      // The provider keeps the draft and exposes the API error so the user can retry.
    }
  };

  return (
    <div className="vybe-dashboard-scroll mx-auto grid w-full max-w-[1410px] grid-cols-1 items-start gap-6 pb-16 pt-8 lg:grid-cols-[225px_minmax(0,1fr)] xl:grid-cols-[225px_minmax(0,1fr)_280px]">
      <aside className="vybe-scroll-column hidden lg:block">
        <div className="premium-panel overflow-hidden p-4">
          <div className="mb-5 flex items-center gap-3 rounded-2xl bg-gradient-to-br from-[#261e4c] to-[#5e43ac] p-4 text-white">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/20 text-lg font-black">{(user?.name?.[0] || 'V').toUpperCase()}</span>
            <div className="min-w-0"><p className="truncate text-sm font-extrabold">{user?.name || 'Welcome back'}</p><p className="truncate text-xs text-white/70">Your creative space</p></div>
          </div>
          <p className="mb-2 px-3 text-[11px] font-extrabold uppercase tracking-[.2em] text-[#aaa4ba]">Your space</p>
          {([["/posts","Home",Home2],["/community","Community",People],["/bookmarks","Saved posts",Bookmark],["/notifications","Notifications",Notification],["/profile","My profile",Profile2User],["/settings","Settings",Setting2]] as const).map(([url,label,Icon]) => <NavLink key={url} to={url} className={({isActive}) => `mb-1 flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-bold transition ${isActive ? 'bg-[#eee8ff] text-[#7648e7]' : 'text-[#726c85] hover:bg-[#f6f3ff] hover:text-[#7648e7]'}`}><Icon size="21" />{label}</NavLink>)}
        </div>
        <div className="mt-4 rounded-[25px] bg-[#211940] p-5 text-white shadow-[0_15px_40px_rgba(36,23,82,.14)]"><MagicStar size="27" className="mb-4 text-[#cdbdff]"/><h3 className="text-lg font-black">Make your mark.</h3><p className="mt-2 text-sm leading-6 text-white/65">Share a little of your world. Someone out there needs to hear it.</p></div>
      </aside>
      <div className="vybe-scroll-column min-w-0 space-y-5"><div className="mb-7"><div className="vybe-pill mb-3">✦ Your daily dose of connection</div><h1 className="text-3xl font-black tracking-tight text-[#18152C] sm:text-4xl">Your <span className="text-[#8B5CF6]">Feed</span></h1><p className="mt-2 text-sm text-[#89859A]">Discover stories, share your thoughts, and stay inspired.</p></div>
      <form onSubmit={submit} className="overflow-hidden rounded-3xl border border-gray-100 bg-white p-4 shadow-[0_8px_28px_rgba(15,23,42,.05)] sm:p-5">
        <textarea value={body} disabled={isPosting} onChange={(e) => setBody(e.target.value)} className="min-h-28 w-full resize-none rounded-2xl bg-gray-50 p-4 leading-7 outline-none ring-[#8B5CF6]/20 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60" placeholder="What's on your mind?" />

        {preview && (
          <div className="relative mt-3 overflow-hidden rounded-2xl bg-gray-100">
            <img src={preview} alt="preview" className="max-h-80 w-full object-cover" />
            <button type="button" onClick={() => setImage(null)} disabled={isPosting} className="absolute right-2 top-2 rounded-full bg-black/55 p-1.5 text-white backdrop-blur hover:bg-black/70 disabled:cursor-not-allowed disabled:opacity-50" title="Remove image"><CloseCircle size="22" /></button>
          </div>
        )}

        {isPosting && (
          <div className="mt-3 rounded-2xl border border-[#8B5CF6]/15 bg-red-50/50 p-3">
            <div className="mb-2 flex items-center justify-between text-xs font-semibold text-gray-500">
              <span>Uploading your post… You can move to another page.</span>
              <span className="text-[#8B5CF6]">{uploadProgress || 1}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white">
              <div className="h-full rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#6D5DF7] transition-all duration-300" style={{ width: `${Math.max(2, uploadProgress)}%` }} />
            </div>
          </div>
        )}

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <label
            className={`inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-bold shadow-sm transition ${isPosting ? "cursor-not-allowed text-gray-300 opacity-60" : "cursor-pointer text-gray-600 hover:border-[#8B5CF6]/50 hover:bg-red-50/40 hover:text-[#8B5CF6]"}`}
            aria-disabled={isPosting}
          >
            <span className={`grid h-8 w-8 place-items-center rounded-lg ${isPosting ? "bg-gray-100 text-gray-300" : "bg-[#F2ECFF] text-[#8B5CF6]"}`}><GalleryAdd size="19" /></span>
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

          {image && <span className="mr-auto max-w-[190px] truncate text-xs text-gray-400">{image.name}</span>}

          <button disabled={isPosting || (!body.trim() && !image)} className="rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#6D5DF7] px-6 py-2.5 font-bold text-white shadow-[0_7px_18px_rgba(244,115,115,.24)] hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-50">{isPosting ? `Posting${uploadProgress ? ` ${uploadProgress}%` : "…"}` : "Post"}</button>
        </div>
      </form>

      <div className="flex gap-2 rounded-2xl border border-gray-100 bg-white p-2 shadow-sm">
        {([['all', 'All posts'], ['following', 'Following'], ['me', 'My posts']] as const).map(([value, label]) => (
          <button key={value} onClick={() => setOnly(value)} className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-bold ${only === value ? "bg-[#8B5CF6] text-white shadow-sm" : "text-gray-500 hover:bg-gray-50"}`}>{label}</button>
        ))}
      </div>

      {(actionError || queryError) && <div className="rounded-xl bg-red-50 p-3 text-red-600">{actionError || queryError}</div>}

      {loading && !posts.length ? (
        <div className="rounded-2xl bg-white p-8 text-center text-gray-500">Loading posts...</div>
      ) : posts.length ? (
        <>
          {refreshing && <div className="h-1 overflow-hidden rounded-full bg-gray-100"><div className="h-full w-1/3 animate-pulse rounded-full bg-[#8B5CF6]/60" /></div>}
          {posts.map((post, index) => <PostCard key={post._id ?? post.id ?? index} post={post} onChanged={() => refetch(true)} />)}
        </>
      ) : (
        <div className="rounded-2xl bg-white p-8 text-center text-gray-500">No posts found.</div>
      )}
      </div>
      <aside className="vybe-scroll-column hidden space-y-5 xl:block">
        <section className="premium-panel p-5">
          <div className="mb-4 flex items-center gap-2"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#efeaff] text-[#865ae8]"><TrendUp size="20" /></span><h3 className="font-extrabold text-[#282040]">Discover VYBE</h3></div>
          <p className="text-sm leading-6 text-[#8c859f]">A little more connection, a little more inspiration, every day.</p>
          <div className="mt-4 grid grid-cols-2 gap-2"><div className="rounded-2xl bg-[#f7f4ff] p-3"><Heart size="19" className="text-[#9868eb]"/><p className="mt-2 text-xs font-bold text-[#635c78]">Connect</p></div><div className="rounded-2xl bg-[#f7f4ff] p-3"><People size="19" className="text-[#9868eb]"/><p className="mt-2 text-xs font-bold text-[#635c78]">Explore</p></div></div>
        </section>
        <section className="premium-panel p-5"><h3 className="mb-2 font-extrabold text-[#282040]">Your community</h3><p className="mb-4 text-sm leading-6 text-[#8c859f]">Find people and fresh perspectives.</p><Link to="/community" className="block rounded-xl bg-[#eee8ff] px-4 py-3 text-center text-sm font-extrabold text-[#7650d9] hover:bg-[#e4dbff]">Explore community →</Link></section>
        <div className="px-3 text-xs leading-6 text-[#aaa5b6]">VYBE · Good things start with a conversation.</div>
      </aside>
    </div>
  );
}
