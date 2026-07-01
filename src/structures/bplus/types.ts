export interface BPlusNode {
  id: string;
  keys: number[];
  isLeaf: boolean;
  children: string[]; // Child node IDs (empty if leaf)
  next: string | null; // Next leaf node ID (null if not leaf or last leaf)
}

export const generateBPlusNodeId = (): string => {
  return `bp_${Math.random().toString(36).substring(2, 9)}`;
};
