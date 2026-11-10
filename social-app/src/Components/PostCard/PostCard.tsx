
import { useState } from "react";
import { Link } from "react-router";
import {
  Bookmark,
  Edit2,
  GalleryAdd,
  Heart,
  Message,
  Share,
  Trash,
  CloseCircle,
} from "iconsax-reactjs";
import { getApiError } from "../../lib/api";
import { postsApi } from "../../lib/postsApi";
import { useAuth } from "../../context/AuthContext";

export type Post = {
  _id?: string;
  id?: string;
  body?: string;
  image?: string;
  createdAt?: string;
  user?: {
    _id?: string;
    id?: string;
    name?: string;
    username?: string;
    photo?: string;
    profilePhoto?: string;
    image?: string;
  };
  creator?: {
    _id?: string;
    id?: string;
    name?: string;
    username?: string;
    photo?: string;
    profilePhoto?: string;
    image?: string;
  };
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

function idOf(post: Post) {
  return post._id ?? post.id ?? "";
}

export default function PostCard({
  post,
  onChanged,
}: {
  post: Post;
  onChanged?: () => void;
}) {
  const { user: currentUser } = useAuth();

  const postId = idOf(post);
  const author = post.user ?? post.creator ?? {};
  const authorId = author._id ?? author.id;
  const currentUserId = currentUser?._id ?? currentUser?.id;

  const isOwner = Boolean(
    authorId && currentUserId && authorId === currentUserId
  );

  const [liked, setLiked] = useState(
    Boolean(post.isLiked ?? post.liked)
  );

  const [bookmarked, setBookmarked] = useState(
    Boolean(post.isBookmarked ?? post.bookmarked)
  );

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

    setBusy("like");
    setError("");

    try {
      await postsApi.toggleLike(postId);

      const next = !liked;
      setLiked(next);
      setLikesCount((n) => Math.max(0, n + (next ? 1 : -1)));

      onChanged?.();
    } catch (e) {
      setError(getApiError(e));
    } finally {
      setBusy("");
    }
  };

  const toggleBookmark = async () => {
    if (!postId || busy) return;

    setBusy("bookmark");
    setError("");

    try {
      await postsApi.toggleBookmark(postId);

      setBookmarked((v) => !v);
      onChanged?.();
    } catch (e) {
      setError(getApiError(e));
    } finally {
      setBusy("");
    }
  };

  const sharePost = async () => {
    if (!postId || busy || !shareBody.trim()) return;

    setBusy("share");
    setError("");

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

    setBusy("edit");
    setError("");

    try {
      await postsApi.update(postId, editBody, editImage);

      setEditing(false);
      setEditImage(null);

      onChanged?.();
    } catch (e) {
      setError(getApiError(e));
    } finally {
      setBusy("");
    }
  };

  const deletePost = async () => {
    if (!postId || busy === "delete") return;

    setBusy("delete");
    setError("");

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

  const authorPhoto =
    author.photo ?? author.profilePhoto ?? author.image;

  const authorInitial =
    (author.name?.trim()?.[0] ?? "U").toUpperCase();

  const actionButton =
    "inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 hover:bg-violet-50 hover:text-violet-700 active:scale-95 dark:hover:bg-violet-500/10 dark:hover:text-violet-300";

  const modalClass =
    "w-full overflow-hidden rounded-[28px] border border-violet-100 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.22)] dark:border-white/10 dark:bg-[#1C1B32] dark:shadow-[0_30px_90px_rgba(0,0,0,0.4)]";

  const mutedText = "text-[#89859A] dark:text-[#AAA4BD]";

  return (
    <article
      className="
        group overflow-hidden rounded-[1.75rem]
        border border-violet-100/80
        bg-white/95
        shadow-[0_12px_35px_rgba(39,29,90,0.05)]
        backdrop-blur-xl
        transition-all duration-300
        hover:shadow-[0_16px_42px_rgba(139,92,246,0.10)]
        dark:border-white/10
        dark:bg-[#1C1B32]/95
        dark:shadow-[0_12px_35px_rgba(0,0,0,0.18)]
        dark:hover:shadow-[0_16px_42px_rgba(139,92,246,0.12)]
      "
    >
      {/* POST HEADER */}
      <div className="p-4 sm:p-5">

        <div className="flex items-start gap-3">

          {/* AUTHOR AVATAR */}
          {authorId ? (
            <Link
              to={`/users/${authorId}`}
              className="shrink-0 rounded-full transition hover:scale-105"
            >
              {authorPhoto ? (
                <img
                  src={authorPhoto}
                  className="h-11 w-11 rounded-full object-cover ring-2 ring-violet-100 dark:ring-violet-400/20"
                  alt=""
                />
              ) : (
                <span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-[#C4B5FD] to-[#7C3AED] font-bold text-white ring-2 ring-violet-100 dark:ring-violet-400/20">
                  {authorInitial}
                </span>
              )}
            </Link>
          ) : authorPhoto ? (
            <img
              src={authorPhoto}
              className="h-11 w-11 shrink-0 rounded-full object-cover"
              alt=""
            />
          ) : (
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#C4B5FD] to-[#7C3AED] font-bold text-white">
              {authorInitial}
            </span>
          )}

          {/* AUTHOR DETAILS */}
          <div className="min-w-0 flex-1 pt-0.5">
            {authorId ? (
              <Link
                to={`/users/${authorId}`}
                className="font-bold text-[#29243C] transition hover:text-violet-600 dark:text-[#F5F0FF] dark:hover:text-violet-300"
              >
                {author.name ?? "User"}
              </Link>
            ) : (
              <p className="font-bold text-[#29243C] dark:text-[#F5F0FF]">
                {author.name ?? "User"}
              </p>
            )}

            <p className={`mt-0.5 text-xs ${mutedText}`}>
              {post.createdAt
                ? new Date(post.createdAt).toLocaleString()
                : ""}
            </p>
          </div>

          {/* OWNER ACTIONS */}
          {isOwner && !editing && (
            <div className="flex shrink-0 gap-1">
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="rounded-xl p-2 text-gray-400 transition hover:bg-violet-50 hover:text-violet-600 dark:hover:bg-violet-500/10 dark:hover:text-violet-300"
                title="Edit post"
              >
                <Edit2 size="18" />
              </button>

              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={busy === "delete"}
                className="rounded-xl p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-red-500/10"
                title="Delete post"
              >
                <Trash size="18" />
              </button>
            </div>
          )}
        </div>

        {/* EDIT POST */}
        {editing ? (
          <div className="mt-5 rounded-2xl border border-violet-100 bg-[#F8F6FF] p-4 dark:border-white/10 dark:bg-[#25213A]">

            <textarea
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
              className="
                min-h-24 w-full resize-none rounded-xl
                border border-transparent bg-white/80 p-3
                text-sm leading-7 text-[#29243C]
                outline-none transition
                placeholder:text-gray-400
                focus:border-violet-300 focus:ring-4 focus:ring-violet-500/10
                dark:bg-[#1C1B32] dark:text-[#F5F0FF]
                dark:placeholder:text-gray-500
              "
              placeholder="Edit your post..."
            />

            <div className="mt-3 flex flex-wrap items-center gap-2">

              <label
                className="
                  inline-flex cursor-pointer items-center gap-2
                  rounded-xl border border-violet-100
                  bg-white px-3 py-2 text-sm font-semibold
                  text-gray-600 transition
                  hover:border-violet-300 hover:text-violet-600
                  dark:border-white/10 dark:bg-[#1C1B32]
                  dark:text-gray-300 dark:hover:text-violet-300
                "
              >
                <GalleryAdd size="18" />
                {editImage ? "Change image" : "Add image"}

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    setEditImage(e.target.files?.[0] ?? null)
                  }
                />
              </label>

              {editImage && (
                <span className={`max-w-[190px] truncate text-xs ${mutedText}`}>
                  {editImage.name}
                </span>
              )}

              <div className="ml-auto flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setEditBody(post.body ?? "");
                    setEditImage(null);
                  }}
                  className="rounded-xl px-3 py-2 text-sm font-semibold text-gray-500 transition hover:bg-white dark:text-gray-400 dark:hover:bg-[#302B47]"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={saveEdit}
                  disabled={busy === "edit"}
                  className="rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50"
                >
                  {busy === "edit" ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          post.body && (
            <p className="mt-4 whitespace-pre-wrap break-words text-[15px] leading-7 text-[#514B63] dark:text-[#D5CFE5]">
              {post.body}
            </p>
          )
        )}
      </div>

      {/* POST IMAGE */}
      {post.image && !editing && (
        <div className="overflow-hidden bg-[#F7F5FF] dark:bg-[#25213A]">
          <img
            src={post.image}
            alt="Post"
            className="max-h-[600px] w-full object-cover transition-transform duration-500 group-hover:scale-[1.005]"
          />
        </div>
      )}

      {/* ERROR */}
      {error && (
        <p
          role="alert"
          className="mx-4 mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-300 sm:mx-5"
        >
          {error}
        </p>
      )}

      {/* POST ACTIONS */}
      <div className="flex items-center justify-between gap-1 border-t border-violet-100/80 px-2 py-2 dark:border-white/10 sm:px-3">

        {/* LIKE */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={toggleLike}
            disabled={busy === "like"}
            className={`
              ${actionButton}
              ${liked
                ? "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300"
                : "text-gray-500 dark:text-gray-400"
              }
              disabled:opacity-50
            `}
          >
            <Heart
              size="20"
              variant={liked ? "Bold" : "Linear"}
            />
            <span className="hidden sm:inline">Like</span>
          </button>

          <button
            type="button"
            onClick={openLikes}
            className="rounded-lg px-2 py-1 text-xs font-semibold text-gray-400 transition hover:text-violet-600 dark:hover:text-violet-300"
            title="View likes"
          >
            {likesCount}
          </button>
        </div>

        {/* COMMENTS */}
        <Link
          to={`/posts/${postId}`}
          className={`${actionButton} text-gray-500 dark:text-gray-400`}
        >
          <Message size="20" />
          <span>{post.commentsCount ?? 0}</span>
        </Link>

        {/* SHARE */}
        <button
          type="button"
          onClick={() => setShowShare(true)}
          disabled={busy === "share"}
          className={`${actionButton} text-gray-500 dark:text-gray-400 disabled:opacity-50`}
        >
          <Share size="20" />
          <span>{sharesCount}</span>
        </button>

        {/* BOOKMARK */}
        <button
          type="button"
          onClick={toggleBookmark}
          disabled={busy === "bookmark"}
          className={`
            ${actionButton}
            ${bookmarked
              ? "bg-amber-50 text-amber-500 dark:bg-amber-500/10 dark:text-amber-300"
              : "text-gray-500 dark:text-gray-400"
            }
            disabled:opacity-50
          `}
          title="Save post"
        >
          <Bookmark
            size="20"
            variant={bookmarked ? "Bold" : "Linear"}
          />
        </button>
      </div>

      {/* DELETE CONFIRMATION */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onMouseDown={() =>
            busy !== "delete" && setShowDeleteConfirm(false)
          }
        >
          <div
            className={modalClass + " max-w-md"}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="p-6 sm:p-7">

              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-red-50 text-red-500 ring-8 ring-red-50/60 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/5">
                <Trash size="30" variant="Bold" />
              </div>

              <div className="mt-6 text-center">
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-[#F5F0FF]">
                  Delete this post?
                </h3>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500 dark:text-[#AAA4BD]">
                  This action is permanent. The post and its related activity will be removed from your profile.
                </p>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={busy === "delete"}
                  className="
                    flex-1 rounded-2xl border border-slate-200
                    bg-white px-4 py-3 font-bold text-slate-600
                    transition hover:bg-slate-50
                    disabled:cursor-not-allowed disabled:opacity-50
                    dark:border-white/10 dark:bg-[#25213A]
                    dark:text-gray-300 dark:hover:bg-[#302B47]
                  "
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={deletePost}
                  disabled={busy === "delete"}
                  className="
                    flex flex-1 items-center justify-center gap-2
                    rounded-2xl bg-gradient-to-r from-red-500 to-rose-600
                    px-4 py-3 font-bold text-white
                    shadow-lg shadow-red-200/50
                    transition hover:-translate-y-0.5 hover:shadow-xl
                    disabled:cursor-not-allowed disabled:opacity-60
                    dark:shadow-red-950/30
                  "
                >
                  <Trash size="18" />
                  {busy === "delete" ? "Deleting..." : "Delete post"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SHARE MODAL */}
      {showShare && (
        <div
          className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm"
          onMouseDown={() =>
            busy !== "share" && setShowShare(false)
          }
        >
          <div
            className={`${modalClass} max-w-md p-5`}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-[#29243C] dark:text-[#F5F0FF]">
                  Share post
                </h3>

                <p className={`mt-1 text-sm ${mutedText}`}>
                  Add a message before sharing.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowShare(false)}
                disabled={busy === "share"}
                className="rounded-full p-2 text-gray-400 transition hover:bg-violet-50 hover:text-violet-600 disabled:opacity-50 dark:hover:bg-violet-500/10 dark:hover:text-violet-300"
              >
                <CloseCircle size="24" />
              </button>
            </div>

            <textarea
              value={shareBody}
              onChange={(e) => setShareBody(e.target.value)}
              placeholder="Write something about this post..."
              className="
                min-h-28 w-full resize-none rounded-2xl
                border border-violet-100 bg-[#F8F6FF]
                p-4 text-sm text-[#29243C]
                outline-none transition
                placeholder:text-gray-400
                focus:border-violet-400 focus:bg-white
                focus:ring-4 focus:ring-violet-500/10
                dark:border-white/10 dark:bg-[#25213A]
                dark:text-[#F5F0FF] dark:placeholder:text-gray-500
                dark:focus:bg-[#292540]
              "
            />

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowShare(false);
                  setShareBody("");
                }}
                disabled={busy === "share"}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-500 transition hover:bg-gray-50 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-[#302B47]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={sharePost}
                disabled={busy === "share" || !shareBody.trim()}
                className="
                  inline-flex items-center gap-2 rounded-xl
                  bg-gradient-to-r from-[#8B5CF6] to-[#6950E8]
                  px-5 py-2.5 text-sm font-bold text-white
                  shadow-md shadow-violet-500/20
                  transition hover:-translate-y-0.5 hover:shadow-lg
                  disabled:cursor-not-allowed disabled:opacity-50
                "
              >
                <Share size="18" />
                {busy === "share" ? "Sharing..." : "Share"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LIKES MODAL */}
      {showLikes && (
        <div
          className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm"
          onMouseDown={() => setShowLikes(false)}
        >
          <div
            className={`${modalClass} max-w-sm p-5`}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-[#29243C] dark:text-[#F5F0FF]">
                People who liked this
              </h3>

              <button
                type="button"
                onClick={() => setShowLikes(false)}
                className="rounded-full p-2 text-gray-400 transition hover:bg-violet-50 hover:text-violet-600 dark:hover:bg-violet-500/10 dark:hover:text-violet-300"
              >
                <CloseCircle size="24" />
              </button>
            </div>

            {likesLoading ? (
              <div className="py-8 text-center">
                <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600 dark:border-violet-900 dark:border-t-violet-400" />

                <p className={`text-sm ${mutedText}`}>
                  Loading likes...
                </p>
              </div>
            ) : likes.length ? (
              <div className="max-h-80 space-y-2 overflow-y-auto">
                {likes.map((entry, index) => {
                  const person = entry.user ?? entry;
                  const uid = person._id ?? person.id;

                  const pic =
                    person.photo ??
                    person.profilePhoto ??
                    person.image;

                  return (
                    <div
                      key={uid ?? index}
                      className="flex items-center gap-3 rounded-2xl p-3 transition hover:bg-violet-50 dark:hover:bg-violet-500/10"
                    >
                      {pic ? (
                        <img
                          src={pic}
                          className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-violet-100 dark:ring-violet-400/20"
                          alt=""
                        />
                      ) : (
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-violet-100 font-bold text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
                          {(person.name?.[0] ?? "U").toUpperCase()}
                        </span>
                      )}

                      <div className="min-w-0 flex-1">
                        {uid ? (
                          <Link
                            to={`/users/${uid}`}
                            onClick={() => setShowLikes(false)}
                            className="block truncate font-bold text-[#29243C] transition hover:text-violet-600 dark:text-[#F5F0FF] dark:hover:text-violet-300"
                          >
                            {person.name ?? "User"}
                          </Link>
                        ) : (
                          <p className="truncate font-bold text-[#29243C] dark:text-[#F5F0FF]">
                            {person.name ?? "User"}
                          </p>
                        )}

                        <p className={`truncate text-xs ${mutedText}`}>
                          @{person.username ?? "user"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={`py-8 text-center text-sm ${mutedText}`}>
                No likes yet.
              </div>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
