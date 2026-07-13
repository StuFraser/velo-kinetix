import { useState } from 'react';
import { UploadScreen } from './UploadScreen';
import { LoadingScreen } from './LoadingScreen';
import { ResultsScreen } from './ResultsScreen';
import { analyseFit, ApiError } from '../api';
import type { AnalyseRequest, AnalyseResponse } from '../api';

type Screen = 'upload' | 'loading' | 'results';

export function HomePage() {
  const [screen, setScreen] = useState<Screen>('upload');
  const [lastRequest, setLastRequest] = useState<AnalyseRequest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyseResponse | null>(null);

  async function handleSubmit(request: AnalyseRequest) {
    setLastRequest(request);
    setError(null);
    setScreen('loading');
    try {
      const response = await analyseFit(request);
      setResult(response);
      setScreen('results');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
      setScreen('upload');
    }
  }

  function handleReset() {
    setResult(null);
    setLastRequest(null);
    setError(null);
    setScreen('upload');
  }

  return (
    <>
      {screen === 'upload' && (
        <UploadScreen onSubmit={handleSubmit} initialError={error} initialRequest={lastRequest} />
      )}
      {screen === 'loading' && <LoadingScreen />}
      {screen === 'results' && result && (
        <ResultsScreen result={result} request={lastRequest} onReset={handleReset} />
      )}
    </>
  );
}
