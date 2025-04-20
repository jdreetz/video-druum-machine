interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const Modal = ({ isOpen, onClose, children, title, subtitle }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-50">
      <div className="bg-gray-800/90 backdrop-blur-[2px] rounded-lg p-6 w-full max-w-4xl mx-4 shadow-xl border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-white text-xl">{title}</h2>
            {subtitle && <p className="text-gray-400 text-sm mt-1">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};
