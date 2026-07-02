export interface BinomialTreeNode {
  id: string;
  value: number;
  children: BinomialTreeNode[];
  order: number;
}

export const generateBinomialNodeId = (): string => {
  return `bn_${Math.random().toString(36).substring(2, 9)}`;
};

export const cloneBinomialTree = (node: BinomialTreeNode): BinomialTreeNode => {
  return {
    id: node.id,
    value: node.value,
    order: node.order,
    children: node.children.map((child) => cloneBinomialTree(child)),
  };
};

export const cloneBinomialHeap = (heap: BinomialTreeNode[]): BinomialTreeNode[] => {
  return heap.map((tree) => cloneBinomialTree(tree));
};

/**
 * Combines two binomial trees of the same order k into a single tree of order k+1.
 * Maintaining the MIN-HEAP property (parent < child).
 */
export const mergeBinomialTrees = (
  t1: BinomialTreeNode,
  t2: BinomialTreeNode,
  heapType: 'min' | 'max' = 'min'
): BinomialTreeNode => {
  const c1 = cloneBinomialTree(t1);
  const c2 = cloneBinomialTree(t2);

  const t1IsParent = heapType === 'min'
    ? c1.value < c2.value
    : c1.value > c2.value;

  if (t1IsParent) {
    return {
      ...c1,
      children: [c2, ...c1.children],
      order: c1.order + 1,
    };
  } else {
    return {
      ...c2,
      children: [c1, ...c2.children],
      order: c2.order + 1,
    };
  }
};
