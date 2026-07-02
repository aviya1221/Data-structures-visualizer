import React, { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../app/store';
import { generateAvlInsertAnimations } from '../structures/avl/avlAnimationsNew';
import { generateRbtInsertAnimations } from '../structures/rbt/rbtAnimationsNew';
import { generateSkipListInsertAnimations } from '../structures/skiplist/skiplistAnimations';
import { createEmptySkipList } from '../structures/skiplist/skiplistAlgorithms';
import { generateHeapInsertAnimations, generateHeapExtractMaxAnimations } from '../structures/heap/heapAnimations';
import { generateBinomialInsertAnimations, generateBinomialExtractMinAnimations } from '../structures/binomial/binomialAnimations';
import { generateBPlusInsertAnimations } from '../structures/bplus/bplusAnimations';
import { generateTrieInsertAnimations, generateTrieSearchAnimations } from '../structures/trie/trieAnimations';
import { generateSuffixTreeAnimations, generateSuffixSearchAnimations } from '../structures/suffix/suffixAnimations';
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
  const [searchQuery, setSearchQuery] = useState<string>('');
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


  const handleToast = (message: string) => {
    setToast(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => {
      clearToast();
      toastTimer.current = null;
    }, 3000);
  };

  const handleInsert = () => {
    if (activeTab === 'trie') {
      const sanitized = inputValue.trim().toLowerCase();
      if (!sanitized) {
        handleToast('נא להזין מילה חוקית');
        return;
      }
      if (!/^[a-zA-Z]+$/.test(sanitized)) {
        handleToast('נא להזין אותיות באנגלית בלבד');
        return;
      }
      const listNodes = (currentTree as any)?.trieNodes ?? [];
      const rootId = (currentTree as any)?.rootId ?? null;
      const newSteps = generateTrieInsertAnimations(listNodes, rootId, sanitized);
      enqueue(newSteps, playMode === 'auto' ? 'playing' : 'paused');
      setInputValue('');
      return;
    }

    if (activeTab === 'suffix') {
      const sanitized = inputValue.trim().toLowerCase();
      if (!sanitized) {
        handleToast('נא להזין מחרוזת חוקית');
        return;
      }
      if (!/^[a-zA-Z]+$/.test(sanitized)) {
        handleToast('נא להזין אותיות באנגלית בלבד');
        return;
      }
      const newSteps = generateSuffixTreeAnimations(sanitized);
      enqueue(newSteps, playMode === 'auto' ? 'playing' : 'paused');
      setInputValue('');
      return;
    }

    const val = parseInt(inputValue, 10);
    if (isNaN(val)) return;

    if (activeTab === 'skiplist') {
      const listNodes = (currentTree as any)?.skipListNodes ?? createEmptySkipList();
      const exists = listNodes.some((n: any) => n.value === val && !n.isHead && !n.isTail);
      if (exists) {
        handleToast('הערך כבר קיים במבנה');
        return;
      }
      const newSteps = generateSkipListInsertAnimations(listNodes, val);
      enqueue(newSteps, playMode === 'auto' ? 'playing' : 'paused');
      setInputValue('');
      return;
    }

    if (activeTab === 'heap') {
      const heap = (currentTree as any)?.heapArray ?? [];
      if (heap.some((n: any) => n.value === val)) {
        handleToast('הערך כבר קיים במבנה');
        return;
      }
      const newSteps = generateHeapInsertAnimations(heap, val);
      enqueue(newSteps, playMode === 'auto' ? 'playing' : 'paused');
      setInputValue('');
      return;
    }

    if (activeTab === 'binomial') {
      const forest = (currentTree as any)?.binomialTrees ?? [];
      const existsInBinomialForest = (nodes: any[], target: number): boolean => {
        return nodes.some(n => n.value === target || existsInBinomialForest(n.children, target));
      };
      if (existsInBinomialForest(forest, val)) {
        handleToast('הערך כבר קיים במבנה');
        return;
      }
      const newSteps = generateBinomialInsertAnimations(forest, val);
      enqueue(newSteps, playMode === 'auto' ? 'playing' : 'paused');
      setInputValue('');
      return;
    }

    if (activeTab === 'bplus') {
      const listNodes = (currentTree as any)?.bplusNodes ?? [];
      const rootId = (currentTree as any)?.rootId ?? null;
      const exists = listNodes.some((n: any) => n.keys.includes(val));
      if (exists) {
        handleToast('הערך כבר קיים במבנה');
        return;
      }
      const newSteps = generateBPlusInsertAnimations(listNodes, rootId, val, 3);
      enqueue(newSteps, playMode === 'auto' ? 'playing' : 'paused');
      setInputValue('');
      return;
    }

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

  const handleSearch = () => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      handleToast('נא להזין ערך לחיפוש');
      return;
    }
    if (!/^[a-zA-Z]+$/.test(query)) {
      handleToast('נא להזין אותיות באנגלית בלבד');
      return;
    }

    if (activeTab === 'trie') {
      let trieNodes = (currentTree as any)?.trieNodes ?? [];
      let rootId = (currentTree as any)?.rootId ?? null;

      // If tree is empty, build PDF baseline tree of ['bear', 'bell', 'bid', 'bull', 'buy', 'sell', 'stock', 'stop']
      if (trieNodes.length === 0 || !rootId) {
        const baselineWords = ['bear', 'bell', 'bid', 'bull', 'buy', 'sell', 'stock', 'stop'];
        let currentMap = new Map<string, any>();
        
        const genRootId = `tr_${Math.random().toString(36).substring(2, 9)}`;
        currentMap.set(genRootId, { id: genRootId, char: '', isWordEnd: false, children: [] });
        
        baselineWords.forEach((word) => {
          let currId = genRootId;
          const chars = [...word, '$'];
          chars.forEach((c) => {
            const node = currentMap.get(currId)!;
            let matchId = '';
            for (const childId of node.children) {
              const child = currentMap.get(childId);
              if (child && child.char === c) {
                matchId = childId;
                break;
              }
            }
            if (matchId) {
              currId = matchId;
            } else {
              const newId = `tr_${Math.random().toString(36).substring(2, 9)}`;
              currentMap.set(newId, { id: newId, char: c, isWordEnd: c === '$', children: [] });
              node.children.push(newId);
              currentMap.set(currId, node);
              currId = newId;
            }
          });
        });
        
        trieNodes = Array.from(currentMap.values());
        rootId = genRootId;
      }

      const searchSteps = generateTrieSearchAnimations(trieNodes, rootId, query);
      enqueue(searchSteps, playMode === 'auto' ? 'playing' : 'paused');
      setSearchQuery('');
      return;
    }

    if (activeTab === 'suffix') {
      let suffixNodes = (currentTree as any)?.suffixNodes ?? [];
      let rootId = (currentTree as any)?.rootId ?? null;

      // If tree is empty, build default word "banana"
      if (suffixNodes.length === 0 || !rootId) {
        const defaultWord = 'banana';
        const buildSteps = generateSuffixTreeAnimations(defaultWord);
        const finalStep = buildSteps[buildSteps.length - 1];
        suffixNodes = (finalStep.rootNode as any).suffixNodes;
        rootId = (finalStep.rootNode as any).rootId;
      }

      const searchSteps = generateSuffixSearchAnimations(suffixNodes, rootId, query);
      enqueue(searchSteps, playMode === 'auto' ? 'playing' : 'paused');
      setSearchQuery('');
      return;
    }
  };

  const handleExtractMax = () => {
    const heap = (currentTree as any)?.heapArray ?? [];
    if (heap.length === 0) {
      handleToast('הערימה ריקה');
      return;
    }
    const newSteps = generateHeapExtractMaxAnimations(heap);
    enqueue(newSteps, playMode === 'auto' ? 'playing' : 'paused');
  };

  const handleExtractMin = () => {
    const forest = (currentTree as any)?.binomialTrees ?? [];
    if (forest.length === 0) {
      handleToast('הערימה ריקה');
      return;
    }
    const newSteps = generateBinomialExtractMinAnimations(forest);
    enqueue(newSteps, playMode === 'auto' ? 'playing' : 'paused');
  };

  const togglePlayMode = () => {
    if (playMode === 'auto') {
      setPlayMode('manual');
      setPlayback('paused');
    } else {
      setPlayMode('auto');
      if (animationQueue.length > 0) {
        setPlayback('playing');
      }
    }
  };

  const handlePlayPause = () => {
    if (animationQueue.length === 0) return;

    if (playMode === 'manual') {
      setPlayMode('auto');
      setPlayback('playing');
      return;
    }

    if (playback === 'playing') {
      setPlayback('paused');
    } else {
      setPlayback('playing');
    }
  };

  return (
    <div className="rounded-3xl bg-slate-900/95 p-4 shadow-xl backdrop-blur-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <input
            type={activeTab === 'trie' || activeTab === 'suffix' ? 'text' : 'number'}
            dir="ltr"
            inputMode={activeTab === 'trie' || activeTab === 'suffix' ? 'text' : 'numeric'}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleInsert();
            }}
            disabled={isAnimating}
            placeholder={
              activeTab === 'trie'
                ? 'הזן מילה'
                : activeTab === 'suffix'
                ? 'הזן מחרוזת'
                : 'הזן ערך'
            }
            className="h-10 min-w-[120px] rounded-2xl border border-slate-700 bg-slate-950 px-3 text-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <button
            onClick={handleInsert}
            disabled={isAnimating}
            className="h-10 rounded-2xl bg-sky-600 px-4 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            הכנס
          </button>
          
          {(activeTab === 'trie' || activeTab === 'suffix') && (
            <>
              <div className="hidden sm:block h-6 w-px bg-slate-800" />
              <input
                type="text"
                dir="ltr"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch();
                }}
                disabled={isAnimating}
                placeholder={activeTab === 'trie' ? 'חפש מילה' : 'חפש תת-מחרוזת'}
                className="h-10 min-w-[120px] rounded-2xl border border-slate-700 bg-slate-950 px-3 text-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <button
                onClick={handleSearch}
                disabled={isAnimating}
                className="h-10 rounded-2xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                חפש
              </button>
            </>
          )}
          {activeTab === 'heap' && (
            <button
              onClick={handleExtractMax}
              disabled={isAnimating}
              className="h-10 rounded-2xl bg-amber-600 px-4 text-sm font-semibold text-white transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              הפקת מקסימום
            </button>
          )}
          {activeTab === 'binomial' && (
            <button
              onClick={handleExtractMin}
              disabled={isAnimating}
              className="h-10 rounded-2xl bg-amber-600 px-4 text-sm font-semibold text-white transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              הפקת מינימום
            </button>
          )}
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
            onClick={togglePlayMode}
            className="h-10 rounded-2xl border border-slate-700 bg-slate-800 px-4 text-sm font-medium text-slate-100 transition hover:bg-slate-700"
          >
            {playMode === 'auto' ? 'מצב רצף' : 'מצב ידני'}
          </button>
          <button
            onClick={undo}
            disabled={isAnimating}
            className="h-10 rounded-2xl border border-slate-700 bg-slate-800 px-4 text-sm font-medium text-slate-100 disabled:cursor-not-allowed disabled:opacity-50 transition hover:bg-slate-700"
          >
            חזור
          </button>
          <button
            onClick={handlePlayPause}
            disabled={animationQueue.length === 0}
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
