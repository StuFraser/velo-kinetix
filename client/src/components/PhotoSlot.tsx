import { useRef, useState } from 'react';
import type { PHOTO_SLOTS } from '../api';
import { PhotoZoomOverlay } from './PhotoZoomOverlay';

interface Props {
  slot: (typeof PHOTO_SLOTS)[number];
  previewUrl: string | null;
  isConverting?: boolean;
  onSelect: (file: File) => void;
  onClear: () => void;
}

export function PhotoSlot({ slot, previewUrl, isConverting, onSelect, onClear }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <div className={`photo-slot ${previewUrl ? 'photo-slot--filled' : ''}`}>
      <div className="photo-slot__preview-wrap">
        <button
          type="button"
          className="photo-slot__dropzone"
          disabled={isConverting}
          onClick={() => inputRef.current?.click()}
        >
          {isConverting ? (
            <span className="photo-slot__plus">Converting…</span>
          ) : previewUrl ? (
            <img src={previewUrl} alt={slot.label} className="photo-slot__preview" />
          ) : (
            <span className="photo-slot__plus">+</span>
          )}
        </button>
        {previewUrl && (
          <button
            type="button"
            className="photo-slot__zoom"
            onClick={(e) => {
              e.stopPropagation();
              setIsZoomed(true);
            }}
            aria-label="View full-size photo"
          >
            🔍
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
        capture="environment"
        className="photo-slot__input"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onSelect(file);
          e.target.value = '';
        }}
      />
      <div className="photo-slot__meta">
        <span className="photo-slot__label">{slot.label}</span>
        <span className={`photo-slot__badge photo-slot__badge--${slot.required}`}>
          {slot.required === 'required' ? 'Required' : slot.required === 'recommended' ? 'Recommended' : 'Optional'}
        </span>
      </div>
      <span className="photo-slot__hint">{slot.hint}</span>
      {previewUrl && (
        <button type="button" className="photo-slot__clear" onClick={onClear}>
          Remove
        </button>
      )}
      {isZoomed && previewUrl && (
        <PhotoZoomOverlay src={previewUrl} alt={slot.label} onClose={() => setIsZoomed(false)} />
      )}
    </div>
  );
}
