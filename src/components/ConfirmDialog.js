import { useEffect } from 'react';

function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  loading = false,
  variant = 'danger',
}) {
  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !loading) onCancel();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, loading, onCancel]);

  if (!open) return null;

  return (
    <div
      className="employer-modal-backdrop confirm-dialog-backdrop"
      onClick={loading ? undefined : onCancel}
      role="presentation"
    >
      <div
        className="employer-modal confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="confirm-dialog-title" className="employer-modal-title mb-2">
          {title}
        </h2>
        <p id="confirm-dialog-message" className="confirm-dialog-message mb-4">
          {message}
        </p>
        <div className="d-flex flex-wrap justify-content-end gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary rounded-pill px-4"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`btn rounded-pill px-4 fw-semibold confirm-dialog-btn-${variant}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? '...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
