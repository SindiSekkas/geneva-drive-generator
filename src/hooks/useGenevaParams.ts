import { useReducer, useMemo } from 'react';
import { deriveParams } from '../geneva/params';
import type { GenevaInput, GenevaParams, RadiusMode } from '../geneva/params';

export interface UiState {
  input: GenevaInput;
  showDimensions: boolean;
  animate: boolean;
}

export const DEFAULT_STATE: UiState = {
  input: { mode: 'b', b: 55, n: 6, p: 4, t: 0.1 },
  showDimensions: true,
  animate: false,
};

export type Action =
  | { type: 'setN'; value: number }
  | { type: 'setRadius'; value: number }
  | { type: 'setP'; value: number }
  | { type: 'setT'; value: number }
  | { type: 'setMode'; value: RadiusMode }
  | { type: 'toggleAnimate' }
  | { type: 'toggleDimensions' }
  | { type: 'replaceAll'; state: UiState };

export function reducer(state: UiState, action: Action): UiState {
  switch (action.type) {
    case 'setN':
      return { ...state, input: { ...state.input, n: action.value } };
    case 'setRadius':
      return {
        ...state,
        input: {
          ...state.input,
          [state.input.mode]: action.value,
        } as GenevaInput,
      };
    case 'setP':
      return { ...state, input: { ...state.input, p: action.value } };
    case 'setT':
      return { ...state, input: { ...state.input, t: action.value } };
    case 'setMode': {
      // Carry the currently-derived value across so geometry doesn't snap.
      const derived = deriveParams(state.input);
      const next: GenevaInput =
        action.value === 'a'
          ? { mode: 'a', a: derived.a, n: state.input.n, p: state.input.p, t: state.input.t }
          : { mode: 'b', b: derived.b, n: state.input.n, p: state.input.p, t: state.input.t };
      return { ...state, input: next };
    }
    case 'toggleAnimate':
      return { ...state, animate: !state.animate };
    case 'toggleDimensions':
      return { ...state, showDimensions: !state.showDimensions };
    case 'replaceAll':
      return action.state;
  }
}

/** Reducer-backed UI state plus the memoized derived GenevaParams. */
export function useGenevaParams() {
  const [state, dispatch] = useReducer(reducer, DEFAULT_STATE);
  const params: GenevaParams = useMemo(
    () => deriveParams(state.input),
    [state.input]
  );
  return { state, dispatch, params };
}
