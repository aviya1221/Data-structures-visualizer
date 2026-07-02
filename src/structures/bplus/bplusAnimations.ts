import type { Step } from '../../app/store';
import { type BPlusNode, generateBPlusNodeId } from './types';

// Helper to convert nodes map to a flat array and rootId into a dummy TreeNode representation
const createDummyRoot = (nodesMap: Map<string, BPlusNode>, rootId: string): any => {
  return {
    id: 'bplus-root',
    value: 0,
    left: null,
    right: null,
    bplusNodes: Array.from(nodesMap.values()).map(n => ({
      ...n,
      keys: [...n.keys],
      children: [...n.children],
    })),
    rootId,
  };
};

// Gets the minimum key in a node's subtree
const getMinKey = (nodeId: string, nodesMap: Map<string, BPlusNode>): number => {
  const node = nodesMap.get(nodeId);
  if (!node) return 0;
  if (node.isLeaf) {
    return node.keys[0];
  }
  return getMinKey(node.children[0], nodesMap);
};

// Recursively updates the parent key indexing to reflect subtree minimums
const updateParentKeys = (
  nodeId: string,
  nodesMap: Map<string, BPlusNode>,
  rootId: string
) => {
  if (nodeId === rootId) return;

  // Find parent
  let parentNode: BPlusNode | null = null;
  for (const n of nodesMap.values()) {
    if (n.children.includes(nodeId)) {
      parentNode = n;
      break;
    }
  }

  if (parentNode) {
    const idx = parentNode.children.indexOf(nodeId);
    if (idx !== -1) {
      parentNode.keys[idx] = getMinKey(nodeId, nodesMap);
      nodesMap.set(parentNode.id, parentNode);
      updateParentKeys(parentNode.id, nodesMap, rootId);
    }
  }
};

// Find the path of node IDs from root to the correct leaf for a key
const findLeafPath = (
  key: number,
  rootId: string,
  nodesMap: Map<string, BPlusNode>
): string[] => {
  const path: string[] = [];
  let currId = rootId;

  while (currId) {
    path.push(currId);
    const node = nodesMap.get(currId);
    if (!node || node.isLeaf) break;

    // Search child index by looking at minimum boundaries
    let idx = 0;
    // We follow child idx if the value is less than the min of child idx + 1
    while (idx < node.keys.length - 1 && key >= getMinKey(node.children[idx + 1], nodesMap)) {
      idx++;
    }
    currId = node.children[idx];
  }

  return path;
};

/**
 * Generates B+ Tree insertion steps following the strict "minimum-key-of-subtree" rule.
 */
