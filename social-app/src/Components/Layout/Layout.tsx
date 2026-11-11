
import { Outlet } from "react-router";
import { TickCircle } from "iconsax-reactjs";
import NavBar from "../NavBar/NavBar";
import { usePostUpload } from "../../context/PostUploadContext";
import { useAuth } from "../../context/AuthContext";

export default function Layout() {
  const { isPosting, uploadProgress, error } = usePostUpload();
  const { isUploadingProfilePhoto, profilePhotoUploadProgress } = useAuth();

  return (
    <div className="relative isolate min-h-dvh w-full max-w-none overflow-x-hidden bg-transparent">

      {/* GLOBAL FIXED BACKGROUND */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none fixed inset-0 z-0
          bg-[radial-gradient(ellipse_65%_55%_at_5%_5%,rgba(168,139,250,0.20),transparent_75%),radial-gradient(ellipse_60%_50%_at_100%_45%,rgba(196,181,253,0.22),transparent_75%),radial-gradient(ellipse_70%_55%_at_50%_100%,rgba(139,92,246,0.10),transparent_75%),#F8F7FE]
          dark:bg-[radial-gradient(ellipse_65%_55%_at_5%_5%,rgba(114,76,212,0.19),transparent_75%),radial-gradient(ellipse_60%_50%_at_100%_45%,rgba(131,102,225,0.13),transparent_75%),radial-gradient(ellipse_70%_55%_at_50%_100%,rgba(139,92,246,0.09),transparent_75%),#101120]
        "
      />

      <div className="relative z-10">

        <NavBar />

        <main className="min-h-screen w-full max-w-none px-0 pt-16">
          <Outlet />
        </main>

      </div>

      {/* PROFILE PHOTO UPLOAD PROGRESS */}
      {isUploadingProfilePhoto && (
        <div
          className={`fixed right-5 z-[80] w-[min(360px,calc(100vw-2rem))] rounded-2xl border border-violet-100 bg-white p-4 shadow-xl dark:border-[#38304F] dark:bg-[#1C1B32] ${
            isPosting ? "bottom-36" : "bottom-5"
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-500 dark:bg-violet-950">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-violet-500/25 border-t-violet-500" />
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-sm font-bold text-gray-800 dark:text-white">
                  Updating profile photo
                </p>
                <span className="text-xs font-bold text-violet-500">
                  {Math.max(1, profilePhotoUploadProgress)}%
                </span>
              </div>

              <p className="mt-0.5 text-xs text-gray-400">
                {profilePhotoUploadProgress >= 100
                  ? "Upload complete — processing on the server…"
                  : "Upload continues while you browse the app."}
              </p>
            </div>
          </div>

          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-300"
              style={{
                width: `${Math.max(2, profilePhotoUploadProgress)}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* POST UPLOAD PROGRESS */}
      {isPosting && (
        <div className="fixed bottom-5 right-5 z-[80] w-[min(360px,calc(100vw-2rem))] rounded-2xl border border-violet-100 bg-white p-4 shadow-xl dark:border-[#38304F] dark:bg-[#1C1B32]">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-500 dark:bg-violet-950">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-violet-500/25 border-t-violet-500" />
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-sm font-bold text-gray-800 dark:text-white">
                  Publishing your post
                </p>
                <span className="text-xs font-bold text-violet-500">
                  {uploadProgress || 1}%
                </span>
              </div>

              <p className="mt-0.5 text-xs text-gray-400">
                Upload continues while you browse the app.
              </p>
            </div>
          </div>

          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-300"
              style={{
                width: `${Math.max(2, uploadProgress)}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* UPLOAD ERROR */}
      {!isPosting && error && (
        <div className="fixed bottom-5 right-5 z-[80] flex w-[min(360px,calc(100vw-2rem))] items-start gap-3 rounded-2xl border border-red-100 bg-white p-4 text-sm text-red-600 shadow-xl dark:border-red-900 dark:bg-[#1C1B32] dark:text-red-400">
          <TickCircle size="20" className="mt-0.5 shrink-0 rotate-45" />
          <span>{error}</span>
        </div>
      )}

    </div>
  );
}
