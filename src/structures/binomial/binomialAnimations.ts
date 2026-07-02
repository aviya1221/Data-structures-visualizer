import type { Step } from '../../app/store';
import {
  type BinomialTreeNode,
  generateBinomialNodeId,
  cloneBinomialHeap,
  mergeBinomialTrees,
} from './binomialAlgorithms';

// Helper to wrap the binomial heap forest array inside a dummy TreeNode
const createDummyRoot = (binomialTrees: BinomialTreeNode[]): any => {
  return {
    id: 'binomial-root',
    value: 0,
    left: null,
    right: null,
    binomialTrees,
  };
};

// Helper to recursively find a node by value in the forest
const findNodeByVal = (nodes: BinomialTreeNode[], val: number): BinomialTreeNode | null => {
  for (const node of nodes) {
    if (node.value === val) return node;
    const found = findNodeByVal(node.children, val);
    if (found) return found;
  }
  return null;
};

// Helper to find the path of ancestor nodes from a node ID up to the root of its tree
const findAncestorPath = (
  current: BinomialTreeNode,
  targetId: string,
  path: BinomialTreeNode[] = []
): boolean => {
  path.push(current);
  if (current.id === targetId) return true;
  for (const child of current.children) {
    if (findAncestorPath(child, targetId, path)) {
      return true;
    }
  }
  path.pop();
  return false;
};

/**
 * Generates insertion animation steps for a Min/Max Binomial Heap.
 */
export const generateBinomialInsertAnimations = (
  currentHeap: BinomialTreeNode[],
  newValue: number,
  heapType: 'min' | 'max' = 'min'
): Step[] => {
  const steps: Step[] = [];
  let heap = cloneBinomialHeap(currentHeap);

  const newTreeId = generateBinomialNodeId();
  const newTree: BinomialTreeNode = {
    id: newTreeId,
    value: newValue,
    children: [],
    order: 0,
  };

  steps.push({
    id: `bn-insert-start-${newValue}`,
    message: `הוספת ערך ${newValue} כעץ בינומי חדש מסדר 0 (B₀) — סוג: ${heapType === 'min' ? 'מינימום' : 'מקסימום'}`,
    rootNode: createDummyRoot([...heap, newTree]),
    highlightedNodeIds: [newTreeId],
    stepType: 'insert',
  });

  let mergedForest: BinomialTreeNode[] = [...heap, newTree].sort((a, b) => a.order - b.order);
  
  let i = 0;
  while (i < mergedForest.length - 1) {
    const t1 = mergedForest[i];
    const t2 = mergedForest[i + 1];

    if (t1.order === t2.order) {
      const t3 = (i + 2 < mergedForest.length) ? mergedForest[i + 2] : null;
      if (t3 && t3.order === t1.order) {
        i++;
        continue;
      }

      const t1IsParent = heapType === 'min' ? t1.value < t2.value : t1.value > t2.value;
      const smaller = t1IsParent ? t1 : t2;
      const larger = t1IsParent ? t2 : t1;

      steps.push({
        id: `bn-merge-prepare-${t1.id}-${t2.id}`,
        message: `נמצאו שני עצים מסדר ${t1.order}. שורש ${larger.value} יוכפף תחת שורש ${smaller.value} לשמירת תכונת ${heapType === 'min' ? 'Min-Heap' : 'Max-Heap'}`,
        rootNode: createDummyRoot(cloneBinomialHeap(mergedForest)),
        highlightedNodeIds: [t1.id, t2.id],
        stepType: 'recolor',
      });

      const mergedTree = mergeBinomialTrees(t1, t2, heapType);
      mergedForest.splice(i, 2, mergedTree);

      steps.push({
        id: `bn-merge-complete-${mergedTree.id}`,
        message: `מיזוג עצי B${mergedTree.order - 1} לעץ B${mergedTree.order} אחד הושלם`,
        rootNode: createDummyRoot(cloneBinomialHeap(mergedForest)),
        highlightedNodeIds: [mergedTree.id],
        stepType: 'rotation',
      });

      mergedForest.sort((a, b) => a.order - b.order);
      i = 0;
    } else {
      i++;
    }
  }

  steps.push({
    id: `bn-insert-complete-${newValue}`,
    message: `הוספת ערך ${newValue} לערימה הבינומית הושלמה בהצלחה`,
    rootNode: createDummyRoot(cloneBinomialHeap(mergedForest)),
    stepType: 'complete',
  });

  return steps;
};

/**
 * Generates deletion / extraction of the root (min/max) steps for Binomial Heap.
 */
