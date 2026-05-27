import { useEffect, useRef, useState } from 'react';
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

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      className={className}
      aria-hidden
    >
      <path d="M4 4l8 8M12 4l-8 8" />
    </svg>
  );
}

type ExportTarget = 'combined' | 'gear' | 'cam';

const EXPORT_OPTIONS: Array<{
  id: ExportTarget;
  title: string;
  filename: string;
  blurb: string;
}> = [
  {
    id: 'combined',
    title: 'Combined assembly',
    filename: 'geneva-drive.dxf',
    blurb: 'Wheel + crank at working centre distance. Both on separate layers — ready to extrude in Fusion.',
  },
  {
    id: 'gear',
    title: 'Gear only',
    filename: 'geneva-wheel.dxf',
    blurb: 'Just the Geneva wheel, centred at the origin.',
  },
  {
    id: 'cam',
    title: 'Cam only',
    filename: 'geneva-crank.dxf',
    blurb: 'Just the drive crank (outer disc + stop disc + pin), centred at the origin.',
  },
];

export function ExportBar({ params }: { params: GenevaParams }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [stlTip, setStlTip] = useState(false);

  const closeDialog = () => {
    setOpen(false);
    dialogRef.current?.close();
  };

  // Sync the <dialog>'s native modal state with our React state so the user
  // can dismiss with Esc or backdrop click and React still re-renders.
  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    if (open && !dlg.open) dlg.showModal();
    if (!open && dlg.open) dlg.close();
    const onCancel = () => setOpen(false);
    const onClose = () => setOpen(false);
    dlg.addEventListener('cancel', onCancel);
    dlg.addEventListener('close', onClose);
    return () => {
      dlg.removeEventListener('cancel', onCancel);
      dlg.removeEventListener('close', onClose);
    };
  }, [open]);

  const exportFor = (target: ExportTarget) => {
    const profiles =
      target === 'combined'
        ? [buildWheelProfile(params), buildCrankProfile(params)]
        : target === 'gear'
        ? [buildWheelProfile(params)]
        : [buildCrankProfile(params, 0)]; // crank-only: re-centre at origin
    const filename = EXPORT_OPTIONS.find((o) => o.id === target)!.filename;
    downloadText(filename, profilesToDxf(profiles), 'application/dxf');
    closeDialog();
  };

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
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn(
            'group relative flex shrink-0 items-center gap-2.5 rounded-md bg-accent px-4 py-2.5',
            'font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-accent-fg',
            'btn-physical transition-all duration-150',
            'hover:-translate-y-px active:translate-y-0'
          )}
        >
          <DownloadIcon className="size-3.5 transition-transform duration-200 group-hover:translate-y-px" />
          Export DXF
          <span className="ml-1 hidden font-mono text-[10px] tracking-[0.16em] text-accent-fg/60 sm:inline">
            ↳ choose parts
          </span>
        </button>

        <div
          className="relative"
          onMouseEnter={() => setStlTip(true)}
          onMouseLeave={() => setStlTip(false)}
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
          {stlTip && (
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

      {/* Native <dialog>: gets accessible Esc-to-close + backdrop click + a
          page-level modal stack out of the box. Styling is matched to the
          rest of the panel chrome. */}
      <dialog
        ref={dialogRef}
        aria-labelledby="export-dialog-title"
        onClick={(e) => {
          // Click on the backdrop (the dialog element itself, not its contents)
          // should close. The inner <div> stops propagation for content clicks.
          if (e.target === dialogRef.current) closeDialog();
        }}
        className={cn(
          // Native <dialog> in showModal mode is positioned with
          // `position: fixed; inset: 0` by the UA, then centred via
          // `margin: auto`. Tailwind's preflight resets margins to 0,
          // which knocks the dialog into the top-left. `m-auto` brings
          // the centring back.
          'fixed inset-0 m-auto',
          'rounded-lg border border-border-bright bg-bg-elev p-0',
          'max-w-[440px] w-[calc(100%-2rem)] h-fit',
          'text-fg shadow-2xl',
          'backdrop:bg-bg/70 backdrop:backdrop-blur-sm',
          'open:animate-[reveal_180ms_var(--ease-precision)_both]'
        )}
      >
        <div className="flex items-center justify-between gap-3 border-b border-border bg-bg-elev-2/60 px-5 py-3">
          <h3
            id="export-dialog-title"
            className="font-mono text-[11px] uppercase tracking-[0.18em] text-fg-muted"
          >
            Export DXF — pick parts
          </h3>
          <button
            type="button"
            onClick={closeDialog}
            aria-label="Close"
            className="rounded p-1 text-fg-subtle transition-colors hover:bg-bg-elev-2 hover:text-fg"
          >
            <CloseIcon className="size-3.5" />
          </button>
        </div>

        <ul className="flex flex-col gap-2 p-4">
          {EXPORT_OPTIONS.map((opt) => (
            <li key={opt.id}>
              <button
                type="button"
                onClick={() => exportFor(opt.id)}
                className={cn(
                  'group flex w-full items-start gap-3 rounded-md border border-border bg-bg-elev-2/40 px-4 py-3 text-left',
                  'transition-all duration-150',
                  'hover:border-accent/60 hover:bg-bg-elev-2 focus-visible:outline-none focus-visible:border-accent',
                  'focus-visible:shadow-[0_0_0_3px_var(--color-accent-dim)]'
                )}
              >
                <span
                  className={cn(
                    'mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md border border-border-bright/60 bg-bg text-fg-muted',
                    'transition-colors group-hover:border-accent group-hover:text-accent'
                  )}
                >
                  <DownloadIcon className="size-3.5" />
                </span>
                <span className="flex flex-1 flex-col gap-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="font-mono text-[12px] font-medium uppercase tracking-[0.14em] text-fg">
                      {opt.title}
                    </span>
                    <span className="font-mono text-[10px] tracking-[0.12em] text-fg-subtle">
                      ↳ {opt.filename}
                    </span>
                  </span>
                  <span className="text-[12px] leading-snug text-fg-muted">
                    {opt.blurb}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>

        <div className="flex justify-end border-t border-border bg-bg-elev-2/40 px-4 py-3">
          <button
            type="button"
            onClick={closeDialog}
            className={cn(
              'rounded-md border border-border px-3 py-1.5',
              'font-mono text-[10px] uppercase tracking-[0.16em] text-fg-muted',
              'transition-colors hover:border-border-bright hover:text-fg'
            )}
          >
            Cancel
          </button>
        </div>
      </dialog>
    </section>
  );
}
