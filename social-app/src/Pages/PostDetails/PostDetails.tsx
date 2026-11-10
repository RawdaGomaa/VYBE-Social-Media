
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import {
  Edit2,
  GalleryAdd,
  Heart,
  Message,
  Send2,
  Trash,
  CloseCircle,
} from "iconsax-reactjs";
import PostCard, { type Post } from "../../Components/PostCard/PostCard";
import { getApiError } from "../../lib/api";
import { postsApi } from "../../lib/postsApi";
import { commentsApi } from "../../lib/commentsApi";
import { useAuth } from "../../context/AuthContext";

type Person = {
  _id?: string;
  id?: string;
  name?: string;
  username?: string;
  photo?: string;
  profilePhoto?: string;
  image?: string;
};

type Comment = {
  _id?: string;
  id?: string;
  content?: string;
  body?: string;
  text?: string;
  image?: string;
  createdAt?: string;
  user?: Person;
  creator?: Person;
  author?: Person;
  likesCount?: number;
  repliesCount?: number;
  isLiked?: boolean;
  liked?: boolean;
};

function commentIdOf(comment: Comment) {
  return comment._id ?? comment.id ?? "";
}

function commentTextOf(comment: Comment) {
  return comment.content ?? comment.body ?? comment.text ?? "";
}

function authorOf(comment: Comment) {
  return comment.user ?? comment.creator ?? comment.author ?? {};
}

const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-violet-500/15 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0";

