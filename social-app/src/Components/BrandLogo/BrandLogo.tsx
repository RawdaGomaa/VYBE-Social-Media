export default function BrandLogo({ compact = false }: { compact?: boolean }) {
  return <div className="flex items-center gap-2.5" aria-label="VYBE social app">
    <div className="relative grid h-11 w-11 place-items-center rounded-[17px] bg-gradient-to-br from-[#a78bfa] via-[#8255f2] to-[#5145bc] shadow-[0_9px_24px_rgba(114,71,227,.3)]">
      <svg width="29" height="29" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path d="M6.5 8.75C6.5 6.4 8.4 4.5 10.75 4.5h10.5c2.35 0 4.25 1.9 4.25 4.25v10c0 2.35-1.9 4.25-4.25 4.25h-5.5l-6.6 4.55v-4.7A4.25 4.25 0 0 1 6.5 18.75v-10Z" stroke="white" strokeWidth="2.5" strokeLinejoin="round"/>
        <path d="m11 14 3.4 3.5 6.9-7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full border-[3px] border-white bg-[#3dd7ad]" />
    </div>
    {!compact && <span className="hidden text-[22px] font-black tracking-[-.055em] vybe-wordmark sm:block">vybe<span className="text-[#8b5cf6]">.</span></span>}
  </div>;
}
