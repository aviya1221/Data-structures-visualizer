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
