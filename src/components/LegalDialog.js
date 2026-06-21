import { useEffect } from 'react';

function LegalDialog({ title, updated, sections, open, onClose, closeLabel }) {
  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="employer-modal-backdrop legal-dialog-backdrop" onClick={onClose} role="presentation">
      <div
        className="legal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="legal-dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="employer-modal-header legal-dialog-header">
          <div>
            <h2 id="legal-dialog-title" className="employer-modal-title">{title}</h2>
            <p className="legal-dialog-updated text-muted small mb-0">{updated}</p>
          </div>
          <button type="button" className="legal-dialog-close" onClick={onClose} aria-label={closeLabel}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" aria-hidden="true">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <div className="legal-dialog-body">
          <ul className="legal-dialog-list">
            {sections.map((section) => (
              <li key={section.heading} className="legal-dialog-item">
                <span className="legal-dialog-item-title">{section.heading}</span>
                <p className="legal-dialog-item-text text-muted mb-0">{section.body}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="legal-dialog-footer">
          <button type="button" className="btn btn-warning fw-semibold legal-dialog-btn" onClick={onClose}>
            {closeLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default LegalDialog;
