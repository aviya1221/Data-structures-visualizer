import type { Step } from '../../app/store';
import { type SuffixTreeNode, generateSuffixNodeId } from './types';

// Helper to convert Suffix Tree nodes map to a flat array and rootId into a dummy TreeNode representation
const createDummyRoot = (nodesMap: Map<string, SuffixTreeNode>, rootId: string): any => {
  return {
    id: 'suffix-root',
    value: 0,
    left: null,
    right: null,
    suffixNodes: Array.from(nodesMap.values()).map(n => ({
      ...n,
      children: [...n.children],
    })),
    rootId,
  };
};

/**
 * Generates Suffix Tree construction steps by inserting all suffixes of a string ending in '$'.
 */
export const generateSuffixTreeAnimations = (
  word: string
): Step[] => {
  const steps: Step[] = [];
  const nodesMap = new Map<string, SuffixTreeNode>();
  
  const rootId = generateSuffixNodeId();
  const rootNode: SuffixTreeNode = {
    id: rootId,
    char: '',
    isWordEnd: false,
    children: [],
  };
  nodesMap.set(rootId, rootNode);

  const sanitized = word.trim().toLowerCase();
  if (!sanitized) return [];

  // Generate all suffixes in descending order of length
  const suffixes: string[] = [];
  for (let i = 0; i < sanitized.length; i++) {
    suffixes.push(sanitized.substring(i) + '$');
  }

  steps.push({
    id: `sf-build-start-${sanitized}`,
    message: `מתחיל בניית עץ סיומת למחרוזת "${sanitized}". הסיומות שיוכנסו לעץ: ${suffixes.map(s => `"${s}"`).join(', ')}`,
    rootNode: createDummyRoot(nodesMap, rootId),
    highlightedNodeIds: [rootId],
    stepType: 'insert',
  });

  // Helper to insert a single suffix suffixStr into the tree
  const insertSuffix = (suffixStr: string, suffixIndex: number) => {
    let currId = rootId;
    const path: string[] = [currId];

    for (let idx = 0; idx < suffixStr.length; idx++) {
      const char = suffixStr[idx];
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
          id: `sf-traverse-${suffixIndex}-${idx}-${currId}`,
          message: `הכנסת הסיומת "${suffixStr}": האות "${char}" כבר קיימת בנתיב. יורד לצומת זה`,
          rootNode: createDummyRoot(nodesMap, rootId),
          highlightedNodeIds: [...path],
          stepType: 'recolor',
        });
      } else {
        // Character does not exist: create child
        const newId = generateSuffixNodeId();
        const isDollar = char === '$';

        const newChild: SuffixTreeNode = {
          id: newId,
          char,
          isWordEnd: isDollar,
          children: [],
        };
        nodesMap.set(newId, newChild);

        currNode.children.push(newId);
        nodesMap.set(currId, currNode);

        currId = newId;
        path.push(currId);

        steps.push({
          id: `sf-create-${suffixIndex}-${idx}-${newId}`,
          message: isDollar
            ? `הכנסת הסיומת "${suffixStr}": מוסיף עלה מיוחד עם תו הקצה "$"`
            : `הכנסת הסיומת "${suffixStr}": יוצר צומת חדש עבור האות "${char}"`,
          rootNode: createDummyRoot(nodesMap, rootId),
          highlightedNodeIds: [...path],
          stepType: 'insert',
        });
      }
    }
  };

  // Insert all suffixes
  suffixes.forEach((suffix, idx) => {
    insertSuffix(suffix, idx);
  });

  steps.push({
    id: `sf-build-complete-${sanitized}`,
    message: `בניית עץ הסיומת עבור "${sanitized}" הושלמה בהצלחה. כל הסיומות מסתיימות בעלי $ נפרדים ומאוזנים`,
    rootNode: createDummyRoot(nodesMap, rootId),
    stepType: 'complete',
  });

  return steps;
};

export const generateSuffixSearchAnimations = (
  currentNodes: SuffixTreeNode[],
  rootId: string | null,
  substring: string
): Step[] => {
  const steps: Step[] = [];
  const nodesMap = new Map<string, SuffixTreeNode>();
  currentNodes.forEach((n) => nodesMap.set(n.id, { ...n, children: [...n.children] }));

  if (!rootId) {
    steps.push({
      id: `sf-search-empty`,
      message: `העץ ריק. החיפוש נכשל.`,
      rootNode: createDummyRoot(nodesMap, ''),
      stepType: 'complete',
    });
    return steps;
  }

  const sanitized = substring.trim().toLowerCase();
  if (!sanitized) return [];

  const searchChars = [...sanitized]; // substring check (no '$' terminator required for contains check)

  steps.push({
    id: `sf-search-start-${sanitized}`,
    message: `מתחיל חיפוש תת-המחרוזת "${sanitized}" בעץ הסיומת.`,
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
        id: `sf-search-match-${idx}-${char}`,
        message: `נמצאה התאמה לאות "${char}". יורד לצומת זה.`,
        rootNode: createDummyRoot(nodesMap, rootId),
        highlightedNodeIds: [...path],
        stepType: 'insert',
      });
    } else {
      failed = true;
      steps.push({
        id: `sf-search-fail-${idx}-${char}`,
        message: `האות "${char}" לא קיימת בבניו של הצומת הנוכחי. החיפוש נכשל.`,
        rootNode: createDummyRoot(nodesMap, rootId),
        highlightedNodeIds: [...path],
        intenseHighlightId: currId,
        stepType: 'imbalance',
      });
      break;
    }
  }

  steps.push({
    id: `sf-search-complete-${sanitized}`,
    message: failed 
      ? `החיפוש נכשל: תת-המחרוזת "${sanitized}" אינה קיימת בטקסט.`
      : `החיפוש הושלם בהצלחה — תת-המחרוזת "${sanitized}" קיימת בטקסט!`,
    rootNode: createDummyRoot(nodesMap, rootId),
    stepType: 'complete',
  });

  return steps;
};
