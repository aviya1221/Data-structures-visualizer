export interface SuffixTreeNode {
  id: string;
  char: string; // empty string for the root
  isWordEnd: boolean; // true for '$' leaf nodes
  children: string[]; // child node IDs
}

export const generateSuffixNodeId = (): string => {
  return `sf_${Math.random().toString(36).substring(2, 9)}`;
};
