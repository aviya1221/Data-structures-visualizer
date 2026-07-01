import { useEffect, useState, useRef } from 'react';
import { useAppStore } from '../app/store';

const StepLog = () => {
  const { animationQueue, stepIndex, currentRoot } = useAppStore();
  const [logs, setLogs] = useState<string[]>([]);
  const lastQueueRef = useRef<any>(null);

  useEffect(() => {
    // Clear logs on complete reset
    if (!currentRoot && animationQueue.length === 0) {
      setLogs([]);
      lastQueueRef.current = null;
      return;
    }

    // Keep displaying previous logs when animation is finished
    if (animationQueue.length === 0) {
      return;
    }

    if (animationQueue !== lastQueueRef.current) {
      lastQueueRef.current = animationQueue;
      const initialLogs = animationQueue.slice(0, stepIndex + 1).map((s) => s.message);
      setLogs(initialLogs);
    } else {
      const currentLogs = animationQueue.slice(0, stepIndex + 1).map((s) => s.message);
      setLogs(currentLogs);
    }
  }, [animationQueue, stepIndex, currentRoot]);

  // Display in reverse order (newest active action at the top)
  const reversedLogs = [...logs].reverse();

  return (
    <section className="flex flex-col h-full rounded-[1.75rem] border border-slate-800 bg-slate-950 p-6 text-slate-100 shadow-xl overflow-hidden">
      <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="text-lg font-semibold text-white">היסטוריית שלבים</h3>
        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-400 font-medium">
          {logs.length} שלבים
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
        {reversedLogs.length > 0 ? (
          reversedLogs.map((logMsg, idx) => {
            const isActive = idx === 0; // Newest item is at index 0 in the reversed list
            return (
              <div
                key={reversedLogs.length - 1 - idx}
                className={`relative rounded-2xl p-4 transition-all duration-300 ${
                  isActive
                    ? 'border border-emerald-500/30 bg-emerald-500/5 shadow-md shadow-emerald-500/5 text-slate-100'
                    : 'border border-slate-850 bg-slate-900/40 text-slate-400 opacity-60 hover:opacity-85'
                }`}
              >
                {isActive && (
                  <span className="absolute top-4 left-4 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                )}
                <div className="flex items-start gap-3">
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {logs.length - idx}
                  </span>
                  <p className="text-sm leading-6 font-medium whitespace-pre-line pr-2">{logMsg}</p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex h-full items-center justify-center text-center text-slate-500 p-4">
            <div className="space-y-2">
              <p className="text-sm">טרם בוצעו פעולות.</p>
              <p className="text-xs text-slate-600 font-normal">הכנס ערך בלוח ההפעלה כדי להתחיל את האנימציה ולראות את לוג השלבים.</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default StepLog;
