export interface HeapNode {
  id: string;
  value: number;
}

export const generateHeapNodeId = (): string => {
  return `hp_${Math.random().toString(36).substring(2, 9)}`;
};

export const parent = (i: number): number => Math.floor(i / 2);
export const left = (i: number): number => 2 * i;
export const right = (i: number): number => 2 * i + 1;

export const cloneHeap = (heap: HeapNode[]): HeapNode[] => {
  return heap.map((item) => ({ ...item }));
};
