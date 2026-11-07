import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { Edit2, GalleryAdd, Heart, Message, Send2, Trash, CloseCircle } from "iconsax-reactjs";
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

  if (loading) return <div className="p-8 text-center text-gray-500">Loading post...</div>;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4 py-6">
      {error && <div className="rounded-2xl bg-red-50 p-3 text-sm text-red-600">{error}</div>}
      {post && <PostCard post={post} onChanged={load} />}

      <form onSubmit={addComment} className="rounded-3xl border border-gray-100 bg-white p-4 shadow-[0_8px_28px_rgba(15,23,42,.05)]">
        <textarea
          value={text}
          disabled={posting}
          onChange={(e) => setText(e.target.value)}
          className="min-h-24 w-full resize-none rounded-2xl bg-gray-50 p-3 outline-none transition focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
          placeholder="Write a comment..."
        />

        {image && (
          <div className="relative mt-3 overflow-hidden rounded-2xl border border-gray-100 bg-gray-50">
            <img src={URL.createObjectURL(image)} className="max-h-72 w-full object-cover" alt="comment preview" />
            <button
              type="button"
              disabled={posting}
              onClick={() => setImage(null)}
              className="absolute right-2 top-2 rounded-full bg-black/55 p-1 text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CloseCircle size="22" />
            </button>
          </div>
        )}

        <div className="mt-3 flex items-center gap-2">
          <label className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition ${posting ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-300" : "cursor-pointer border-gray-200 bg-white text-gray-600 hover:border-[#8B5CF6]/40 hover:text-[#8B5CF6]"}`}>
            <GalleryAdd size="19" /> {image ? "Change photo" : "Add photo"}
            <input
              type="file"
              accept="image/*"
              disabled={posting}
              className="hidden"
              onChange={(e) => setImage(e.target.files?.[0] ?? null)}
            />
          </label>
          {image && <span className="max-w-[220px] truncate text-xs text-gray-400">{image.name}</span>}
          <button
            disabled={posting || (!text.trim() && !image)}
            className="ml-auto inline-flex items-center gap-2 rounded-xl bg-[#8B5CF6] px-4 py-2.5 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send2 size="18" /> {posting ? "Sending..." : "Comment"}
          </button>
        </div>
      </form>

      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-bold text-gray-800">Comments</h2>
          <span className="text-sm text-gray-400">{comments.length}</span>
        </div>
        {comments.length ? comments.map((comment, index) => (
          <CommentCard
            key={commentIdOf(comment) || index}
            postId={postId ?? ""}
            comment={comment}
            currentUserId={currentUserId}
            onChanged={load}
          />
        )) : <div className="rounded-2xl bg-white p-8 text-center text-gray-400">No comments yet. Be the first to comment.</div>}
      </section>
    </div>
  );
}

