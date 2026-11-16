
export default function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className="flex items-center gap-2 sm:gap-2.5"
      aria-label="VYBE social app"
    >
      {/* BRAND ICON */}
      <div
        className="
          relative grid
          h-9 w-9 sm:h-11 sm:w-11
          place-items-center
          rounded-[14px] sm:rounded-[17px]
          bg-gradient-to-br from-[#a78bfa] via-[#8255f2] to-[#5145bc]
          shadow-[0_7px_18px_rgba(114,71,227,.25)]
          sm:shadow-[0_9px_24px_rgba(114,71,227,.3)]
          shrink-0
        "
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 32 32"
          className="sm:w-[29px] sm:h-[29px]"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M6.5 8.75C6.5 6.4 8.4 4.5 10.75 4.5h10.5c2.35 0 4.25 1.9 4.25 4.25v10c0 2.35-1.9 4.25-4.25 4.25h-5.5l-6.6 4.55v-4.7A4.25 4.25 0 0 1 6.5 18.75v-10Z"
            stroke="white"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          <path
            d="m11 14 3.4 3.5 6.9-7"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* ONLINE INDICATOR */}
        <span
          className="
            absolute -right-1 -top-1
            h-3 w-3 sm:h-3.5 sm:w-3.5
            rounded-full
            border-[2.5px] sm:border-[3px]
            border-white
            bg-[#3dd7ad]
          "
        />
      </div>

      {/* BRAND NAME */}
      {!compact && (
        <span
          className="
            hidden sm:block
            text-[22px]
            font-black
            tracking-[-.055em]
            vybe-wordmark
          "
        >
          vybe<span className="text-[#8b5cf6]">.</span>
        </span>
      )}
    </div>
  );
}
