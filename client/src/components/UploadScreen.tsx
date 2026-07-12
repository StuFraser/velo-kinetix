import { useState } from 'react';
import { PHOTO_SLOTS, RIDING_STYLES, fileToBase64 } from '../api';
import type { AnalyseRequest, PhotoType, RidingStyle } from '../api';
import { PhotoSlot } from './PhotoSlot';

interface PhotoState {
  file: File;
  previewUrl: string;
  base64: string;
}

interface Props {
  onSubmit: (request: AnalyseRequest) => void;
  initialError: string | null;
  initialRequest: AnalyseRequest | null;
}

function restorePhotos(initialRequest: AnalyseRequest | null): Partial<Record<PhotoType, PhotoState>> {
  if (!initialRequest) return {};
  const restored: Partial<Record<PhotoType, PhotoState>> = {};
  for (const photo of initialRequest.photos) {
    restored[photo.photoType] = {
      file: new File([], photo.photoType, { type: photo.mimeType }),
      previewUrl: `data:${photo.mimeType};base64,${photo.base64Data}`,
      base64: photo.base64Data,
    };
  }
  return restored;
}

export function UploadScreen({ onSubmit, initialError, initialRequest }: Props) {
  const [ridingStyle, setRidingStyle] = useState<RidingStyle | ''>(initialRequest?.ridingStyle ?? '');
  const [riderNotes, setRiderNotes] = useState(initialRequest?.riderNotes ?? '');
  const [photos, setPhotos] = useState<Partial<Record<PhotoType, PhotoState>>>(() =>
    restorePhotos(initialRequest),
  );
  const [formError, setFormError] = useState<string | null>(null);

  const photoCount = Object.keys(photos).length;

  async function handleSelect(photoType: PhotoType, file: File) {
    const base64 = await fileToBase64(file);
    const previewUrl = URL.createObjectURL(file);
    setPhotos((prev) => ({ ...prev, [photoType]: { file, previewUrl, base64 } }));
  }

  function handleClear(photoType: PhotoType) {
    setPhotos((prev) => {
      const next = { ...prev };
      const existing = next[photoType];
      if (existing) URL.revokeObjectURL(existing.previewUrl);
      delete next[photoType];
      return next;
    });
  }

  function handleSubmit() {
    if (!ridingStyle) {
      setFormError('Choose a riding style before analysing.');
      return;
    }
    if (photoCount === 0) {
      setFormError('Add at least one photo before analysing.');
      return;
    }
    setFormError(null);
    onSubmit({
      ridingStyle,
      riderNotes: riderNotes.trim(),
      photos: Object.entries(photos).map(([photoType, p]) => ({
        photoType: photoType as PhotoType,
        base64Data: p.base64,
        mimeType: p.file.type,
      })),
    });
  }

  return (
    <div className="upload-screen">
      <h1>Get your fit analysis</h1>
      <p className="upload-screen__intro">
        Upload a few photos, tell us how you ride, and get AI-powered rider and bike adjustment
        recommendations — free.
      </p>

      <section className="upload-section">
        <h2>Riding style</h2>
        <div className="riding-style-grid">
          {RIDING_STYLES.map((style) => (
            <button
              key={style}
              type="button"
              className={`riding-style-chip ${ridingStyle === style ? 'riding-style-chip--active' : ''}`}
              onClick={() => setRidingStyle(style)}
            >
              {style}
            </button>
          ))}
        </div>
      </section>

      <section className="upload-section">
        <h2>Photos</h2>
        <div className="photo-grid">
          {PHOTO_SLOTS.map((slot) => (
            <PhotoSlot
              key={slot.photoType}
              slot={slot}
              previewUrl={photos[slot.photoType]?.previewUrl ?? null}
              onSelect={(file) => handleSelect(slot.photoType, file)}
              onClear={() => handleClear(slot.photoType)}
            />
          ))}
        </div>
      </section>

      <section className="upload-section">
        <h2>Rider notes</h2>
        <textarea
          className="rider-notes"
          placeholder="Optional — injuries, adaptive needs, or anything else worth knowing"
          value={riderNotes}
          onChange={(e) => setRiderNotes(e.target.value)}
          rows={4}
        />
      </section>

      {(formError ?? initialError) && (
        <p className="upload-screen__error">{formError ?? initialError}</p>
      )}

      <button type="button" className="analyse-button" onClick={handleSubmit}>
        Analyse my fit
      </button>
    </div>
  );
}
