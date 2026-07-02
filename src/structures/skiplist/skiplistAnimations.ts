import type { Step } from '../../app/store';
import type { SkipListNode } from './types';
import {
  generateSkipListId,
  findLevelHead,
  findLevelTail,
  getMaxLevel
} from './skiplistAlgorithms';

// Helper to convert nodes map to a flat array suitable for the store
const mapToFlatArray = (nodesMap: Map<string, SkipListNode>): SkipListNode[] => {
  return Array.from(nodesMap.values());
};

// Helper to create a dummy root node containing the skip list array
const createDummyRoot = (nodesArray: SkipListNode[]): any => {
  return {
    id: 'skiplist-root',
    value: 0,
    left: null,
    right: null,
    skipListNodes: nodesArray,
  };
};

export const generateSkipListInsertAnimations = (
  currentNodes: SkipListNode[],
  value: number
): Step[] => {
  const steps: Step[] = [];
  const nodesMap = new Map<string, SkipListNode>();
  currentNodes.forEach((n) => nodesMap.set(n.id, { ...n }));

  const maxLevel = getMaxLevel(nodesMap);

  // --- PHASE 1: Search ---
  let currentLevel = maxLevel;
  let curr = findLevelHead(currentLevel, nodesMap)!;
  const searchPath: string[] = [];

  steps.push({
    id: `sl-search-start-${value}`,
    message: `מתחיל חיפוש עבור מיקום הכנסת הערך ${value} מהראש של הרמה העליונה (${currentLevel})`,
    rootNode: createDummyRoot(mapToFlatArray(nodesMap)),
    highlightedNodeIds: [curr.id],
    stepType: 'insert',
  });

  while (curr) {
    searchPath.push(curr.id);

    // Look at the next node
    const nextId = curr.next;
    const nextNode = nextId ? nodesMap.get(nextId) : null;

    if (nextNode && !nextNode.isTail && nextNode.value < value) {
      curr = nextNode;
      steps.push({
        id: `sl-search-right-${curr.id}-${value}`,
        message: `סורק ימינה לרמה ${curr.level}: הערך ${curr.value} קטן מ-${value}`,
        rootNode: createDummyRoot(mapToFlatArray(nodesMap)),
        highlightedNodeIds: [curr.id],
        stepType: 'insert',
      });
    } else {
      if (curr.down) {
        curr = nodesMap.get(curr.down)!;
        steps.push({
          id: `sl-search-down-${curr.id}-${value}`,
          message: `הערך הבא גדול מ-${value} או שהגענו לסוף הרמה. יורד רמה אחת למטה לרמת הדילוג ${curr.level}`,
          rootNode: createDummyRoot(mapToFlatArray(nodesMap)),
          highlightedNodeIds: [curr.id],
          stepType: 'insert',
        });
      } else {
        // We are at level 0 and cannot move right
        break;
      }
    }
  }

  // --- PHASE 2: Insert node at level 0 ---
  const insertPrev = curr;
  const insertNextId = curr.next!;
  const insertNext = nodesMap.get(insertNextId)!;

  const newNodeId = generateSkipListId();
  const newNode: SkipListNode = {
    id: newNodeId,
    value,
    next: insertNextId,
    prev: insertPrev.id,
    up: null,
    down: null,
    level: 0,
  };

  insertPrev.next = newNodeId;
  insertNext.prev = newNodeId;
  nodesMap.set(insertPrev.id, insertPrev);
  nodesMap.set(insertNextId, insertNext);
  nodesMap.set(newNodeId, newNode);

  steps.push({
    id: `sl-inserted-${value}`,
    message: `הכנסת צומת ${value} ברמת הבסיס (רמה 0) בין ${insertPrev.isHead ? 'ראש הרשימה' : insertPrev.value} ל-${insertNext.isTail ? 'סוף הרשימה' : insertNext.value}`,
    rootNode: createDummyRoot(mapToFlatArray(nodesMap)),
    highlightedNodeIds: [newNodeId],
    stepType: 'insert',
  });

  // --- PHASE 3: Deterministic check & promotions cascading up ---
  let level = 0;
  let activePromotedNodeId: string | null = newNodeId;

  while (activePromotedNodeId) {
    const levelHead = findLevelHead(level, nodesMap)!;
    
    // Find all gaps at the current level.
    // A gap is a list of consecutive non-promoted nodes between promoted nodes/sentinels.
    let scan: SkipListNode | null = levelHead;
    let currentGap: SkipListNode[] = [];
    let gapToSplit: SkipListNode[] | null = null;

    while (scan) {
      if (scan.isHead || scan.isTail || scan.up) {
        if (currentGap.length === 3) {
          gapToSplit = currentGap;
          break;
        }
        currentGap = [];
      } else {
        currentGap.push(scan);
      }

      if (!scan.next) break;
      scan = nodesMap.get(scan.next)!;
    }

    if (gapToSplit) {
      // We found a gap of exactly 3 nodes that do not exist in the level above.
      // We must promote the middle node (index 1).
      const middleNode = gapToSplit[1];

      steps.push({
        id: `sl-violation-detected-${middleNode.id}`,
        message: `זוהתה הפרה: רצף של 3 צמתים (${gapToSplit[0].value}, ${gapToSplit[1].value}, ${gapToSplit[2].value}) ברמה ${level} ללא הורה. מכין קידום לצומת האמצעי (${middleNode.value}) לרמה ${level + 1}`,
        rootNode: createDummyRoot(mapToFlatArray(nodesMap)),
        highlightedNodeIds: gapToSplit.map(n => n.id),
        intenseHighlightId: middleNode.id,
        stepType: 'recolor', // highlight as imbalance / rebalance
      });

      // Perform promotion of middleNode
      const nextLevel = level + 1;
      let nextLevelHead = findLevelHead(nextLevel, nodesMap);
      let nextLevelTail = findLevelTail(nextLevel, nodesMap);

      // Create a new level if it does not exist
      if (!nextLevelHead || !nextLevelTail) {
        const newHeadId = generateSkipListId();
        const newTailId = generateSkipListId();

        const levelHeadNode = findLevelHead(level, nodesMap)!;
        const levelTailNode = findLevelTail(level, nodesMap)!;

        nextLevelHead = {
          id: newHeadId,
          value: -Infinity,
          isHead: true,
          next: newTailId,
          prev: null,
          up: null,
          down: levelHeadNode.id,
          level: nextLevel,
        };

        nextLevelTail = {
          id: newTailId,
          value: Infinity,
          isTail: true,
          next: null,
          prev: newHeadId,
          up: null,
          down: levelTailNode.id,
          level: nextLevel,
        };

        levelHeadNode.up = newHeadId;
        levelTailNode.up = newTailId;
        nodesMap.set(levelHeadNode.id, levelHeadNode);
        nodesMap.set(levelTailNode.id, levelTailNode);

        nodesMap.set(newHeadId, nextLevelHead);
        nodesMap.set(newTailId, nextLevelTail);
      }

      // Find insert position in the level above
      let leftScan = nodesMap.get(middleNode.prev!)!;
      while (leftScan && !leftScan.up && !leftScan.isHead) {
        leftScan = nodesMap.get(leftScan.prev!)!;
      }

      const leftScanUpId = leftScan.up!;
      const leftScanUp = nodesMap.get(leftScanUpId)!;
      const rightScanUpId = leftScanUp.next!;
      const rightScanUp = nodesMap.get(rightScanUpId)!;

      const upNodeId = generateSkipListId();
      const upNode: SkipListNode = {
        id: upNodeId,
        value: middleNode.value,
        next: rightScanUpId,
        prev: leftScanUpId,
        up: null,
        down: middleNode.id,
        level: nextLevel,
      };

      middleNode.up = upNodeId;
      leftScanUp.next = upNodeId;
      rightScanUp.prev = upNodeId;

      nodesMap.set(middleNode.id, middleNode);
      nodesMap.set(leftScanUpId, leftScanUp);
      nodesMap.set(rightScanUpId, rightScanUp);
      nodesMap.set(upNodeId, upNode);

      steps.push({
        id: `sl-promoted-${upNodeId}`,
        message: `קידום הושלם: הצומת ${middleNode.value} הועלה לרמה ${nextLevel}`,
        rootNode: createDummyRoot(mapToFlatArray(nodesMap)),
        highlightedNodeIds: [upNodeId, middleNode.id],
        stepType: 'rotation',
      });

      // Continue cascade verification to the level above
      activePromotedNodeId = upNodeId;
      level += 1;
    } else {
      // Spacing is valid, cascade complete
      activePromotedNodeId = null;
    }
  }

  steps.push({
    id: `sl-complete-${value}`,
    message: `הפעולה הושלמה בהצלחה — רשימת הדילוג מאוזנת לפי כללי הספר (2 או 3 צמתים בין כל קידום)`,
    rootNode: createDummyRoot(mapToFlatArray(nodesMap)),
    stepType: 'complete',
  });

  return steps;
};

