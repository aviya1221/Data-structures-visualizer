import type { Step } from '../../app/store';
import { type TrieNode, generateTrieNodeId } from './types';

// Helper to convert Trie nodes map to a flat array and rootId into a dummy TreeNode representation
const createDummyRoot = (nodesMap: Map<string, TrieNode>, rootId: string): any => {
  return {
    id: 'trie-root',
    value: 0,
    left: null,
    right: null,
    trieNodes: Array.from(nodesMap.values()).map(n => ({
      ...n,
      children: [...n.children],
    })),
    rootId,
  };
};

/**
 * Generates Trie word insertion animation steps.
 * Appends '$' as a child node at the end of the word.
 */
export const generateTrieInsertAnimations = (
  currentNodes: TrieNode[],
  rootId: string | null,
  word: string
): Step[] => {
  const steps: Step[] = [];
  const nodesMap = new Map<string, TrieNode>();
  currentNodes.forEach((n) => nodesMap.set(n.id, { ...n, children: [...n.children] }));

  let activeRootId = rootId;

  // 1. If root doesn't exist, create it
  if (!activeRootId) {
    activeRootId = generateTrieNodeId();
    const rootNode: TrieNode = {
      id: activeRootId,
      char: '',
      isWordEnd: false,
      children: [],
    };
    nodesMap.set(activeRootId, rootNode);
  }

  // Sanitize input word: remove whitespace and make lowercase
  const sanitizedWord = word.trim().toLowerCase();
  if (!sanitizedWord) return [];

  // We append '$' to represent the end of the word
  const chars = [...sanitizedWord, '$'];

  steps.push({
    id: `tr-insert-start-${sanitizedWord}`,
    message: `מתחיל הכנסת המילה "${sanitizedWord}" לעץ האחזור. נתיב המילה יסתיים בתו "$"`,
    rootNode: createDummyRoot(nodesMap, activeRootId),
    highlightedNodeIds: [activeRootId],
    stepType: 'insert',
  });

  let currId = activeRootId;
  const path: string[] = [currId];

  for (let idx = 0; idx < chars.length; idx++) {
    const char = chars[idx];
    const currNode = nodesMap.get(currId)!;

    // Find if a child with this character already exists
    let matchId = '';
    for (const childId of currNode.children) {
      const child = nodesMap.get(childId);
      if (child && child.char === char) {
        matchId = childId;
        break;
      }
    }

    if (matchId) {
      // Character exists: traverse down
      currId = matchId;
      path.push(currId);

      steps.push({
        id: `tr-traverse-${currId}-${char}`,
        message: `האות "${char}" כבר קיימת. עובר לצומת "${char}"`,
        rootNode: createDummyRoot(nodesMap, activeRootId),
        highlightedNodeIds: [...path],
        stepType: 'recolor',
      });
    } else {
      // Character does not exist: create a new child node
      const newId = generateTrieNodeId();
      const isDollar = char === '$';
      
      const newChild: TrieNode = {
        id: newId,
        char,
        isWordEnd: isDollar,
        children: [],
      };
      
      nodesMap.set(newId, newChild);
      
      // Link child to parent
      currNode.children.push(newId);
      nodesMap.set(currId, currNode);

      currId = newId;
      path.push(currId);

      steps.push({
        id: `tr-create-${newId}-${char}`,
        message: isDollar 
          ? `הגענו לסוף המילה. מוסיף את התו המיוחד "$" לסימון סוף המילה`
          : `האות "${char}" אינה קיימת. יוצר צומת חדש עבור "${char}"`,
        rootNode: createDummyRoot(nodesMap, activeRootId),
        highlightedNodeIds: [...path],
        stepType: 'insert',
      });
    }
  }

  steps.push({
    id: `tr-complete-${sanitizedWord}`,
    message: `המילה "${sanitizedWord}" הוכנסה בהצלחה לעץ האחזור (Trie)`,
    rootNode: createDummyRoot(nodesMap, activeRootId),
    stepType: 'complete',
  });

  return steps;
};

export const generateTrieSearchAnimations = (
  currentNodes: TrieNode[],
  rootId: string | null,
  word: string
): Step[] => {
  const steps: Step[] = [];
  const nodesMap = new Map<string, TrieNode>();
  currentNodes.forEach((n) => nodesMap.set(n.id, { ...n, children: [...n.children] }));

  if (!rootId) {
    steps.push({
      id: `tr-search-empty`,
      message: `העץ ריק. החיפוש נכשל.`,
      rootNode: createDummyRoot(nodesMap, ''),
      stepType: 'complete',
    });
    return steps;
  }

  const sanitized = word.trim().toLowerCase();
  if (!sanitized) return [];

  const searchChars = [...sanitized, '$'];

  steps.push({
    id: `tr-search-start-${sanitized}`,
    message: `מתחיל חיפוש המילה "${sanitized}" בעץ האחזור. נחפש נתיב צמתים המסתיים ב-$.`,
    rootNode: createDummyRoot(nodesMap, rootId),
    highlightedNodeIds: [rootId],
    stepType: 'recolor',
  });

  let currId = rootId;
  const path: string[] = [currId];
  let failed = false;

  for (let idx = 0; idx < searchChars.length; idx++) {
    const char = searchChars[idx];
    const currNode = nodesMap.get(currId)!;

    let matchId = '';
    for (const childId of currNode.children) {
      const child = nodesMap.get(childId);
      if (child && child.char === char) {
        matchId = childId;
        break;
      }
    }

    if (matchId) {
      currId = matchId;
      path.push(currId);
      steps.push({
        id: `tr-search-match-${idx}-${char}`,
        message: char === '$' 
          ? `נמצא תו הקצה "$". המילה קיימת בעץ!`
          : `נמצאה התאמה לאות "${char}". יורד לצומת זה.`,
        rootNode: createDummyRoot(nodesMap, rootId),
        highlightedNodeIds: [...path],
        stepType: 'insert',
      });
    } else {
      failed = true;
      steps.push({
        id: `tr-search-fail-${idx}-${char}`,
        message: char === '$'
          ? `המילה "${sanitized}" היא תחילית של מילה אחרת, אך אינה מסתיימת ב-$. החיפוש נכשל.`
          : `האות "${char}" לא קיימת בבניו של הצומת הנוכחי. החיפוש נכשל.`,
        rootNode: createDummyRoot(nodesMap, rootId),
        highlightedNodeIds: [...path],
        intenseHighlightId: currId,
        stepType: 'imbalance',
      });
      break;
    }
  }

  steps.push({
    id: `tr-search-complete-${sanitized}`,
    message: failed ? `החיפוש נכשל` : `החיפוש הושלם בהצלחה — המילה קיימת בעץ`,
    rootNode: createDummyRoot(nodesMap, rootId),
    stepType: 'complete',
  });

  return steps;
};

