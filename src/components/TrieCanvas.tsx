import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../app/store';
import { type TrieNode } from '../structures/trie/types';


export const TrieCanvas: React.FC = () => {
  const { animationQueue, stepIndex, currentRoot } = useAppStore();
  const currentStep = animationQueue[stepIndex];
  const root = (animationQueue.length > 0 ? currentStep?.rootNode : currentRoot) as any | null;
  const trieNodes: TrieNode[] = root?.trieNodes ?? [];
  const rootId: string | null = root?.rootId ?? null;

  const highlightedNodeIds = new Set(currentStep?.highlightedNodeIds ?? []);

  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const nodeSize = isMobile ? 38 : 50;
  const vSpacing = isMobile ? 60 : 85;
  const siblingGap = isMobile ? 22 : 35;
  const baseLeafWidth = isMobile ? 32 : 45;

  // Compute Layouts
  const layoutData = useMemo(() => {
    const nodes: { node: TrieNode; x: number; y: number }[] = [];
    const eds: { id: string; from: string; to: string }[] = [];

    if (trieNodes.length === 0 || !rootId) {
      return { flatNodes: nodes, edges: eds, computedWidth: 1000, computedHeight: 520 };
    }

    const nodesMap = new Map<string, TrieNode>();
    trieNodes.forEach((n) => nodesMap.set(n.id, n));

    const widthsMap = new Map<string, number>();

    // 1. Calculate subtree widths recursively to prevent overlapping branches
    const computeWidth = (nodeId: string): number => {
      const node = nodesMap.get(nodeId);
      if (!node) return 0;
      
      if (node.children.length === 0) {
        widthsMap.set(nodeId, baseLeafWidth);
        return baseLeafWidth;
      }

      let totalWidth = 0;
      node.children.forEach((childId) => {
        totalWidth += computeWidth(childId);
      });

      // Add gaps between children
      const totalGaps = (node.children.length - 1) * siblingGap;
      const computed = Math.max(baseLeafWidth, totalWidth + totalGaps);
      
      widthsMap.set(nodeId, computed);
      return computed;
    };

    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 360;
    const treeWidth = computeWidth(rootId);
    const cWidth = Math.max(isMobile ? viewportWidth - 32 : 1000, treeWidth + (isMobile ? 40 : 240));

    // 2. Position nodes recursively
    const layout = (nodeId: string, x: number, y: number) => {
      const node = nodesMap.get(nodeId);
      if (!node) return;

      nodes.push({ node, x, y });

      const nodeWidth = widthsMap.get(nodeId) || baseLeafWidth;
      
      // Sort children alphabetically so they render in a consistent alphabetical order!
      const sortedChildren = [...node.children].sort((a, b) => {
        const charA = nodesMap.get(a)?.char ?? '';
        const charB = nodesMap.get(b)?.char ?? '';
        return charA.localeCompare(charB);
      });

      let currentLeft = x - nodeWidth / 2;

      sortedChildren.forEach((childId) => {
        const childWidth = widthsMap.get(childId) || baseLeafWidth;
        const childX = currentLeft + childWidth / 2;
        const childY = y + vSpacing;

        eds.push({
          id: `te-${nodeId}-${childId}`,
          from: nodeId,
          to: childId,
        });

        layout(childId, childX, childY);
        currentLeft += childWidth + siblingGap; // move boundary
      });
    };

    layout(rootId, cWidth / 2, isMobile ? 50 : 70);

    let maxY = 0;
    nodes.forEach((fn) => {
      if (fn.y > maxY) {
        maxY = fn.y;
      }
    });

    const cHeight = Math.max(520, maxY + nodeSize / 2 + 40);

    return { flatNodes: nodes, edges: eds, computedWidth: cWidth, computedHeight: cHeight };
  }, [trieNodes, rootId, isMobile, nodeSize, vSpacing, siblingGap, baseLeafWidth]);

  const { flatNodes, edges, computedWidth, computedHeight } = layoutData;

  const coord = useMemo(() => {
    const m = new Map<string, { x: number; y: number }>();
    flatNodes.forEach((fn) => m.set(fn.node.id, { x: fn.x, y: fn.y }));
    return m;
  }, [flatNodes]);

  if (trieNodes.length === 0 || !rootId) {
    return (
      <div className="flex h-full min-h-[520px] items-center justify-center text-slate-400">
        <div className="space-y-3 text-center">
          <p className="text-lg font-semibold text-slate-200">עץ אחזור (Trie) ריק</p>
          <p className="text-sm text-slate-500">הזן מילה בלוח ההפעלה כדי להתחיל בניית עץ אחזור</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[520px] rounded-[1.75rem] border border-slate-800 bg-slate-950 p-4 shadow-inner overflow-auto">
      <div style={{ width: computedWidth, height: computedHeight, position: 'relative', margin: '0 auto' }}>
            
            {/* SVG Edges Layer */}
            <svg
              className="absolute inset-0 block pointer-events-none"
              width={computedWidth}
              height={computedHeight}
              viewBox={`0 0 ${computedWidth} ${computedHeight}`}
              style={{ width: computedWidth, height: computedHeight }}
            >
              <g>
                {edges.map((e) => {
                  const from = coord.get(e.from);
                  const to = coord.get(e.to);
                  if (!from || !to) return null;
                  return (
                    <motion.line
                      key={e.id}
                      initial={false}
                      animate={{
                        x1: from.x,
                        y1: from.y,
                        x2: to.x,
                        y2: to.y,
                      }}
                      transition={{ type: 'spring', stiffness: 120, damping: 14 }}
                      stroke="#475569"
                      strokeWidth={2.5}
                      strokeLinecap="round"
                    />
                  );
                })}
              </g>
            </svg>

            {/* HTML Nodes Layer */}
            <div style={{ width: computedWidth, height: computedHeight, position: 'absolute', top: 0, left: 0 }}>
              {flatNodes.map((fn) => {
                const node = fn.node;
                const isRoot = node.char === '';
                const isDollar = node.char === '$';
                const isFailedNode = node.id === currentStep?.intenseHighlightId;
                
                const isHighlighted = highlightedNodeIds.has(node.id);
                
                // Color configuration
                const fill = isRoot
                  ? '#0f172a' // slate-900 for root
                  : isFailedNode
                  ? '#991b1b' // red-800 for failed search node
                  : isDollar
                  ? '#991b1b' // red-800 for dollar end marker
                  : isHighlighted
                  ? '#16a34a' // green for search/insert highlight
                  : '#1e293b'; // base slate-800

                const border = isFailedNode
                  ? '#ef4444' // bright red border for failed node
                  : isHighlighted
                  ? '#22c55e' // bright green border for highlighted
                  : isRoot
                  ? '#334155'
                  : isDollar
                  ? '#ef4444'
                  : '#475569';

                // Render as red squares for dollar sign markers, circles for chars
                const isSquare = isDollar;

                return (
                  <motion.div
                    key={node.id}
                    layoutId={node.id}
                    initial={false}
                    animate={{
                      x: fn.x - nodeSize / 2,
                      y: fn.y - nodeSize / 2,
                    }}
                    transition={{ type: 'spring', stiffness: 120, damping: 14 }}
                    className={`absolute flex items-center justify-center shadow-lg border-2 ${
                      isSquare ? 'rounded-lg' : 'rounded-full'
                    }`}
                    style={{
                      width: nodeSize,
                      height: nodeSize,
                      background: fill,
                      borderColor: border,
                      color: '#fff',
                      left: 0,
                      top: 0,
                      userSelect: 'none',
                      touchAction: 'none',
                    }}
                  >
                    <span className="font-extrabold text-base uppercase" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      {isRoot ? '' : node.char}
                    </span>
                  </motion.div>
                );
              })}
            </div>

      </div>
    </div>
  );
};

export default TrieCanvas;
