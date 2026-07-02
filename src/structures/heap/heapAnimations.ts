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
 * Generates insertion animation steps for Min-Heap or Max-Heap.
 */
export const generateHeapInsertAnimations = (
  currentHeap: HeapNode[],
  newValue: number,
  heapType: 'min' | 'max' = 'max'
): Step[] => {
  const steps: Step[] = [];
  
  // Clone current heap (1-based representation)
  const A: HeapNode[] = [null as any, ...cloneHeap(currentHeap.filter(Boolean))];
  
  const newNodeId = generateHeapNodeId();
  const newNode: HeapNode = { id: newNodeId, value: newValue };

  A.push(newNode);
  let size = A.length - 1;

  steps.push({
    id: `hp-insert-start-${newValue}`,
    message: `הוספת צומת ${newValue} לסוף המערך במקום ${size} (סוג ערימה: ${heapType === 'max' ? 'מקסימום' : 'מינימום'})`,
    rootNode: createDummyRoot(A.filter(Boolean)),
    highlightedNodeIds: [newNodeId],
    stepType: 'insert',
  });

  let i = size;
  
  // Bubble up (Up-Heap)
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

    const violates = heapType === 'max'
      ? parentNode.value < currentNode.value
      : parentNode.value > currentNode.value;

    if (violates) {
      // Swap elements
      A[pIdx] = currentNode;
      A[i] = parentNode;

      steps.push({
        id: `hp-swap-${currentNode.id}-${parentNode.id}`,
        message: `החלפה: ${currentNode.value} ${heapType === 'max' ? 'גדול' : 'קטן'} מ-${parentNode.value}. הערך מבעבע למעלה`,
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
    message: `הכנסה הושלמה. תכונת הערימה (${heapType === 'max' ? 'Max-Heap' : 'Min-Heap'}) נשמרת`,
    rootNode: createDummyRoot(A.filter(Boolean)),
    stepType: 'complete',
  });

  return steps;
};

/**
 * Helper to sink down an element in Min-Heap or Max-Heap (Heapify).
 */
const heapifyDown = (
  A: HeapNode[],
  i: number,
  heapSize: number,
  steps: Step[],
  heapType: 'min' | 'max'
) => {
  while (true) {
    const lIdx = left(i);
    const rIdx = right(i);
    let target = i; // largest in Max-Heap, smallest in Min-Heap

    const childIds: string[] = [];
    if (lIdx <= heapSize) childIds.push(A[lIdx].id);
    if (rIdx <= heapSize) childIds.push(A[rIdx].id);

    if (lIdx <= heapSize || rIdx <= heapSize) {
      steps.push({
        id: `hp-heapify-compare-${i}-${Date.now()}`,
        message: `תיקון ערימה (${heapType === 'max' ? 'Max-Heapify' : 'Min-Heapify'}): בודק את הצומת במקום ${i} (${A[i].value}) מול ילדיו`,
        rootNode: createDummyRoot(A.filter(Boolean)),
        highlightedNodeIds: [A[i].id, ...childIds],
        stepType: 'recolor',
      });
    }

    if (heapType === 'max') {
      if (lIdx <= heapSize && A[lIdx].value > A[target].value) {
        target = lIdx;
      }
      if (rIdx <= heapSize && A[rIdx].value > A[target].value) {
        target = rIdx;
      }
    } else {
      if (lIdx <= heapSize && A[lIdx].value < A[target].value) {
        target = lIdx;
      }
      if (rIdx <= heapSize && A[rIdx].value < A[target].value) {
        target = rIdx;
      }
    }

    if (target !== i) {
      const parentNode = A[i];
      const targetNode = A[target];

      A[i] = targetNode;
      A[target] = parentNode;

      steps.push({
        id: `hp-heapify-swap-${parentNode.id}-${targetNode.id}`,
        message: `החלפה: ${targetNode.value} ${heapType === 'max' ? 'גדול' : 'קטן'} מ-${parentNode.value}. הערך שוקע מטה`,
        rootNode: createDummyRoot(A.filter(Boolean)),
        highlightedNodeIds: [parentNode.id, targetNode.id],
        stepType: 'rotation',
      });

      i = target;
    } else {
      break;
    }
  }
};

/**
 * Generates extraction animation steps for the root (Max/Min) of the Heap.
 */
export const generateHeapExtractAnimations = (
  currentHeap: HeapNode[],
  heapType: 'min' | 'max' = 'max'
): Step[] => {
  const steps: Step[] = [];
  const A: HeapNode[] = [null as any, ...cloneHeap(currentHeap.filter(Boolean))];
  const size = A.length - 1;

  if (size <= 0) {
    steps.push({
      id: `hp-extract-empty`,
      message: `הערימה ריקה. אין מה להוציא`,
      rootNode: createDummyRoot([]),
      stepType: 'complete',
    });
    return steps;
  }

  const rootNode = A[1];

  if (size === 1) {
    steps.push({
      id: `hp-extract-last`,
      message: `מחיקת האיבר היחיד בערימה (${rootNode.value})`,
      rootNode: createDummyRoot([]),
      stepType: 'complete',
    });
    return steps;
  }

  const lastNode = A[size];

  steps.push({
    id: `hp-extract-start`,
    message: `החלפת שורש הערימה (${rootNode.value}) עם האיבר האחרון (${lastNode.value}) לצורך הסרתו`,
    rootNode: createDummyRoot(A.filter(Boolean)),
    highlightedNodeIds: [rootNode.id, lastNode.id],
    stepType: 'recolor',
  });

  // Swap root and last
  A[1] = lastNode;
  A[size] = rootNode;

  steps.push({
    id: `hp-extract-swap`,
    message: `ביצוע החלפה בשורש`,
    rootNode: createDummyRoot(A.filter(Boolean)),
    highlightedNodeIds: [rootNode.id, lastNode.id],
    stepType: 'rotation',
  });

  // Remove the last node
  A.pop();
  const heapSize = A.length - 1;

  steps.push({
    id: `hp-extract-remove`,
    message: `הסרת האיבר (${rootNode.value}) מהערימה. כעת נתקן את חוק הערימה מטה מהשורש`,
    rootNode: createDummyRoot(A.filter(Boolean)),
    stepType: 'insert',
  });

  // Sink down from root
  heapifyDown(A, 1, heapSize, steps, heapType);

  steps.push({
    id: `hp-extract-complete`,
    message: `הפקת השורש הושלמה בהצלחה. הערימה תוקנה ומאוזנת`,
    rootNode: createDummyRoot(A.filter(Boolean)),
    stepType: 'complete',
  });

  return steps;
};

/**
 * Generates arbitrary value deletion animations for Min-Heap or Max-Heap.
 */
export const generateHeapDeleteAnimations = (
  currentHeap: HeapNode[],
  valueToDelete: number,
  heapType: 'min' | 'max' = 'max'
): Step[] => {
  const steps: Step[] = [];
  const A: HeapNode[] = [null as any, ...cloneHeap(currentHeap.filter(Boolean))];
  const size = A.length - 1;

  // Find index of value to delete
  let targetIdx = -1;
  for (let idx = 1; idx <= size; idx++) {
    if (A[idx].value === valueToDelete) {
      targetIdx = idx;
      break;
    }
  }

  if (targetIdx === -1) {
    steps.push({
      id: `hp-delete-not-found`,
      message: `הערך ${valueToDelete} אינו נמצא בערימה`,
      rootNode: createDummyRoot(currentHeap),
      stepType: 'complete',
    });
    return steps;
  }

  const targetNode = A[targetIdx];

  // If deleting the last node, simply pop it
  if (targetIdx === size) {
    A.pop();
    steps.push({
      id: `hp-delete-last`,
      message: `הערך ${valueToDelete} נמצא בסוף המערך (אינדקס ${targetIdx}). מסירים אותו ישירות`,
      rootNode: createDummyRoot(A.filter(Boolean)),
      stepType: 'complete',
    });
    return steps;
  }

  const lastNode = A[size];

  steps.push({
    id: `hp-delete-swap-start`,
    message: `מחיקת ${valueToDelete} ממיקום ${targetIdx}: מחליפים אותו עם האיבר האחרון (${lastNode.value}) במקום ${size}`,
    rootNode: createDummyRoot(A.filter(Boolean)),
    highlightedNodeIds: [targetNode.id, lastNode.id],
    stepType: 'recolor',
  });

  // Swap target and last
  A[targetIdx] = lastNode;
  A[size] = targetNode;

  steps.push({
    id: `hp-delete-swap`,
    message: `ביצוע החלפה לצורך מחיקה`,
    rootNode: createDummyRoot(A.filter(Boolean)),
    highlightedNodeIds: [targetNode.id, lastNode.id],
    stepType: 'rotation',
  });

  A.pop();
  const heapSize = A.length - 1;

  steps.push({
    id: `hp-delete-remove`,
    message: `הסרת האיבר (${valueToDelete}) מהערימה. כעת נתקן את חוק הערימה ממיקום ${targetIdx} (ערך: ${lastNode.value})`,
    rootNode: createDummyRoot(A.filter(Boolean)),
    stepType: 'insert',
  });

  // Check if we need to bubble up or bubble down
  let i = targetIdx;
  let bubbledUp = false;

  while (i > 1) {
    const pIdx = parent(i);
    const parentNode = A[pIdx];
    const currentNode = A[i];

    const violates = heapType === 'max'
      ? parentNode.value < currentNode.value
      : parentNode.value > currentNode.value;

    if (violates) {
      A[pIdx] = currentNode;
      A[i] = parentNode;
      bubbledUp = true;

      steps.push({
        id: `hp-delete-bubbleup-${currentNode.id}-${parentNode.id}`,
        message: `תיקון כלפי מעלה (Bubble Up): החלפה בין ${currentNode.value} ל-${parentNode.value}`,
        rootNode: createDummyRoot(A.filter(Boolean)),
        highlightedNodeIds: [currentNode.id, parentNode.id],
        stepType: 'rotation',
      });

      i = pIdx;
    } else {
      break;
    }
  }

  // If it didn't bubble up, we try to heapify down
  if (!bubbledUp) {
    heapifyDown(A, targetIdx, heapSize, steps, heapType);
  }

  steps.push({
    id: `hp-delete-complete`,
    message: `מחיקת ${valueToDelete} הושלמה. הערימה מאוזנת ותקינה`,
    rootNode: createDummyRoot(A.filter(Boolean)),
    stepType: 'complete',
  });

  return steps;
};
