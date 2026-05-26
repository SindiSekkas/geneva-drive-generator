import { GitBranch } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-10 h-14 border-b border-border bg-bg/80 backdrop-blur">
      <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between px-6">
        <div className="flex items-baseline gap-3">
          <span className="text-lg font-semibold tracking-tight text-fg">
            Geneva Drive Generator
          </span>
          <span className="font-mono text-xs text-fg-subtle">v0.1</span>
        </div>
        <a
          href="https://github.com/<owner>/geneva-drive-generator"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg transition-colors"
        >
          <GitBranch className="size-4" />
          <span>Source</span>
        </a>
      </div>
    </header>
  );
}