export const generateBinomialExtractAnimations = (
  currentHeap: BinomialTreeNode[],
  heapType: 'min' | 'max' = 'min'
): Step[] => {
  const steps: Step[] = [];
  let heap = cloneBinomialHeap(currentHeap);

  if (heap.length === 0) {
    steps.push({
      id: `bn-extract-empty`,
      message: `הערימה הבינומית ריקה. אין מה למחוק`,
      rootNode: createDummyRoot([]),
      stepType: 'complete',
    });
    return steps;
  }

  // Find root node to extract (min or max)
  let targetTreeIdx = 0;
  for (let i = 1; i < heap.length; i++) {
    const isBetter = heapType === 'min'
      ? heap[i].value < heap[targetTreeIdx].value
      : heap[i].value > heap[targetTreeIdx].value;
    if (isBetter) {
      targetTreeIdx = i;
    }
  }

  const targetTree = heap[targetTreeIdx];

  steps.push({
    id: `bn-extract-start-${targetTree.id}`,
    message: `זיהוי השורש ה${heapType === 'min' ? 'מינימלי' : 'מקסימלי'} בערימה: ${targetTree.value} בעץ מסדר ${targetTree.order}`,
    rootNode: createDummyRoot(cloneBinomialHeap(heap)),
    highlightedNodeIds: [targetTree.id],
    stepType: 'recolor',
  });

  // Remove the targetTree from the forest
  heap.splice(targetTreeIdx, 1);

  steps.push({
    id: `bn-extract-remove-${targetTree.id}`,
    message: `הסרת השורש (${targetTree.value}). ילדיו יוצרים ערימה בינומית חדשה מסודרת לפי דרגות עולות`,
    rootNode: createDummyRoot(cloneBinomialHeap(heap)),
    stepType: 'insert',
  });

  const childrenHeap = [...targetTree.children].reverse();

  steps.push({
    id: `bn-union-start`,
    message: `ביצוע איחוד (Union) בין הערימה המקורית לבין ערימת הילדים החדשה`,
    rootNode: createDummyRoot([...heap, ...childrenHeap]),
    stepType: 'insert',
  });

  let mergedForest = [...heap, ...childrenHeap].sort((a, b) => a.order - b.order);
  
  let i = 0;
  while (i < mergedForest.length - 1) {
    const t1 = mergedForest[i];
    const t2 = mergedForest[i + 1];

    if (t1.order === t2.order) {
      const t3 = (i + 2 < mergedForest.length) ? mergedForest[i + 2] : null;
      if (t3 && t3.order === t1.order) {
        i++;
        continue;
      }

      const t1IsParent = heapType === 'min' ? t1.value < t2.value : t1.value > t2.value;
      const smaller = t1IsParent ? t1 : t2;
      const larger = t1IsParent ? t2 : t1;

      steps.push({
        id: `bn-union-merge-prepare-${t1.id}-${t2.id}`,
        message: `מיזוג עצי דרגה ${t1.order}: שורש ${smaller.value} הופך לאב של ${larger.value}`,
        rootNode: createDummyRoot(cloneBinomialHeap(mergedForest)),
        highlightedNodeIds: [t1.id, t2.id],
        stepType: 'recolor',
      });

      const mergedTree = mergeBinomialTrees(t1, t2, heapType);
      mergedForest.splice(i, 2, mergedTree);

      steps.push({
        id: `bn-union-merge-complete-${mergedTree.id}`,
        message: `מיזוג עצי B${mergedTree.order - 1} לעץ B${mergedTree.order} אחד הושלם`,
        rootNode: createDummyRoot(cloneBinomialHeap(mergedForest)),
        highlightedNodeIds: [mergedTree.id],
        stepType: 'rotation',
      });

      mergedForest.sort((a, b) => a.order - b.order);
      i = 0;
    } else {
      i++;
    }
  }

  steps.push({
    id: `bn-extract-complete`,
    message: `תהליך הפקת השורש והאיחוד מחדש הושלם בהצלחה`,
    rootNode: createDummyRoot(cloneBinomialHeap(mergedForest)),
    stepType: 'complete',
  });

  return steps;
};

/**
 * Generates arbitrary value deletion animations for Min/Max Binomial Heap.
 */
