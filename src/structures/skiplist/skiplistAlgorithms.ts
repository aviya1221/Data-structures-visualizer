import type { SkipListNode } from './types';

// Unique ID generator for nodes
export const generateSkipListId = (): string => {
  return `sl_${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Creates a brand new empty Skip List containing head and tail nodes at level 0.
 */
export const createEmptySkipList = (): SkipListNode[] => {
  const headId = generateSkipListId();
  const tailId = generateSkipListId();

  const head: SkipListNode = {
    id: headId,
    value: -Infinity,
    isHead: true,
    next: tailId,
    prev: null,
    up: null,
    down: null,
    level: 0,
  };

  const tail: SkipListNode = {
    id: tailId,
    value: Infinity,
    isTail: true,
    next: null,
    prev: headId,
    up: null,
    down: null,
    level: 0,
  };

  return [head, tail];
};

export const findLevelHead = (level: number, nodesMap: Map<string, SkipListNode>): SkipListNode | null => {
  for (const node of nodesMap.values()) {
    if (node.level === level && node.isHead) {
      return node;
    }
  }
  return null;
};

export const findLevelTail = (level: number, nodesMap: Map<string, SkipListNode>): SkipListNode | null => {
  for (const node of nodesMap.values()) {
    if (node.level === level && node.isTail) {
      return node;
    }
  }
  return null;
};

export const getMaxLevel = (nodesMap: Map<string, SkipListNode>): number => {
  let max = 0;
  for (const node of nodesMap.values()) {
    if (node.level > max) {
      max = node.level;
    }
  }
  return max;
};
