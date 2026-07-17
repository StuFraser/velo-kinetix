import { PHOTO_SLOTS } from '../api';
import type { PhotoType } from '../api';

const PHOTO_TIPS: Record<PhotoType, string> = {
  profile_drive: 'Stand to the drive (chain) side, with pedals near 6 and 12 o’clock. Stand back far enough ' +
    'to fit the whole bike and rider in frame, and shoot from roughly hip height rather than above or below.',
  front_on: 'Face the camera straight on, sitting normally on the bike. This helps catch left/right asymmetries ' +
    'that a side profile can’t show.',
  bike_static: 'Just the bike, no rider, from roughly a 45° angle. Keep the bike upright and level — not leaning ' +
    'against a wall at an odd angle.',
};

export function AboutPage() {
  return (
    <div className="about-page">
      <h1>About VeloKinetix</h1>
      <p className="about-page__intro">
        AI-powered MTB bike fit analysis — a budget-conscious alternative to a paid professional fit.
      </p>

      <section className="about-page__section">
        <h2>How it works</h2>
        <p>
          Pick your discipline and riding style, upload a few photos of you and your bike, and optionally add notes on any
          pain points, injuries, or adaptive needs. VeloKinetix analyses the photos and returns structured
          fit recommendations — rider position and technique adjustments, plus bike adjustments split by
          cost (free, under $50, or higher).
        </p>
      </section>

      <section className="about-page__section">
        <h2>Getting good photos</h2>
        <p>
          The quality of the analysis depends on the quality of the photos. A few tips before you shoot:
        </p>
        <ul className="about-page__photo-list">
          {PHOTO_SLOTS.map((slot) => (
            <li key={slot.photoType}>
              <strong>
                {slot.label}
                {slot.required === 'required' ? ' (required)' : ' (recommended)'}
              </strong>
              <span> — {PHOTO_TIPS[slot.photoType]}</span>
            </li>
          ))}
        </ul>
        <p>
          A few things that help across all three shots: wear normal-fitting cycling gear — a jersey or fitted
          top and cycling or fitted shorts — rather than baggy or loose clothing, since it obscures the body
          lines and joint angles the analysis relies on. Shoot outdoors or somewhere well-lit rather than a
          dim room, and use a plain, uncluttered background if you can, so the bike and rider are easy to
          make out.
        </p>
      </section>

      <section className="about-page__section">
        <h2>Disclaimer</h2>
        <div className="about-page__disclaimer">
          This analysis is AI-generated from photos and is not a substitute for a professional in-person bike
          fit. Use it as a starting point for adjustments you can try and reassess — not as medical, safety,
          or mechanical advice. If something feels wrong with your bike or your body, see a professional
          fitter or a doctor.
        </div>
      </section>
    </div>
  );
}
