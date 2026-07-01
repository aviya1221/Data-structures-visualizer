import type { Step } from '../../app/store';
import type { AVLNode } from './types';
import {
  cloneTree,
  insertBST,
  getBalanceFactor,
  rotateLeft,
  rotateRight,
} from './avlAlgorithms';

const attachRotatedSubtree = (
  root: AVLNode,
  path: AVLNode[],
  index: number,
  replacement: AVLNode
): AVLNode => {
  if (index === 0) {
    return replacement;
  }

  const parent = path[index - 1];
  const target = path[index];
  if (parent.left?.id === target.id) {
    parent.left = replacement;
  } else if (parent.right?.id === target.id) {
    parent.right = replacement;
  }

  return root;
};

export const generateAvlInsertAnimations = (
  initialTree: AVLNode | null,
  newValue: number
): Step[] => {
  const steps: Step[] = [];
  const path: AVLNode[] = [];
  const clonedTree = cloneTree(initialTree);
  let currentTree = insertBST(clonedTree, newValue, path);
  const insertedNode = path[path.length - 1] ?? currentTree;

  steps.push({
    id: `step-1-insert-${newValue}`,
    message: `הוספת צומת ${newValue} — מיקום נכון לפי כללי BST`,
    rootNode: cloneTree(currentTree),
    highlightedNodeIds: [insertedNode.id],
    stepType: 'insert',
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
      stepType: 'height',
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
        id: `step-4a-prepare-${caseLabel}-${node.id}`,
        message: `מתכונן לסיבוב ${caseLabel} — צמתים: ${node.value}, ${child.value}${grandChild ? `, ${grandChild.value}` : ''}`,
        rootNode: cloneTree(currentTree),
        highlightedNodeIds: [node.id, child.id, grandChild?.id].filter(Boolean) as string[],
        stepType: 'rotation',
        rotationCase: caseLabel,
      });

      // Perform rotations in-place (preserve original node ids and objects)
      let balancedSubtree = node;
      const participantIds = [node.id, child.id, grandChild?.id].filter(Boolean) as string[];

      if (caseLabel === 'LL') {
        balancedSubtree = rotateRight(node);
        currentTree = attachRotatedSubtree(currentTree, path, i, balancedSubtree);
      }

      if (caseLabel === 'RR') {
        balancedSubtree = rotateLeft(node);
        currentTree = attachRotatedSubtree(currentTree, path, i, balancedSubtree);
      }

      if (caseLabel === 'LR') {
        node.left = rotateLeft(node.left!);
        steps.push({
          id: `step-4b-rotation-${caseLabel}-${node.id}`,
          message: `סיבוב LR חלק 1: סיבוב שמאל על הילד השמאלי (${child.value})`,
          rootNode: cloneTree(currentTree),
          highlightedNodeIds: [node.id, child.id, grandChild?.id].filter(Boolean) as string[],
          stepType: 'rotation',
          rotationCase: caseLabel,
        });

        balancedSubtree = rotateRight(node);
        currentTree = attachRotatedSubtree(currentTree, path, i, balancedSubtree);
      }

      if (caseLabel === 'RL') {
        node.right = rotateRight(node.right!);
        steps.push({
          id: `step-4b-rotation-${caseLabel}-${node.id}`,
          message: `סיבוב RL חלק 1: סיבוב ימין על הילד הימני (${child.value})`,
          rootNode: cloneTree(currentTree),
          highlightedNodeIds: [node.id, child.id, grandChild?.id].filter(Boolean) as string[],
          stepType: 'rotation',
          rotationCase: caseLabel,
        });

        balancedSubtree = rotateLeft(node);
        currentTree = attachRotatedSubtree(currentTree, path, i, balancedSubtree);
      }

      steps.push({
        id: `step-4c-rotation-${caseLabel}-${node.id}`,
        message: `סיבוב ${caseLabel} הושלם — העץ משנה צורה וגלש למיקום החדש`,
        rootNode: cloneTree(currentTree),
        highlightedNodeIds: participantIds,
        stepType: 'rotation',
        rotationCase: caseLabel,
      });

      currentTree = currentTree;

      steps.push({
        id: `step-5-complete-${caseLabel}-${node.id}`,
        message: `סיבוב ${caseLabel} הושלם — העץ מאוזן`,
        rootNode: cloneTree(currentTree),
        stepType: 'complete',
      });
      break;
    }
  }

  if (!imbalanceStepAdded) {
    steps.push({
      id: `step-3-balanced-${newValue}`,
      message: `העץ מאוזן, אין צורך ברוטציות.`,
      rootNode: cloneTree(currentTree),
      stepType: 'balanced',
    });
  }

  return steps;
};
