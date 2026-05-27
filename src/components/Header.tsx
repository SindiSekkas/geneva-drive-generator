/**
 * Inline Geneva-wheel logo mark — a stylized 6-position Geneva drive in 18px.
 * Hairline strokes, matches the engineering aesthetic.
 */
function WheelMark() {
  return (
    <svg
      viewBox="-12 -12 24 24"
      className="size-[18px] text-accent"
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
    >
      {/* outer wheel */}
      <circle cx={0} cy={0} r={9} />
      {/* 6 slot indicator dashes around the rim */}
      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i * Math.PI) / 3;
        const x1 = 7 * Math.cos(a);
        const y1 = 7 * Math.sin(a);
        const x2 = 9 * Math.cos(a);
        const y2 = 9 * Math.sin(a);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
      })}
      {/* drive pin (small filled dot offset from center, simulating crank position) */}
      <circle cx={0} cy={0} r={1.2} fill="currentColor" stroke="none" />
    </svg>
  );
}

/**
 * Inline GitHub mark (24×24 official octocat path, hand-trimmed).
 * Avoids lucide-react brand-icon dependency.
 */
function GithubMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden fill="currentColor">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-1.95c-3.2.7-3.87-1.54-3.87-1.54-.52-1.33-1.27-1.68-1.27-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.69 1.25 3.34.96.1-.74.4-1.25.73-1.54-2.55-.29-5.24-1.27-5.24-5.66 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.17.91-.25 1.89-.38 2.86-.38.97 0 1.95.13 2.86.38 2.19-1.48 3.15-1.17 3.15-1.17.62 1.58.23 2.75.11 3.04.73.8 1.18 1.82 1.18 3.07 0 4.4-2.69 5.37-5.25 5.65.41.36.78 1.07.78 2.15v3.19c0 .31.21.68.8.56C20.21 21.38 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z" />
    </svg>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-20 h-14 border-b border-border bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <WheelMark />
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-[13px] font-medium uppercase tracking-[0.14em] text-fg">
              Geneva Drive Generator
            </span>
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.18em] text-fg-subtle sm:inline">
              v1.0
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-fg-subtle md:flex">
            <span className="size-1.5 rounded-full bg-accent pulse-soft" />
            units · mm
          </span>
          <a
            href="https://github.com/SindiSekkas/geneva-drive-generator"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-sm text-fg-muted transition-colors hover:text-fg"
            aria-label="View source on GitHub"
          >
            <GithubMark />
            <span className="hidden sm:inline">Source</span>
          </a>
        </div>
      </div>
    </header>
  );
}