export const generateBPlusInsertAnimations = (
  currentNodes: BPlusNode[],
  rootId: string | null,
  value: number,
  blockSize: number = 3
): Step[] => {
  const steps: Step[] = [];
  const nodesMap = new Map<string, BPlusNode>();
  currentNodes.forEach((n) => nodesMap.set(n.id, { ...n, keys: [...n.keys], children: [...n.children] }));

  // Case 1: Empty Tree
  if (!rootId) {
    const newRootId = generateBPlusNodeId();
    const newRoot: BPlusNode = {
      id: newRootId,
      keys: [value],
      isLeaf: true,
      children: [],
      next: null,
    };
    nodesMap.set(newRootId, newRoot);

    steps.push({
      id: `bp-insert-empty-${value}`,
      message: `העץ ריק. יוצר עלה שורש חדש עבור הערך ${value}`,
      rootNode: createDummyRoot(nodesMap, newRootId),
      highlightedNodeIds: [newRootId],
      stepType: 'insert',
    });

    steps.push({
      id: `bp-complete-empty-${value}`,
      message: `ההכנסה הושלמה בהצלחה`,
      rootNode: createDummyRoot(nodesMap, newRootId),
      stepType: 'complete',
    });

    return steps;
  }

  // Case 2: Tree is not empty. Search path to find correct leaf
  const path = findLeafPath(value, rootId, nodesMap);
  
  steps.push({
    id: `bp-search-path-${value}`,
    message: `חיפוש אחר עלה מתאים להכנסת הערך ${value}`,
    rootNode: createDummyRoot(nodesMap, rootId),
    highlightedNodeIds: path,
    stepType: 'recolor',
  });

  const leafId = path[path.length - 1];
  const leaf = nodesMap.get(leafId)!;

  // Insert key in sorted order in the leaf
  leaf.keys.push(value);
  leaf.keys.sort((a, b) => a - b);
  nodesMap.set(leafId, leaf);

  // Propagate minimum updates up if leaf minimum has changed
  updateParentKeys(leafId, nodesMap, rootId);

  steps.push({
    id: `bp-inserted-leaf-${value}`,
    message: `הכנסת הערך ${value} לעלה ועדכון מפתחות האב לפי המינימום החדש`,
    rootNode: createDummyRoot(nodesMap, rootId),
    highlightedNodeIds: [leafId],
    stepType: 'insert',
  });

  // Handle cascading splits if keys count exceeds block size
  let activeId = leafId;
  let activeRootId = rootId;

  while (activeId) {
    const node = nodesMap.get(activeId)!;
    if (node.keys.length <= blockSize) {
      break; // No split needed
    }

    // Split needed!
    const isLeafSplit = node.isLeaf;
    const mid = Math.floor(node.keys.length / 2);
    
    const siblingId = generateBPlusNodeId();
    const sibling: BPlusNode = {
      id: siblingId,
      keys: [],
      isLeaf: isLeafSplit,
      children: [],
      next: null,
    };

    if (isLeafSplit) {
      // Leaf Split: keys are distributed, and right block minimum will represent the promoted separator key
      sibling.keys = node.keys.slice(mid);
      node.keys = node.keys.slice(0, mid);

      // Update linked list pointers for Leaf nodes
      sibling.next = node.next;
      node.next = siblingId;
    } else {
      // Index Split: children and corresponding keys are distributed
      sibling.keys = node.keys.slice(mid);
      sibling.children = node.children.slice(mid);
      
      node.keys = node.keys.slice(0, mid);
      node.children = node.children.slice(0, mid);
    }

    nodesMap.set(activeId, node);
    nodesMap.set(siblingId, sibling);

    steps.push({
      id: `bp-split-prepare-${activeId}`,
      message: `חריגה מקיבולת גוש (size > ${blockSize}): מפצל את הגוש לשניים`,
      rootNode: createDummyRoot(nodesMap, activeRootId),
      highlightedNodeIds: [activeId, siblingId],
      stepType: 'recolor',
    });

    // Find parent of activeId
    let parentNode: BPlusNode | null = null;
    for (const n of nodesMap.values()) {
      if (n.children.includes(activeId)) {
        parentNode = n;
        break;
      }
    }
    
    if (!parentNode) {
      // Root split: create a new root index node containing minimums of both split children
      const newRootId = generateBPlusNodeId();
      const leftMin = getMinKey(activeId, nodesMap);
      const rightMin = getMinKey(siblingId, nodesMap);
      
      const newRoot: BPlusNode = {
        id: newRootId,
        keys: [leftMin, rightMin],
        isLeaf: false,
        children: [activeId, siblingId],
        next: null,
      };
      nodesMap.set(newRootId, newRoot);
      activeRootId = newRootId;

      steps.push({
        id: `bp-split-newroot-${newRootId}`,
        message: `נוצר שורש אינדקס חדש המפנה לשני הבנים המפוצלים ומחזיק במפתחות המינימום שלהם [${leftMin}, ${rightMin}]`,
        rootNode: createDummyRoot(nodesMap, activeRootId),
        highlightedNodeIds: [newRootId, activeId, siblingId],
        stepType: 'rotation',
      });

      break; // End of splits since we created a new root
    } else {
      // Parent exists: insert sibling and update keys to reflect minimums
      const childIdx = parentNode.children.indexOf(activeId);
      parentNode.children.splice(childIdx + 1, 0, siblingId);
      
      // Rebuild parent keys based on child minimums
      parentNode.keys = parentNode.children.map(cId => getMinKey(cId, nodesMap));
      nodesMap.set(parentNode.id, parentNode);

      steps.push({
        id: `bp-split-promote-${parentNode.id}`,
        message: `קידום מפתח המינימום של הגוש החדש לרמת האב [${parentNode.keys.join(',')}]`,
        rootNode: createDummyRoot(nodesMap, activeRootId),
        highlightedNodeIds: [parentNode.id, activeId, siblingId],
        stepType: 'rotation',
      });

      // Continue check up the tree
      activeId = parentNode.id;
    }
  }

  steps.push({
    id: `bp-insert-complete-${value}`,
    message: `הפעולה הושלמה בהצלחה — עץ ה-B+ תקין ומאוזן לחלוטין לפי כללי הספר`,
    rootNode: createDummyRoot(nodesMap, activeRootId),
    stepType: 'complete',
  });

  return steps;
};

/**
 * Generates B+ Tree deletion steps following the strict "minimum-key-of-subtree" rule.
 */