export const generateBinomialDeleteAnimations = (
  currentHeap: BinomialTreeNode[],
  valueToDelete: number,
  heapType: 'min' | 'max' = 'min'
): Step[] => {
  const steps: Step[] = [];
  let heap = cloneBinomialHeap(currentHeap);

  // 1. Find the target node
  const targetNode = findNodeByVal(heap, valueToDelete);
  if (!targetNode) {
    steps.push({
      id: `bn-delete-not-found`,
      message: `הערך ${valueToDelete} אינו נמצא בערימה`,
      rootNode: createDummyRoot(cloneBinomialHeap(heap)),
      stepType: 'complete',
    });
    return steps;
  }

  steps.push({
    id: `bn-delete-found`,
    message: `הצומת המכיל את ${valueToDelete} נמצא. נבעבע אותו לשורש העץ שלו ע"י החלפות ערכים עם ההורים`,
    rootNode: createDummyRoot(cloneBinomialHeap(heap)),
    highlightedNodeIds: [targetNode.id],
    stepType: 'recolor',
  });

  // 2. Find the path from root of its tree to targetNode
  // First, identify which binomial tree contains the targetNode
  let containingTreeIdx = -1;
  let ancestorPath: BinomialTreeNode[] = [];

  for (let idx = 0; idx < heap.length; idx++) {
    const path: BinomialTreeNode[] = [];
    if (findAncestorPath(heap[idx], targetNode.id, path)) {
      containingTreeIdx = idx;
      ancestorPath = path;
      break;
    }
  }

  // 3. Bubble up to the root of its tree (by swapping values with parents)
  // ancestorPath contains [root, child, ..., targetNode]
  let currIdx = ancestorPath.length - 1;
  while (currIdx > 0) {
    const parentNode = ancestorPath[currIdx - 1];
    const currentNode = ancestorPath[currIdx];

    steps.push({
      id: `bn-delete-bubble-compare-${currentNode.id}-${parentNode.id}`,
      message: `בעבוע למעלה: משווים בין ${currentNode.value} להורה שלו ${parentNode.value}`,
      rootNode: createDummyRoot(cloneBinomialHeap(heap)),
      highlightedNodeIds: [currentNode.id, parentNode.id],
      stepType: 'recolor',
    });

    // Swap values
    const tempVal = parentNode.value;
    parentNode.value = currentNode.value;
    currentNode.value = tempVal;

    // Update ancestorPath array values to track the swapped state
    // The node object reference is mutated, so the heap tree is updated
    steps.push({
      id: `bn-delete-bubble-swap-${currentNode.id}-${parentNode.id}`,
      message: `מבצעים החלפת ערכים. הערך ${valueToDelete} עולה למעלה`,
      rootNode: createDummyRoot(cloneBinomialHeap(heap)),
      highlightedNodeIds: [currentNode.id, parentNode.id],
      stepType: 'rotation',
    });

    currIdx--;
  }

  // 4. Now the value to delete is at the root of the tree at containingTreeIdx
  const rootTree = heap[containingTreeIdx];
  steps.push({
    id: `bn-delete-at-root`,
    message: `הערך ${valueToDelete} הגיע לשורש העץ שלו. כעת מסירים את השורש וממזגים את ילדיו`,
    rootNode: createDummyRoot(cloneBinomialHeap(heap)),
    highlightedNodeIds: [rootTree.id],
    stepType: 'recolor',
  });

  // Extract the root tree
  heap.splice(containingTreeIdx, 1);
  const childrenHeap = [...rootTree.children].reverse();

  steps.push({
    id: `bn-delete-union`,
    message: `איחוד ילדי העץ שהוסר עם שאר היער`,
    rootNode: createDummyRoot([...heap, ...childrenHeap]),
    stepType: 'insert',
  });

  let mergedForest = [...heap, ...childrenHeap].sort((a, b) => a.order - b.order);
  
  let uIdx = 0;
  while (uIdx < mergedForest.length - 1) {
    const t1 = mergedForest[uIdx];
    const t2 = mergedForest[uIdx + 1];

    if (t1.order === t2.order) {
      const t3 = (uIdx + 2 < mergedForest.length) ? mergedForest[uIdx + 2] : null;
      if (t3 && t3.order === t1.order) {
        uIdx++;
        continue;
      }

      const t1IsParent = heapType === 'min' ? t1.value < t2.value : t1.value > t2.value;
      const smaller = t1IsParent ? t1 : t2;
      const larger = t1IsParent ? t2 : t1;

      steps.push({
        id: `bn-delete-union-merge-prepare-${t1.id}-${t2.id}`,
        message: `מיזוג עצי דרגה ${t1.order}: שורש ${smaller.value} הופך לאב של ${larger.value}`,
        rootNode: createDummyRoot(cloneBinomialHeap(mergedForest)),
        highlightedNodeIds: [t1.id, t2.id],
        stepType: 'recolor',
      });

      const mergedTree = mergeBinomialTrees(t1, t2, heapType);
      mergedForest.splice(uIdx, 2, mergedTree);

      steps.push({
        id: `bn-delete-union-merge-complete-${mergedTree.id}`,
        message: `מיזוג עצי B${mergedTree.order - 1} לעץ B${mergedTree.order} אחד הושלם`,
        rootNode: createDummyRoot(cloneBinomialHeap(mergedForest)),
        highlightedNodeIds: [mergedTree.id],
        stepType: 'rotation',
      });

      mergedForest.sort((a, b) => a.order - b.order);
      uIdx = 0;
    } else {
      uIdx++;
    }
  }

  steps.push({
    id: `bn-delete-complete`,
    message: `מחיקת ${valueToDelete} הושלמה בהצלחה. הערימה מאוזנת ותקינה`,
    rootNode: createDummyRoot(cloneBinomialHeap(mergedForest)),
    stepType: 'complete',
  });

  return steps;
};
