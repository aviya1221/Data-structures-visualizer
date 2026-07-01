import type { AVLNode } from './types';

export const generateId = (): string => Math.random().toString(36).substring(2, 9);

export const cloneTree = (node: AVLNode | null): AVLNode | null => {
  if (!node) return null;
  return {
    ...node,
    left: cloneTree(node.left),
    right: cloneTree(node.right)
  };
};

export const getHeight = (node: AVLNode | null): number => node ? node.height : -1;

export const updateHeight = (node: AVLNode): void => {
  node.height = Math.max(getHeight(node.left), getHeight(node.right)) + 1;
};

export const getBalanceFactor = (node: AVLNode | null): number => {
  if (!node) return 0;
  return getHeight(node.left) - getHeight(node.right);
};

export const rotateRight = (y: AVLNode): AVLNode => {
  const x = y.left!;
  const T2 = x.right;
  x.right = y;
  y.left = T2;
  updateHeight(y);
  updateHeight(x);
  return x;
};

export const rotateLeft = (x: AVLNode): AVLNode => {
  const y = x.right!;
  const T2 = y.left;
  y.left = x;
  x.right = T2;
  updateHeight(x);
  updateHeight(y);
  return y;
};

export const insertBST = (
  node: AVLNode | null,
  value: number,
  path: AVLNode[] = []
): AVLNode => {
  if (!node) {
    return { id: generateId(), value, height: 0, left: null, right: null };
  }

  path.push(node);

  if (value < node.value) {
    node.left = insertBST(node.left, value, path);
  } else if (value > node.value) {
    node.right = insertBST(node.right, value, path);
  }

  return node;
};

export const findNodeByValue = (node: AVLNode | null, value: number): AVLNode | null => {
  if (!node) return null;
  if (value === node.value) return node;
  return value < node.value ? findNodeByValue(node.left, value) : findNodeByValue(node.right, value);
};

export const replaceSubtree = (
  root: AVLNode | null,
  targetId: string,
  replacement: AVLNode | null
): AVLNode | null => {
  if (!root) return null;
  if (root.id === targetId) return replacement;
  return {
    ...root,
    left: replaceSubtree(root.left, targetId, replacement),
    right: replaceSubtree(root.right, targetId, replacement),
  };
};

// פונקציית איזון מלאה (AVL Balance)
export const balance = (node: AVLNode): AVLNode => {
  updateHeight(node);
  const bf = getBalanceFactor(node);

  // Left Heavy
  if (bf > 1) {
    if (getBalanceFactor(node.left) < 0) {
      node.left = rotateLeft(node.left!); // Left-Right Case
    }
    return rotateRight(node); // Left-Left Case
  }

  // Right Heavy
  if (bf < -1) {
    if (getBalanceFactor(node.right) > 0) {
      node.right = rotateRight(node.right!); // Right-Left Case
    }
    return rotateLeft(node); // Right-Right Case
  }

  return node;
};

// פונקציית הכנסה רקורסיבית מלאה (כולל איזון)
export const insertAVL = (node: AVLNode | null, value: number): AVLNode => {
  if (!node) {
    return { id: generateId(), value, height: 0, left: null, right: null };
  }

  if (value < node.value) node.left = insertAVL(node.left, value);
  else if (value > node.value) node.right = insertAVL(node.right, value);
  else return node; // הערך כבר קיים

  return balance(node);
};