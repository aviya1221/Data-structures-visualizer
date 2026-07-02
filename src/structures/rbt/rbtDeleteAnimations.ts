import type { Step } from '../../app/store';
import type { RBNode } from './types';
import {
  cloneTree,
  rotateLeft,
  rotateRight,
  attachRotatedSubtreeRbt,
} from './rbtAlgorithms';

const getParentOfId = (root: RBNode | null, id: string): RBNode | null => {
  if (!root) return null;
  if (root.left?.id === id || root.right?.id === id) return root;
  const left = getParentOfId(root.left, id);
  if (left) return left;
  return getParentOfId(root.right, id);
};

// Rebuild path to root for replacement node
const findPathToId = (root: RBNode | null, id: string): RBNode[] => {
  const path: RBNode[] = [];
  const traverse = (current: RBNode | null): boolean => {
    if (!current) return false;
    path.push(current);
    if (current.id === id) return true;
    if (traverse(current.left) || traverse(current.right)) {
      return true;
    }
    path.pop();
    return false;
  };
  traverse(root);
  return path;
};

export const generateRbtDeleteAnimations = (
  initialTree: RBNode | null,
  valueToDelete: number
): Step[] => {
  const steps: Step[] = [];
  if (!initialTree) {
    steps.push({
      id: `rbt-delete-empty`,
      message: `העץ ריק, אין מה למחוק`,
      rootNode: null,
      stepType: 'complete',
    });
    return steps;
  }

  let currentTree = cloneTree(initialTree)!;

  // 1. Search phase
  const searchPath: RBNode[] = [];
  let curr: RBNode | null = currentTree;
  let targetNode: RBNode | null = null;

  while (curr) {
    searchPath.push(curr);
    steps.push({
      id: `rbt-delete-search-${curr.id}`,
      message: `חיפוש ${valueToDelete}: משווים עם ${curr.value}`,
      rootNode: cloneTree(currentTree),
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
      id: `rbt-delete-not-found`,
      message: `הערך ${valueToDelete} אינו קיים בעץ.`,
      rootNode: cloneTree(currentTree),
      stepType: 'complete',
    });
    return steps;
  }

  steps.push({
    id: `rbt-delete-found`,
    message: `הצומת ${valueToDelete} נמצא. צבעו: ${targetNode.color === 'red' ? 'אדום' : 'שחור'}. מתחילים מחיקה.`,
    rootNode: cloneTree(currentTree),
    highlightedNodeIds: [targetNode.id],
    stepType: 'compare',
  });

  // Track physical deleted node information
  let physicallyDeletedColor: 'red' | 'black' = 'red';
  let replacementId = ''; // holds ID of node that replaced the deleted one
  let parentIdOfDeleted = '';

  // Case A: At most one child
  if (!targetNode.left || !targetNode.right) {
    const child = targetNode.left ? targetNode.left : targetNode.right;
    physicallyDeletedColor = targetNode.color;
    parentIdOfDeleted = getParentOfId(currentTree, targetNode.id)?.id ?? '';

    const targetIdx = searchPath.findIndex(n => n.id === targetNode!.id);
    const parentNode = targetIdx > 0 ? searchPath[targetIdx - 1] : null;

    if (parentNode) {
      if (parentNode.left?.id === targetNode.id) parentNode.left = child;
      else parentNode.right = child;
    } else {
      currentTree = child!;
    }

    replacementId = child ? child.id : 'NIL';
    steps.push({
      id: `rbt-delete-phys-${valueToDelete}`,
      message: `הסרת הצומת ${valueToDelete}. ${child ? `מציבים את הילד היחיד שלו (${child.value}) במקומו` : 'זהו עלה ולכן פשוט מסירים אותו'}.`,
      rootNode: cloneTree(currentTree),
      highlightedNodeIds: child ? [child.id] : [],
      stepType: 'complete',
    });
  } 
  // Case B: Two children
  else {
    // Find successor (smallest in the right subtree)
    let succ = targetNode.right;
    const successorPath: RBNode[] = [];
    successorPath.push(succ);

    while (succ.left) {
      succ = succ.left;
      successorPath.push(succ);
    }

    steps.push({
      id: `rbt-delete-find-succ`,
      message: `לצומת ${valueToDelete} יש שני ילדים. מחליפים ערך עם העוקב שלו: ${succ.value}`,
      rootNode: cloneTree(currentTree),
      highlightedNodeIds: [targetNode.id, succ.id],
      stepType: 'compare',
    });

    const succVal = succ.value;
    succ.value = targetNode.value;
    targetNode.value = succVal;

    steps.push({
      id: `rbt-delete-swapped-succ`,
      message: `הערכים הוחלפו. כעת נמחק את הצומת שמכיל את הערך המקורי ${valueToDelete} (במקור העוקב)`,
      rootNode: cloneTree(currentTree),
      highlightedNodeIds: [targetNode.id, succ.id],
      stepType: 'swap',
    });

    // Physically delete successor
    physicallyDeletedColor = succ.color;
    parentIdOfDeleted = getParentOfId(currentTree, succ.id)?.id ?? '';
    const succChild = succ.right; // successor can only have a right child

    const targetIdx = searchPath.findIndex(n => n.id === targetNode!.id);
    const fullPathToSucc = [...searchPath.slice(0, targetIdx + 1), ...successorPath];
    const succParentNode = fullPathToSucc[fullPathToSucc.length - 2];

    if (succParentNode.left?.id === succ.id) succParentNode.left = succChild;
    else succParentNode.right = succChild;

    replacementId = succChild ? succChild.id : 'NIL';
    steps.push({
      id: `rbt-delete-phys-succ`,
      message: `הסרת הצומת המכיל את ${valueToDelete}. ${succChild ? `מציבים את הילד הימני שלו (${succChild.value}) במקומו` : 'זהו עלה ולכן פשוט מסירים אותו'}.`,
      rootNode: cloneTree(currentTree),
      highlightedNodeIds: succChild ? [succChild.id] : [],
      stepType: 'complete',
    });
  }

  // 3. RBT Rebalance phase (if deleted node was black)
  if (currentTree && physicallyDeletedColor === 'black') {
    // If the replacement node is Red, simply recolor it black and we are done!
    const replacementNode = replacementId !== 'NIL' ? findPathToId(currentTree, replacementId).pop() ?? null : null;
    if (replacementNode && replacementNode.color === 'red') {
      replacementNode.color = 'black';
      steps.push({
        id: `rbt-delete-recolor-red-replacement`,
        message: `צומת ההחלפה (${replacementNode.value}) היה אדום. צובעים אותו בשחור כדי להחזיר את האיזון הנדרש בערימה שחורה.`,
        rootNode: cloneTree(currentTree),
        highlightedNodeIds: [replacementNode.id],
        stepType: 'recolor',
      });
    } 
    // Double Black (DB) case - sibling rebalancing
    else {
      let xId = replacementId;
      let xParentId = parentIdOfDeleted;

      while (xId !== currentTree.id && xParentId) {
        const path = findPathToId(currentTree, xParentId);
        const xParent = path[path.length - 1] ?? null;
        if (!xParent) break;

        const isLeftChild = xParent.left?.id === xId || (xId === 'NIL' && xParent.left === null);
        let sibling = isLeftChild ? xParent.right : xParent.left;

        // Double Black representation log
        steps.push({
          id: `rbt-delete-db-step-${xId}`,
          message: `נתקבל צומת Double Black (צומת ${xId}). בודקים את אחיו: ${sibling ? sibling.value : 'NIL'} (אב: ${xParent.value})`,
          rootNode: cloneTree(currentTree),
          highlightedNodeIds: [xParent.id, sibling?.id].filter(Boolean) as string[],
          stepType: 'compare',
        });

        if (!sibling) {
          // Sibling is NIL (implicitly black NIL). Move DB up to parent
          xId = xParent.id;
          xParentId = getParentOfId(currentTree, xParent.id)?.id ?? '';
          continue;
        }

        // Case 1: Sibling is Red
        if (sibling.color === 'red') {
          sibling.color = 'black';
          xParent.color = 'red';
          
          steps.push({
            id: `rbt-delete-db-case1-recolor-${sibling.id}`,
            message: `מקרה 1: האח של ה-Double Black אדום. צובעים אח בשחור, אב באדום ומבצעים רוטציה`,
            rootNode: cloneTree(currentTree),
            highlightedNodeIds: [xParent.id, sibling.id],
            stepType: 'recolor',
          });

          const balanced = isLeftChild ? rotateLeft(xParent) : rotateRight(xParent);
          const parentIdxInPath = path.length - 1;
          currentTree = attachRotatedSubtreeRbt(currentTree, path, parentIdxInPath, balanced);

          // Update parent and sibling
          sibling = isLeftChild ? xParent.right : xParent.left;
          steps.push({
            id: `rbt-delete-db-case1-rotated`,
            message: `המבנה לאחר רוטציה במקרה 1. כעת ממשיכים לבחון את המצב החדש`,
            rootNode: cloneTree(currentTree),
            stepType: 'rotation',
          });
        }

        if (!sibling) {
          xId = xParent.id;
          xParentId = getParentOfId(currentTree, xParent.id)?.id ?? '';
          continue;
        }

        // Sibling is Black
        const sibLeftRed = sibling.left && sibling.left.color === 'red';
        const sibRightRed = sibling.right && sibling.right.color === 'red';

        // Case 2: Sibling is Black and both its children are Black
        if (!sibLeftRed && !sibRightRed) {
          sibling.color = 'red';
          
          steps.push({
            id: `rbt-delete-db-case2-recolor-${sibling.id}`,
            message: `מקרה 2: אח שחור עם שני ילדים שחורים. צובעים את האח באדום ומעבירים את ה-Double Black לאב (${xParent.value})`,
            rootNode: cloneTree(currentTree),
            highlightedNodeIds: [sibling.id, xParent.id],
            stepType: 'recolor',
          });

          xId = xParent.id;
          if (xParent.color === 'red') {
            xParent.color = 'black';
            steps.push({
              id: `rbt-delete-db-case2-resolved-${xParent.id}`,
              message: `צומת האב היה אדום. צובעים אותו בשחור ובכך פתרנו את ה-Double Black!`,
              rootNode: cloneTree(currentTree),
              highlightedNodeIds: [xParent.id],
              stepType: 'recolor',
            });
            break;
          }
          xParentId = getParentOfId(currentTree, xParent.id)?.id ?? '';
        } 
        // Case 3 & 4: Sibling is Black and at least one child is Red
        else {
          // Case 3: Sibling's child closer to DB is Red, further child is Black
          if (isLeftChild) {
            if (!sibRightRed && sibLeftRed) {
              sibling.left!.color = 'black';
              sibling.color = 'red';
              
              steps.push({
                id: `rbt-delete-db-case3-recolor-${sibling.id}`,
                message: `מקרה 3: הילד הקרוב של האח אדום והרחוק שחור. צובעים ילד בשחור ואח באדום ומבצעים רוטציה ימינה על האח`,
                rootNode: cloneTree(currentTree),
                highlightedNodeIds: [sibling.id, sibling.left!.id],
                stepType: 'recolor',
              });

              const rotated = rotateRight(sibling);
              xParent.right = rotated;
              sibling = xParent.right; // update sibling pointer
            }
          } else {
            if (!sibLeftRed && sibRightRed) {
              sibling.right!.color = 'black';
              sibling.color = 'red';
              
              steps.push({
                id: `rbt-delete-db-case3-recolor-${sibling.id}`,
                message: `מקרה 3: הילד הקרוב של האח אדום והרחוק שחור. צובעים ילד בשחור ואח באדום ומבצעים רוטציה שמאלה על האח`,
                rootNode: cloneTree(currentTree),
                highlightedNodeIds: [sibling.id, sibling.right!.id],
                stepType: 'recolor',
              });

              const rotated = rotateLeft(sibling);
              xParent.left = rotated;
              sibling = xParent.left; // update sibling pointer
            }
          }

          // Sibling refresh after Case 3
          steps.push({
            id: `rbt-delete-db-case3-complete`,
            message: `המבנה לאחר רוטציה במקרה 3. כעת הגענו למצב של מקרה 4`,
            rootNode: cloneTree(currentTree),
            stepType: 'rotation',
          });

          // Case 4: Sibling's further child is Red
          if (sibling) {
            sibling.color = xParent.color;
            xParent.color = 'black';
            if (isLeftChild) {
              if (sibling.right) sibling.right.color = 'black';
            } else {
              if (sibling.left) sibling.left.color = 'black';
            }

            steps.push({
              id: `rbt-delete-db-case4-recolor-${sibling.id}`,
              message: `מקרה 4: הילד הרחוק של האח אדום. האח מקבל את צבע האב, האב נצבע שחור, הילד הרחוק נצבע שחור, ומבצעים רוטציה על האב`,
              rootNode: cloneTree(currentTree),
              highlightedNodeIds: [sibling.id, xParent.id],
              stepType: 'recolor',
            });

            const parentIdxInPath = path.length - 1;
            const balanced = isLeftChild ? rotateLeft(xParent) : rotateRight(xParent);
            currentTree = attachRotatedSubtreeRbt(currentTree, path, parentIdxInPath, balanced);

            steps.push({
              id: `rbt-delete-db-case4-complete`,
              message: `רוטציה של מקרה 4 הושלמה. ה-Double Black נפתר לחלוטין!`,
              rootNode: cloneTree(currentTree),
              stepType: 'rotation',
            });
            break;
          }
        }
      }
    }
  }

  // Ensure root is black
  if (currentTree && currentTree.color !== 'black') {
    currentTree.color = 'black';
    steps.push({
      id: `rbt-delete-root-black`,
      message: `חוקי עץ אדום-שחור: צובעים את שורש העץ בשחור`,
      rootNode: cloneTree(currentTree),
      highlightedNodeIds: [currentTree.id],
      stepType: 'recolor',
    });
  }

  steps.push({
    id: `rbt-delete-finished`,
    message: `מחיקת ${valueToDelete} מתוך עץ אדום-שחור הושלמה בהצלחה.`,
    rootNode: cloneTree(currentTree),
    stepType: 'complete',
  });

  return steps;
};
