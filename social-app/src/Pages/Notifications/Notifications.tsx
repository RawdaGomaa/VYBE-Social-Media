import { useState } from "react";
import { Link } from "react-router";
import { Notification, TickCircle } from "iconsax-reactjs";
import { getApiError } from "../../lib/api";
import { emitNotificationsChanged, notificationsApi } from "../../lib/notificationsApi";
import type { AppNotification } from "../../lib/notificationsApi";
import { setCachedData, useCachedQuery } from "../../lib/queryCache";

function notificationId(item: AppNotification) {
  return item._id ?? item.id ?? "";
}

function isUnread(item: AppNotification) {
  return !(item.isRead ?? item.read ?? false);
}

function actorPhoto(item: AppNotification) {
  const actor = item.actor ?? item.user;
  return actor?.photo ?? actor?.profilePhoto ?? actor?.image;
}

function actorName(item: AppNotification) {
  return item.actor?.name ?? item.user?.name ?? "VYBE";
}

function notificationText(item: AppNotification) {
  return item.message ?? item.body ?? item.title ?? "You have a new notification";
}

function relatedPostId(item: AppNotification) {
  if (typeof item.post === "string") return item.post;
  return item.post?._id ?? item.post?.id ?? item.postId;
}

export default function Notifications() {
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [markingId, setMarkingId] = useState("");
  const [markingAll, setMarkingAll] = useState(false);
  const [actionError, setActionError] = useState("");

  const key = onlyUnread ? "notifications:unread" : "notifications:all";
  const { data, loading, refreshing, error, setData } = useCachedQuery<AppNotification[]>(
    key,
    async () => {
      const result = await notificationsApi.getNotifications({ unread: onlyUnread, page: 1, limit: 50 });
      return result.notifications;
    },
    { staleTime: 45_000 },
  );
  const items = data ?? [];

  const markOne = async (item: AppNotification) => {
    const id = notificationId(item);
    if (!id || !isUnread(item) || markingId || markingAll) return;

    setMarkingId(id);
    setActionError("");
    try {
      await notificationsApi.markAsRead(id);
      const markRead = (list: AppNotification[] | undefined) => (list ?? []).map((notification) =>
        notificationId(notification) === id ? { ...notification, isRead: true, read: true } : notification,
      );
      const removeFromUnread = (list: AppNotification[] | undefined) => (list ?? []).filter((notification) => notificationId(notification) !== id);

      setCachedData<AppNotification[]>("notifications:all", markRead);
      setCachedData<AppNotification[]>("notifications:unread", removeFromUnread);
      setData(onlyUnread ? removeFromUnread : markRead);
      emitNotificationsChanged();
    } catch (err) {
      setActionError(getApiError(err));
    } finally {
      setMarkingId("");
    }
  };

  const markAll = async () => {
    if (markingAll || !items.some(isUnread)) return;

    setMarkingAll(true);
    setActionError("");
    try {
      await notificationsApi.markAllAsRead();
      const markEverything = (list: AppNotification[] | undefined) => (list ?? []).map((item) => ({ ...item, isRead: true, read: true }));
      setCachedData<AppNotification[]>("notifications:all", markEverything);
      setCachedData<AppNotification[]>("notifications:unread", []);
      setData(onlyUnread ? [] : markEverything);
      emitNotificationsChanged();
    } catch (err) {
      setActionError(getApiError(err));
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl py-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="mt-1 text-sm text-gray-500">Stay updated with activity around your account.</p>
        </div>

        <button
          onClick={markAll}
          disabled={markingAll || !items.some(isUnread)}
          className="inline-flex items-center gap-2 rounded-xl border border-[#8B5CF6] px-3 py-2 text-sm font-semibold text-[#8B5CF6] transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-45"
        >
          <TickCircle size="18" />
          {markingAll ? "Marking..." : "Mark all as read"}
        </button>
      </div>

      <div className="mb-4 grid grid-cols-2 rounded-2xl bg-white p-1 shadow-sm">
        <button
          onClick={() => setOnlyUnread(false)}
          className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${!onlyUnread ? "bg-[#8B5CF6] text-white" : "text-gray-500 hover:bg-gray-50"}`}
        >All</button>
        <button
          onClick={() => setOnlyUnread(true)}
          className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${onlyUnread ? "bg-[#8B5CF6] text-white" : "text-gray-500 hover:bg-gray-50"}`}
        >Unread</button>
      </div>

      {(actionError || error) && <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">{actionError || error}</div>}

      {loading && !items.length ? (
        <div className="rounded-2xl bg-white p-8 text-center text-gray-500 shadow-sm">Loading notifications...</div>
      ) : (
        <div className="space-y-2">
          {refreshing && items.length > 0 && <div className="pb-1 text-right text-xs text-gray-400">Updating…</div>}
          {items.map((item, index) => {
            const id = notificationId(item);
            const unread = isUnread(item);
            const photo = actorPhoto(item);
            const name = actorName(item);
            const postId = relatedPostId(item);
            const busy = markingId === id;

            const content = (
              <div className="flex min-w-0 flex-1 items-start gap-3">
                {photo ? (
                  <img src={photo} alt={name} className="h-11 w-11 shrink-0 rounded-full object-cover ring-1 ring-gray-100" />
                ) : (
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#F2ECFF] text-[#8B5CF6]"><Notification size="21" /></span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-6 text-gray-800">{notificationText(item)}</p>
                  <p className="mt-1 text-xs text-gray-400">{item.createdAt ? new Date(item.createdAt).toLocaleString() : ""}</p>
                </div>
                {unread && <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-[#8B5CF6]" />}
              </div>
            );

            return (
              <div key={id || index} className={`rounded-2xl border p-4 shadow-sm transition ${unread ? "border-[#ffdada] bg-[#fff8f8]" : "border-gray-100 bg-white"}`}>
                {postId ? (
                  <Link to={`/posts/${postId}`} onClick={() => unread && markOne(item)} className={busy ? "pointer-events-none opacity-60" : "block"}>{content}</Link>
                ) : (
                  <button type="button" onClick={() => markOne(item)} disabled={!unread || busy || markingAll} className="block w-full text-left disabled:cursor-default">{content}</button>
                )}
              </div>
            );
          })}

          {!items.length && (
            <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-gray-50 text-gray-400"><Notification size="23" /></span>
              <p className="mt-3 font-semibold text-gray-700">{onlyUnread ? "No unread notifications" : "No notifications yet"}</p>
              <p className="mt-1 text-sm text-gray-400">{onlyUnread ? "You're all caught up." : "New activity will appear here."}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