/**
 * Handles Skip List deletion logic and step generation.
 */
export const generateSkipListDeleteAnimations = (
  currentNodes: SkipListNode[],
  value: number
): Step[] => {
  const steps: Step[] = [];
  const nodesMap = new Map<string, SkipListNode>();
  currentNodes.forEach((n) => nodesMap.set(n.id, { ...n }));

  // Search for the node at level 0
  const level0Head = findLevelHead(0, nodesMap)!;
  let targetNode: SkipListNode | null = null;
  let scan: SkipListNode | null = level0Head;

  while (scan) {
    if (!scan.isHead && !scan.isTail && scan.value === value) {
      targetNode = scan;
      break;
    }
    if (!scan.next) break;
    scan = nodesMap.get(scan.next)!;
  }

  if (!targetNode) {
    steps.push({
      id: `sl-delete-fail-${value}`,
      message: `מחיקה נכשלה — הערך ${value} אינו קיים ברשימת הדילוג.`,
      rootNode: createDummyRoot(mapToFlatArray(nodesMap)),
      stepType: 'complete',
    });
    return steps;
  }

  // Collect all vertical occurrences of this node to delete
  const nodeIdsToDelete: string[] = [];
  let currToDelete: SkipListNode | null = targetNode;
  while (currToDelete) {
    nodeIdsToDelete.push(currToDelete.id);
    currToDelete = currToDelete.up ? nodesMap.get(currToDelete.up)! : null;
  }

  steps.push({
    id: `sl-delete-start-${value}`,
    message: `מחיקת צומת ${value}: מזהה את כל הקידומים של הצומת ברשימה`,
    rootNode: createDummyRoot(mapToFlatArray(nodesMap)),
    highlightedNodeIds: nodeIdsToDelete,
    stepType: 'recolor',
  });

  // Perform deletion by updating horizontal pointers for each level where node exists
  nodeIdsToDelete.forEach((id) => {
    const node = nodesMap.get(id)!;
    const prevNode = nodesMap.get(node.prev!)!;
    const nextNode = nodesMap.get(node.next!)!;

    prevNode.next = nextNode.id;
    nextNode.prev = prevNode.id;

    nodesMap.set(prevNode.id, prevNode);
    nodesMap.set(nextNode.id, nextNode);
    nodesMap.delete(id);
  });

  // Check if we have empty levels that should be cleaned up (except level 0)
  const maxLevel = getMaxLevel(nodesMap);
  for (let lvl = maxLevel; lvl > 0; lvl--) {
    const headNode = findLevelHead(lvl, nodesMap)!;
    const tailNode = findLevelTail(lvl, nodesMap)!;
    
    // If the only elements at this level are head and tail, delete them
    if (headNode.next === tailNode.id) {
      // Disconnect down pointers from above if they exist
      const belowHead = nodesMap.get(headNode.down!)!;
      belowHead.up = null;
      nodesMap.set(belowHead.id, belowHead);

      const belowTail = nodesMap.get(tailNode.down!)!;
      belowTail.up = null;
      nodesMap.set(belowTail.id, belowTail);

      nodesMap.delete(headNode.id);
      nodesMap.delete(tailNode.id);
    } else {
      break; // Stop cleaning up if level is not empty
    }
  }

  steps.push({
    id: `sl-deleted-${value}`,
    message: `מחיקת צומת ${value} הושלמה בהצלחה מכל רמות הדילוג. הרשימה מאוזנת מחדש.`,
    rootNode: createDummyRoot(mapToFlatArray(nodesMap)),
    stepType: 'complete',
  });

  return steps;
};
