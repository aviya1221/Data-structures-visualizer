import type { TreeNode } from '../types';

export type RBNodeColor = 'red' | 'black';

export interface RBNode extends TreeNode {
  color: RBNodeColor;
  left: RBNode | null;
  right: RBNode | null;
}
