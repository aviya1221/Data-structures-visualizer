import type { Step } from '../../app/store';
import type { AVLNode } from './types';
import {
  cloneTree,
  insertBST,
  getBalanceFactor,
  rotateLeft,
  rotateRight,
  replaceSubtree,
} from './avlAlgorithms';

export const generateAvlInsertAnimations = (
  initialTree: AVLNode | null,
  newValue: number
): Step[] => {
  const steps: Step[] = [];
  const path: AVLNode[] = [];
  const tree = cloneTree(initialTree);
  let currentTree = insertBST(tree, newValue, path);
  const insertedNode = path[path.length - 1] ?? currentTree;

  steps.push({
    id: `step-1-insert-${newValue}`,
    message: `הוספת צומת ${newValue} — מיקום נכון לפי כללי BST`,
    rootNode: cloneTree(currentTree),
    highlightedNodeIds: [insertedNode.id],
  });
  let imbalanceStepAdded = false;

  for (let i = path.length - 1; i >= 0; i -= 1) {
    const node = path[i];
    const leftHeight = node.left ? node.left.height : -1;
    const rightHeight = node.right ? node.right.height : -1;
    const newHeight = Math.max(leftHeight, rightHeight) + 1;
    node.height = newHeight;

    steps.push({
      id: `step-2-height-${node.id}`,
      message: `עדכון גובה בצומת ${node.value} — גובה חדש: ${newHeight}`,
      rootNode: cloneTree(currentTree),
      highlightedNodeIds: [node.id],
    });

    const bf = getBalanceFactor(node);
    if (!imbalanceStepAdded && Math.abs(bf) === 2) {
      imbalanceStepAdded = true;
      const child = bf > 0 ? node.left! : node.right!;
      const grandChild = bf > 0
        ? (getBalanceFactor(child) < 0 ? child.right : child.left)
        : (getBalanceFactor(child) > 0 ? child.left : child.right);
      const caseLabel = bf === 2
        ? (getBalanceFactor(child) < 0 ? 'LR' : 'LL')
        : (getBalanceFactor(child) > 0 ? 'RL' : 'RR');

      steps.push({
        id: `step-3-imbalance-${node.id}`,
        message: `חוסר איזון זוהה בצומת ${node.value} — גורם איזון: ${bf}`,
        rootNode: cloneTree(currentTree),
        intenseHighlightId: node.id,
      });

      steps.push({
        id: `step-4-rotation-${caseLabel}-${node.id}`,
        message: `מכין סיבוב ${caseLabel} — צמתים משתתפים: ${node.value}, ${child.value}${grandChild ? `, ${grandChild.value}` : ''}`,
        rootNode: cloneTree(currentTree),
        highlightedNodeIds: [node.id, child.id, grandChild?.id ?? ''].filter(Boolean) as string[],
      });

      let balancedSubtree = node;
      if (caseLabel === 'LL') balancedSubtree = rotateRight(node);
      if (caseLabel === 'RR') balancedSubtree = rotateLeft(node);
      if (caseLabel === 'LR') balancedSubtree = rotateRight({ ...node, left: rotateLeft(node.left!) });
      if (caseLabel === 'RL') balancedSubtree = rotateLeft({ ...node, right: rotateRight(node.right!) });

      currentTree = replaceSubtree(currentTree, node.id, balancedSubtree) as AVLNode;

      steps.push({
        id: `step-5-complete-${caseLabel}-${node.id}`,
        message: `סיבוב ${caseLabel} הושלם — העץ מאוזן`,
        rootNode: cloneTree(currentTree),
      });
      break;
    }
  }

  if (!imbalanceStepAdded) {
    steps.push({
      id: `step-3-balanced-${newValue}`,
      message: `העץ מאוזן, אין צורך ברוטציות.`,
      rootNode: cloneTree(currentTree),
    });
  }

  return steps;
};