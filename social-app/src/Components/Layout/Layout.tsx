import { Outlet } from "react-router";
import { TickCircle } from "iconsax-reactjs";
import NavBar from "../NavBar/NavBar";
import { usePostUpload } from "../../context/PostUploadContext";
import { useAuth } from "../../context/AuthContext";

export default function Layout() {
  const { isPosting, uploadProgress, error } = usePostUpload();
  const { isUploadingProfilePhoto, profilePhotoUploadProgress } = useAuth();

  return (
    <>
      <NavBar />
      <main className="min-h-screen px-4 pt-16"><Outlet /></main>

      {isUploadingProfilePhoto && (
        <div className={`fixed right-5 z-[80] w-[min(360px,calc(100vw-2rem))] rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_18px_55px_rgba(15,23,42,.18)] ${isPosting ? "bottom-36" : "bottom-5"}`}>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#F2ECFF] text-[#8B5CF6]">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#8B5CF6]/25 border-t-[#8B5CF6]" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-sm font-bold text-gray-800">Updating profile photo</p>
                <span className="text-xs font-bold text-[#8B5CF6]">{Math.max(1, profilePhotoUploadProgress)}%</span>
              </div>
              <p className="mt-0.5 text-xs text-gray-400">{profilePhotoUploadProgress >= 100 ? "Upload complete — processing on the server…" : "Upload continues while you browse the app."}</p>
            </div>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-100">
            <div className="h-full rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#6D5DF7] transition-all duration-300" style={{ width: `${Math.max(2, profilePhotoUploadProgress)}%` }} />
          </div>
        </div>
      )}

      {isPosting && (
        <div className="fixed bottom-5 right-5 z-[80] w-[min(360px,calc(100vw-2rem))] rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_18px_55px_rgba(15,23,42,.18)]">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#F2ECFF] text-[#8B5CF6]">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#8B5CF6]/25 border-t-[#8B5CF6]" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-sm font-bold text-gray-800">Publishing your post</p>
                <span className="text-xs font-bold text-[#8B5CF6]">{uploadProgress || 1}%</span>
              </div>
              <p className="mt-0.5 text-xs text-gray-400">Upload continues while you browse the app.</p>
            </div>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-100">
            <div className="h-full rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#6D5DF7] transition-all duration-300" style={{ width: `${Math.max(2, uploadProgress)}%` }} />
          </div>
        </div>
      )}

      {!isPosting && error && (
        <div className="fixed bottom-5 right-5 z-[80] flex w-[min(360px,calc(100vw-2rem))] items-start gap-3 rounded-2xl border border-red-100 bg-white p-4 text-sm text-red-600 shadow-[0_18px_55px_rgba(15,23,42,.18)]">
          <TickCircle size="20" className="mt-0.5 shrink-0 rotate-45" />
          <span>{error}</span>
        </div>
      )}
    </>
  );
}
