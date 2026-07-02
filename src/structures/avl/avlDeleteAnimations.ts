import type { Step } from '../../app/store';
import type { AVLNode } from './types';
import {
  cloneTree,
  getBalanceFactor,
  rotateLeft,
  rotateRight,
} from './avlAlgorithms';

const attachRotatedSubtree = (
  root: AVLNode,
  path: AVLNode[],
  index: number,
  replacement: AVLNode | null
): AVLNode | null => {
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

export const generateAvlDeleteAnimations = (
  initialTree: AVLNode | null,
  valueToDelete: number
): Step[] => {
  const steps: Step[] = [];
  if (!initialTree) {
    steps.push({
      id: `avl-delete-empty`,
      message: `העץ ריק, אין מה למחוק`,
      rootNode: null,
      stepType: 'complete',
    });
    return steps;
  }

  const clonedTree = cloneTree(initialTree)!;
  
  // 1. Search phase to locate the node and build path
  const searchPath: AVLNode[] = [];
  let curr: AVLNode | null = clonedTree;
  let targetNode: AVLNode | null = null;

  while (curr) {
    searchPath.push(curr);
    steps.push({
      id: `avl-delete-search-${curr.id}`,
      message: `חיפוש ${valueToDelete}: משווים עם ${curr.value}`,
      rootNode: cloneTree(clonedTree),
      highlightedNodeIds: [curr.id],
      stepType: 'compare',
    });

    if (valueToDelete === curr.value) {
      targetNode = curr;
      break;
    } else if (valueToDelete < curr.value) {
      curr = curr.left;
    } else {
      curr = curr.right;
    }
  }

  if (!targetNode) {
    steps.push({
      id: `avl-delete-not-found`,
      message: `הערך ${valueToDelete} אינו קיים בעץ.`,
      rootNode: cloneTree(clonedTree),
      stepType: 'complete',
    });
    return steps;
  }

  steps.push({
    id: `avl-delete-found`,
    message: `הצומת ${valueToDelete} נמצא. מתחילים בתהליך המחיקה.`,
    rootNode: cloneTree(clonedTree),
    highlightedNodeIds: [targetNode.id],
    stepType: 'compare',
  });

  // Rebalance path starts from the node that is physically deleted's parent.
  // Let's copy searchPath into a rebalance path
  let rebalancePath = [...searchPath];
  let currentTree: AVLNode | null = clonedTree;

  // Case A: Node has at most one child
  if (!targetNode.left || !targetNode.right) {
    const child = targetNode.left ? targetNode.left : targetNode.right;
    const targetIdx = rebalancePath.findIndex(n => n.id === targetNode!.id);
    
    currentTree = attachRotatedSubtree(currentTree!, rebalancePath, targetIdx, child);
    
    // The node is removed. The rebalance path should contain all parents of targetNode.
    rebalancePath.splice(targetIdx); // remove targetNode and any children from rebalance path
    
    steps.push({
      id: `avl-delete-phys-${valueToDelete}`,
      message: `הסרת הצומת ${valueToDelete}. ${child ? `מציבים את הילד שלו (${child.value}) במקומו` : 'זהו עלה ולכן פשוט מסירים אותו'}.`,
      rootNode: cloneTree(currentTree),
      highlightedNodeIds: child ? [child.id] : [],
      stepType: 'complete',
    });
  } 
  // Case B: Node has two children
  else {
    // Find successor (smallest in the right subtree)
    const successorPath: AVLNode[] = [];
    let succ = targetNode.right;
    successorPath.push(succ);

    steps.push({
      id: `avl-delete-find-succ-start`,
      message: `לצומת ${valueToDelete} יש שני ילדים. מחפשים את העוקב לו (הקטן ביותר בתת-העץ הימני)`,
      rootNode: cloneTree(currentTree),
      highlightedNodeIds: [targetNode.id, succ.id],
      stepType: 'compare',
    });

    while (succ.left) {
      succ = succ.left;
      successorPath.push(succ);

      steps.push({
        id: `avl-delete-find-succ-${succ.id}`,
        message: `יורדים שמאלה: ${succ.value}`,
        rootNode: cloneTree(currentTree),
        highlightedNodeIds: [targetNode.id, succ.id],
        stepType: 'compare',
      });
    }

    steps.push({
      id: `avl-delete-found-succ-${succ.id}`,
      message: `העוקב נמצא: ${succ.value}. מחליפים את ערכי הצמתים ${valueToDelete} ו-${succ.value}`,
      rootNode: cloneTree(currentTree),
      highlightedNodeIds: [targetNode.id, succ.id],
      stepType: 'compare',
    });

    // Swap values
    const originalVal = targetNode.value;
    targetNode.value = succ.value;
    succ.value = originalVal;

    steps.push({
      id: `avl-delete-swapped-succ`,
      message: `החלפת הערכים הושלמה. כעת נמחק את הצומת שמכיל כעת את ${originalVal} (במקור העוקב)`,
      rootNode: cloneTree(currentTree),
      highlightedNodeIds: [targetNode.id, succ.id],
      stepType: 'swap',
    });

    // We physically delete 'succ'. It has at most one child (its right child, since it has no left child).
    // Build the rebalance path. It will consist of the path to 'targetNode', plus the path from targetNode's right child down to 'succParent'.
    const targetIdx = rebalancePath.findIndex(n => n.id === targetNode!.id);
    
    // Construct path to the physically removed node (succ)
    // succ is at the end of successorPath. The parent of succ is the second to last.
    const fullPathToSucc = [...rebalancePath.slice(0, targetIdx + 1), ...successorPath];
    const succIdxInFullPath = fullPathToSucc.length - 1;
    
    const succChild = succ.right;
    currentTree = attachRotatedSubtree(currentTree!, fullPathToSucc, succIdxInFullPath, succChild);
    
    // The rebalance path is everything in fullPathToSucc EXCEPT succ itself
    rebalancePath = fullPathToSucc.slice(0, succIdxInFullPath);

    steps.push({
      id: `avl-delete-phys-succ-${succ.id}`,
      message: `הסרת הצומת עם הערך ${originalVal}. ${succChild ? `מציבים את בנו הימני (${succChild.value}) במקומו` : 'זהו עלה ולכן פשוט מסירים אותו'}.`,
      rootNode: cloneTree(currentTree),
      highlightedNodeIds: succChild ? [succChild.id] : [],
      stepType: 'complete',
    });
  }

  // 2. Rebalancing phase (backtrack up the rebalance path)
  for (let i = rebalancePath.length - 1; i >= 0; i--) {
    const node = rebalancePath[i];
    
    // Fetch refreshed node references from cloning
    // Since we mutated children in attachRotatedSubtree, we should refresh node references
    // Update node height
    const leftHeight = node.left ? node.left.height : -1;
    const rightHeight = node.right ? node.right.height : -1;
    const newHeight = Math.max(leftHeight, rightHeight) + 1;
    node.height = newHeight;

    steps.push({
      id: `avl-delete-height-${node.id}-${i}`,
      message: `עדכון גובה במסלול חזרה בצומת ${node.value} — גובה חדש: ${newHeight}`,
      rootNode: cloneTree(currentTree),
      highlightedNodeIds: [node.id],
      stepType: 'height',
    });

    const bf = getBalanceFactor(node);
    if (Math.abs(bf) === 2) {
      const child = bf > 0 ? node.left! : node.right!;
      
      // Determine rotation case
      // In deletion, if child balance factor is 0, we can do single rotation
      const childBf = getBalanceFactor(child);
      let caseLabel = '';
      if (bf === 2) {
        caseLabel = childBf < 0 ? 'LR' : 'LL';
      } else {
        caseLabel = childBf > 0 ? 'RL' : 'RR';
      }

      const grandChild = bf > 0
        ? (childBf < 0 ? child.right : child.left)
        : (childBf > 0 ? child.left : child.right);

      const prepMessage = (caseLabel === 'LR' || caseLabel === 'RL')
        ? `אי-איזון בצומת ${node.value} (BF: ${bf}). מתכוננים לסיבוב כפול ${caseLabel} — צמתים משתתפים: הסב (${node.value}), האב (${child.value}) והנכד (${grandChild?.value})`
        : `אי-איזון בצומת ${node.value} (BF: ${bf}). מתכוננים לסיבוב יחיד ${caseLabel} — צמתים: ${node.value}, ${child.value}`;

      steps.push({
        id: `avl-delete-prepare-${caseLabel}-${node.id}`,
        message: prepMessage,
        rootNode: cloneTree(currentTree),
        highlightedNodeIds: [node.id, child.id, grandChild?.id].filter(Boolean) as string[],
        stepType: 'rotation',
        rotationCase: caseLabel,
      });

      let balancedSubtree = node;
      let skipGeneralCompletedStep = false;

      if (caseLabel === 'LL') {
        balancedSubtree = rotateRight(node);
        currentTree = attachRotatedSubtree(currentTree!, rebalancePath, i, balancedSubtree);
      }

      if (caseLabel === 'RR') {
        balancedSubtree = rotateLeft(node);
        currentTree = attachRotatedSubtree(currentTree!, rebalancePath, i, balancedSubtree);
      }

      if (caseLabel === 'LR') {
        skipGeneralCompletedStep = true;

        // Visual step pointing out who is about to swap
        steps.push({
          id: `avl-delete-swap-targets-${caseLabel}-${node.id}`,
          message: `לפי חוקי AVL בסיבוב LR: הנכד (${grandChild!.value}) והסב (${node.value}) עומדים להתחלף במיקומם`,
          rootNode: cloneTree(currentTree),
          highlightedNodeIds: [node.id, grandChild!.id],
          intenseHighlightId: grandChild!.id,
          stepType: 'rotation',
          rotationCase: caseLabel,
        });

        node.left = rotateLeft(node.left!);
        steps.push({
          id: `avl-delete-rotation-${caseLabel}-${node.id}`,
          message: `סיבוב LR חלק 1: סיבוב שמאל על הילד השמאלי (${child.value}) כהכנה להחלפה`,
          rootNode: cloneTree(currentTree),
          highlightedNodeIds: [node.id, grandChild!.id],
          stepType: 'rotation',
          rotationCase: caseLabel,
        });

        balancedSubtree = rotateRight(node);
        currentTree = attachRotatedSubtree(currentTree!, rebalancePath, i, balancedSubtree);

        steps.push({
          id: `avl-delete-rotation-complete-${caseLabel}-${node.id}`,
          message: `ההחלפה הושלמה: הנכד (${grandChild!.value}) והסב (${node.value}) התחלפו — הנכד הפך לשורש תת-העץ והסב הפך לבן שלו`,
          rootNode: cloneTree(currentTree),
          highlightedNodeIds: [balancedSubtree.id, node.id],
          stepType: 'rotation',
          rotationCase: caseLabel,
        });
      }

      if (caseLabel === 'RL') {
        skipGeneralCompletedStep = true;

        // Visual step pointing out who is about to swap
        steps.push({
          id: `avl-delete-swap-targets-${caseLabel}-${node.id}`,
          message: `לפי חוקי AVL בסיבוב RL: הנכד (${grandChild!.value}) והסב (${node.value}) עומדים להתחלף במיקומם`,
          rootNode: cloneTree(currentTree),
          highlightedNodeIds: [node.id, grandChild!.id],
          intenseHighlightId: grandChild!.id,
          stepType: 'rotation',
          rotationCase: caseLabel,
        });

        node.right = rotateRight(node.right!);
        steps.push({
          id: `avl-delete-rotation-${caseLabel}-${node.id}`,
          message: `סיבוב RL חלק 1: סיבוב ימין על הילד הימני (${child.value}) כהכנה להחלפה`,
          rootNode: cloneTree(currentTree),
          highlightedNodeIds: [node.id, grandChild!.id],
          stepType: 'rotation',
          rotationCase: caseLabel,
        });

        balancedSubtree = rotateLeft(node);
        currentTree = attachRotatedSubtree(currentTree!, rebalancePath, i, balancedSubtree);

        steps.push({
          id: `avl-delete-rotation-complete-${caseLabel}-${node.id}`,
          message: `ההחלפה הושלמה: הנכד (${grandChild!.value}) והסב (${node.value}) התחלפו — הנכד הפך לשורש תת-העץ והסב הפך לבן שלו`,
          rootNode: cloneTree(currentTree),
          highlightedNodeIds: [balancedSubtree.id, node.id],
          stepType: 'rotation',
          rotationCase: caseLabel,
        });
      }

      if (!skipGeneralCompletedStep) {
        steps.push({
          id: `avl-delete-rotation-complete-${caseLabel}-${node.id}`,
          message: `סיבוב ${caseLabel} הושלם — תת-העץ התאזן`,
          rootNode: cloneTree(currentTree),
          highlightedNodeIds: [balancedSubtree.id],
          stepType: 'rotation',
          rotationCase: caseLabel,
        });
      }

      // Re-evaluate path node pointers after rotations
      rebalancePath[i] = balancedSubtree;
    }
  }

  steps.push({
    id: `avl-delete-finished`,
    message: `תהליך מחיקת ${valueToDelete} והאיזון מחדש הושלם בהצלחה.`,
    rootNode: cloneTree(currentTree),
    stepType: 'complete',
  });

  return steps;
};
