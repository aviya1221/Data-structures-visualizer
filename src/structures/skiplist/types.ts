export interface SkipListNode {
  id: string;
  value: number; // Or a special number representing 'h' (head) and 'n' (null/tail)
  isHead?: boolean;
  isTail?: boolean;
  next: string | null; // Pointer to next node ID
  prev: string | null; // Pointer to previous node ID
  up: string | null;   // Pointer to node ID in level above
  down: string | null; // Pointer to node ID in level below
  level: number;       // Level index (0 = bottom level)
  x?: number;
  y?: number;
}

export interface SkipListStep {
  id: string;
  message: string;
  nodes: SkipListNode[]; // Flattened list of all nodes across all levels
  highlightedNodeIds?: string[];
  intenseHighlightId?: string;
  stepType?: 'search' | 'insert' | 'delete' | 'promote' | 'rebalance' | 'complete';
}
