import type { Step } from '../../app/store';
import type { RBNode } from './types';
import {
  cloneTree,
  insertBST,
  isRed,
  rotateLeft,
  rotateRight,
  replaceSubtree,
  findPathToValue,
} from './rbtAlgorithms';

export const generateRbtInsertAnimations = (
  initialTree: RBNode | null,
  newValue: number
): Step[] => {
  const steps: Step[] = [];
  const clonedTree = cloneTree(initialTree);
  let currentTree = insertBST(clonedTree, newValue);

  const insertedPath = findPathToValue(currentTree, newValue);
  const insertedNode = insertedPath[insertedPath.length - 1];

  steps.push({
    id: `step-1-insert-${newValue}`,
    message: `הוספת צומת ${newValue} — מיקום נכון לפי כללי BST`,
    rootNode: cloneTree(currentTree),
    highlightedNodeIds: insertedNode ? [insertedNode.id] : undefined,
    stepType: 'insert',
  });

  let path = insertedPath;

  while (path.length >= 2 && path[path.length - 2].color === 'red') {
    const currentNode = path[path.length - 1];
    const parent = path[path.length - 2];
    const grandparent = path[path.length - 3];
    if (!grandparent) break;

    const uncle = grandparent.left?.id === parent.id ? grandparent.right : grandparent.left;
    const uncleIsRed = isRed(uncle);
    const parentIsLeft = grandparent.left?.id === parent.id;
    const currentIsRight = parent.right?.id === currentNode.id;
    const currentIsLeft = parent.left?.id === currentNode.id;

    if (uncleIsRed) {
      parent.color = 'black';
      if (uncle) uncle.color = 'black';
      grandparent.color = 'red';

      steps.push({
        id: `step-2-recolor-${parent.id}`,
        message: `תיקון צבעים case 1 — הורדת צבע הורה ועלם, העלאת צבע סב`,
        rootNode: cloneTree(currentTree),
        highlightedNodeIds: [parent.id, grandparent.id, ...(uncle ? [uncle.id] : [])],
        stepType: 'recolor',
      });

      path = findPathToValue(currentTree, newValue);
      continue;
    }

    let caseLabel = '';
    if (parentIsLeft && currentIsRight) {
      caseLabel = 'LR';
      const rotatedParent = rotateLeft(parent);
      currentTree = replaceSubtree(currentTree, parent.id, rotatedParent) as RBNode;
      steps.push({
        id: `step-3-case2-${parent.id}`,
        message: `מכין סיבוב LR — סיבוב הורה שמאלה כדי ליישר את המסלול`,
        rootNode: cloneTree(currentTree),
        highlightedNodeIds: [currentNode.id, parent.id, grandparent.id],
        stepType: 'rotation',
        rotationCase: caseLabel,
      });
      path = findPathToValue(currentTree, newValue);
      continue;
    }

    if (!parentIsLeft && currentIsLeft) {
      caseLabel = 'RL';
      const rotatedParent = rotateRight(parent);
      currentTree = replaceSubtree(currentTree, parent.id, rotatedParent) as RBNode;
      steps.push({
        id: `step-3-case2-${parent.id}`,
        message: `מכין סיבוב RL — סיבוב הורה ימינה כדי ליישר את המסלול`,
        rootNode: cloneTree(currentTree),
        highlightedNodeIds: [currentNode.id, parent.id, grandparent.id],
        stepType: 'rotation',
        rotationCase: caseLabel,
      });
      path = findPathToValue(currentTree, newValue);
      continue;
    }

    if (parentIsLeft) {
      caseLabel = 'LL';
      const rotatedGrandparent = rotateRight(grandparent);
      currentTree = replaceSubtree(currentTree, grandparent.id, rotatedGrandparent) as RBNode;
      parent.color = 'black';
      grandparent.color = 'red';
    } else {
      caseLabel = 'RR';
      const rotatedGrandparent = rotateLeft(grandparent);
      currentTree = replaceSubtree(currentTree, grandparent.id, rotatedGrandparent) as RBNode;
      parent.color = 'black';
      grandparent.color = 'red';
    }

    steps.push({
      id: `step-4-rotation-${caseLabel}-${grandparent.id}`,
      message: `סיבוב ${caseLabel} הושלם — שמירת צבעים מתאימים`,
      rootNode: cloneTree(currentTree),
      highlightedNodeIds: [parent.id, grandparent.id],
      stepType: 'rotation',
      rotationCase: caseLabel,
    });

    path = findPathToValue(currentTree, newValue);
  }

  if (currentTree) {
    currentTree.color = 'black';
  }

  steps.push({
    id: `step-5-complete-${newValue}`,
    message: `הכנסה הושלמה — השורש שחור והעץ מאוזן`,
    rootNode: cloneTree(currentTree),
    stepType: 'complete',
  });

  return steps;
};
