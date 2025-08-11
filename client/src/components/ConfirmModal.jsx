// components/ConfirmModal.jsx
import React from "react";

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  colors,
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        backgroundColor: colors.overlay?.dark || "rgba(0,0,0,0.5)", // overlay color from theme
      }}
    >
      <div
        className="rounded-lg shadow-lg p-6 max-w-sm w-full"
        style={{
          backgroundColor: colors.background.card,
          color: colors.text.primary,
        }}
      >
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        <p className="mb-6" style={{ color: colors.text.secondary }}>
          {message}
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg transition-transform hover:scale-105"
            style={{
              backgroundColor: colors.button.secondary.background,
              color: colors.button.secondary.text,
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 rounded-lg transition-transform hover:scale-105"
            style={{
              backgroundColor: colors.button.danger.background,
              color: colors.button.danger.text,
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
