import type { RBNode } from './types';

export const generateId = (): string => Math.random().toString(36).substring(2, 9);

export const cloneTree = (node: RBNode | null): RBNode | null => {
  if (!node) return null;
  return {
    ...node,
    left: cloneTree(node.left),
    right: cloneTree(node.right),
  };
};

export const isRed = (node: RBNode | null): boolean => node?.color === 'red';

export const rotateLeft = (h: RBNode): RBNode => {
  const x = h.right!;
  h.right = x.left;
  x.left = h;
  return x;
};

export const rotateRight = (h: RBNode): RBNode => {
  const x = h.left!;
  h.left = x.right;
  x.right = h;
  return x;
};

export const replaceSubtree = (
  root: RBNode | null,
  targetId: string,
  replacement: RBNode | null
): RBNode | null => {
  if (!root) return null;
  if (root.id === targetId) return replacement;
  return {
    ...root,
    left: replaceSubtree(root.left, targetId, replacement),
    right: replaceSubtree(root.right, targetId, replacement),
  };
};

export const findNodeByValue = (node: RBNode | null, value: number): RBNode | null => {
  if (!node) return null;
  if (node.value === value) return node;
  return value < node.value ? findNodeByValue(node.left, value) : findNodeByValue(node.right, value);
};

export const insertBST = (node: RBNode | null, value: number): RBNode => {
  if (!node) {
    return { id: generateId(), value, color: 'red', left: null, right: null };
  }

  if (value < node.value) {
    node.left = insertBST(node.left, value);
  } else if (value > node.value) {
    node.right = insertBST(node.right, value);
  }

  return node;
};

export const findPathToValue = (node: RBNode | null, value: number): RBNode[] => {
  const path: RBNode[] = [];
  let current = node;

  while (current) {
    path.push(current);
    if (value === current.value) break;
    current = value < current.value ? current.left : current.right;
  }

  return path;
};

export const findPathToId = (node: RBNode | null, id: string): RBNode[] => {
  const path: RBNode[] = [];
  const traverse = (current: RBNode | null): boolean => {
    if (!current) return false;
    path.push(current);
    if (current.id === id) return true;
    if (traverse(current.left) || traverse(current.right)) {
      return true;
    }
    path.pop();
    return false;
  };
  traverse(node);
  return path;
};

export const attachRotatedSubtreeRbt = (
  root: RBNode,
  path: RBNode[],
  index: number,
  replacement: RBNode
): RBNode => {
  if (index === 0) {
    return replacement;
  }

  const parent = path[index - 1];
  const target = path[index];
  if (parent.left?.id === target.id) {
    parent.left = replacement;
  } else if (parent.right?.id === target.id) {
    parent.right = replacement;
  }

  return root;
};
