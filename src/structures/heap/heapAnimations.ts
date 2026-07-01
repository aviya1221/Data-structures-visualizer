import type { Step } from '../../app/store';
import {
  type HeapNode,
  generateHeapNodeId,
  parent,
  left,
  right,
  cloneHeap,
} from './heapAlgorithms';

// Helper to wrap the heap array inside a dummy TreeNode
const createDummyRoot = (heapArray: HeapNode[]): any => {
  return {
    id: 'heap-root',
    value: 0,
    left: null,
    right: null,
    heapArray,
  };
};

/**
 * Generates insertion animation steps (bubble-up / up-heap) for Max-Heap.
 */
export const generateHeapInsertAnimations = (
  currentHeap: HeapNode[],
  newValue: number
): Step[] => {
  const steps: Step[] = [];
  
  // Clone the current heap (1-based index representation: index 0 is null/ignored)
  const A: HeapNode[] = [null as any, ...cloneHeap(currentHeap.filter(Boolean))];
  
  const newNodeId = generateHeapNodeId();
  const newNode: HeapNode = { id: newNodeId, value: newValue };

  // Place new node at the end of the heap array
  A.push(newNode);
  let size = A.length - 1;

  steps.push({
    id: `hp-insert-start-${newValue}`,
    message: `הוספת צומת ${newValue} לסוף המערך במקום ${size}`,
    rootNode: createDummyRoot(A.filter(Boolean)),
    highlightedNodeIds: [newNodeId],
    stepType: 'insert',
  });

  let i = size;
  
  // Bubble up (Heap-Increase-Key style)
  while (i > 1) {
    const pIdx = parent(i);
    const parentNode = A[pIdx];
    const currentNode = A[i];

    // Highlight comparison
    steps.push({
      id: `hp-compare-${currentNode.id}-${parentNode.id}`,
      message: `השוואה בין צומת ${currentNode.value} במקום ${i} לאב ${parentNode.value} במקום ${pIdx}`,
      rootNode: createDummyRoot(A.filter(Boolean)),
      highlightedNodeIds: [currentNode.id, parentNode.id],
      stepType: 'recolor',
    });

    if (parentNode.value < currentNode.value) {
      // Swap elements
      A[pIdx] = currentNode;
      A[i] = parentNode;

      steps.push({
        id: `hp-swap-${currentNode.id}-${parentNode.id}`,
        message: `החלפה: ${currentNode.value} גדול מ-${parentNode.value}. הערך מבעבע למעלה`,
        rootNode: createDummyRoot(A.filter(Boolean)),
        highlightedNodeIds: [currentNode.id, parentNode.id],
        stepType: 'rotation',
      });

      i = pIdx;
    } else {
      break; // Heap property satisfied
    }
  }

  steps.push({
    id: `hp-insert-complete-${newValue}`,
    message: `הכנסה הושלמה. תכונת הערימה (Max-Heap) נשמרת`,
    rootNode: createDummyRoot(A.filter(Boolean)),
    stepType: 'complete',
  });

  return steps;
};

/**
 * Generates extract-max animation steps (sink-down / Max-Heapify) for Max-Heap.
 */
export const generateHeapExtractMaxAnimations = (
  currentHeap: HeapNode[]
): Step[] => {
  const steps: Step[] = [];
  const A: HeapNode[] = [null as any, ...cloneHeap(currentHeap.filter(Boolean))];
  const size = A.length - 1;

  if (size <= 0) {
    steps.push({
      id: `hp-extract-empty`,
      message: `הערימה ריקה. אין מה למחוק`,
      rootNode: createDummyRoot([]),
      stepType: 'complete',
    });
    return steps;
  }

  const maxNode = A[1];

  if (size === 1) {
    steps.push({
      id: `hp-extract-last`,
      message: `מחיקת האיבר היחיד בערימה (${maxNode.value})`,
      rootNode: createDummyRoot([]),
      stepType: 'complete',
    });
    return steps;
  }

  const lastNode = A[size];

  steps.push({
    id: `hp-extract-start`,
    message: `החלפת שורש הערימה המקסימלי (${maxNode.value}) עם האיבר האחרון (${lastNode.value})`,
    rootNode: createDummyRoot(A.filter(Boolean)),
    highlightedNodeIds: [maxNode.id, lastNode.id],
    stepType: 'recolor',
  });

  // Swap root and last
  A[1] = lastNode;
  A[size] = maxNode;

  steps.push({
    id: `hp-extract-swap`,
    message: `ביצוע החלפה בשורש`,
    rootNode: createDummyRoot(A.filter(Boolean)),
    highlightedNodeIds: [maxNode.id, lastNode.id],
    stepType: 'rotation',
  });

  // Remove the last node (which contains the maximum value)
  A.pop();
  const heapSize = A.length - 1;

  steps.push({
    id: `hp-extract-remove`,
    message: `הסרת הערך המקסימלי (${maxNode.value}) מהערימה. כעת נתקן את חוק הערימה מטה מהשורש`,
    rootNode: createDummyRoot(A.filter(Boolean)),
    stepType: 'insert',
  });

  // Max-Heapify from the root (index 1)
  let i = 1;
  while (true) {
    const lIdx = left(i);
    const rIdx = right(i);
    let largest = i;

    // Highlight active element and children under comparison
    const childIds: string[] = [];
    if (lIdx <= heapSize) childIds.push(A[lIdx].id);
    if (rIdx <= heapSize) childIds.push(A[rIdx].id);

    steps.push({
      id: `hp-heapify-compare-${i}`,
      message: `תיקון ערימה (Max-Heapify): בודק את הצומת במקום ${i} (${A[i].value}) מול ילדיו`,
      rootNode: createDummyRoot(A.filter(Boolean)),
      highlightedNodeIds: [A[i].id, ...childIds],
      stepType: 'recolor',
    });

    if (lIdx <= heapSize && A[lIdx].value > A[largest].value) {
      largest = lIdx;
    }
    if (rIdx <= heapSize && A[rIdx].value > A[largest].value) {
      largest = rIdx;
    }

    if (largest !== i) {
      const parentNode = A[i];
      const largestNode = A[largest];

      A[i] = largestNode;
      A[largest] = parentNode;

      steps.push({
        id: `hp-heapify-swap-${parentNode.id}-${largestNode.id}`,
        message: `החלפה: ${largestNode.value} גדול מ-${parentNode.value}. הערך שוקע מטה`,
        rootNode: createDummyRoot(A.filter(Boolean)),
        highlightedNodeIds: [parentNode.id, largestNode.id],
        stepType: 'rotation',
      });

      i = largest;
    } else {
      break;
    }
  }

  steps.push({
    id: `hp-extract-complete`,
    message: `הפקת מקסימום הושלמה בהצלחה. השורש תוקן והערימה מאוזנת`,
    rootNode: createDummyRoot(A.filter(Boolean)),
    stepType: 'complete',
  });

  return steps;
};
