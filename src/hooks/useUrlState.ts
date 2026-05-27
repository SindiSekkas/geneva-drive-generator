import { useEffect } from 'react';
import type { UiState } from './useGenevaParams';
import type { GenevaInput } from '../geneva/params';

function serialize(state: UiState): string {
  const { input } = state;
  const radiusValue = input.mode === 'b' ? input.b : input.a;
  const parts = new URLSearchParams();
  parts.set('mode', input.mode);
  parts.set('n', String(input.n));
  parts.set(input.mode, String(radiusValue));
  parts.set('p', String(input.p));
  parts.set('t', String(input.t));
  if (state.showDimensions) parts.set('dims', '1');
  if (state.animate) parts.set('anim', '1');
  return parts.toString();
}

export function parseUrl(search: string): Partial<UiState> | null {
  const q = new URLSearchParams(search);
  const mode = q.get('mode');
  if (mode !== 'a' && mode !== 'b') return null;
  const n = Number(q.get('n'));
  const radius = Number(q.get(mode));
  const p = Number(q.get('p'));
  const t = Number(q.get('t'));
  if (![n, radius, p, t].every(Number.isFinite)) return null;
  const input: GenevaInput = mode === 'b'
    ? { mode, b: radius, n, p, t }
    : { mode, a: radius, n, p, t };
  return {
    input,
    showDimensions: q.get('dims') === '1',
    animate: q.get('anim') === '1',
  };
}

/**
 * Debounce-mirrors state into the URL query string.
 *
 * Note: loading from URL is handled in App.tsx so this hook stays one-directional.
 */
export function useUrlState(state: UiState): void {
  useEffect(() => {
    const id = setTimeout(() => {
      const url = new URL(window.location.href);
      url.search = '?' + serialize(state);
      window.history.replaceState(null, '', url);
    }, 200);
    return () => clearTimeout(id);
  }, [state]);
}
