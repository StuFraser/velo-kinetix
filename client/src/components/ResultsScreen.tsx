import { useState } from 'react';
import type { AnalyseRequest, AnalyseResponse, Adjustment } from '../api';

interface Props {
  result: AnalyseResponse;
  request: AnalyseRequest | null;
  onReset: () => void;
}

function AdjustmentCard({ adjustment }: { adjustment: Adjustment }) {
  return (
    <div className="adjustment-card">
      <div className="adjustment-card__head">
        <span className="adjustment-card__title">{adjustment.title}</span>
        <span className={`impact-badge impact-badge--${adjustment.impact.toLowerCase()}`}>
          {adjustment.impact}
        </span>
      </div>
      <p className="adjustment-card__zone">{adjustment.zone}</p>
      <p className="adjustment-card__detail">{adjustment.detail}</p>
    </div>
  );
}

function CostGroup({ title, dot, items }: { title: string; dot: string; items: Adjustment[] }) {
  if (items.length === 0) return null;
  return (
    <div className="cost-group">
      <h3>
        <span aria-hidden="true">{dot}</span> {title}
      </h3>
      <div className="adjustment-list">
        {items.map((a, i) => (
          <AdjustmentCard key={i} adjustment={a} />
        ))}
      </div>
    </div>
  );
}

export function ResultsScreen({ result, request, onReset }: Props) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  async function handleDownloadPdf() {
    if (!request) return;
    setPdfError(null);
    setIsGeneratingPdf(true);
    try {
      const { downloadFitReportPdf } = await import('./PdfReport');
      await downloadFitReportPdf(request, result);
    } catch {
      setPdfError('Could not generate the PDF. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  }

  return (
    <div className="results-screen">
      <h1>Your fit analysis</h1>
      <p className="results-screen__subtitle">
        Discipline: {result.discipline} · Riding style: {result.ridingStyle}
      </p>

      <section className="results-section">
        <h2>Rider adjustments</h2>
        <div className="adjustment-list">
          {result.riderAdjustments.map((a, i) => (
            <AdjustmentCard key={i} adjustment={a} />
          ))}
        </div>
      </section>

      <section className="results-section">
        <h2>Bike adjustments</h2>
        <CostGroup title="Free" dot="🟢" items={result.bikeAdjustments.free} />
        <CostGroup title="Low cost (under $50)" dot="🟡" items={result.bikeAdjustments.lowCost} />
        <CostGroup title="Higher cost" dot="🔴" items={result.bikeAdjustments.highCost} />
      </section>

      {result.analysisLimitations.length > 0 && (
        <section className="results-section">
          <h2>Analysis limitations</h2>
          <ul className="limitations-list">
            {result.analysisLimitations.map((l, i) => (
              <li key={i}>{l}</li>
            ))}
          </ul>
        </section>
      )}

      <p className="disclaimer">{result.disclaimer}</p>

      {pdfError && <p className="results-screen__error">{pdfError}</p>}

      {request && (
        <button
          type="button"
          className="download-pdf-button"
          onClick={handleDownloadPdf}
          disabled={isGeneratingPdf}
        >
          {isGeneratingPdf ? 'Preparing PDF…' : 'Download PDF report'}
        </button>
      )}

      <button type="button" className="analyse-button" onClick={onReset}>
        Analyse another fit
      </button>
    </div>
  );
}
