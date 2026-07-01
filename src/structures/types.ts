export type RBNodeColor = 'red' | 'black';

export interface TreeNode {
	id: string;
	value: number;
	left: TreeNode | null;
	right: TreeNode | null;
	x?: number;
	y?: number;
	height?: number;
	color?: RBNodeColor;
}

export interface AVLNode extends TreeNode {
	height: number;
	left: AVLNode | null;
	right: AVLNode | null;
}

export interface RBNode extends TreeNode {
	color: RBNodeColor;
	left: RBNode | null;
	right: RBNode | null;
}
