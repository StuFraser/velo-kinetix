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
      <svg className="loading-screen__svg" viewBox="0 0 480 140" width="100%" height="140" aria-hidden="true">
        <line x1="0" y1="112" x2="480" y2="112" stroke="var(--border)" strokeWidth="2" />

        <g className="loading-screen__obstacles">
          {[0, 480].map((offset) => (
            <g key={offset} transform={`translate(${offset}, 0)`}>
              <polygon points="60,112 72,80 84,112" fill="var(--text-muted)" />
              <polygon points="220,112 232,84 244,112" fill="var(--text-muted)" />
              <polygon points="380,112 392,80 404,112" fill="var(--text-muted)" />
            </g>
          ))}
        </g>

        <g className="loading-screen__rider" transform="translate(90, 0)">
          <circle cx="-20" cy="100" r="14" fill="none" stroke="var(--green)" strokeWidth="4" />
          <circle cx="26" cy="100" r="14" fill="none" stroke="var(--orange)" strokeWidth="4" />
          <path
            d="M 2 100 L -20 100
               M 2 100 L -10 64
               M -10 64 L 20 64
               M 2 100 L 20 64
               M 20 64 L 26 100
               M -10 64 L 0 38
               M 0 38 L 20 64
               M -10 64 L -2 84 L 2 100"
            fill="none"
            stroke="var(--text)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="4" cy="28" r="8" fill="var(--text)" />
        </g>
      </svg>
      <p className="loading-screen__message">{MESSAGES[messageIndex]}</p>
    </div>
  );
}
