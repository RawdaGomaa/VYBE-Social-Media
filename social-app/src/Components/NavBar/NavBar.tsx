
import { Link, NavLink } from "react-router";
import {
  Home2,
  People,
  Bookmark,
  Notification,
  Setting2,
} from "iconsax-reactjs";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import { notificationsApi } from "../../lib/notificationsApi";
import { useTheme } from "../../context/ThemeContext";
import BrandLogo from "../BrandLogo/BrandLogo";

export default function NavBar() {
  const { user, token, logout, profilePhotoPreview } = useAuth();
  const [unread, setUnread] = useState(0);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (!token) {
      setUnread(0);
      return;
    }

    const refreshUnread = () => {
      notificationsApi
        .getUnreadCount()
        .then(setUnread)
        .catch(() => {});
    };

    refreshUnread();

    window.addEventListener("notifications:changed", refreshUnread);

    return () =>
      window.removeEventListener("notifications:changed", refreshUnread);
  }, [token]);

  const nav = ({ isActive }: { isActive: boolean }) =>
    `group flex shrink-0 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200
    ${
      isActive
        ? "bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 shadow-sm dark:from-violet-500/20 dark:to-purple-500/20 dark:text-violet-300"
        : "text-gray-500 hover:bg-violet-50 hover:text-violet-700 dark:text-gray-400 dark:hover:bg-violet-500/10 dark:hover:text-violet-300"
    }`;

  const photo =
    profilePhotoPreview ??
    user?.photo ??
    user?.profilePhoto ??
    user?.image;

  const iconButtonClass =
    "grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-violet-200/80 bg-white/70 text-violet-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-300 hover:bg-violet-50 hover:shadow-md dark:border-violet-400/20 dark:bg-[#25213A] dark:text-violet-300 dark:hover:bg-violet-500/15";

  return (
    <nav
      className="
        fixed inset-x-0 top-0 z-50 w-full
        border-b border-violet-200/70
        bg-white/85 shadow-[0_8px_32px_rgba(32,22,75,0.06)]
        backdrop-blur-2xl
        dark:border-white/10
        dark:bg-[#151426]/90
        dark:shadow-[0_8px_32px_rgba(0,0,0,0.25)]
      "
    >
      <div className="mx-auto grid w-full max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-2 px-3 py-2.5 sm:gap-4 sm:px-5 lg:px-6">

        {/* BRAND LOGO */}
        <Link
          to={token ? "/posts" : "/login"}
          className="flex shrink-0 items-center justify-self-start"
        >
          <BrandLogo />
        </Link>

        {token ? (
          <>
            {/* NAVIGATION LINKS */}
            <div
              className="
                flex min-w-0 items-center justify-center gap-1
                overflow-x-auto
                [scrollbar-width:none]
                [&::-webkit-scrollbar]:hidden
              "
            >
              <NavLink to="/posts" className={nav} title="Home">
                <Home2 size="19" />
                <span className="hidden lg:inline">Home</span>
              </NavLink>

              <NavLink to="/community" className={nav} title="Community">
                <People size="19" />
                <span className="hidden lg:inline">Community</span>
              </NavLink>

              <NavLink to="/bookmarks" className={nav} title="Saved posts">
                <Bookmark size="19" />
                <span className="hidden lg:inline">Saved</span>
              </NavLink>

              <NavLink
                to="/notifications"
                className={nav}
                title="Notifications"
              >
                <span className="relative">
                  <Notification size="19" />

                  {unread > 0 && (
                    <span
                      className="
                        absolute -right-2 -top-2
                        flex min-h-4 min-w-4 items-center justify-center
                        rounded-full bg-gradient-to-r
                        from-violet-500 to-purple-600
                        px-1 text-[10px] font-bold leading-4 text-white
                        shadow-md shadow-violet-500/30
                      "
                    >
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </span>

                <span className="hidden lg:inline">Notifications</span>
              </NavLink>
            </div>

            {/* RIGHT ACTIONS */}
            <div className="flex shrink-0 items-center justify-end gap-1.5 sm:gap-2">

              {/* THEME TOGGLE */}
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={
                  theme === "dark"
                    ? "Switch to light mode"
                    : "Switch to dark mode"
                }
                title={theme === "dark" ? "Light mode" : "Dark mode"}
                aria-pressed={theme === "dark"}
                className={iconButtonClass}
              >
                {theme === "dark" ? (
                  <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  >
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  >
                    <path d="M20.8 15.2A9 9 0 0 1 8.8 3.2a9 9 0 1 0 12 12Z" />
                  </svg>
                )}
              </button>

              {/* SETTINGS */}
              <NavLink
                to="/settings"
                className={nav}
                title="Settings"
                aria-label="Settings"
              >
                <Setting2 size="19" />
              </NavLink>

              {/* PROFILE PHOTO */}
              <Link
                to="/profile"
                className="
                  shrink-0 rounded-full p-0.5
                  ring-2 ring-transparent
                  transition-all duration-200
                  hover:-translate-y-0.5
                  hover:ring-violet-400/50
                  hover:shadow-lg hover:shadow-violet-500/15
                "
                title="My profile"
              >
                {photo ? (
                  <img
                    src={photo}
                    alt="Profile"
                    className="
                      h-9 w-9 rounded-full object-cover
                      ring-2 ring-white dark:ring-[#39304F]
                    "
                  />
                ) : (
                  <img
                    src="/female-avatar.svg"
                    alt={`${user?.name ?? "User"} profile avatar`}
                    className="
                      h-9 w-9 rounded-full object-cover
                      ring-2 ring-violet-200 dark:ring-violet-400/30
                    "
                  />
                )}
              </Link>

              {/* LOGOUT */}
              <button
                type="button"
                onClick={logout}
                className="
                  hidden rounded-xl border border-red-100
                  px-3 py-2 text-sm font-semibold text-red-500
                  transition-all duration-200
                  hover:-translate-y-0.5 hover:bg-red-50
                  hover:shadow-sm
                  lg:block
                  dark:border-red-400/20
                  dark:text-red-400
                  dark:hover:bg-red-500/10
                "
              >
                Logout
              </button>
            </div>
          </>
        ) : (
          /* GUEST NAVIGATION */
          <div className="col-span-2 flex items-center justify-end gap-2">

            <button
              type="button"
              onClick={toggleTheme}
              aria-label={
                theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
              title="Toggle color theme"
              aria-pressed={theme === "dark"}
              className={iconButtonClass}
            >
              {theme === "dark" ? "☀" : "☾"}
            </button>

            <NavLink to="/login" className={nav}>
              Login
            </NavLink>

            <NavLink
              to="/register"
              className="
                shrink-0 rounded-xl
                bg-gradient-to-r from-[#8B5CF6] to-[#6950E8]
                px-4 py-2.5 text-sm font-bold text-white
                shadow-[0_5px_18px_rgba(139,92,246,0.22)]
                transition-all duration-200
                hover:-translate-y-0.5
                hover:shadow-[0_8px_22px_rgba(139,92,246,0.35)]
                active:scale-95
              "
            >
              Register
            </NavLink>
          </div>
        )}
      </div>
    </nav>
  );
}
