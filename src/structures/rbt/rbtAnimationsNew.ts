import type { Step } from '../../app/store';
import type { RBNode } from './types';
import {
  cloneTree,
  insertBST,
  isRed,
  rotateLeft,
  rotateRight,
  findPathToValue,
  findPathToId,
  attachRotatedSubtreeRbt,
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

  if (!insertedNode) {
    return steps;
  }

  let activeId = insertedNode.id;
  let path = findPathToId(currentTree, activeId);

  while (path.length >= 2) {
    const currentNode = path[path.length - 1];
    const parent = path[path.length - 2];
    
    // If the parent is not red, there is no violation, we are done
    if (parent.color !== 'red') {
      break;
    }

    const grandparent = path[path.length - 3];
    // If there is no grandparent, it means parent is the root.
    // The root will be colored black at the end of insertion anyway.
    if (!grandparent) {
      break;
    }

    const uncle = grandparent.left?.id === parent.id ? grandparent.right : grandparent.left;
    const uncleIsRed = isRed(uncle);
    const parentIsLeft = grandparent.left?.id === parent.id;
    const currentIsRight = parent.right?.id === currentNode.id;
    const currentIsLeft = parent.left?.id === currentNode.id;

    if (uncleIsRed) {
      // Case 1: Recolor
      parent.color = 'black';
      if (uncle) uncle.color = 'black';
      grandparent.color = 'red';

      steps.push({
        id: `step-2-recolor-${parent.id}`,
        message: `תיקון צבעים case 1 — צביעת הורה (${parent.value}) ועלם (${uncle?.value ?? ''}) לשחור, והעלאת צבע סב (${grandparent.value}) לאדום`,
        rootNode: cloneTree(currentTree),
        highlightedNodeIds: [parent.id, grandparent.id, ...(uncle ? [uncle.id] : [])],
        stepType: 'recolor',
      });

      // Move active node to grandparent and propagate up
      activeId = grandparent.id;
      path = findPathToId(currentTree, activeId);
      continue;
    }

    // Case 2: Double rotation preparation (LR / RL)
    if (parentIsLeft && currentIsRight) {
      const rotatedParent = rotateLeft(parent);
      currentTree = attachRotatedSubtreeRbt(currentTree, path, path.length - 2, rotatedParent);
      
      steps.push({
        id: `step-3-rotation-LR-${parent.id}`,
        message: `סיבוב LR חלק 1 — סיבוב שמאלה על הורה (${parent.value}) כדי ליישר את המסלול`,
        rootNode: cloneTree(currentTree),
        highlightedNodeIds: [currentNode.id, parent.id, grandparent.id],
        stepType: 'rotation',
        rotationCase: 'LR',
      });
      
      activeId = parent.id;
      path = findPathToId(currentTree, activeId);
      continue;
    }

    if (!parentIsLeft && currentIsLeft) {
      const rotatedParent = rotateRight(parent);
      currentTree = attachRotatedSubtreeRbt(currentTree, path, path.length - 2, rotatedParent);
      
      steps.push({
        id: `step-3-rotation-RL-${parent.id}`,
        message: `סיבוב RL חלק 1 — סיבוב ימינה על הורה (${parent.value}) כדי ליישר את המסלול`,
        rootNode: cloneTree(currentTree),
        highlightedNodeIds: [currentNode.id, parent.id, grandparent.id],
        stepType: 'rotation',
        rotationCase: 'RL',
      });
      
      activeId = parent.id;
      path = findPathToId(currentTree, activeId);
      continue;
    }

    // Case 3: Single rotation + recolor (LL / RR)
    let caseLabel = '';
    if (parentIsLeft) {
      caseLabel = 'LL';
      const rotatedGrandparent = rotateRight(grandparent);
      currentTree = attachRotatedSubtreeRbt(currentTree, path, path.length - 3, rotatedGrandparent);
      parent.color = 'black';
      grandparent.color = 'red';
    } else {
      caseLabel = 'RR';
      const rotatedGrandparent = rotateLeft(grandparent);
      currentTree = attachRotatedSubtreeRbt(currentTree, path, path.length - 3, rotatedGrandparent);
      parent.color = 'black';
      grandparent.color = 'red';
    }

    steps.push({
      id: `step-4-rotation-${caseLabel}-${grandparent.id}`,
      message: `סיבוב ${caseLabel} הושלם על סב (${grandparent.value}) — צביעת הורה (${parent.value}) לשחור וסב לאדום`,
      rootNode: cloneTree(currentTree),
      highlightedNodeIds: [parent.id, grandparent.id],
      stepType: 'rotation',
      rotationCase: caseLabel,
    });

    // Recalculate path to check final layout state
    path = findPathToId(currentTree, activeId);
  }

  // Ensure root is colored black
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
