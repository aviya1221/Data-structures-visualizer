import React, { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../app/store';
import type { Step } from '../app/store';
import { generateAvlInsertAnimations } from '../structures/avl/avlAnimationsNew';
import { generateAvlDeleteAnimations } from '../structures/avl/avlDeleteAnimations';
import { generateRbtInsertAnimations } from '../structures/rbt/rbtAnimationsNew';
import { generateRbtDeleteAnimations } from '../structures/rbt/rbtDeleteAnimations';
import { generateSkipListInsertAnimations, generateSkipListDeleteAnimations } from '../structures/skiplist/skiplistAnimations';
import { createEmptySkipList } from '../structures/skiplist/skiplistAlgorithms';
import { generateHeapInsertAnimations, generateHeapExtractAnimations, generateHeapDeleteAnimations } from '../structures/heap/heapAnimations';
import { generateBinomialInsertAnimations, generateBinomialExtractAnimations, generateBinomialDeleteAnimations } from '../structures/binomial/binomialAnimations';
import { generateBPlusInsertAnimations, generateBPlusDeleteAnimations } from '../structures/bplus/bplusAnimations';
import { generateTrieInsertAnimations, generateTrieSearchAnimations, generateTrieDeleteAnimations } from '../structures/trie/trieAnimations';
import { generateSuffixTreeAnimations, generateSuffixSearchAnimations } from '../structures/suffix/suffixAnimations';
import { findTreeNodeByValue } from '../structures/tree/utils';
import {
  generateInsertionSortAnimations,
  generateHeapSortAnimations,
  generateQuickSortAnimations,
  generateMergeSortAnimations,
  generateCountingSortAnimations,
  generateRadixSortAnimations
} from '../structures/sorting/sortingAnimations';

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
    currentArray,
    setCurrentArray,
    selectedSortingAlgorithm,
    setSelectedSortingAlgorithm,
    heapType,
    setHeapType,
    binomialHeapType,
    setBinomialHeapType,
    bPlusBlockSize,
    setBPlusBlockSize,
  } = useAppStore();

  const [inputValue, setInputValue] = useState<string>('');
  const [deleteValue, setDeleteValue] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [playMode, setPlayMode] = useState<'auto' | 'manual'>('auto');
  const toastTimer = useRef<number | null>(null);
  const currentTree = (animationQueue.length > 0 ? animationQueue[stepIndex]?.rootNode : currentRoot) ?? null;
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
    if (activeTab === 'sorting') {
      if (inputValue.includes(',')) {
        const parsed = inputValue.split(',').map(s => parseInt(s.trim(), 10));
        if (parsed.some(isNaN)) {
          handleToast('נא להזין רשימת מספרים חוקית מופרדת בפסיקים');
          return;
        }
        setCurrentArray(parsed);
        handleToast('המערך עודכן בהצלחה');
        setInputValue('');
      } else {
        const val = parseInt(inputValue.trim(), 10);
        if (isNaN(val)) {
          handleToast('נא להזין מספר חוקי');
          return;
        }
        setCurrentArray([...currentArray, val]);
        handleToast(`הוסף האיבר ${val} למערך`);
        setInputValue('');
      }
      return;
    }

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
      const newSteps = generateHeapInsertAnimations(heap, val, heapType);
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
      const newSteps = generateBinomialInsertAnimations(forest, val, binomialHeapType);
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
      const newSteps = generateBPlusInsertAnimations(listNodes, rootId, val, bPlusBlockSize);
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
    const newSteps = generateHeapExtractAnimations(heap, heapType);
    enqueue(newSteps, playMode === 'auto' ? 'playing' : 'paused');
  };

  const handleExtractMin = () => {
    const forest = (currentTree as any)?.binomialTrees ?? [];
    if (forest.length === 0) {
      handleToast('הערימה ריקה');
      return;
    }
    const newSteps = generateBinomialExtractAnimations(forest, binomialHeapType);
    enqueue(newSteps, playMode === 'auto' ? 'playing' : 'paused');
  };

  const handleDelete = () => {
    if (isAnimating) return;

    if (activeTab === 'trie') {
      const sanitized = deleteValue.trim().toLowerCase();
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
      const newSteps = generateTrieDeleteAnimations(listNodes, rootId, sanitized);
      enqueue(newSteps, playMode === 'auto' ? 'playing' : 'paused');
      setDeleteValue('');
      return;
    }

    if (activeTab === 'suffix') {
      handleToast('עץ סיומות הוא מבנה סטטי עבור מחרוזת נתונה, מחיקת מפתח בודד אינה נתמכת');
      return;
    }

    const val = parseInt(deleteValue, 10);
    if (isNaN(val)) {
      handleToast('נא להזין מספר שלם חוקי');
      return;
    }

    if (activeTab === 'avl') {
      const newSteps = generateAvlDeleteAnimations(currentTree as any, val);
      enqueue(newSteps, playMode === 'auto' ? 'playing' : 'paused');
    } else if (activeTab === 'rbt') {
      const newSteps = generateRbtDeleteAnimations(currentTree as any, val);
      enqueue(newSteps, playMode === 'auto' ? 'playing' : 'paused');
    } else if (activeTab === 'heap') {
      const heap = (currentTree as any)?.heapArray ?? [];
      const newSteps = generateHeapDeleteAnimations(heap, val, heapType);
      enqueue(newSteps, playMode === 'auto' ? 'playing' : 'paused');
    } else if (activeTab === 'binomial') {
      const forest = (currentTree as any)?.binomialTrees ?? [];
      const newSteps = generateBinomialDeleteAnimations(forest, val, binomialHeapType);
      enqueue(newSteps, playMode === 'auto' ? 'playing' : 'paused');
    } else if (activeTab === 'bplus') {
      const listNodes = (currentTree as any)?.bplusNodes ?? [];
      const rootId = (currentTree as any)?.rootId ?? null;
      const newSteps = generateBPlusDeleteAnimations(listNodes, rootId, val, bPlusBlockSize);
      enqueue(newSteps, playMode === 'auto' ? 'playing' : 'paused');
    } else if (activeTab === 'skiplist') {
      const listNodes = (currentTree as any)?.skipListNodes ?? [];
      const newSteps = generateSkipListDeleteAnimations(listNodes, val);
      enqueue(newSteps, playMode === 'auto' ? 'playing' : 'paused');
    }

    setDeleteValue('');
  };

  const handleSort = () => {
    if (currentArray.length === 0) {
      handleToast('המערך ריק, נא להזין איברים תחילה');
      return;
    }

    if ((selectedSortingAlgorithm === 'counting' || selectedSortingAlgorithm === 'radix') && currentArray.some(x => x < 0)) {
      handleToast('מיוני טווח חסום (מנייה ובסיס) תומכים במספרים אי-שליליים בלבד');
      return;
    }

    let newSteps: Step[] = [];
    if (selectedSortingAlgorithm === 'insertion') {
      newSteps = generateInsertionSortAnimations(currentArray);
    } else if (selectedSortingAlgorithm === 'merge') {
      newSteps = generateMergeSortAnimations(currentArray);
    } else if (selectedSortingAlgorithm === 'quick') {
      newSteps = generateQuickSortAnimations(currentArray);
    } else if (selectedSortingAlgorithm === 'heap') {
      newSteps = generateHeapSortAnimations(currentArray);
    } else if (selectedSortingAlgorithm === 'counting') {
      newSteps = generateCountingSortAnimations(currentArray);
    } else if (selectedSortingAlgorithm === 'radix') {
      newSteps = generateRadixSortAnimations(currentArray);
    }

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
    <div className="rounded-3xl bg-slate-900/95 p-4 shadow-xl backdrop-blur-sm flex flex-col gap-4">
      {/* ROW 1: INSERT & PLAYBACK */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* RIGHT SIDE: INSERT & SPEED SLIDER */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <input
              type={activeTab === 'trie' || activeTab === 'suffix' || activeTab === 'sorting' ? 'text' : 'number'}
              dir="ltr"
              inputMode={activeTab === 'trie' || activeTab === 'suffix' || activeTab === 'sorting' ? 'text' : 'numeric'}
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
                  : activeTab === 'sorting'
                  ? 'הזן מספר או רשימה עם פסיקים'
                  : 'הזן ערך'
              }
              className="h-10 min-w-[120px] rounded-2xl border border-slate-700 bg-slate-950 px-3 text-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <button
              onClick={handleInsert}
              disabled={isAnimating}
              className="h-10 rounded-2xl bg-sky-600 px-4 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap"
            >
              {activeTab === 'sorting' ? 'הוסף / עדכן' : 'הכנס'}
            </button>
          </div>

          {/* SPEED SLIDER */}
          <div className="flex h-10 items-center gap-3 rounded-2xl border border-slate-700 bg-slate-950 px-3">
            <label className="text-sm text-slate-300 font-medium whitespace-nowrap">מהירות אנימציה</label>
            <input
              type="range"
              min="0.25"
              max="3"
              step="0.25"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="h-2 w-28 cursor-pointer accent-sky-500"
            />
            <span className="text-sm text-slate-200 min-w-[36px] text-left">{speed.toFixed(2)}x</span>
          </div>
        </div>

        {/* LEFT SIDE: PLAYBACK & RESET */}
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

      {/* ROW 2: DELETE, SELECTORS & ADDITIONAL CONTROLS */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* RIGHT SIDE: DELETE & SELECTORS */}
        <div className="flex flex-wrap items-center gap-4">
          {activeTab !== 'sorting' && (
            <div className="flex items-center gap-2">
              <input
                type={activeTab === 'trie' ? 'text' : 'number'}
                dir="ltr"
                inputMode={activeTab === 'trie' ? 'text' : 'numeric'}
                value={deleteValue}
                onChange={(e) => setDeleteValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleDelete();
                }}
                disabled={isAnimating}
                placeholder={activeTab === 'trie' ? 'מילה למחיקה' : 'מחק ערך'}
                className="h-10 min-w-[120px] rounded-2xl border border-slate-700 bg-slate-950 px-3 text-slate-100 disabled:cursor-not-allowed disabled:opacity-50 text-sm font-medium"
              />
              <button
                onClick={handleDelete}
                disabled={isAnimating}
                className="h-10 rounded-2xl bg-rose-600 px-4 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                מחק
              </button>
            </div>
          )}

          {activeTab === 'heap' && (
            <>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-semibold">סוג ערימה:</span>
                <select
                  value={heapType}
                  onChange={(e) => {
                    setHeapType(e.target.value as 'min' | 'max');
                    reset();
                  }}
                  disabled={isAnimating}
                  className="h-10 rounded-2xl border border-slate-700 bg-slate-950 px-3 text-slate-100 disabled:cursor-not-allowed disabled:opacity-50 text-sm font-semibold cursor-pointer"
                >
                  <option value="max">ערימת מקסימום (Max)</option>
                  <option value="min">ערימת מינימום (Min)</option>
                </select>
              </div>
              <button
                onClick={handleExtractMax}
                disabled={isAnimating}
                className="h-10 rounded-2xl bg-amber-600 px-4 text-sm font-semibold text-white transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {heapType === 'max' ? 'הפקת מקסימום' : 'הפקת מינימום'}
              </button>
            </>
          )}

          {activeTab === 'binomial' && (
            <>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-semibold">סוג ערימה:</span>
                <select
                  value={binomialHeapType}
                  onChange={(e) => {
                    setBinomialHeapType(e.target.value as 'min' | 'max');
                    reset();
                  }}
                  disabled={isAnimating}
                  className="h-10 rounded-2xl border border-slate-700 bg-slate-950 px-3 text-slate-100 disabled:cursor-not-allowed disabled:opacity-50 text-sm font-semibold cursor-pointer"
                >
                  <option value="min">ערימה בינומית מינימום</option>
                  <option value="max">ערימה בינומית מקסימום</option>
                </select>
              </div>
              <button
                onClick={handleExtractMin}
                disabled={isAnimating}
                className="h-10 rounded-2xl bg-amber-600 px-4 text-sm font-semibold text-white transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {binomialHeapType === 'min' ? 'הפקת מינימום' : 'הפקת מקסימום'}
              </button>
            </>
          )}

          {activeTab === 'bplus' && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold">דרגה (b):</span>
              <select
                value={bPlusBlockSize}
                onChange={(e) => {
                  setBPlusBlockSize(Number(e.target.value));
                  reset();
                }}
                disabled={isAnimating}
                className="h-10 rounded-2xl border border-slate-700 bg-slate-950 px-3 text-slate-100 disabled:cursor-not-allowed disabled:opacity-50 text-sm font-semibold cursor-pointer"
              >
                <option value={3}>3</option>
                <option value={4}>4</option>
                <option value={5}>5</option>
              </select>
            </div>
          )}

          {(activeTab === 'trie' || activeTab === 'suffix') && (
            <div className="flex items-center gap-2">
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
            </div>
          )}

          {activeTab === 'sorting' && (
            <>
              <select
                value={selectedSortingAlgorithm}
                onChange={(e) => setSelectedSortingAlgorithm(e.target.value as any)}
                disabled={isAnimating}
                className="h-10 rounded-2xl border border-slate-700 bg-slate-950 px-3 text-slate-100 disabled:cursor-not-allowed disabled:opacity-50 text-sm font-semibold cursor-pointer"
              >
                <option value="heap">מיון ערמה (Heap Sort)</option>
                <option value="quick">מיון מהיר (Quick Sort)</option>
                <option value="merge">מיון מיזוג (Merge Sort)</option>
                <option value="insertion">מיון הכנסה (Insertion Sort)</option>
                <option value="counting">מיון מנייה (Counting Sort)</option>
                <option value="radix">מיון בסיס (Radix Sort)</option>
              </select>
              <button
                onClick={handleSort}
                disabled={isAnimating}
                className="h-10 rounded-2xl bg-amber-600 px-4 text-sm font-semibold text-white transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                מיין מערך
              </button>
              <button
                onClick={() => {
                  setCurrentArray([14, 3, 8, 16, 2, 10, 7, 9, 1, 12]);
                  handleToast('המערך הדיפולטיבי נטען בהצלחה');
                }}
                disabled={isAnimating}
                className="h-10 rounded-2xl border border-slate-750 bg-slate-950 px-3 text-xs font-semibold text-slate-350 transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                טען מערך דיפולטיבי
              </button>
            </>
          )}
        </div>
        <div className="hidden md:block" />
      </div>
    </div>
  );
};
