
import { useState } from "react";
import { Link } from "react-router";
import { People, UserAdd, UserTick } from "iconsax-reactjs";
import { getApiError } from "../../lib/api";
import { usersApi } from "../../lib/usersApi";
import type { User } from "../../context/AuthContext";
import { useCachedQuery } from "../../lib/queryCache";

export default function Community() {
  const [busy, setBusy] = useState("");
  const [actionError, setActionError] = useState("");

  const {
    data,
    loading,
    refreshing,
    error,
    setData,
  } = useCachedQuery<User[]>(
    "community:suggestions",
    () => usersApi.getFollowSuggestions(1, 10),
    { staleTime: 120_000 },
  );

  const users = data ?? [];

  const toggleFollow = async (user: User) => {
    const id = user._id ?? user.id;
    if (!id || busy) return;

    setBusy(id);
    setActionError("");

    try {
      await usersApi.toggleFollow(id);

      setData((current) =>
        (current ?? []).map((item) => {
          const itemId = item._id ?? item.id;

          return itemId === id
            ? { ...item, isFollowing: !item.isFollowing }
            : item;
        }),
      );
    } catch (e) {
      setActionError(getApiError(e));
    } finally {
      setBusy("");
    }
  };

  return (
    <main className="mx-auto min-h-[calc(100vh-80px)] w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">

      {/* Header */}
      <section className="mb-8">
        <span className="vybe-pill mb-3">
          ✦ Find your people
        </span>

        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-3xl font-black tracking-tight text-[#18152C] dark:text-[#F5F0FF] sm:text-4xl">
              Your <span className="text-[#8B5CF6]">Community</span>
            </h1>

            <p className="mt-2 text-sm leading-relaxed !text-[#62566F] dark:!text-[#AAA4BD]">
              Discover new people and build meaningful connections.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2 rounded-2xl border border-[#E5DCF5] bg-white px-4 py-3 shadow-sm dark:border-[#383651] dark:bg-[#1B1C32]">
            <People size="20" className="text-[#8B5CF6]" />

            <span className="text-sm font-bold !text-[#493765] dark:!text-[#E5DCFA]">
              {users.length} People
            </span>
          </div>
        </div>
      </section>

      {/* Suggestions Panel */}
      <section className="premium-panel overflow-hidden p-4 sm:p-7">

        {/* Panel Header */}
        <div className="mb-6 flex min-w-0 items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="!text-[#282040] text-lg font-extrabold lg:text-2xl dark:!text-[#F1ECFF]">
              People you may know
            </h2>

            <p className="mt-1 text-xs leading-relaxed !text-[#695D78] sm:text-sm dark:!text-[#AAA4BD]">
              Connect with people and grow your circle.
            </p>
          </div>

          {refreshing && (
            <span className="shrink-0 text-xs font-semibold text-[#8B5CF6]">
              Updating...
            </span>
          )}
        </div>

        {/* Errors */}
        {(actionError || error) && (
          <div
            role="alert"
            className="mb-5 break-words rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-300"
          >
            {actionError || error}
          </div>
        )}

        {/* Loading */}
        {loading && !users.length ? (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex animate-pulse items-center gap-4 rounded-2xl border border-[#E5DCF5] bg-white p-4 dark:border-[#383651] dark:bg-[#202039]"
              >
                <div className="h-14 w-14 shrink-0 rounded-full bg-[#EAE2F8] dark:bg-[#302A46]" />

                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-3 w-32 rounded bg-[#EAE2F8] dark:bg-[#302A46]" />
                  <div className="h-3 w-20 rounded bg-[#F0EBF8] dark:bg-[#28243B]" />
                </div>

                <div className="h-9 w-24 shrink-0 rounded-xl bg-[#EAE2F8] dark:bg-[#302A46]" />
              </div>
            ))}
          </div>
        ) : users.length > 0 ? (

          <div className="grid gap-3 sm:grid-cols-2">

            {users.map((user, index) => {
              const id = user._id ?? user.id ?? String(index);
              const canOpenProfile = Boolean(user._id ?? user.id);

              const photo =
                user.photo ??
                user.profilePhoto ??
                user.image ??
                "/female-avatar.svg";

              return (
                <article
                  key={id}
                  className="group flex min-w-0 items-center gap-3 rounded-2xl border border-[#E5DCF5] bg-white p-3.5 transition-all duration-300 hover:-translate-y-1 hover:border-[#CBB5F0] hover:shadow-[0_12px_30px_rgba(139,92,246,0.10)] sm:p-4 dark:border-[#383651] dark:bg-[#202039] dark:hover:border-violet-500/50"
                >

                  {/* Avatar */}
                  <Link
                    to={canOpenProfile ? `/users/${id}` : "#"}
                    onClick={(e) => {
                      if (!canOpenProfile) e.preventDefault();
                    }}
                    className="relative shrink-0"
                  >
                    <img
                      src={photo}
                      alt={user.name ?? "User"}
                      className="h-12 w-12 rounded-full border-2 border-[#E4D8FF] object-cover transition-transform duration-300 group-hover:scale-105 sm:h-14 sm:w-14 dark:border-[#51416F]"
                      onError={(e) => {
                        e.currentTarget.src = "/female-avatar.svg";
                      }}
                    />

                    <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-400 dark:border-[#202039]" />
                  </Link>

                  {/* User Info */}
                  <div className="min-w-0 flex-1">
                    {canOpenProfile ? (
                      <Link
                        to={`/users/${id}`}
                        className="block truncate text-sm font-extrabold !text-[#282040] transition-colors hover:!text-[#8B5CF6] lg:text-base dark:!text-[#F1ECFF]"
                      >
                        {user.name ?? "User"}
                      </Link>
                    ) : (
                      <p className="truncate text-sm font-extrabold !text-[#282040] lg:text-base dark:!text-[#F1ECFF]">
                        {user.name ?? "User"}
                      </p>
                    )}

                    <p className="mt-1 truncate text-xs !text-[#695D78] dark:!text-[#AAA4BD]">
                      @{user.username ?? "username"}
                    </p>

                    {typeof user.followersCount === "number" && (
                      <p className="mt-1 text-[11px] font-medium !text-[#756B80] lg:text-xs dark:!text-[#8984A3]">
                        {user.followersCount} followers
                      </p>
                    )}
                  </div>

                  {/* Follow Button */}
                  <button
                    type="button"
                    onClick={() => toggleFollow(user)}
                    disabled={busy !== "" || !canOpenProfile}
                    className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl px-2.5 py-2.5 text-xs font-bold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 ${
                      user.isFollowing
                        ? "border border-[#DCCBF5] bg-[#F2EBFF] text-[#7142C2] hover:bg-[#E8DCFF] dark:border-[#594477] dark:bg-[#34294E] dark:text-[#D5BEFF] dark:hover:bg-[#42315C]"
                        : "bg-gradient-to-r from-[#8B5CF6] to-[#6950E8] text-white shadow-[0_5px_15px_rgba(139,92,246,.20)] hover:-translate-y-0.5 hover:shadow-lg"
                    }`}
                  >
                    {busy === id ? (
                      "..."
                    ) : user.isFollowing ? (
                      <>
                        <UserTick size="16" />
                        Following
                      </>
                    ) : (
                      <>
                        <UserAdd size="16" />
                        Follow
                      </>
                    )}
                  </button>

                </article>
              );
            })}

          </div>

        ) : (

          /* Empty State */
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#DCCBF5] bg-[#F8F5FF] px-5 py-12 text-center sm:py-16 dark:border-[#51416F] dark:bg-[#242039]">

            <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-[#EAE0FF] text-[#8B5CF6] shadow-sm dark:bg-[#34294E]">
              <People size="32" />
            </div>

            <h3 className="!text-[#8B5CF6] text-lg font-extrabold lg:text-2xl dark:!text-[#F1ECFF]">
              No suggestions yet
            </h3>

            <p className="mt-2 max-w-sm text-sm leading-relaxed !text-[#62566F] dark:!text-[#AAA4BD]">
              New connections will appear here. Come back soon and discover your community.
            </p>

            <Link
              to="/posts"
              className="mt-5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#6950E8] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              Explore your feed
            </Link>
          </div>
        )}

      </section>

      {/* Footer */}
      <p className="mt-6 text-center text-xs !text-[#695D78] dark:!text-[#77738F]">
        VYBE · Good things start with a conversation.
      </p>

    </main>
  );
}
