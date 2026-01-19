import React from 'react';

const VARIANTS = {
  success: {
    borderColor: '#038474',
    backgroundColor: '#E0F2F1',
    color: '#04534A',
  },
  error: {
    borderColor: '#D32F2F',
    backgroundColor: '#FFEBEE',
    color: '#8A1C1C',
  },
  info: {
    borderColor: '#096187',
    backgroundColor: '#E3F2FD',
    color: '#063A52',
  },
};

export default function Alert({ type = 'info', title, message, onClose }) {
  const styles = VARIANTS[type] || VARIANTS.info;

  if (!message && !title) return null;

  return (
    <div
      className="flex items-start gap-3 rounded-md border px-4 py-3 text-sm mb-4"
      style={styles}
    >
      <div className="flex-1">
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        {message && <p>{message}</p>}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="ml-2 text-xs font-medium underline"
          style={{ color: styles.color }}
        >
          Close
        </button>
      )}
    </div>
  );
}

