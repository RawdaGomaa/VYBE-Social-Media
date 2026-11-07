import { useState } from "react";
import { Link } from "react-router";
import { Bookmark, Edit2, GalleryAdd, Heart, Message, Share, Trash, CloseCircle } from "iconsax-reactjs";
import { getApiError } from "../../lib/api";
import { postsApi } from "../../lib/postsApi";
import { useAuth } from "../../context/AuthContext";

export type Post = {
  _id?: string;
  id?: string;
  body?: string;
  image?: string;
  createdAt?: string;
  user?: { _id?: string; id?: string; name?: string; username?: string; photo?: string; profilePhoto?: string; image?: string };
  creator?: { _id?: string; id?: string; name?: string; username?: string; photo?: string; profilePhoto?: string; image?: string };
  likesCount?: number;
  commentsCount?: number;
  sharesCount?: number;
  isLiked?: boolean;
  liked?: boolean;
  isBookmarked?: boolean;
  bookmarked?: boolean;
};

type LikeUser = {
  _id?: string;
  id?: string;
  name?: string;
  username?: string;
  photo?: string;
  profilePhoto?: string;
  image?: string;
  user?: LikeUser;
};

function idOf(post: Post) { return post._id ?? post.id ?? ""; }

export default function PostCard({ post, onChanged }: { post: Post; onChanged?: () => void }) {
  const { user: currentUser } = useAuth();
  const postId = idOf(post);
  const author = post.user ?? post.creator ?? {};
  const authorId = author._id ?? author.id;
  const currentUserId = currentUser?._id ?? currentUser?.id;
  const isOwner = Boolean(authorId && currentUserId && authorId === currentUserId);

  const [liked, setLiked] = useState(Boolean(post.isLiked ?? post.liked));
  const [bookmarked, setBookmarked] = useState(Boolean(post.isBookmarked ?? post.bookmarked));
  const [likesCount, setLikesCount] = useState(post.likesCount ?? 0);
  const [sharesCount, setSharesCount] = useState(post.sharesCount ?? 0);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [editBody, setEditBody] = useState(post.body ?? "");
  const [editImage, setEditImage] = useState<File | null>(null);
  const [showLikes, setShowLikes] = useState(false);
  const [likes, setLikes] = useState<LikeUser[]>([]);
  const [likesLoading, setLikesLoading] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [shareBody, setShareBody] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const toggleLike = async () => {
    if (!postId || busy) return;
    setBusy("like"); setError("");
    try {
      await postsApi.toggleLike(postId);
      const next = !liked;
      setLiked(next);
      setLikesCount((n) => Math.max(0, n + (next ? 1 : -1)));
      onChanged?.();
    } catch (e) { setError(getApiError(e)); } finally { setBusy(""); }
  };

  const toggleBookmark = async () => {
    if (!postId || busy) return;
    setBusy("bookmark"); setError("");
    try {
      await postsApi.toggleBookmark(postId);
      setBookmarked((v) => !v);
      onChanged?.();
    } catch (e) { setError(getApiError(e)); } finally { setBusy(""); }
  };

  const sharePost = async () => {
    if (!postId || busy || !shareBody.trim()) return;
    setBusy("share"); setError("");
    try {
      await postsApi.share(postId, shareBody);
      setSharesCount((n) => n + 1);
      setShareBody("");
      setShowShare(false);
      onChanged?.();
    } catch (e) {
      setError(getApiError(e));
    } finally {
      setBusy("");
    }
  };

  const openLikes = async () => {
    if (!postId) return;
    setShowLikes(true);
    setLikesLoading(true);
    setError("");
    try {
      setLikes(await postsApi.getLikes<LikeUser>(postId, 1, 20));
    } catch (e) {
      setError(getApiError(e));
    } finally {
      setLikesLoading(false);
    }
  };

  const saveEdit = async () => {
    if (!postId || (!editBody.trim() && !editImage)) return;
    setBusy("edit"); setError("");
    try {
      await postsApi.update(postId, editBody, editImage);
      setEditing(false);
      setEditImage(null);
      onChanged?.();
    } catch (e) { setError(getApiError(e)); }
    finally { setBusy(""); }
  };

  const deletePost = async () => {
    if (!postId || busy === "delete") return;
    setBusy("delete"); setError("");
    try {
      await postsApi.remove(postId);
      setShowDeleteConfirm(false);
      onChanged?.();
    } catch (e) {
      setError(getApiError(e));
    } finally {
      setBusy("");
    }
  };

  const authorPhoto = author.photo ?? author.profilePhoto ?? author.image;
  const authorInitial = (author.name?.trim()?.[0] ?? "U").toUpperCase();

  return (
    <article className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-[0_8px_28px_rgba(15,23,42,.055)]">
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          {authorId ? (
            <Link to={`/users/${authorId}`} className="shrink-0">
              {authorPhoto ? <img src={authorPhoto} className="h-11 w-11 rounded-full object-cover ring-2 ring-gray-100" alt="" /> : <span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-[#C4B5FD] to-[#7C3AED] font-bold text-white">{authorInitial}</span>}
            </Link>
          ) : authorPhoto ? (
            <img src={authorPhoto} className="h-11 w-11 rounded-full object-cover" alt="" />
          ) : <span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-[#C4B5FD] to-[#7C3AED] font-bold text-white">{authorInitial}</span>}

          <div className="min-w-0 flex-1">
            {authorId ? <Link to={`/users/${authorId}`} className="font-bold text-gray-800 hover:text-[#8B5CF6]">{author.name ?? "User"}</Link> : <p className="font-bold text-gray-800">{author.name ?? "User"}</p>}
            <p className="text-xs text-gray-400">{post.createdAt ? new Date(post.createdAt).toLocaleString() : ""}</p>
          </div>

          {isOwner && !editing && (
            <div className="flex gap-1">
              <button onClick={() => setEditing(true)} className="rounded-xl p-2 text-gray-400 hover:bg-gray-50 hover:text-[#8B5CF6]" title="Edit post"><Edit2 size="18" /></button>
              <button onClick={() => setShowDeleteConfirm(true)} disabled={busy === "delete"} className="rounded-xl p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50" title="Delete post"><Trash size="18" /></button>
            </div>
          )}
        </div>

        {editing ? (
          <div className="mt-4 rounded-2xl bg-gray-50 p-3">
            <textarea value={editBody} onChange={(e) => setEditBody(e.target.value)} className="min-h-24 w-full resize-none bg-transparent p-2 outline-none" placeholder="Edit your post..." />
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-600 hover:border-[#8B5CF6]/50 hover:text-[#8B5CF6]">
                <GalleryAdd size="18" /> {editImage ? "Change image" : "Add image"}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setEditImage(e.target.files?.[0] ?? null)} />
              </label>
              {editImage && <span className="max-w-[190px] truncate text-xs text-gray-400">{editImage.name}</span>}
              <div className="ml-auto flex gap-2">
                <button type="button" onClick={() => { setEditing(false); setEditBody(post.body ?? ""); setEditImage(null); }} className="rounded-xl px-3 py-2 text-sm font-semibold text-gray-500">Cancel</button>
                <button type="button" onClick={saveEdit} disabled={busy === "edit"} className="rounded-xl bg-[#8B5CF6] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{busy === "edit" ? "Saving..." : "Save"}</button>
              </div>
            </div>
          </div>
        ) : post.body ? <p className="mt-4 whitespace-pre-wrap leading-7 text-gray-700">{post.body}</p> : null}
      </div>

      {post.image && !editing && <img src={post.image} alt="post" className="max-h-[600px] w-full object-cover" />}
      {error && <p className="px-5 pt-3 text-sm text-red-500">{error}</p>}

      <div className="flex items-center justify-between border-t border-gray-100 px-3 py-2 text-sm">
        <div className="flex items-center gap-1">
          <button onClick={toggleLike} disabled={busy === "like"} className={`flex items-center gap-1.5 rounded-xl px-3 py-2 font-semibold ${liked ? "bg-red-50 text-[#8B5CF6]" : "text-gray-500 hover:bg-gray-50"}`}>
            <Heart size="20" variant={liked ? "Bold" : "Linear"} /> Like
          </button>
          <button onClick={openLikes} className="rounded-lg px-2 py-1 text-xs text-gray-400 hover:text-gray-700" title="View likes">{likesCount}</button>
        </div>
        <Link to={`/posts/${postId}`} className="flex items-center gap-1.5 rounded-xl px-3 py-2 font-semibold text-gray-500 hover:bg-gray-50"><Message size="20" /> {post.commentsCount ?? 0}</Link>
        <button onClick={() => setShowShare(true)} disabled={busy === "share"} className="flex items-center gap-1.5 rounded-xl px-3 py-2 font-semibold text-gray-500 hover:bg-gray-50"><Share size="20" /> {sharesCount}</button>
        <button onClick={toggleBookmark} disabled={busy === "bookmark"} className={`rounded-xl p-2.5 ${bookmarked ? "bg-amber-50 text-amber-500" : "text-gray-500 hover:bg-gray-50"}`} title="Save post"><Bookmark size="20" variant={bookmarked ? "Bold" : "Linear"} /></button>
      </div>


      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm"
          onMouseDown={() => busy !== "delete" && setShowDeleteConfirm(false)}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-[0_30px_90px_rgba(15,23,42,.28)]"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="p-6 sm:p-7">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-red-50 text-red-500 ring-8 ring-red-50/60">
                <Trash size="30" variant="Bold" />
              </div>

              <div className="mt-6 text-center">
                <h3 className="text-xl font-extrabold text-slate-900">Delete this post?</h3>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  This action is permanent. The post and its related activity will be removed from your profile.
                </p>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={busy === "delete"}
                  className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={deletePost}
                  disabled={busy === "delete"}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-red-500 px-4 py-3 font-bold text-white shadow-lg shadow-red-200 transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Trash size="18" />
                  {busy === "delete" ? "Deleting..." : "Delete post"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {showShare && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/35 p-4 backdrop-blur-[2px]" onMouseDown={() => busy !== "share" && setShowShare(false)}>
          <div className="w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl" onMouseDown={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Share post</h3>
                <p className="text-sm text-gray-400">Add a message before sharing.</p>
              </div>
              <button onClick={() => setShowShare(false)} disabled={busy === "share"} className="rounded-full p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-50">
                <CloseCircle size="24" />
              </button>
            </div>

            <textarea
              value={shareBody}
              onChange={(e) => setShareBody(e.target.value)}
              placeholder="Write something about this post..."
              className="min-h-28 w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none transition focus:border-[#8B5CF6] focus:bg-white"
            />

            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => { setShowShare(false); setShareBody(""); }} disabled={busy === "share"} className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-50 disabled:opacity-50">
                Cancel
              </button>
              <button type="button" onClick={sharePost} disabled={busy === "share" || !shareBody.trim()} className="inline-flex items-center gap-2 rounded-xl bg-[#8B5CF6] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
                <Share size="18" /> {busy === "share" ? "Sharing..." : "Share"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showLikes && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/35 p-4 backdrop-blur-[2px]" onMouseDown={() => setShowLikes(false)}>
          <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl" onMouseDown={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between"><h3 className="text-lg font-bold">People who liked this</h3><button onClick={() => setShowLikes(false)} className="rounded-full p-1 text-gray-400 hover:bg-gray-100"><CloseCircle size="24" /></button></div>
            {likesLoading ? <div className="py-8 text-center text-gray-400">Loading likes...</div> : likes.length ? (
              <div className="max-h-80 space-y-2 overflow-y-auto">
                {likes.map((entry, index) => {
                  const person = entry.user ?? entry;
                  const uid = person._id ?? person.id;
                  const pic = person.photo ?? person.profilePhoto ?? person.image;
                  return <div key={uid ?? index} className="flex items-center gap-3 rounded-2xl p-2 hover:bg-gray-50">{pic ? <img src={pic} className="h-10 w-10 rounded-full object-cover" alt=""/> : <span className="grid h-10 w-10 place-items-center rounded-full bg-gray-100 font-bold text-gray-500">{(person.name?.[0] ?? "U").toUpperCase()}</span>}<div className="min-w-0 flex-1">{uid ? <Link to={`/users/${uid}`} onClick={() => setShowLikes(false)} className="truncate font-semibold hover:text-[#8B5CF6]">{person.name ?? "User"}</Link> : <p className="truncate font-semibold">{person.name ?? "User"}</p>}<p className="truncate text-xs text-gray-400">@{person.username ?? "user"}</p></div></div>;
                })}
              </div>
            ) : <div className="py-8 text-center text-gray-400">No likes yet.</div>}
          </div>
        </div>
      )}
    </article>
  );
}
