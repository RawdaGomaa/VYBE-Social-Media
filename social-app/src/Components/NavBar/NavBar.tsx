
import { Link, NavLink } from "react-router";
import { Home2, People, Bookmark, Notification, Setting2 } from "iconsax-reactjs";
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
      notificationsApi.getUnreadCount().then(setUnread).catch(() => {});
    };

    refreshUnread();
    window.addEventListener("notifications:changed", refreshUnread);
    return () => window.removeEventListener("notifications:changed", refreshUnread);
  }, [token]);

  const nav = ({ isActive }: { isActive: boolean }) =>
    `group flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${
      isActive ? "bg-[#F2ECFF] text-[#8B5CF6]" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
    }`;

  const photo = profilePhotoPreview ?? user?.photo ?? user?.profilePhoto ?? user?.image;

  return (
    <nav className="fixed inset-x-0 top-0 z-30 border-b border-violet-100 bg-white/85 shadow-[0_8px_32px_rgba(32,22,75,.05)] backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-2.5">
        <Link to={token ? "/posts" : "/login"} className="justify-self-start">
          <BrandLogo />
        </Link>

        {token ? (
          <>
            <div className="flex items-center justify-center gap-1 overflow-x-auto">
              <NavLink to="/posts" className={nav}><Home2 size="19" /> <span className="hidden md:inline">Home</span></NavLink>
              <NavLink to="/community" className={nav}><People size="19" /> <span className="hidden md:inline">Community</span></NavLink>
              <NavLink to="/bookmarks" className={nav}><Bookmark size="19" /> <span className="hidden md:inline">Saved</span></NavLink>
              <NavLink to="/notifications" className={nav}>
                <span className="relative">
                  <Notification size="19" />
                  {unread > 0 && (
                    <span className="absolute -right-2 -top-2 min-w-4 rounded-full bg-[#8B5CF6] px-1 text-center text-[10px] leading-4 text-white">
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </span>
                <span className="hidden md:inline">Notifications</span>
              </NavLink>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
                className="theme-toggle"
                aria-pressed={theme === 'dark'}
              >
                {theme === 'dark' ? (
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <circle cx="12" cy="12" r="4"/>
                    <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M20.8 15.2A9 9 0 0 1 8.8 3.2a9 9 0 1 0 12 12Z"/>
                  </svg>
                )}
              </button>

              <NavLink to="/settings" className={nav} title="Settings">
                <Setting2 size="19" />
              </NavLink>

              <Link to="/profile" className="rounded-full p-0.5 ring-2 ring-transparent transition hover:ring-[#8B5CF6]/25" title="My profile">
                {photo ? (
                  <img src={photo} alt="profile" className="h-9 w-9 rounded-full object-cover ring-1 ring-gray-200" />
                ) : (
                  <img src="/female-avatar.svg" alt={`${user?.name ?? 'User'} profile avatar`} className="h-9 w-9 rounded-full object-cover ring-1 ring-violet-200" />
                )}
              </Link>

              <button onClick={logout} className="hidden rounded-xl px-3 py-2 text-sm font-semibold text-red-500 hover:bg-red-50 lg:block">
                Logout
              </button>
            </div>
          </>
        ) : (
          <div className="col-span-2 flex justify-end gap-2">
            <button type="button" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} title="Toggle color theme" className="theme-toggle">
              {theme === 'dark' ? '☀' : '☾'}
            </button>
            <NavLink to="/login" className={nav}>Login</NavLink>
            <NavLink to="/register" className="rounded-xl bg-[#8B5CF6] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#7C3AED]">
              Register
            </NavLink>
          </div>
        )}
      </div>
    </nav>
  );
}
