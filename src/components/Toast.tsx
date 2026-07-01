import { useAppStore } from '../app/store';

const Toast = () => {
  const { toastMessage } = useAppStore();

  if (!toastMessage) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-6 z-50 flex justify-center px-4">
      <div className="pointer-events-auto rounded-3xl border border-rose-300 bg-rose-600/95 px-5 py-3 text-sm font-semibold text-white shadow-2xl shadow-rose-900/30">
        {toastMessage}
      </div>
    </div>
  );
};

export default Toast;
