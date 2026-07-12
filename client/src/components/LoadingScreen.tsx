import { useEffect, useState } from 'react';

const MESSAGES = [
  'Reading your riding position…',
  'Checking saddle height and setback…',
  'Cross-referencing your riding style…',
  'Weighing up cost-free wins first…',
  'Drafting your fit report…',
];

export function LoadingScreen() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % MESSAGES.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="loading-screen">
      <div className="loading-screen__spinner" aria-hidden="true">
        <svg viewBox="0 0 100 100" width="96" height="96">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="var(--surface-raised)"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="var(--green)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="60 190"
          />
        </svg>
      </div>
      <p className="loading-screen__message">{MESSAGES[messageIndex]}</p>
    </div>
  );
}
