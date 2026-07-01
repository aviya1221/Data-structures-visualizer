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

/**
 * Generates insertion animation steps for a Binomial Heap.
 */
export const generateBinomialInsertAnimations = (
  currentHeap: BinomialTreeNode[],
  newValue: number
): Step[] => {
  const steps: Step[] = [];
  
  // Clone current heap forest
  let heap = cloneBinomialHeap(currentHeap);

  // 1. Create a B0 tree for newValue
  const newTreeId = generateBinomialNodeId();
  const newTree: BinomialTreeNode = {
    id: newTreeId,
    value: newValue,
    children: [],
    order: 0,
  };

  steps.push({
    id: `bn-insert-start-${newValue}`,
    message: `הוספת ערך ${newValue} כעץ בינומי חדש מסדר 0 (B₀)`,
    rootNode: createDummyRoot([...heap, newTree]),
    highlightedNodeIds: [newTreeId],
    stepType: 'insert',
  });

  // 2. Perform Heap Union (forest addition)
  // Merge the two heaps sorted by order
  let mergedForest: BinomialTreeNode[] = [...heap, newTree].sort((a, b) => a.order - b.order);
  
  let i = 0;
  while (i < mergedForest.length - 1) {
    const t1 = mergedForest[i];
    const t2 = mergedForest[i + 1];

    if (t1.order === t2.order) {
      // Check if there is a third tree of the same order (carry propagation case)
      const t3 = (i + 2 < mergedForest.length) ? mergedForest[i + 2] : null;
      
      if (t3 && t3.order === t1.order) {
        // If we have three trees of same order (e.g. order k, k, k),
        // we leave the first one and merge the next two.
        i++;
        continue;
      }

      // Merge t1 and t2
      const smaller = t1.value < t2.value ? t1 : t2;
      const larger = t1.value < t2.value ? t2 : t1;

      steps.push({
        id: `bn-merge-prepare-${t1.id}-${t2.id}`,
        message: `נמצאו שני עצים מסדר ${t1.order}. מכין מיזוג ביניהם. השורש הגדול (${larger.value}) יוכפף תחת השורש הקטן (${smaller.value}) לשמירת תכונת Min-Heap`,
        rootNode: createDummyRoot(cloneBinomialHeap(mergedForest)),
        highlightedNodeIds: [t1.id, t2.id],
        stepType: 'recolor',
      });

      // Perform merge
      const mergedTree = mergeBinomialTrees(t1, t2);

      // Remove the two old trees and insert the merged tree
      mergedForest.splice(i, 2, mergedTree);

      steps.push({
        id: `bn-merge-complete-${mergedTree.id}`,
        message: `הושלם מיזוג של שני עצי B${mergedTree.order - 1} לעץ B${mergedTree.order} אחד בעל שורש ${mergedTree.value}`,
        rootNode: createDummyRoot(cloneBinomialHeap(mergedForest)),
        highlightedNodeIds: [mergedTree.id],
        stepType: 'rotation',
      });

      // Re-sort to maintain ascending order of degrees
      mergedForest.sort((a, b) => a.order - b.order);
      // Restart verification index to process any cascading order conflicts
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
 * Generates deletion / extraction of minimum (extract-min) steps for Binomial Heap.
 */
export const generateBinomialExtractMinAnimations = (
  currentHeap: BinomialTreeNode[]
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

  // 1. Find the tree with the minimum root value
  let minTreeIdx = 0;
  for (let i = 1; i < heap.length; i++) {
    if (heap[i].value < heap[minTreeIdx].value) {
      minTreeIdx = i;
    }
  }

  const minTree = heap[minTreeIdx];

  steps.push({
    id: `bn-extract-start-${minTree.id}`,
    message: `זיהוי השורש המינימלי בערימה: ${minTree.value} בעץ מסדר ${minTree.order}`,
    rootNode: createDummyRoot(cloneBinomialHeap(heap)),
    highlightedNodeIds: [minTree.id],
    stepType: 'recolor',
  });

  // 2. Remove the minTree from the forest
  heap.splice(minTreeIdx, 1);

  steps.push({
    id: `bn-extract-remove-${minTree.id}`,
    message: `הסרת השורש המינימלי (${minTree.value}). ילדיו של השורש יוצרים ערימה בינומית חדשה מסודרת לפי דרגות עולות`,
    rootNode: createDummyRoot(cloneBinomialHeap(heap)),
    stepType: 'insert',
  });

  // 3. The children of the removed root form a new binomial heap, ordered in ascending order of degree.
  // In the tree, children are stored descending of order, so we reverse them.
  const childrenHeap = [...minTree.children].reverse();

  // Highlight union of the remaining heap and the children heap
  steps.push({
    id: `bn-union-start`,
    message: `ביצוע איחוד (Union) בין הערימה המקורית לבין ערימת הילדים החדשה`,
    rootNode: createDummyRoot([...heap, ...childrenHeap]),
    stepType: 'insert',
  });

  // Perform standard Union logic
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

      const smaller = t1.value < t2.value ? t1 : t2;
      const larger = t1.value < t2.value ? t2 : t1;

      steps.push({
        id: `bn-union-merge-prepare-${t1.id}-${t2.id}`,
        message: `מיזוג עצי דרגה ${t1.order} במהלך האיחוד: הורה ${smaller.value}, ילד ${larger.value}`,
        rootNode: createDummyRoot(cloneBinomialHeap(mergedForest)),
        highlightedNodeIds: [t1.id, t2.id],
        stepType: 'recolor',
      });

      const mergedTree = mergeBinomialTrees(t1, t2);
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
    message: `הפקת המינימום והאיחוד מחדש הושלמו בהצלחה`,
    rootNode: createDummyRoot(cloneBinomialHeap(mergedForest)),
    stepType: 'complete',
  });

  return steps;
};