function CommentCard({ postId, comment, currentUserId, onChanged, isReply = false }: {
  postId: string;
  comment: Comment;
  currentUserId?: string;
  onChanged: () => Promise<void> | void;
  isReply?: boolean;
}) {
  const commentId = commentIdOf(comment);
  const author = authorOf(comment);
  const authorId = author._id ?? author.id;
  const isOwner = Boolean(authorId && currentUserId && authorId === currentUserId);
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
  const replyCount = useMemo(() => Math.max(comment.repliesCount ?? 0, replies.length), [comment.repliesCount, replies.length]);

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
      setReplies(await commentsApi.getReplies<Comment>(postId, commentId, 1, 50));
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
    if (!commentId || busy || !window.confirm(isReply ? "Delete this reply?" : "Delete this comment?")) return;
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
    <div className={`${isReply ? "ml-8 border-l-2 border-gray-100 pl-3" : "rounded-3xl border border-gray-100 bg-white p-4 shadow-[0_5px_18px_rgba(15,23,42,.035)]"}`}>
      <div className="flex items-start gap-3">
        {authorId ? (
          <Link to={`/users/${authorId}`} className="shrink-0">
            {avatar ? <img src={avatar} className="h-9 w-9 rounded-full object-cover" alt="" /> : <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-[#C4B5FD] to-[#7C3AED] text-sm font-bold text-white">{initial}</span>}
          </Link>
        ) : avatar ? <img src={avatar} className="h-9 w-9 rounded-full object-cover" alt="" /> : <span className="grid h-9 w-9 place-items-center rounded-full bg-gray-100 text-sm font-bold text-gray-500">{initial}</span>}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              {authorId ? <Link to={`/users/${authorId}`} className="font-semibold text-gray-800 hover:text-[#8B5CF6]">{author.name ?? "User"}</Link> : <span className="font-semibold text-gray-800">{author.name ?? "User"}</span>}
              {comment.createdAt && <p className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleString()}</p>}
            </div>
            {isOwner && !editing && (
              <div className="flex gap-1">
                <button onClick={() => setEditing(true)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-50 hover:text-[#8B5CF6]" title="Edit"><Edit2 size="16" /></button>
                <button onClick={deleteComment} disabled={busy === "delete"} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-50" title="Delete"><Trash size="16" /></button>
              </div>
            )}
          </div>

          {editing ? (
            <div className="mt-2 rounded-2xl bg-gray-50 p-2.5">
              <textarea value={editText} disabled={busy === "edit"} onChange={(e) => setEditText(e.target.value)} className="min-h-20 w-full resize-none bg-transparent p-2 outline-none disabled:opacity-60" />
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <label className={`inline-flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-xs font-semibold ${busy === "edit" ? "cursor-not-allowed text-gray-300" : "cursor-pointer text-gray-600 hover:text-[#8B5CF6]"}`}>
                  <GalleryAdd size="16" /> {editImage ? "Change image" : "Add image"}
                  <input type="file" accept="image/*" disabled={busy === "edit"} className="hidden" onChange={(e) => setEditImage(e.target.files?.[0] ?? null)} />
                </label>
                <div className="ml-auto flex gap-2">
                  <button type="button" disabled={busy === "edit"} onClick={() => { setEditing(false); setEditText(commentTextOf(comment)); setEditImage(null); }} className="rounded-lg px-3 py-2 text-xs font-semibold text-gray-500 disabled:opacity-50">Cancel</button>
                  <button type="button" disabled={busy === "edit" || (!editText.trim() && !editImage)} onClick={saveEdit} className="rounded-lg bg-[#8B5CF6] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">{busy === "edit" ? "Saving..." : "Save"}</button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {commentTextOf(comment) && <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">{commentTextOf(comment)}</p>}
              {comment.image && <img src={comment.image} className="mt-3 max-h-80 w-full rounded-2xl object-cover" alt="comment" />}
            </>
          )}

          {error && <p className="mt-2 text-xs text-red-500">{error}</p>}

          {!editing && (
            <div className="mt-2 flex items-center gap-2 text-xs font-semibold">
              <button onClick={toggleLike} disabled={busy === "like"} className={`inline-flex items-center gap-1 rounded-lg px-2 py-1.5 ${liked ? "bg-red-50 text-[#8B5CF6]" : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"}`}>
                <Heart size="15" variant={liked ? "Bold" : "Linear"} /> {likesCount || "Like"}
              </button>
              {!isReply && <button onClick={() => setReplyOpen((value) => !value)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-gray-400 hover:bg-gray-50 hover:text-gray-600"><Message size="15" /> Reply</button>}
              {!isReply && <button onClick={repliesOpen ? () => setRepliesOpen(false) : loadReplies} className="rounded-lg px-2 py-1.5 text-gray-400 hover:bg-gray-50 hover:text-gray-600">{repliesOpen ? "Hide replies" : `${replyCount || "View"} replies`}</button>}
            </div>
          )}

          {!isReply && replyOpen && (
            <form onSubmit={submitReply} className="mt-3 rounded-2xl bg-gray-50 p-3">
              <textarea value={replyText} disabled={busy === "reply"} onChange={(e) => setReplyText(e.target.value)} className="min-h-20 w-full resize-none bg-transparent p-2 text-sm outline-none disabled:opacity-60" placeholder={`Reply to ${author.name ?? "this comment"}...`} />
              {replyImage && <div className="mb-2 text-xs text-gray-400">{replyImage.name}</div>}
              <div className="flex items-center gap-2">
                <label className={`inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-semibold ${busy === "reply" ? "cursor-not-allowed text-gray-300" : "cursor-pointer text-gray-500 hover:text-[#8B5CF6]"}`}>
                  <GalleryAdd size="16" /> Photo
                  <input type="file" accept="image/*" disabled={busy === "reply"} className="hidden" onChange={(e) => setReplyImage(e.target.files?.[0] ?? null)} />
                </label>
                <button disabled={busy === "reply" || (!replyText.trim() && !replyImage)} className="ml-auto inline-flex items-center gap-1.5 rounded-xl bg-[#8B5CF6] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"><Send2 size="15" /> {busy === "reply" ? "Replying..." : "Reply"}</button>
              </div>
            </form>
          )}

          {!isReply && repliesOpen && (
            <div className="mt-3 space-y-3">
              {repliesLoading ? <div className="py-3 text-sm text-gray-400">Loading replies...</div> : replies.length ? replies.map((reply, index) => (
                <CommentCard key={commentIdOf(reply) || index} postId={postId} comment={reply} currentUserId={currentUserId} onChanged={loadReplies} isReply />
              )) : <div className="py-2 text-sm text-gray-400">No replies yet.</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
