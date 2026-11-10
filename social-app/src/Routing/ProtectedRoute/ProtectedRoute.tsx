
import { Navigate, Outlet } from "react-router";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute() {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <main className="flex min-h-[calc(100dvh-64px)] items-center justify-center bg-[#F8F7FE] px-4 dark:bg-[#101120]">
        <div className="flex flex-col items-center text-center">

          <div className="relative mb-5 grid h-16 w-16 place-items-center rounded-2xl border border-violet-100 bg-white shadow-lg shadow-violet-500/10 dark:border-[#383651] dark:bg-[#1B1C32]">
            <span className="text-2xl font-black text-[#8B5CF6]">
              V
            </span>

            <span className="absolute -right-1 -top-1 h-4 w-4 animate-ping rounded-full bg-violet-400/60" />
          </div>

          <div className="mb-3 h-1.5 w-32 overflow-hidden rounded-full bg-violet-100 dark:bg-[#302A46]">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#6950E8]" />
          </div>

          <p className="text-sm font-bold text-[#51456E] dark:text-[#E5DCFA]">
            Getting things ready...
          </p>

          <p className="mt-1 text-xs text-[#9891A9] dark:text-[#AAA4BD]">
            Welcome to your VYBE space
          </p>

        </div>
      </main>
    );
  }

  return token ? <Outlet /> : <Navigate to="/login" replace />;
}