export const generateBPlusDeleteAnimations = (
  currentNodes: BPlusNode[],
  rootId: string | null,
  value: number,
  blockSize: number = 3
): Step[] => {
  const steps: Step[] = [];
  if (!rootId) {
    steps.push({
      id: `bp-delete-empty`,
      message: `העץ ריק. אין מה למחוק`,
      rootNode: null,
      stepType: 'complete',
    });
    return steps;
  }

  const nodesMap = new Map<string, BPlusNode>();
  currentNodes.forEach((n) => nodesMap.set(n.id, { ...n, keys: [...n.keys], children: [...n.children] }));

  // 1. Search phase to locate the leaf node
  const path = findLeafPath(value, rootId, nodesMap);
  
  steps.push({
    id: `bp-delete-search-start`,
    message: `חיפוש המפתח ${value} למחיקה במורד העץ...`,
    rootNode: createDummyRoot(nodesMap, rootId),
    highlightedNodeIds: [...path],
    stepType: 'compare',
  });

  const leafId = path[path.length - 1];
  const leaf = nodesMap.get(leafId);

  if (!leaf || !leaf.keys.includes(value)) {
    steps.push({
      id: `bp-delete-not-found`,
      message: `המפתח ${value} אינו נמצא בעץ ה-B+`,
      rootNode: createDummyRoot(nodesMap, rootId),
      stepType: 'complete',
    });
    return steps;
  }

  // 2. Perform deletion on leaf
  const keyIdx = leaf.keys.indexOf(value);
  leaf.keys.splice(keyIdx, 1);
  nodesMap.set(leafId, leaf);

  steps.push({
    id: `bp-delete-removed-${value}`,
    message: `הסרנו את המפתח ${value} מעלה העץ (${leafId})`,
    rootNode: createDummyRoot(nodesMap, rootId),
    highlightedNodeIds: [leafId],
    stepType: 'recolor',
  });

  let activeRootId = rootId;
  const minKeys = Math.ceil(blockSize / 2); // for blockSize=3, minKeys=2

  // If leaf is root
  if (leafId === activeRootId) {
    if (leaf.keys.length === 0) {
      steps.push({
        id: `bp-delete-root-empty`,
        message: `השורש התרוקן לחלוטין. העץ כעת ריק`,
        rootNode: null,
        stepType: 'complete',
      });
      return steps;
    }
    
    steps.push({
      id: `bp-delete-complete-root`,
      message: `המחיקה מהשורש הושלמה בהצלחה`,
      rootNode: createDummyRoot(nodesMap, activeRootId),
      stepType: 'complete',
    });
    return steps;
  }

  // Backtrack to update parent keys and check underflow
  updateParentKeys(leafId, nodesMap, activeRootId);

  let currId = leafId;
  while (currId !== activeRootId) {
    const currNode = nodesMap.get(currId);
    if (!currNode) break;

    if (currNode.keys.length >= minKeys) {
      // Underflow check passed
      break;
    }

    // Underflow detected! Must borrow or merge
    // Find parent
    let parentNode: BPlusNode | null = null;
    for (const n of nodesMap.values()) {
      if (n.children.includes(currId)) {
        parentNode = n;
        break;
      }
    }

    if (!parentNode) break;

    const childIdx = parentNode.children.indexOf(currId);
    const leftSibId = childIdx > 0 ? parentNode.children[childIdx - 1] : null;
    const rightSibId = childIdx < parentNode.children.length - 1 ? parentNode.children[childIdx + 1] : null;

    let resolved = false;

    // Try borrowing from left sibling
    if (leftSibId) {
      const leftSib = nodesMap.get(leftSibId);
      if (leftSib && leftSib.keys.length > minKeys) {
        if (!currNode.isLeaf) {
          // Internal node: borrow the last child from left sibling
          const borrowedChild = leftSib.children.pop()!;
          leftSib.keys = leftSib.children.map(cId => getMinKey(cId, nodesMap));
          currNode.children.unshift(borrowedChild);
          currNode.keys = currNode.children.map(cId => getMinKey(cId, nodesMap));
        } else {
          // Leaf node: borrow last key directly
          const borrowedKey = leftSib.keys.pop()!;
          currNode.keys.unshift(borrowedKey);
        }

        nodesMap.set(leftSibId, leftSib);
        nodesMap.set(currId, currNode);
        updateParentKeys(currId, nodesMap, activeRootId);
        updateParentKeys(leftSibId, nodesMap, activeRootId);

        steps.push({
          id: `bp-delete-borrow-left-${currId}`,
          message: `תת-תפוסה בגוש: לוקחים (Borrow) מפתח מהאח השמאלי כדי לאזן`,
          rootNode: createDummyRoot(nodesMap, activeRootId),
          highlightedNodeIds: [currId, leftSibId, parentNode.id],
          stepType: 'rotation',
        });
        resolved = true;
        break;
      }
    }

    // Try borrowing from right sibling
    if (!resolved && rightSibId) {
      const rightSib = nodesMap.get(rightSibId);
      if (rightSib && rightSib.keys.length > minKeys) {
        if (!currNode.isLeaf) {
          // Internal node: borrow the first child from right sibling
          const borrowedChild = rightSib.children.shift()!;
          rightSib.keys = rightSib.children.map(cId => getMinKey(cId, nodesMap));
          currNode.children.push(borrowedChild);
          currNode.keys = currNode.children.map(cId => getMinKey(cId, nodesMap));
        } else {
          // Leaf node: borrow first key directly
          const borrowedKey = rightSib.keys.shift()!;
          currNode.keys.push(borrowedKey);
        }

        nodesMap.set(rightSibId, rightSib);
        nodesMap.set(currId, currNode);
        updateParentKeys(currId, nodesMap, activeRootId);
        updateParentKeys(rightSibId, nodesMap, activeRootId);

        steps.push({
          id: `bp-delete-borrow-right-${currId}`,
          message: `תת-תפוסה בגוש: לוקחים (Borrow) מפתח מהאח הימני כדי לאזן`,
          rootNode: createDummyRoot(nodesMap, activeRootId),
          highlightedNodeIds: [currId, rightSibId, parentNode.id],
          stepType: 'rotation',
        });
        resolved = true;
        break;
      }
    }

    // Merge with left sibling
    if (!resolved && leftSibId) {
      const leftSib = nodesMap.get(leftSibId);
      if (leftSib) {
        leftSib.keys.push(...currNode.keys);
        if (!currNode.isLeaf) {
          leftSib.children.push(...currNode.children);
          // Rebuild keys for merged internal node based on child minimums
          leftSib.keys = leftSib.children.map(cId => getMinKey(cId, nodesMap));
        } else {
          leftSib.next = currNode.next;
        }

        nodesMap.set(leftSibId, leftSib);
        nodesMap.delete(currId);
        
        parentNode.children.splice(childIdx, 1);
        parentNode.keys = parentNode.children.map(cId => getMinKey(cId, nodesMap));
        nodesMap.set(parentNode.id, parentNode);

        steps.push({
          id: `bp-delete-merge-left-${currId}`,
          message: `מיזוג (Merge) הגוש עם אחיו השמאלי עקב תת-תפוסה של שניהם`,
          rootNode: createDummyRoot(nodesMap, activeRootId),
          highlightedNodeIds: [leftSibId, parentNode.id],
          stepType: 'recolor',
        });

        currId = parentNode.id;
        resolved = true;
        continue;
      }
    }

    // Merge with right sibling
    if (!resolved && rightSibId) {
      const rightSib = nodesMap.get(rightSibId);
      if (rightSib) {
        currNode.keys.push(...rightSib.keys);
        if (!currNode.isLeaf) {
          currNode.children.push(...rightSib.children);
          // Rebuild keys for merged internal node based on child minimums
          currNode.keys = currNode.children.map(cId => getMinKey(cId, nodesMap));
        } else {
          currNode.next = rightSib.next;
        }

        nodesMap.set(currId, currNode);
        nodesMap.delete(rightSibId);

        parentNode.children.splice(childIdx + 1, 1);
        parentNode.keys = parentNode.children.map(cId => getMinKey(cId, nodesMap));
        nodesMap.set(parentNode.id, parentNode);

        steps.push({
          id: `bp-delete-merge-right-${currId}`,
          message: `מיזוג (Merge) הגוש עם אחיו הימני עקב תת-תפוסה של שניהם`,
          rootNode: createDummyRoot(nodesMap, activeRootId),
          highlightedNodeIds: [currId, parentNode.id],
          stepType: 'recolor',
        });

        currId = parentNode.id;
        resolved = true;
        continue;
      }
    }

    break;
  }

  // If root is empty internal node, make its only child the new root
  const rootNode = nodesMap.get(activeRootId);
  if (rootNode && !rootNode.isLeaf && rootNode.children.length === 1) {
    const newRootId = rootNode.children[0];
    nodesMap.delete(activeRootId);
    activeRootId = newRootId;

    steps.push({
      id: `bp-delete-new-root-${activeRootId}`,
      message: `השורש התרוקן. הבן היחיד שלו הופך לשורש החדש של עץ ה-B+`,
      rootNode: createDummyRoot(nodesMap, activeRootId),
      highlightedNodeIds: [activeRootId],
      stepType: 'rotation',
    });
  }

  steps.push({
    id: `bp-delete-complete`,
    message: `פעולת המחיקה והאיזון מחדש של עץ ה-B+ הושלמה בהצלחה`,
    rootNode: createDummyRoot(nodesMap, activeRootId),
    stepType: 'complete',
  });

  return steps;
};
