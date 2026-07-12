import { useState } from 'react';
import { Header } from './components/Header';
import { UploadScreen } from './components/UploadScreen';
import { LoadingScreen } from './components/LoadingScreen';
import { ResultsScreen } from './components/ResultsScreen';
import { analyseFit, ApiError } from './api';
import type { AnalyseRequest, AnalyseResponse } from './api';
import './App.css';

type Screen = 'upload' | 'loading' | 'results';

function App() {
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
    <div className="app">
      <Header />
      <main className="app__main">
        {screen === 'upload' && (
          <UploadScreen onSubmit={handleSubmit} initialError={error} initialRequest={lastRequest} />
        )}
        {screen === 'loading' && <LoadingScreen />}
        {screen === 'results' && result && <ResultsScreen result={result} onReset={handleReset} />}
      </main>
    </div>
  );
}

export default App;