const secondaryButton =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-violet-100 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:border-violet-300 hover:bg-violet-50 dark:border-white/10 dark:bg-[#25213A] dark:text-gray-300 dark:hover:bg-violet-500/10";

const inputStyle =
  "w-full resize-none rounded-2xl border border-violet-100 bg-[#F8F6FF] p-4 text-sm leading-7 text-[#29243C] outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-[#25213A] dark:text-[#F5F0FF] dark:placeholder:text-gray-500 dark:focus:border-violet-400 dark:focus:bg-[#292540]";

export default function PostDetails() {
  const { postId } = useParams();
  const { user } = useAuth();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  const currentUserId = user?._id ?? user?.id;

  const load = async () => {
    if (!postId) return;

    setLoading(true);
    setError("");

    try {
      const [singlePost, commentList] = await Promise.all([
        postsApi.getOne<Post>(postId),
        commentsApi.getPostComments<Comment>(postId, 1, 50),
      ]);

      setPost(singlePost);
      setComments(commentList);
    } catch (e) {
      setError(getApiError(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [postId]);

  const addComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!postId || (!text.trim() && !image) || posting) return;

    setPosting(true);
    setError("");

    try {
      await commentsApi.createComment(postId, text, image);

      setText("");
      setImage(null);

      await load();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setPosting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[55vh] w-full max-w-2xl flex-col items-center justify-center gap-4 px-4">
        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-violet-200 border-t-violet-600 dark:border-violet-900 dark:border-t-violet-400" />
        <p className="text-sm font-semibold text-[#89859A] dark:text-[#AAA4BD]">
          Loading post...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-3 py-8 sm:px-5">

      {/* PAGE HEADER */}
      <div>
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700 dark:border-violet-400/20 dark:bg-violet-500/10 dark:text-violet-300">
          <span>✦</span>
          VYBE COMMUNITY
        </div>

        <h1 className="text-3xl font-black tracking-tight text-[#211940] dark:text-[#F5F0FF]">
          Post <span className="text-violet-600 dark:text-violet-400">Details</span>
        </h1>

        <p className="mt-2 text-sm text-[#89859A] dark:text-[#AAA4BD]">
          Join the conversation and share your thoughts.
        </p>
      </div>

      {/* ERROR */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-300"
        >
          <span>ⓘ</span>
          <p>{error}</p>
        </div>
      )}

      {/* MAIN POST */}
      {post ? (
        <div className="space-y-5">
          <PostCard post={post} onChanged={load} />
        </div>
      ) : (
        <div className="rounded-3xl border border-violet-100 bg-white p-8 text-center dark:border-white/10 dark:bg-[#1C1B32]">
          <p className="font-semibold text-gray-500 dark:text-gray-400">
            Post not found.
          </p>
        </div>
      )}

      {/* ADD COMMENT */}
      {post && (
        <section className="overflow-hidden rounded-[1.75rem] border border-violet-100 bg-white/95 shadow-[0_12px_35px_rgba(39,29,90,0.05)] backdrop-blur-xl dark:border-white/10 dark:bg-[#1C1B32]/95">

          <div className="border-b border-violet-100 px-5 py-4 dark:border-white/10">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-md shadow-violet-500/20">
                <Message size="21" />
              </span>

              <div>
                <h2 className="font-extrabold text-[#211940] dark:text-[#F5F0FF]">
                  Join the conversation
                </h2>
                <p className="mt-0.5 text-xs text-[#89859A] dark:text-[#AAA4BD]">
                  Share your thoughts with the community.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={addComment} className="p-4 sm:p-5">

            <textarea
              value={text}
              disabled={posting}
              onChange={(e) => setText(e.target.value)}
              className={`${inputStyle} min-h-28`}
              placeholder="Write a comment..."
            />

            {/* IMAGE PREVIEW */}
            {image && (
              <div className="relative mt-4 overflow-hidden rounded-2xl border border-violet-100 bg-[#F8F6FF] dark:border-white/10 dark:bg-[#25213A]">
                <img
                  src={URL.createObjectURL(image)}
                  className="max-h-80 w-full object-cover"
                  alt="Comment preview"
                />

                <button
                  type="button"
                  disabled={posting}
                  onClick={() => setImage(null)}
                  className="absolute right-3 top-3 rounded-full bg-black/60 p-2 text-white shadow-lg backdrop-blur transition hover:bg-black/80 disabled:opacity-50"
                  title="Remove image"
                >
                  <CloseCircle size="21" />
                </button>

                <div className="truncate border-t border-violet-100 px-3 py-2 text-xs text-gray-500 dark:border-white/10 dark:text-gray-400">
                  {image.name}
                </div>
              </div>
            )}

            {/* COMMENT ACTIONS */}
            <div className="mt-4 flex flex-wrap items-center gap-3">

              <label
                className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-semibold transition ${
                  posting
                    ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400 opacity-60 dark:border-white/10 dark:bg-[#25213A]"
                    : "cursor-pointer border-violet-100 bg-[#F8F6FF] text-violet-700 hover:border-violet-300 hover:bg-violet-50 dark:border-white/10 dark:bg-[#25213A] dark:text-violet-300 dark:hover:bg-violet-500/10"
                }`}
              >
                <GalleryAdd size="19" />
                {image ? "Change photo" : "Add photo"}

                <input
                  type="file"
                  accept="image/*"
                  disabled={posting}
                  className="hidden"
                  onChange={(e) => setImage(e.target.files?.[0] ?? null)}
                />
              </label>

              <button
                type="submit"
                disabled={posting || (!text.trim() && !image)}
                className={`${primaryButton} ml-auto px-5 py-3`}
              >
                <Send2 size="18" />
                {posting ? "Sending..." : "Comment"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* COMMENTS SECTION */}
      <section className="space-y-4">

        <div className="flex items-center justify-between gap-3 px-1">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-6 w-1 rounded-full bg-gradient-to-b from-violet-500 to-purple-600" />
              <h2 className="text-xl font-black text-[#211940] dark:text-[#F5F0FF]">
                Comments
              </h2>
            </div>

            <p className="mt-1 pl-3 text-xs text-[#89859A] dark:text-[#AAA4BD]">
              See what people are saying.
            </p>
          </div>

          <span className="rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 text-xs font-extrabold text-violet-700 dark:border-violet-400/20 dark:bg-violet-500/10 dark:text-violet-300">
            {comments.length} Comments
          </span>
        </div>

        {/* COMMENT LIST */}
        {comments.length ? (
          <div className="space-y-4">
            {comments.map((comment, index) => (
              <CommentCard
                key={commentIdOf(comment) || index}
                postId={postId ?? ""}
                comment={comment}
                currentUserId={currentUserId}
                onChanged={load}
              />
            ))}
          </div>
        ) : (
          <div className="overflow-hidden rounded-[1.75rem] border border-violet-100 bg-white p-8 text-center shadow-sm dark:border-white/10 dark:bg-[#1C1B32] sm:p-10">

            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 text-violet-600 dark:from-violet-500/15 dark:to-purple-500/15 dark:text-violet-300">
              <Message size="30" />
            </div>

            <h3 className="mt-4 font-extrabold text-[#211940] dark:text-[#F5F0FF]">
              No comments yet
            </h3>

            <p className="mt-2 text-sm text-[#89859A] dark:text-[#AAA4BD]">
              Be the first to share your thoughts!
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function CommentCard({
  postId,
  comment,
  currentUserId,
  onChanged,
  isReply = false,
}: {
  postId: string;
  comment: Comment;
  currentUserId?: string;
  onChanged: () => Promise<void> | void;
  isReply?: boolean;
}) {
  const commentId = commentIdOf(comment);
  const author = authorOf(comment);
  const authorId = author._id ?? author.id;

  const isOwner = Boolean(
    authorId && currentUserId && authorId === currentUserId
  );

  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [liked, setLiked] = useState(Boolean(comment.isLiked ?? comment.liked));
  const [likesCount, setLikesCount] = useState(comment.likesCount ?? 0);

  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(commentTextOf(comment));
  const [editImage, setEditImage] = useState<File | null>(null);

  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyImage, setReplyImage] = useState<File | null>(null);

  const [repliesOpen, setRepliesOpen] = useState(false);
  const [repliesLoading, setRepliesLoading] = useState(false);
  const [replies, setReplies] = useState<Comment[]>([]);

  const avatar = author.photo ?? author.profilePhoto ?? author.image;
  const initial = (author.name?.trim()?.[0] ?? "U").toUpperCase();

  const replyCount = useMemo(
    () => Math.max(comment.repliesCount ?? 0, replies.length),
    [comment.repliesCount, replies.length]
  );

  const toggleLike = async () => {
    if (!commentId || busy) return;

    setBusy("like");
    setError("");

    try {
      await commentsApi.toggleLike(postId, commentId);

      const next = !liked;
      setLiked(next);
      setLikesCount((count) => Math.max(0, count + (next ? 1 : -1)));
    } catch (e) {
      setError(getApiError(e));
    } finally {
      setBusy("");
    }
  };

  const loadReplies = async () => {
    if (!commentId) return;

    setRepliesOpen(true);
    setRepliesLoading(true);
    setError("");

    try {
      setReplies(
        await commentsApi.getReplies<Comment>(postId, commentId, 1, 50)
      );
    } catch (e) {
      setError(getApiError(e));
    } finally {
      setRepliesLoading(false);
    }
  };

  const submitReply = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!commentId || (!replyText.trim() && !replyImage) || busy) return;

    setBusy("reply");
    setError("");

    try {
      await commentsApi.createReply(postId, commentId, replyText, replyImage);

      setReplyText("");
      setReplyImage(null);
      setReplyOpen(false);

      await loadReplies();
      await onChanged();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setBusy("");
    }
  };

  const saveEdit = async () => {
    if (!commentId || (!editText.trim() && !editImage) || busy) return;

    setBusy("edit");
    setError("");

    try {
      await commentsApi.updateComment(postId, commentId, editText, editImage);

      setEditing(false);
      setEditImage(null);

      await onChanged();
    } catch (e) {
      setError(getApiError(e));
    } finally {
      setBusy("");
    }
  };

  const deleteComment = async () => {
    if (
      !commentId ||
      busy ||
      !window.confirm(isReply ? "Delete this reply?" : "Delete this comment?")
    ) {
      return;
    }

    setBusy("delete");
    setError("");

    try {
      await commentsApi.deleteComment(postId, commentId);
      await onChanged();
    } catch (e) {
      setError(getApiError(e));
    } finally {
      setBusy("");
    }
  };

  return (
    <div
      className={
        isReply
          ? "ml-4 border-l-2 border-violet-100 pl-3 dark:border-violet-400/20 sm:ml-8 sm:pl-4"
          : "overflow-hidden rounded-[1.5rem] border border-violet-100 bg-white p-4 shadow-[0_8px_25px_rgba(39,29,90,0.04)] transition-all duration-200 hover:shadow-[0_12px_30px_rgba(139,92,246,0.07)] dark:border-white/10 dark:bg-[#1C1B32] sm:p-5"
      }
    >
      <div className="flex items-start gap-3">

        {/* AVATAR */}
        {authorId ? (
          <Link to={`/users/${authorId}`} className="shrink-0 transition hover:scale-105">
            {avatar ? (
              <img
                src={avatar}
                className="h-10 w-10 rounded-full object-cover ring-2 ring-violet-100 dark:ring-violet-400/20"
                alt=""
              />
            ) : (
              <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-[#C4B5FD] to-[#7C3AED] text-sm font-bold text-white ring-2 ring-violet-100 dark:ring-violet-400/20">
                {initial}
              </span>
            )}
          </Link>
        ) : avatar ? (
          <img
            src={avatar}
            className="h-10 w-10 shrink-0 rounded-full object-cover"
            alt=""
          />
        ) : (
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-violet-100 text-sm font-bold text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
            {initial}
          </span>
        )}

        <div className="min-w-0 flex-1">

          {/* AUTHOR HEADER */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              {authorId ? (
                <Link
                  to={`/users/${authorId}`}
                  className="block truncate text-sm font-extrabold text-[#29243C] transition hover:text-violet-600 dark:text-[#F5F0FF] dark:hover:text-violet-300"
                >
                  {author.name ?? "User"}
                </Link>
              ) : (
                <span className="text-sm font-extrabold text-[#29243C] dark:text-[#F5F0FF]">
                  {author.name ?? "User"}
                </span>
              )}

              {author.username && (
                <p className="text-xs text-violet-600 dark:text-violet-400">
                  @{author.username}
                </p>
              )}

              {comment.createdAt && (
                <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">
                  {new Date(comment.createdAt).toLocaleString()}
                </p>
              )}
            </div>

            {/* OWNER ACTIONS */}
            {isOwner && !editing && (
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  disabled={Boolean(busy)}
                  className="rounded-xl p-2 text-gray-400 transition hover:bg-violet-50 hover:text-violet-600 disabled:opacity-50 dark:hover:bg-violet-500/10 dark:hover:text-violet-300"
                  title="Edit"
                >
                  <Edit2 size="17" />
                </button>

                <button
                  type="button"
                  onClick={deleteComment}
                  disabled={Boolean(busy)}
                  className="rounded-xl p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50 dark:hover:bg-red-500/10"
                  title="Delete"
                >
                  <Trash size="17" />
                </button>
              </div>
            )}
          </div>

          {/* EDIT COMMENT */}
          {editing ? (
            <div className="mt-3 rounded-2xl border border-violet-100 bg-[#F8F6FF] p-3 dark:border-white/10 dark:bg-[#25213A]">

              <textarea
                value={editText}
                disabled={busy === "edit"}
                onChange={(e) => setEditText(e.target.value)}
                className={`${inputStyle} min-h-20 bg-white dark:bg-[#1C1B32]`}
                placeholder="Edit your comment..."
              />

              <div className="mt-3 flex flex-wrap items-center gap-2">

                <label
                  className={`inline-flex items-center gap-2 rounded-xl border border-violet-100 bg-white px-3 py-2 text-xs font-bold text-violet-600 transition dark:border-white/10 dark:bg-[#1C1B32] dark:text-violet-300 ${
                    busy === "edit"
                      ? "cursor-not-allowed opacity-50"
                      : "cursor-pointer hover:border-violet-300"
                  }`}
                >
                  <GalleryAdd size="16" />
                  {editImage ? "Change image" : "Add image"}

                  <input
                    type="file"
                    accept="image/*"
                    disabled={busy === "edit"}
                    className="hidden"
                    onChange={(e) =>
                      setEditImage(e.target.files?.[0] ?? null)
                    }
                  />
                </label>

                <div className="ml-auto flex gap-2">
                  <button
                    type="button"
                    disabled={busy === "edit"}
                    onClick={() => {
                      setEditing(false);
                      setEditText(commentTextOf(comment));
                      setEditImage(null);
                    }}
                    className={secondaryButton}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    disabled={busy === "edit" || (!editText.trim() && !editImage)}
                    onClick={saveEdit}
                    className={primaryButton}
                  >
                    {busy === "edit" ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {commentTextOf(comment) && (
                <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-[#514B63] dark:text-[#D5CFE5]">
                  {commentTextOf(comment)}
                </p>
              )}

              {comment.image && (
                <div className="mt-3 overflow-hidden rounded-2xl border border-violet-100 dark:border-white/10">
                  <img
                    src={comment.image}
                    className="max-h-96 w-full object-cover"
                    alt="Comment"
                  />
                </div>
              )}
            </>
          )}

          {/* COMMENT ERROR */}
          {error && (
            <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-500/10 dark:text-red-300">
              {error}
            </p>
          )}

          {/* COMMENT ACTIONS */}
          {!editing && (
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-violet-50 pt-2 dark:border-white/5">

              <button
                type="button"
                onClick={toggleLike}
                disabled={busy === "like"}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition disabled:opacity-50 ${
                  liked
                    ? "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300"
                    : "text-gray-400 hover:bg-violet-50 hover:text-violet-600 dark:hover:bg-violet-500/10 dark:hover:text-violet-300"
                }`}
              >
                <Heart size="16" variant={liked ? "Bold" : "Linear"} />
                {likesCount || "Like"}
              </button>

              {!isReply && (
                <button
                  type="button"
                  onClick={() => setReplyOpen((value) => !value)}
                  className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-gray-400 transition hover:bg-violet-50 hover:text-violet-600 dark:hover:bg-violet-500/10 dark:hover:text-violet-300"
                >
                  <Message size="16" />
                  Reply
                </button>
              )}

              {!isReply && (
                <button
                  type="button"
                  onClick={repliesOpen ? () => setRepliesOpen(false) : loadReplies}
                  className="rounded-xl px-3 py-2 text-xs font-bold text-violet-600 transition hover:bg-violet-50 dark:text-violet-400 dark:hover:bg-violet-500/10"
                >
                  {repliesOpen ? "Hide replies" : `${replyCount || "View"} replies`}
                </button>
              )}
            </div>
          )}

          {/* REPLY FORM */}
          {!isReply && replyOpen && (
            <form
              onSubmit={submitReply}
              className="mt-3 rounded-2xl border border-violet-100 bg-[#F8F6FF] p-3 dark:border-white/10 dark:bg-[#25213A]"
            >
              <textarea
                value={replyText}
                disabled={busy === "reply"}
                onChange={(e) => setReplyText(e.target.value)}
                className={`${inputStyle} min-h-20 bg-white dark:bg-[#1C1B32]`}
                placeholder={`Reply to ${author.name ?? "this comment"}...`}
              />

              {replyImage && (
                <div className="mt-2 truncate text-xs text-violet-600 dark:text-violet-400">
                  {replyImage.name}
                </div>
              )}

              <div className="mt-3 flex items-center gap-2">

                <label
                  className={`inline-flex items-center gap-1.5 rounded-xl border border-violet-100 bg-white px-3 py-2 text-xs font-bold text-violet-600 transition dark:border-white/10 dark:bg-[#1C1B32] dark:text-violet-300 ${
                    busy === "reply"
                      ? "cursor-not-allowed opacity-50"
                      : "cursor-pointer hover:border-violet-300"
                  }`}
                >
                  <GalleryAdd size="16" />
                  Photo

                  <input
                    type="file"
                    accept="image/*"
                    disabled={busy === "reply"}
                    className="hidden"
                    onChange={(e) =>
                      setReplyImage(e.target.files?.[0] ?? null)
                    }
                  />
                </label>

                <button
                  type="submit"
                  disabled={busy === "reply" || (!replyText.trim() && !replyImage)}
                  className={`${primaryButton} ml-auto px-3 py-2 text-xs`}
                >
                  <Send2 size="15" />
                  {busy === "reply" ? "Replying..." : "Reply"}
                </button>
              </div>
            </form>
          )}

          {/* REPLIES */}
          {!isReply && repliesOpen && (
            <div className="mt-4 space-y-3">

              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                <span className="h-px flex-1 bg-violet-100 dark:bg-white/10" />
                Replies
                <span className="h-px flex-1 bg-violet-100 dark:bg-white/10" />
              </div>

              {repliesLoading ? (
                <div className="flex items-center gap-2 py-3 text-sm text-gray-400">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600" />
                  Loading replies...
                </div>
              ) : replies.length ? (
                replies.map((reply, index) => (
                  <CommentCard
                    key={commentIdOf(reply) || index}
                    postId={postId}
                    comment={reply}
                    currentUserId={currentUserId}
                    onChanged={loadReplies}
                    isReply
                  />
                ))
              ) : (
                <p className="py-3 text-center text-xs text-gray-400">
                  No replies yet.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
