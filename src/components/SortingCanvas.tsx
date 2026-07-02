import React from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../app/store';

export const SortingCanvas: React.FC = () => {
  const { animationQueue, stepIndex, currentArray, selectedSortingAlgorithm } = useAppStore();
  const currentStep = animationQueue[stepIndex];

  // Pick active array states dynamically
  const array = currentStep?.arrayState ?? currentArray;
  const countArray = currentStep?.countArrayState ?? null;
  const outputArray = currentStep?.outputArrayState ?? null;

  const highlighted = new Set(currentStep?.highlightedIndices ?? []);
  const sorted = new Set(currentStep?.sortedIndices ?? []);
  const pivotIndex = currentStep?.pivotIndex ?? -1;

  if (array.length === 0) {
    return (
      <div className="flex h-full min-h-[440px] items-center justify-center text-slate-400 bg-slate-950 rounded-[1.75rem] border border-slate-800">
        <div className="space-y-3 text-center">
          <p className="text-lg font-semibold text-slate-200">המערך ריק</p>
          <p className="text-sm text-slate-500">הוסף איברים או טען מערך דיפולטיבי כדי להתחיל</p>
        </div>
      </div>
    );
  }

  // Helper for Radix Sort digit highlighting
  const renderRadixNumber = (num: number, exp: number) => {
    if (exp <= 0) return <span>{num}</span>;
    const numStr = String(num);
    const digitIndexFromRight = Math.round(Math.log10(exp));
    const paddedNumStr = numStr.padStart(digitIndexFromRight + 1, '0');
    const len = paddedNumStr.length;
    const targetIdx = len - 1 - digitIndexFromRight;

    return (
      <span className="flex justify-center select-none font-mono tracking-wider">
        {paddedNumStr.split('').map((char, charIdx) => {
          const isTarget = charIdx === targetIdx;
          return (
            <span
              key={charIdx}
              className={isTarget ? "text-amber-400 font-black underline decoration-wavy decoration-amber-400 underline-offset-4 text-lg" : "text-slate-350"}
            >
              {char}
            </span>
          );
        })}
      </span>
    );
  };

  // 1. COUNTING SORT VISUALIZATION
  if (selectedSortingAlgorithm === 'counting' && countArray && outputArray) {
    return (
      <div className="relative w-full h-full min-h-[440px] rounded-[1.75rem] border border-slate-800 bg-slate-950 p-6 shadow-inner flex flex-col justify-between overflow-x-auto select-none" dir="ltr">
        <div className="space-y-8 min-w-[600px] py-4">
          
          {/* Row 1: Source Array A */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider text-left">מערך מקור (A)</h3>
            <div className="flex gap-2">
              {array.map((val, idx) => {
                const isHighlighted = highlighted.has(idx);
                return (
                  <div key={`c-src-${idx}`} className="flex flex-col items-center">
                    <div 
                      className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold border transition ${
                        isHighlighted 
                          ? 'bg-amber-500/20 border-amber-500 shadow-md shadow-amber-500/20 text-amber-300' 
                          : 'bg-slate-900/60 border-slate-800 text-slate-300'
                      }`}
                    >
                      {val}
                    </div>
                    <span className="text-[10px] font-mono text-slate-650 mt-1">[{idx + 1}]</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Row 2: Count Array C */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider text-left">מערך מונים (C)</h3>
            <div className="flex gap-2 flex-wrap">
              {countArray.map((count, idx) => {
                return (
                  <div key={`c-count-${idx}`} className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-lg bg-slate-900 border border-purple-900/60 flex items-center justify-center font-semibold text-purple-400 text-sm">
                      {count}
                    </div>
                    <span className="text-[10px] font-mono text-purple-600 mt-1">{idx}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Row 3: Output Array B */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider text-left">מערך מוצא ממוין (B)</h3>
            <div className="flex gap-2">
              {outputArray.map((val, idx) => {
                const isEmpty = val === -1;
                const isSorted = sorted.has(idx);
                return (
                  <div key={`c-out-${idx}`} className="flex flex-col items-center">
                    <div 
                      className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold border transition ${
                        isEmpty 
                          ? 'bg-slate-950 border-dashed border-slate-800 text-slate-700' 
                          : isSorted
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-emerald-500/10 shadow-md'
                          : 'bg-slate-900/80 border-slate-800 text-slate-300'
                      }`}
                    >
                      {isEmpty ? '-' : val}
                    </div>
                    <span className="text-[10px] font-mono text-slate-650 mt-1">[{idx + 1}]</span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Legend */}
        <div className="border-t border-slate-900 pt-4 flex flex-wrap gap-4 items-center justify-center text-xs text-slate-400 select-none">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-slate-900 border border-slate-800" />
            <span>איבר רגיל</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-amber-500/20 border border-amber-500" />
            <span>איבר בתהליך סריקה/מנייה</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-purple-900 border border-purple-700" />
            <span>סכום מונים</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500" />
            <span>איבר שהוצב במיקומו הסופי</span>
          </div>
        </div>
      </div>
    );
  }

  // 2. STANDARD & RADIX SORT CARD LIST LAYOUT
  const isRadix = selectedSortingAlgorithm === 'radix';
  const activeExp = isRadix ? pivotIndex : -1; // pivotIndex holds the exp divisor

  return (
    <div className="relative w-full h-full min-h-[440px] rounded-[1.75rem] border border-slate-800 bg-slate-950 p-6 shadow-inner flex flex-col justify-between overflow-hidden" dir="ltr">
      
      {/* Scrollable container for list cells */}
      <div className="flex items-center justify-center flex-wrap gap-3 md:gap-4 w-full my-auto overflow-y-auto px-2 py-4">
        {array.map((val, idx) => {
          const isHighlighted = highlighted.has(idx);
          const isSorted = sorted.has(idx);
          const isPivot = !isRadix && idx === pivotIndex;

          let bg = 'bg-slate-900/80';
          let border = 'border-slate-800';
          let text = 'text-slate-100';
          let glow = 'none';

          if (isPivot) {
            bg = 'bg-purple-900/30';
            border = 'border-purple-500';
            text = 'text-purple-300';
            glow = '0 0 14px rgba(168, 85, 247, 0.25)';
          } else if (isHighlighted) {
            bg = 'bg-amber-500/20';
            border = 'border-amber-500';
            text = 'text-amber-300';
            glow = '0 0 14px rgba(245, 158, 11, 0.25)';
          } else if (isSorted) {
            bg = 'bg-emerald-500/20';
            border = 'border-emerald-500';
            text = 'text-emerald-300';
            glow = '0 0 14px rgba(16, 185, 129, 0.25)';
          }

          return (
            <motion.div
              layout
              key={`cell-item-${idx}`}
              className="flex flex-col items-center"
              transition={{ type: 'spring', stiffness: 150, damping: 18 }}
            >
              {/* Styled Card Block */}
              <div 
                className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center font-bold text-base md:text-lg border transition-all ${bg} ${border} ${text}`}
                style={{ boxShadow: glow }}
              >
                {isRadix ? (
                  renderRadixNumber(val, activeExp)
                ) : (
                  <span>{val}</span>
                )}
              </div>

              {/* Monospace index label */}
              <span className="text-[10px] md:text-xs font-mono font-bold text-slate-650 mt-2 select-none">
                [{idx + 1}]
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="border-t border-slate-900 pt-4 flex flex-wrap gap-4 items-center justify-center text-xs text-slate-400 select-none">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-slate-900 border border-slate-800" />
          <span>מערך לא ממוין</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-amber-500/20 border border-amber-500" />
          <span>{isRadix ? 'ספרה נבדקת בסבב הנוכחי' : 'השוואה / החלפה פעילה'}</span>
        </div>
        {!isRadix && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-purple-900/30 border border-purple-500" />
            <span>איבר ציר (Pivot)</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500" />
          <span>ממוין סופית</span>
        </div>
      </div>
    </div>
  );
};
export default SortingCanvas;
