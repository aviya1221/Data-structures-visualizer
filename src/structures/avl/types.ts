import type { TreeNode } from '../types';

export interface AVLNode extends TreeNode {
  height: number;
  left: AVLNode | null;
  right: AVLNode | null;
}