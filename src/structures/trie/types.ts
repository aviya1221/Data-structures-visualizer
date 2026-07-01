export interface TrieNode {
  id: string;
  char: string; // empty string for the root
  isWordEnd: boolean; // flag representing word end
  children: string[]; // child node IDs
}

export const generateTrieNodeId = (): string => {
  return `tr_${Math.random().toString(36).substring(2, 9)}`;
};
