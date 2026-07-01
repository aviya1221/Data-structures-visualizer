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
