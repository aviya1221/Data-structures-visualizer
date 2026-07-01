import React, { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../app/store';
import { generateAvlInsertAnimations } from '../structures/avl/avlAnimationsNew';
import { generateRbtInsertAnimations } from '../structures/rbt/rbtAnimationsNew';
import { findTreeNodeByValue } from '../structures/tree/utils';
import type { TreeNode } from '../structures/types';

interface ControlPanelProps {
  activeTab: string;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ activeTab }) => {
  const {
    playback,
    setPlayback,
    nextStep,
    undo,
    enqueue,
    reset,
    speed,
    setSpeed,
    animationQueue,
    stepIndex,
    isAnimating,
    currentRoot,
    setToast,
    clearToast,
  } = useAppStore();

  const [inputValue, setInputValue] = useState<string>('');
  const [playMode, setPlayMode] = useState<'auto' | 'manual'>('auto');
  const toastTimer = useRef<number | null>(null);
  const currentTree = animationQueue.length > 0 ? animationQueue[stepIndex]?.rootNode : currentRoot as TreeNode | null;
  const currentStep = animationQueue[stepIndex];
  const isPlaying = playback === 'playing';

  useEffect(() => {
    if (playback !== 'playing' || animationQueue.length === 0) return;

    const stepDelay = currentStep?.stepType === 'insert' ? 1000 : 1700;
    const timeout = window.setTimeout(() => {
      nextStep();
    }, Math.max(500, stepDelay / speed));

    return () => window.clearTimeout(timeout);
  }, [animationQueue.length, currentStep?.stepType, nextStep, playback, speed, stepIndex]);

  useEffect(() => {
    if (animationQueue.length === 0) return;

    if (playMode === 'manual' && playback === 'playing') {
      setPlayback('paused');
    }

    if (playMode === 'auto' && playback === 'paused') {
      setPlayback('playing');
    }
  }, [playMode, animationQueue.length, playback, setPlayback]);

  const handleToast = (message: string) => {
    setToast(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => {
      clearToast();
      toastTimer.current = null;
    }, 3000);
  };

  const handleInsert = () => {
    const val = parseInt(inputValue, 10);
    if (isNaN(val)) return;

    if (findTreeNodeByValue(currentTree, val)) {
      handleToast('הערך כבר קיים במבנה');
      return;
    }

    const newSteps = activeTab === 'rbt'
      ? generateRbtInsertAnimations(currentTree as any, val)
      : generateAvlInsertAnimations(currentTree as any, val);
    enqueue(newSteps, playMode === 'auto' ? 'playing' : 'paused');
    setInputValue('');
  };

  const handlePlayPause = () => {
    if (playMode === 'manual') return;

    if (playback === 'playing') {
      setPlayback('paused');
      return;
    }

    setPlayback('playing');
  };

  return (
    <div className="rounded-3xl bg-slate-900/95 p-4 shadow-xl backdrop-blur-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <input
            type="number"
            dir="ltr"
            inputMode="numeric"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleInsert();
            }}
            disabled={isAnimating}
            placeholder="הזן ערך"
            className="h-10 min-w-[120px] rounded-2xl border border-slate-700 bg-slate-950 px-3 text-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <button
            onClick={handleInsert}
            disabled={isAnimating}
            className="h-10 rounded-2xl bg-sky-600 px-4 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            הכנס
          </button>
          <div className="flex h-10 items-center gap-3 rounded-2xl border border-slate-700 bg-slate-950 px-3">
            <label className="text-sm text-slate-300">מהירות אנימציה</label>
            <input
              type="range"
              min="0.25"
              max="3"
              step="0.25"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="h-2 w-28 cursor-pointer accent-sky-500"
            />
            <span className="text-sm text-slate-200">{speed.toFixed(2)}x</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setPlayMode(playMode === 'auto' ? 'manual' : 'auto')}
            className="h-10 rounded-2xl border border-slate-700 bg-slate-800 px-4 text-sm font-medium text-slate-100 transition hover:bg-slate-700"
          >
            {playMode === 'auto' ? 'מצב רצף' : 'מצב שלב-אחר-שלב'}
          </button>
          <button
            onClick={undo}
            disabled={isAnimating}
            className="h-10 rounded-2xl border border-slate-700 bg-slate-800 px-4 text-sm font-medium text-slate-100 disabled:cursor-not-allowed disabled:opacity-50 transition hover:bg-slate-700"
          >
            ביטול פעולה אחרונה
          </button>
          <button
            onClick={handlePlayPause}
            disabled={playMode === 'manual' || animationQueue.length === 0}
            className="h-10 rounded-2xl bg-emerald-500 px-4 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPlaying ? 'השהה' : 'הפעל'}
          </button>
          <button
            onClick={nextStep}
            disabled={animationQueue.length === 0}
            className="h-10 rounded-2xl border border-slate-700 bg-slate-800 px-4 text-sm font-medium text-slate-100 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            צעד הבא
          </button>
          <button
            onClick={reset}
            className="h-10 rounded-2xl bg-rose-500 px-4 text-sm font-semibold text-white transition hover:bg-rose-400"
          >
            איפוס
          </button>
        </div>
      </div>
    </div>
  );
};
