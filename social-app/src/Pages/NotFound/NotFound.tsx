
import { Link } from "react-router";
import { Home2, ArrowLeft, SearchNormal1 } from "iconsax-reactjs";

export default function NotFound() {
  return (
    <div className="relative flex min-h-[calc(100dvh-80px)] w-full items-center justify-center overflow-hidden bg-[#F8F7FE] px-4 py-12 dark:bg-[#101120]">

      {/* Background Effects */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-violet-400/20 blur-[110px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-purple-400/20 blur-[110px]" />

      <div className="relative z-10 w-full max-w-xl text-center">

        {/* 404 */}
        <div className="relative mb-6">
          <h1 className="select-none text-[130px] font-black leading-none tracking-tighter text-violet-100 dark:text-violet-500/10 sm:text-[190px]">
            404
          </h1>

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="grid h-20 w-20 place-items-center rounded-3xl border border-violet-200 bg-white shadow-xl shadow-violet-500/10 dark:border-violet-400/20 dark:bg-[#1C1B32]">
              <SearchNormal1
                size="38"
                className="text-violet-500"
              />
            </div>
          </div>
        </div>

        {/* Message */}
        <span className="inline-flex rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-xs font-bold text-violet-700 dark:border-violet-400/20 dark:bg-violet-500/10 dark:text-violet-300">
          ✦ Lost in the VYBE?
        </span>

        <h2 className="mt-6 text-3xl font-black tracking-tight text-[#18152C] dark:text-white sm:text-4xl">
          Oops! Page not found
        </h2>

        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[#89859A] dark:text-[#AAA4BD]">
          Looks like this page doesn't exist or may have been moved.
          Don't worry, there's still plenty to discover in VYBE.
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">

          <Link
            to="/posts"
            className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 px-7 py-3.5 font-bold text-white shadow-lg shadow-violet-500/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-500/30"
          >
            <Home2 size="20" />
            Back to Home
          </Link>

          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-violet-200 bg-white px-7 py-3.5 font-bold text-violet-700 transition-all duration-300 hover:-translate-y-1 hover:bg-violet-50 dark:border-violet-400/20 dark:bg-[#1C1B32] dark:text-violet-300 dark:hover:bg-[#25213A]"
          >
            <ArrowLeft size="20" />
            Go Back
          </button>

        </div>

        <p className="mt-12 text-xs font-semibold tracking-widest text-[#AAA4BA] dark:text-[#77718F]">
          VYBE · GOOD THINGS START WITH A CONVERSATION
        </p>

      </div>
    </div>
  );
}
