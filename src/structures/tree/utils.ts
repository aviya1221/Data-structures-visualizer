import type { TreeNode } from '../types';

export const findTreeNodeByValue = (node: TreeNode | null, value: number): TreeNode | null => {
  if (!node) return null;
  if (node.value === value) return node;
  return findTreeNodeByValue(node.left as TreeNode | null, value) ?? findTreeNodeByValue(node.right as TreeNode | null, value);
};
