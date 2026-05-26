import { Download, Info } from 'lucide-react';
import { useState } from 'react';
import type { GenevaParams } from '../geneva/params';
import { buildWheelProfile, buildCrankProfile } from '../geneva/geometry';
import { profilesToDxf } from '../geneva/exporters/dxf';
import { downloadText } from '../lib/download';

export function ExportBar({ params }: { params: GenevaParams }) {
  const handleDxf = () => {
    const dxf = profilesToDxf([buildWheelProfile(params), buildCrankProfile(params)]);
    downloadText('geneva-drive.dxf', dxf, 'application/dxf');
  };

  const [tip, setTip] = useState(false);
  return (
    <section className="flex flex-col gap-3 rounded-xl border border-border bg-bg-elev p-6">
      <h2 className="text-xs uppercase tracking-widest text-fg-subtle">Export</h2>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleDxf}
          className="flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-fg
            shadow-[inset_0_1px_0_rgb(255_255_255_/_0.08)] transition-transform hover:scale-[1.01] active:scale-[0.99]"
        >
          <Download className="size-4" />
          Export DXF
        </button>
        <div
          className="relative"
          onMouseEnter={() => setTip(true)}
          onMouseLeave={() => setTip(false)}
        >
          <button
            type="button"
            aria-disabled
            disabled
            className="flex cursor-not-allowed items-center gap-2 rounded-md border border-border bg-bg
              px-4 py-2 text-sm text-fg-muted opacity-40"
          >
            <Download className="size-4" />
            Export STL
            <Info className="size-3.5 ml-1" />
          </button>
          {tip && (
            <div
              role="tooltip"
              className="absolute left-1/2 top-full mt-2 -translate-x-1/2 rounded-md border border-border bg-bg-elev
                px-3 py-1.5 text-xs text-fg-muted shadow-lg whitespace-nowrap"
            >
              STL export — coming soon
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
