import { useAppStore } from '../app/store';

const StepLog = () => {
  const { animationQueue, stepIndex } = useAppStore();
  const currentStep = animationQueue[stepIndex];

  return (
    <section className="rounded-3xl border border-slate-700 bg-slate-900/90 p-6 text-slate-100 shadow-lg">
      <div className="mb-3 flex items-center justify-between text-sm text-slate-400">
        <span>לוח שלבים</span>
        <span>{animationQueue.length} שלבים</span>
      </div>
      <p className="text-base leading-7">
        {currentStep?.message ?? 'מוכן להתחלת אנימציה - הכנס מספר כדי להתחיל.'}
      </p>
    </section>
  );
};

export default StepLog
