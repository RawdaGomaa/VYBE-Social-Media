
import { useState } from "react";
import { Link } from "react-router";
import { Notification, TickCircle } from "iconsax-reactjs";
import { getApiError } from "../../lib/api";
import {
  emitNotificationsChanged,
  notificationsApi,
} from "../../lib/notificationsApi";
import type { AppNotification } from "../../lib/notificationsApi";
import {
  setCachedData,
  useCachedQuery,
} from "../../lib/queryCache";

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
  return (
    item.message ??
    item.body ??
    item.title ??
    "You have a new notification"
  );
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

  const key = onlyUnread
    ? "notifications:unread"
    : "notifications:all";

  const {
    data,
    loading,
    refreshing,
    error,
    setData,
  } = useCachedQuery<AppNotification[]>(
    key,
    async () => {
      const result = await notificationsApi.getNotifications({
        unread: onlyUnread,
        page: 1,
        limit: 50,
      });

      return result.notifications;
    },
    { staleTime: 45_000 },
  );

  const items = data ?? [];
  const unreadCount = items.filter(isUnread).length;

  const markOne = async (item: AppNotification) => {
    const id = notificationId(item);

    if (!id || !isUnread(item) || markingId || markingAll) return;

    setMarkingId(id);
    setActionError("");

    try {
      await notificationsApi.markAsRead(id);

      const markRead = (list: AppNotification[] | undefined) =>
        (list ?? []).map((notification) =>
          notificationId(notification) === id
            ? { ...notification, isRead: true, read: true }
            : notification,
        );

      const removeFromUnread = (
        list: AppNotification[] | undefined,
      ) =>
        (list ?? []).filter(
          (notification) => notificationId(notification) !== id,
        );

      setCachedData<AppNotification[]>(
        "notifications:all",
        markRead,
      );

      setCachedData<AppNotification[]>(
        "notifications:unread",
        removeFromUnread,
      );

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

      const markEverything = (
        list: AppNotification[] | undefined,
      ) =>
        (list ?? []).map((item) => ({
          ...item,
          isRead: true,
          read: true,
        }));

      setCachedData<AppNotification[]>(
        "notifications:all",
        markEverything,
      );

      setCachedData<AppNotification[]>(
        "notifications:unread",
        [],
      );

      setData(onlyUnread ? [] : markEverything);
      emitNotificationsChanged();
    } catch (err) {
      setActionError(getApiError(err));
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <main className="mx-auto min-h-[calc(100vh-80px)] w-full max-w-4xl px-4 py-8 sm:px-6">

      {/* Header */}
      <section className="mb-8">
        <span className="vybe-pill mb-3">
          ✦ Stay in the loop
        </span>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-[#18152C] dark:text-[#F5F0FF] sm:text-4xl">
              Your <span className="text-[#8B5CF6]">Notifications</span>
            </h1>

            <p className="mt-2 text-sm text-[#89859A] dark:text-[#AAA4BD]">
              Stay updated with everything happening around you.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-violet-100 bg-white px-4 py-3 shadow-sm dark:border-[#383651] dark:bg-[#1B1C32]">
            <Notification
              size="20"
              className="text-[#8B5CF6]"
            />

            <span className="text-sm font-bold text-[#51456E] dark:text-[#E5DCFA]">
              {unreadCount} Unread
            </span>
          </div>
        </div>
      </section>

      {/* Notifications Panel */}
      <section className="premium-panel overflow-hidden p-4 sm:p-6">

        {/* Panel Header */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold text-[#282040] dark:text-[#F1ECFF]">
              Recent activity
            </h2>

            <p className="mt-1 text-xs text-[#9891A9] dark:text-[#AAA4BD]">
              Your latest updates and interactions.
            </p>
          </div>

          <button
            type="button"
            onClick={markAll}
            disabled={markingAll || unreadCount === 0}
            className="inline-flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-3.5 py-2.5 text-xs font-bold text-[#8050D5] transition-all duration-200 hover:-translate-y-0.5 hover:bg-violet-100 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#594477] dark:bg-[#34294E] dark:text-[#D5BEFF] dark:hover:bg-[#42315C]"
          >
            <TickCircle size="17" />

            {markingAll ? "Marking..." : "Mark all as read"}
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-5 flex gap-2 rounded-2xl border border-violet-100 bg-[#F7F5FF] p-1.5 dark:border-[#383651] dark:bg-[#202039]">

          <button
            type="button"
            onClick={() => {
              setOnlyUnread(false);
              setActionError("");
            }}
            className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-200 ${
              !onlyUnread
                ? "bg-gradient-to-r from-[#8B5CF6] to-[#6950E8] text-white shadow-md"
                : "text-[#89819D] hover:bg-white hover:text-[#8050D5] dark:text-[#AAA4BD] dark:hover:bg-[#302A46]"
            }`}
          >
            All
          </button>

          <button
            type="button"
            onClick={() => {
              setOnlyUnread(true);
              setActionError("");
            }}
            className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-200 ${
              onlyUnread
                ? "bg-gradient-to-r from-[#8B5CF6] to-[#6950E8] text-white shadow-md"
                : "text-[#89819D] hover:bg-white hover:text-[#8050D5] dark:text-[#AAA4BD] dark:hover:bg-[#302A46]"
            }`}
          >
            Unread
            {unreadCount > 0 && (
              <span className="ml-2 rounded-full bg-white/25 px-2 py-0.5 text-[10px]">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Errors */}
        {(actionError || error) && (
          <div
            role="alert"
            className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-300"
          >
            {actionError || error}
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && !items.length ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="flex animate-pulse items-center gap-3 rounded-2xl border border-violet-100 p-4 dark:border-[#383651]"
              >
                <div className="h-12 w-12 rounded-full bg-violet-100 dark:bg-[#302A46]" />

                <div className="flex-1 space-y-2">
                  <div className="h-3 w-3/4 rounded bg-violet-100 dark:bg-[#302A46]" />
                  <div className="h-3 w-1/3 rounded bg-violet-50 dark:bg-[#28243B]" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">

            {refreshing && items.length > 0 && (
              <div className="text-right text-xs font-medium text-[#8B5CF6]">
                Updating...
              </div>
            )}

            {items.map((item, index) => {
              const id = notificationId(item);
              const unread = isUnread(item);
              const photo = actorPhoto(item);
              const name = actorName(item);
              const postId = relatedPostId(item);
              const busy = markingId === id;

              const content = (
                <div className="flex min-w-0 items-start gap-3">

                  {/* Avatar */}
                  {photo ? (
                    <img
                      src={photo}
                      alt={name}
                      className="h-12 w-12 shrink-0 rounded-full border-2 border-violet-100 object-cover dark:border-[#51416F]"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-violet-100 text-[#8B5CF6] dark:bg-[#34294E]">
                      <Notification size="22" />
                    </span>
                  )}

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm leading-6 ${
                      unread
                        ? "font-bold text-[#282040] dark:text-[#F1ECFF]"
                        : "font-medium text-[#625B76] dark:text-[#C4BED8]"
                    }`}>
                      {notificationText(item)}
                    </p>

                    <p className="mt-1.5 text-xs text-[#A39BB5] dark:text-[#8984A3]">
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleString()
                        : ""}
                    </p>
                  </div>

                  {/* Unread Indicator */}
                  {unread && (
                    <span
                      className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-[#8B5CF6] shadow-[0_0_10px_rgba(139,92,246,.4)]"
                      title="Unread"
                    />
                  )}
                </div>
              );

              return (
                <article
                  key={id || index}
                  className={`group rounded-2xl border p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${
                    unread
                      ? "border-violet-200 bg-violet-50/70 hover:border-violet-300 dark:border-[#594477] dark:bg-[#29233E] dark:hover:border-violet-500/60"
                      : "border-[#EEE9FA] bg-white hover:border-violet-200 dark:border-[#383651] dark:bg-[#202039] dark:hover:border-[#594477]"
                  }`}
                >
                  {postId ? (
                    <Link
                      to={`/posts/${postId}`}
                      onClick={() => unread && markOne(item)}
                      className={busy ? "pointer-events-none opacity-60" : "block"}
                    >
                      {content}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => markOne(item)}
                      disabled={!unread || busy || markingAll}
                      className="block w-full text-left disabled:cursor-default"
                    >
                      {content}
                    </button>
                  )}
                </article>
              );
            })}

            {/* Empty State */}
            {!items.length && (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-violet-200 bg-violet-50/50 px-5 py-16 text-center dark:border-[#51416F] dark:bg-[#242039]">

                <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-white text-[#8B5CF6] shadow-sm dark:bg-[#34294E]">
                  <Notification size="32" />
                </div>

                <h3 className="text-lg font-extrabold text-[#282040] dark:text-[#F1ECFF]">
                  {onlyUnread
                    ? "You're all caught up!"
                    : "No notifications yet"}
                </h3>

                <p className="mt-2 max-w-sm text-sm text-[#89859A] dark:text-[#AAA4BD]">
                  {onlyUnread
                    ? "You have no unread notifications. Enjoy your day!"
                    : "When someone interacts with your account, you'll see it here."}
                </p>

                {onlyUnread && (
                  <button
                    type="button"
                    onClick={() => setOnlyUnread(false)}
                    className="mt-5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#6950E8] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    View all notifications
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      <p className="mt-6 text-center text-xs text-[#AAA4B6] dark:text-[#77738F]">
        VYBE · Good things start with a conversation.
      </p>

    </main>
  );
}
