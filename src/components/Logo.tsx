export function Logo({ className = "h-12" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg viewBox="0 0 100 100" className="h-full w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="cross-grad" x1="0" y1="0" x2="0" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0099b8" />
            <stop offset="100%" stopColor="#2C3E50" />
          </linearGradient>
        </defs>
        <path d="M 35 10 h 30 a 5 5 0 0 1 5 5 v 20 h 20 a 5 5 0 0 1 5 5 v 20 a 5 5 0 0 1 -5 5 h -20 v 20 a 5 5 0 0 1 -5 5 h -30 a 5 5 0 0 1 -5 -5 v -20 h -20 a 5 5 0 0 1 -5 -5 v -20 a 5 5 0 0 1 5 -5 h 20 v -20 a 5 5 0 0 1 5 -5 z" fill="url(#cross-grad)" />
        <path d="M 12 50 h 28 l 6 -20 l 12 40 l 6 -20 h 24" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="flex flex-col justify-center leading-none">
        <span className="text-[28px] font-black tracking-widest text-[#2C3E50] leading-none font-heading">IZCOR</span>
        <span className="text-[16px] font-bold tracking-wide text-brand-cyan leading-none font-heading">medic</span>
      </div>
    </div>
  )
}
