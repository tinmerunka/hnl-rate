import { useEffect } from 'react';

export default function Modal({ title, onClose, children, footer }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,17,23,0.75)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-hnl-card rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
          <h2 className="text-[15px] font-bold font-display text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-white/30 hover:text-white/70 transition-colors text-xl leading-none cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex gap-3 justify-end px-6 py-4 border-t border-white/[0.07]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
