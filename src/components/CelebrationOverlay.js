import React, { useEffect } from "react";

function CelebrationOverlay({ title, text, onClose }) {
  useEffect(() => {
    if (!onClose) return undefined;
    const timer = window.setTimeout(() => onClose(), 2600);
    return () => window.clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="product-demo__celebrate" role="status" aria-live="polite" onClick={onClose}>
      <div className="product-demo__celebrate-ring" />
      <div className="product-demo__celebrate-card" onClick={e => e.stopPropagation()}>
        <p className="product-demo__celebrate-emoji" aria-hidden="true">
          🎉
        </p>
        <h3 className="product-demo__celebrate-title">{title}</h3>
      </div>
    </div>
  );
}

export default CelebrationOverlay;