/**
 * Generates Trie word deletion/pruning animations.
 */
export const generateTrieDeleteAnimations = (
  currentNodes: TrieNode[],
  rootId: string | null,
  word: string
): Step[] => {
  const steps: Step[] = [];
  const nodesMap = new Map<string, TrieNode>();
  currentNodes.forEach((n) => nodesMap.set(n.id, { ...n, children: [...n.children] }));

  if (!rootId) {
    steps.push({
      id: `tr-delete-empty`,
      message: `העץ ריק. אין מה למחוק`,
      rootNode: null,
      stepType: 'complete',
    });
    return steps;
  }

  const sanitized = word.trim().toLowerCase();
  if (!sanitized) return [];

  const searchChars = [...sanitized, '$'];

  steps.push({
    id: `tr-delete-search-start`,
    message: `חיפוש המילה "${sanitized}" למחיקה...`,
    rootNode: createDummyRoot(nodesMap, rootId),
    highlightedNodeIds: [rootId],
    stepType: 'recolor',
  });

  let currId = rootId;
  const path: string[] = [currId];
  let failed = false;

  for (let idx = 0; idx < searchChars.length; idx++) {
    const char = searchChars[idx];
    const currNode = nodesMap.get(currId)!;

    let matchId = '';
    for (const childId of currNode.children) {
      const child = nodesMap.get(childId);
      if (child && child.char === char) {
        matchId = childId;
        break;
      }
    }

    if (matchId) {
      currId = matchId;
      path.push(currId);
    } else {
      failed = true;
      break;
    }
  }

  if (failed) {
    steps.push({
      id: `tr-delete-not-found`,
      message: `המילה "${sanitized}" אינה קיימת בעץ האחזור`,
      rootNode: createDummyRoot(nodesMap, rootId),
      stepType: 'complete',
    });
    return steps;
  }

  steps.push({
    id: `tr-delete-found`,
    message: `המילה "${sanitized}" נמצאה. מתחילים מחיקה וגיזום מלמטה למעלה`,
    rootNode: createDummyRoot(nodesMap, rootId),
    highlightedNodeIds: [...path],
    stepType: 'compare',
  });

  // Pruning phase from leaf back to root
  // path is [root, char1, char2, ..., '$']
  for (let i = path.length - 1; i > 0; i--) {
    const nodeId = path[i];
    const node = nodesMap.get(nodeId);
    if (!node) continue;

    const parentNodeId = path[i - 1];
    const parentNode = nodesMap.get(parentNodeId);
    if (!parentNode) continue;

    // A node can be pruned if it has no children AND it does not represent another word end (not $)
    // In our Trie: only '$' nodes have isWordEnd = true.
    if (node.children.length === 0) {
      steps.push({
        id: `tr-delete-prune-node-${nodeId}`,
        message: `גיזום: לצומת "${node.char}" אין ילדים נוספים. מוחקים אותו`,
        rootNode: createDummyRoot(nodesMap, rootId),
        highlightedNodeIds: [nodeId, parentNodeId],
        stepType: 'recolor',
      });

      // Remove from nodesMap
      nodesMap.delete(nodeId);
      // Remove from parent children
      parentNode.children = parentNode.children.filter(cid => cid !== nodeId);
      nodesMap.set(parentNodeId, parentNode);
    } else {
      steps.push({
        id: `tr-delete-prune-stop-${nodeId}`,
        message: `הגענו לצומת "${node.char}" שיש לו ילדים נוספים (משמש מילים אחרות). מפסיקים את הגיזום`,
        rootNode: createDummyRoot(nodesMap, rootId),
        highlightedNodeIds: [nodeId],
        stepType: 'complete',
      });
      break;
    }
  }

  // Check if root is now empty and has no children
  let finalRootId = rootId;
  const rootNode = nodesMap.get(rootId);
  if (rootNode && rootNode.children.length === 0) {
    nodesMap.delete(rootId);
    finalRootId = '';
  }

  steps.push({
    id: `tr-delete-complete`,
    message: `מחיקת המילה "${sanitized}" הושלמה בהצלחה`,
    rootNode: finalRootId ? createDummyRoot(nodesMap, finalRootId) : null,
    stepType: 'complete',
  });

  return steps;
};
