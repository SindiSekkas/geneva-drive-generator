import { useState } from 'react';
import type { GenevaParams } from '../geneva/params';
import { buildWheelProfile, buildCrankProfile } from '../geneva/geometry';
import { profilesToDxf } from '../geneva/exporters/dxf';
import { downloadText } from '../lib/download';
import { cn } from '../lib/cn';

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M8 2v9" />
      <path d="M4.5 7.5L8 11l3.5-3.5" />
      <path d="M3 13.5h10" />
    </svg>
  );
}

export function ExportBar({ params }: { params: GenevaParams }) {
  const handleDxf = () => {
    const dxf = profilesToDxf([buildWheelProfile(params), buildCrankProfile(params)]);
    downloadText('geneva-drive.dxf', dxf, 'application/dxf');
  };

  const [tip, setTip] = useState(false);

  return (
    <section className="flex flex-col gap-4 rounded-lg border border-border bg-bg-elev p-6">
      <div className="flex items-baseline justify-between border-b border-border pb-2">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-fg-muted">
          Export
        </h2>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-fg-subtle">
          R12 · MM
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Primary DXF button. */}
        <button
          type="button"
          onClick={handleDxf}
          className={cn(
            'group relative flex shrink-0 items-center gap-2.5 rounded-md bg-accent px-4 py-2.5',
            'font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-accent-fg',
            'btn-physical transition-all duration-150',
            'hover:-translate-y-px active:translate-y-0'
          )}
        >
          <DownloadIcon className="size-3.5 transition-transform duration-200 group-hover:translate-y-px" />
          Export DXF
          {/* Filename hint — hidden below ~sm because it makes the row too wide. */}
          <span className="ml-1 hidden font-mono text-[10px] tracking-[0.16em] text-accent-fg/60 sm:inline">
            ↳ geneva-drive.dxf
          </span>
        </button>

        {/* Disabled STL button with delayed tooltip. */}
        <div
          className="relative"
          onMouseEnter={() => setTip(true)}
          onMouseLeave={() => setTip(false)}
        >
          <button
            type="button"
            aria-disabled
            disabled
            className={cn(
              'flex shrink-0 cursor-not-allowed items-center gap-2.5 rounded-md border border-border bg-bg-elev-2 px-4 py-2.5',
              'font-mono text-[11px] uppercase tracking-[0.18em] text-fg-subtle opacity-50'
            )}
          >
            <DownloadIcon className="size-3.5" />
            Export STL
            <span className="ml-0.5 inline-flex h-4 items-center rounded border border-border-bright/60 bg-bg px-1.5 font-mono text-[9px] tracking-[0.1em] text-fg-subtle">
              SOON
            </span>
          </button>
          {tip && (
            <div
              role="tooltip"
              className={cn(
                'tip-in absolute left-1/2 top-full z-30 mt-2 whitespace-nowrap rounded border border-border-bright bg-bg-elev-2 px-3 py-2 shadow-xl',
                'font-mono text-[10px] uppercase tracking-[0.14em] text-fg-muted'
              )}
            >
              <span className="inline-flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-warn pulse-soft" />
                STL Export · In Development
              </span>
              <span className="absolute -top-1 left-1/2 size-2 -translate-x-1/2 rotate-45 border-l border-t border-border-bright bg-bg-elev-2" />
            </div>
          )}
        </div>
      </div>

      <p className="font-mono text-[10px] leading-relaxed text-fg-subtle">
        DXF · R12 (AC1009) · both parts on separate layers at working center
        distance. Import into Fusion 360 → extrude each layer.
      </p>
    </section>
  );
}
