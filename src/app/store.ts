import { create } from 'zustand';
import type { TreeNode } from '../structures/types';

export type PlaybackState = 'idle' | 'playing' | 'paused';

export interface Step {
  id: string;
  message: string;
  rootNode?: TreeNode | null;
  highlightedNodeIds?: string[];
  intenseHighlightId?: string;
  stepType?: 'insert' | 'height' | 'imbalance' | 'recolor' | 'rotation' | 'balanced' | 'complete' | 'compare' | 'swap' | 'pivot' | 'sorted';
  rotationCase?: string;

  // Sorting Visualizer properties
  arrayState?: number[];
  highlightedIndices?: number[];
  sortedIndices?: number[];
  pivotIndex?: number;
  countArrayState?: number[];
  outputArrayState?: number[];
}

interface AppState {
  currentRoot: TreeNode | null;
  currentArray: number[];
  playback: PlaybackState;
  speed: number;
  stepIndex: number;
  animationQueue: Step[];
  stepHistory: Array<TreeNode | null>;
  isAnimating: boolean;
  toastMessage: string;
  selectedSortingAlgorithm: 'heap' | 'quick' | 'merge' | 'insertion' | 'counting' | 'radix';
  heapType: 'min' | 'max';
  binomialHeapType: 'min' | 'max';
  bPlusBlockSize: number;

  setPlayback: (state: PlaybackState) => void;
  setSpeed: (speed: number) => void;
  setToast: (message: string) => void;
  clearToast: () => void;
  enqueue: (steps: Step[], startPlayback?: PlaybackState) => void;
  nextStep: () => void;
  undo: () => void;
  reset: () => void;
  setCurrentArray: (arr: number[]) => void;
  setSelectedSortingAlgorithm: (algo: 'heap' | 'quick' | 'merge' | 'insertion' | 'counting' | 'radix') => void;
  setHeapType: (type: 'min' | 'max') => void;
  setBinomialHeapType: (type: 'min' | 'max') => void;
  setBPlusBlockSize: (size: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentRoot: null,
  currentArray: [14, 3, 8, 16, 2, 10, 7, 9, 1, 12], // default baseline array
  playback: 'idle',
  speed: 1,
  stepIndex: 0,
  animationQueue: [],
  stepHistory: [],
  isAnimating: false,
  toastMessage: '',
  selectedSortingAlgorithm: 'heap',
  heapType: 'max',
  binomialHeapType: 'min',
  bPlusBlockSize: 3,

  setPlayback: (state) => set((prev) => ({
    playback: state,
    isAnimating: state !== 'idle' && prev.animationQueue.length > 0,
  })),

  setSpeed: (speed) => set({ speed }),

  setToast: (message) => set({ toastMessage: message }),

  clearToast: () => set({ toastMessage: '' }),
  
  enqueue: (steps, startPlayback: PlaybackState = 'playing') => set((state) => ({
    stepHistory: [...state.stepHistory, state.currentRoot],
    animationQueue: steps,
    stepIndex: 0,
    playback: startPlayback,
    isAnimating: startPlayback !== 'idle',
  })),

  nextStep: () => set((state) => {
    if (state.animationQueue.length === 0) {
      return { playback: 'idle', isAnimating: false };
    }

    if (state.stepIndex < state.animationQueue.length - 1) {
      return { stepIndex: state.stepIndex + 1 };
    }

    const lastStep = state.animationQueue[state.stepIndex];
    const finalRoot = lastStep && lastStep.rootNode !== undefined ? lastStep.rootNode : state.currentRoot;
    const finalArray = lastStep && lastStep.arrayState !== undefined ? lastStep.arrayState : state.currentArray;
    return {
      currentRoot: finalRoot,
      currentArray: finalArray,
      animationQueue: [],
      stepIndex: 0,
      playback: 'idle',
      isAnimating: false,
    };
  }),

  undo: () => set((state) => {
    if (state.stepHistory.length === 0) return state;

    const previousRoot = state.stepHistory[state.stepHistory.length - 1];
    return {
      currentRoot: previousRoot,
      animationQueue: [],
      stepIndex: 0,
      playback: 'idle',
      isAnimating: false,
      stepHistory: state.stepHistory.slice(0, -1),
    };
  }),

  reset: () => set((state) => ({ 
    currentRoot: null,
    currentArray: [14, 3, 8, 16, 2, 10, 7, 9, 1, 12],
    playback: 'idle', 
    speed: 1,
    stepIndex: 0, 
    animationQueue: [], 
    stepHistory: [],
    isAnimating: false,
    toastMessage: '',
    selectedSortingAlgorithm: state.selectedSortingAlgorithm,
    heapType: state.heapType,
    binomialHeapType: state.binomialHeapType,
    bPlusBlockSize: state.bPlusBlockSize,
  })),

  setCurrentArray: (currentArray) => set({ currentArray }),

  setSelectedSortingAlgorithm: (selectedSortingAlgorithm) => set({ selectedSortingAlgorithm }),

  setHeapType: (heapType) => set({ heapType, currentRoot: null }),

  setBinomialHeapType: (binomialHeapType) => set({ binomialHeapType, currentRoot: null }),

  setBPlusBlockSize: (bPlusBlockSize) => set({ bPlusBlockSize, currentRoot: null })
}));