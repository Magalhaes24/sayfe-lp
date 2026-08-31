import React from "react";
import "./ConfirmDialog.css";

function ConfirmDialog({
  open,
  title = "Confirm",
  message = "",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel
}) {
  if (!open) return null;

  return (
    <div className="confirm-dialog" role="dialog" aria-modal="true" onClick={onCancel}>
      <div className="confirm-dialog__card" onClick={e => e.stopPropagation()}>
        <p className="confirm-dialog__title">{title}</p>
        {message && <p className="confirm-dialog__text">{message}</p>}
        <div className="confirm-dialog__actions">
          <button className="confirm-dialog__secondary" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button className="confirm-dialog__primary" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
