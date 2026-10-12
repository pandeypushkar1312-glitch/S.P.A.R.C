import React from 'react';

export const Footer: React.FC<{ onOpenPoster: () => void }> = ({ onOpenPoster }) => {
  return (
    <footer className="app-footer">
      <div>
        <strong>s.p.a.r.c.</strong> — solar powered autonomous roaming charger
      </div>
      <div>
        first-year multi-disciplinary project at vit chennai • design inspired by{' '}
        <a href="https://whybit.in" target="_blank" rel="noopener noreferrer">
          whybit.in
        </a>
      </div>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '6px' }}>
        <button
          className="btn btn-secondary"
          style={{ padding: '3px 12px', fontSize: '0.72rem', fontFamily: 'var(--font-mono)' }}
          onClick={onOpenPoster}
        >
          view print-ready poster [A3]
        </button>
        <span>press [J] anytime for judge guided demo</span>
      </div>
    </footer>
  );
};
