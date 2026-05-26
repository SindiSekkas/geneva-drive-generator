import { useEffect } from 'react';
import { Header } from './components/Header';
import { ParameterPanel } from './components/ParameterPanel';
import { DerivedValuesCard } from './components/DerivedValuesCard';
import { Preview } from './components/Preview';
import { PreviewControls } from './components/PreviewControls';
import { ExportBar } from './components/ExportBar';
import { useGenevaParams } from './hooks/useGenevaParams';
import { useUrlState, parseUrl } from './hooks/useUrlState';

export default function App() {
  const { state, dispatch, params } = useGenevaParams();

  useEffect(() => {
    const fromUrl = parseUrl(window.location.search);
    if (fromUrl?.input) {
      dispatch({
        type: 'replaceAll',
        state: { ...state, ...fromUrl } as typeof state,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useUrlState(state);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto grid max-w-[1200px] grid-cols-1 gap-8 px-6 py-8 lg:grid-cols-[400px_1fr]">
        <div className="flex flex-col gap-6">
          <ParameterPanel
            state={state}
            derivedA={params.a}
            derivedB={params.b}
            dispatch={dispatch}
          />
          <DerivedValuesCard params={params} />
        </div>
        <div className="flex flex-col gap-4">
          <div className="aspect-[4/3] w-full rounded-xl border border-border bg-bg-elev">
            <Preview params={params} />
          </div>
          <PreviewControls state={state} dispatch={dispatch} />
          <ExportBar params={params} />
        </div>
      </main>
    </div>
  );
}
