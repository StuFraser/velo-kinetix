import { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  src: string;
  alt: string;
  onClose: () => void;
}

export function PhotoZoomOverlay({ src, alt, onClose }: Props) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return createPortal(
    <div className="photo-zoom" role="dialog" aria-modal="true" onClick={onClose}>
      <button type="button" className="photo-zoom__close" onClick={onClose} aria-label="Close">
        ✕
      </button>
      <img
        src={src}
        alt={alt}
        className="photo-zoom__image"
        onClick={(e) => e.stopPropagation()}
      />
    </div>,
    document.body,
  );
}
