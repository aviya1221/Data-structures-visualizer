import { create } from 'zustand';
import type { TreeNode } from '../structures/types';

export type PlaybackState = 'idle' | 'playing' | 'paused';

export interface Step {
  id: string;
  message: string;
  rootNode: TreeNode | null;
  highlightedNodeIds?: string[];
  intenseHighlightId?: string;
  stepType?: 'insert' | 'height' | 'imbalance' | 'recolor' | 'rotation' | 'balanced' | 'complete';
  rotationCase?: string;
}

interface AppState {
  currentRoot: TreeNode | null;
  playback: PlaybackState;
  speed: number;
  stepIndex: number;
  animationQueue: Step[];
  stepHistory: Array<TreeNode | null>;
  isAnimating: boolean;
  toastMessage: string;

  setPlayback: (state: PlaybackState) => void;
  setSpeed: (speed: number) => void;
  setToast: (message: string) => void;
  clearToast: () => void;
  enqueue: (steps: Step[], startPlayback?: PlaybackState) => void;
  nextStep: () => void;
  undo: () => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentRoot: null,
  playback: 'idle',
  speed: 1,
  stepIndex: 0,
  animationQueue: [],
  stepHistory: [],
  isAnimating: false,
  toastMessage: '',

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

    const finalRoot = state.animationQueue[state.stepIndex]?.rootNode ?? state.currentRoot;
    return {
      currentRoot: finalRoot,
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

  reset: () => set({ 
    currentRoot: null,
    playback: 'idle', 
    speed: 1,
    stepIndex: 0, 
    animationQueue: [], 
    stepHistory: [],
    isAnimating: false,
    toastMessage: '',
  })
}));