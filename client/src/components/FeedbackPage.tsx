import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError, FEEDBACK_CATEGORIES, submitFeedback } from '../api';
import type { FeedbackCategory } from '../api';

const RETURN_HOME_DELAY_MS = 5000;

export function FeedbackPage() {
  const navigate = useNavigate();
  const [category, setCategory] = useState<FeedbackCategory | ''>('');
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!submitted) return;
    const timer = setTimeout(() => navigate('/'), RETURN_HOME_DELAY_MS);
    return () => clearTimeout(timer);
  }, [submitted, navigate]);

  async function handleSubmit() {
    if (!category) {
      setFormError('Choose a category before submitting.');
      return;
    }
    if (!message.trim()) {
      setFormError('Enter a message before submitting.');
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      await submitFeedback({ category, message: message.trim(), website });
      setSubmitted(true);
      setMessage('');
      setCategory('');
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="feedback-page">
        <h1>Thanks for the feedback</h1>
        <p className="feedback-page__intro">Your message was posted.</p>
        <button
          type="button"
          className="analyse-button feedback-page__return-button"
          onClick={() => navigate('/')}
        >
          <span
            className="feedback-page__return-fill"
            style={{ animationDuration: `${RETURN_HOME_DELAY_MS}ms` }}
          />
          <span className="feedback-page__return-label">Return to home</span>
        </button>
      </div>
    );
  }

  return (
    <div className="feedback-page">
      <h1>Feedback</h1>
      <p className="feedback-page__intro">
        Ideas, bug reports, questions — anything's welcome. Posted anonymously as a GitHub Discussion.
      </p>

      <section className="upload-section">
        <h2>Category</h2>
        <div className="riding-style-grid">
          {FEEDBACK_CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              className={`riding-style-chip ${category === c ? 'riding-style-chip--active' : ''}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      <section className="upload-section">
        <h2>Message</h2>
        <textarea
          className="rider-notes"
          placeholder="What's on your mind?"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
        />
      </section>

      {/* Honeypot — hidden from real users, bots that auto-fill every input trip it. */}
      <input
        type="text"
        name="website"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="feedback-page__honeypot"
      />

      {formError && <p className="upload-screen__error">{formError}</p>}

      <button type="button" className="analyse-button" onClick={handleSubmit} disabled={submitting}>
        {submitting ? 'Submitting…' : 'Submit feedback'}
      </button>
    </div>
  );
}
