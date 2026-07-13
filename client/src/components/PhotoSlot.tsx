import { useRef } from 'react';
import type { PHOTO_SLOTS } from '../api';

interface Props {
  slot: (typeof PHOTO_SLOTS)[number];
  previewUrl: string | null;
  onSelect: (file: File) => void;
  onClear: () => void;
}

export function PhotoSlot({ slot, previewUrl, onSelect, onClear }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={`photo-slot ${previewUrl ? 'photo-slot--filled' : ''}`}>
      <button
        type="button"
        className="photo-slot__dropzone"
        onClick={() => inputRef.current?.click()}
      >
        {previewUrl ? (
          <img src={previewUrl} alt={slot.label} className="photo-slot__preview" />
        ) : (
          <span className="photo-slot__plus">+</span>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
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
    </div>
  );
}
