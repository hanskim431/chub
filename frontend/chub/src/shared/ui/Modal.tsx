import { createPortal } from 'react-dom';

interface ModalProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onClose: () => void;
  contentRef: React.RefObject<HTMLDivElement | null>;
}

function Modal({ title, subtitle, children, onClose, contentRef }: ModalProps) {
  return createPortal(
    <div
      aria-label="modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
    >
      <div
        ref={contentRef}
        aria-label="modal"
        role="dialog"
        aria-modal="true"
        className="relative flex max-h-[80vh] w-[min(640px,92vw)] flex-col gap-4 rounded-2xl border border-gray-200 bg-white px-8 py-6 shadow-lg"
      >
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-lg font-semibold">{title}</span>
            {subtitle && (
              <span className="text-sm text-gray-500">{subtitle}</span>
            )}
          </div>
          <button
            className="inline-flex items-center gap-1.5 rounded-xl border border-blue-600 bg-white px-4 py-2 text-sm font-semibold text-blue-600 shadow-sm transition hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-blue-500/60 focus-visible:outline-none active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            onClick={onClose}
          >
            닫기
          </button>
        </div>
        <div className="overflow-auto">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

export default Modal;
