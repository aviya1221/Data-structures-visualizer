import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../app/store';
import type { BPlusNode } from '../structures/bplus/types';

const CELL_WIDTH = 38;
const BLOCK_HEIGHT = 64; // increased height to fit two rows
const SVG_HEIGHT = 520;

export const BPlusTreeCanvas: React.FC = () => {
  const { animationQueue, stepIndex, currentRoot } = useAppStore();
  const currentStep = animationQueue[stepIndex];
  const root = (animationQueue.length > 0 ? currentStep?.rootNode : currentRoot) as any | null;
  const nodesArray: BPlusNode[] = root?.bplusNodes ?? [];
  const rootId: string | null = root?.rootId ?? null;

  const highlightedNodeIds = new Set(currentStep?.highlightedNodeIds ?? []);

  // Compute Layouts
  const { blockLayouts, parentEdges, leafNextEdges, computedWidth } = useMemo(() => {
    const layouts = new Map<string, { x: number; y: number; width: number; capacity: number; node: BPlusNode }>();
    const pEdges: { id: string; x1: number; y1: number; x2: number; y2: number }[] = [];
    const lEdges: { id: string; x1: number; y1: number; x2: number; y2: number }[] = [];

    if (nodesArray.length === 0 || !rootId) {
      return { blockLayouts: layouts, parentEdges: pEdges, leafNextEdges: lEdges, computedWidth: 1000 };
    }

    const nodesMap = new Map<string, BPlusNode>();
    nodesArray.forEach((n) => nodesMap.set(n.id, n));

    // 1. Find the leftmost leaf node by traversing down the leftmost children
    let firstLeafId = rootId;
    let scanNode = nodesMap.get(rootId);
    while (scanNode && !scanNode.isLeaf) {
      firstLeafId = scanNode.children[0];
      scanNode = nodesMap.get(firstLeafId);
    }

    // 2. Build ordered leaves list
    const orderedLeaves: BPlusNode[] = [];
    let currId: string | null = firstLeafId;
    while (currId) {
      const leaf = nodesMap.get(currId);
      if (!leaf) break;
      orderedLeaves.push(leaf);
      currId = leaf.next;
    }

    const LEAF_GAP = 45;
    const getBlockCapacity = (node: BPlusNode) => Math.max(3, node.keys.length);
    const getBlockWidth = (node: BPlusNode) => getBlockCapacity(node) * CELL_WIDTH;
    
    let totalLeavesWidth = 0;
    const leafWidths = orderedLeaves.map((leaf) => {
      const w = getBlockWidth(leaf);
      totalLeavesWidth += w + LEAF_GAP;
      return w;
    });

    const cWidth = Math.max(1000, totalLeavesWidth + 120);

    // 3. Position leaf nodes side-by-side
    let currentLeft = (cWidth - totalLeavesWidth) / 2;
    const leafY = 380;

    orderedLeaves.forEach((leaf, idx) => {
      const w = leafWidths[idx];
      const x = currentLeft + w / 2;
      layouts.set(leaf.id, { x, y: leafY, width: w, capacity: getBlockCapacity(leaf), node: leaf });
      currentLeft += w + LEAF_GAP;
    });

    // 4. Position index nodes level-by-level bottom-up
    const nodeDepths = new Map<string, number>();
    const computeDepth = (id: string, depth: number) => {
      nodeDepths.set(id, depth);
      const node = nodesMap.get(id);
      if (node && !node.isLeaf) {
        node.children.forEach((childId) => computeDepth(childId, depth + 1));
      }
    };
    computeDepth(rootId, 0);

    const indexNodes = nodesArray
      .filter((n) => !n.isLeaf)
      .sort((a, b) => (nodeDepths.get(b.id) ?? 0) - (nodeDepths.get(a.id) ?? 0));

    indexNodes.forEach((node) => {
      const childrenCoords = node.children
        .map((childId) => layouts.get(childId))
        .filter(Boolean) as { x: number; y: number }[];

      if (childrenCoords.length > 0) {
        const minX = Math.min(...childrenCoords.map((c) => c.x));
        const maxX = Math.max(...childrenCoords.map((c) => c.x));
        const x = (minX + maxX) / 2;
        
        const depth = nodeDepths.get(node.id) ?? 0;
        const maxDepth = Math.max(...Array.from(nodeDepths.values()));
        const y = leafY - (maxDepth - depth) * 125;
        
        const w = getBlockWidth(node);
        layouts.set(node.id, { x, y, width: w, capacity: getBlockCapacity(node), node });
      }
    });

    // 5. Generate parent-child child edges starting from pointer row cells
    nodesArray.forEach((node) => {
      const parentLayout = layouts.get(node.id);
      if (!parentLayout || node.isLeaf) return;

      const pX = parentLayout.x;
      const pY = parentLayout.y;
      const pW = parentLayout.width;
      const pCap = parentLayout.capacity;
      const bottomCellWidth = pW / (pCap + 1);

      node.children.forEach((childId, childIdx) => {
        const childLayout = layouts.get(childId);
        if (!childLayout) return;

        // Pointers originate from the center of each pointer dot cell in bottom row
        const originX = pX - pW / 2 + childIdx * bottomCellWidth + bottomCellWidth / 2;
        const originY = pY + BLOCK_HEIGHT / 2 - 13; // centered in bottom row height

        pEdges.push({
          id: `pe-${node.id}-${childId}`,
          x1: originX,
          y1: originY,
          x2: childLayout.x,
          y2: childLayout.y - BLOCK_HEIGHT / 2,
        });
      });
    });

    // 6. Generate leaf sequential linked-list edges
    for (let i = 0; i < orderedLeaves.length - 1; i++) {
      const leafA = layouts.get(orderedLeaves[i].id)!;
      const leafB = layouts.get(orderedLeaves[i + 1].id)!;

      const bottomCellWidthA = leafA.width / (leafA.capacity + 1);
      // Sibling pointer originates from the last pointer dot cell in bottom row of leafA
      const originX = leafA.x + leafA.width / 2 - bottomCellWidthA / 2;
      const originY = leafA.y + BLOCK_HEIGHT / 2 - 13;

      lEdges.push({
        id: `le-${orderedLeaves[i].id}-${orderedLeaves[i + 1].id}`,
        x1: originX,
        y1: originY,
        x2: leafB.x - leafB.width / 2,
        y2: leafB.y + BLOCK_HEIGHT / 2 - 13,
      });
    }

    return {
      blockLayouts: layouts,
      parentEdges: pEdges,
      leafNextEdges: lEdges,
      computedWidth: cWidth,
    };
  }, [nodesArray, rootId]);

  if (nodesArray.length === 0 || !rootId) {
    return (
      <div className="flex h-full min-h-[520px] items-center justify-center text-slate-400">
        <div className="space-y-3 text-center">
          <p className="text-lg font-semibold text-slate-200">עץ B+ ריק</p>
          <p className="text-sm text-slate-500">הזן ערך בלוח ההפעלה כדי להתחיל בניית עץ B+</p>
        </div>
      </div>
    );
  }

  const layoutsList = Array.from(blockLayouts.values());

  return (
    <div className="relative w-full h-full min-h-[520px] rounded-[1.75rem] border border-slate-800 bg-slate-950 p-4 shadow-inner overflow-x-auto overflow-y-hidden">
      <div style={{ width: computedWidth, height: SVG_HEIGHT, position: 'relative' }}>
        
        {/* SVG Edges Layer */}
        <svg
          className="absolute inset-0 block pointer-events-none"
          width={computedWidth}
          height={SVG_HEIGHT}
          viewBox={`0 0 ${computedWidth} ${SVG_HEIGHT}`}
          style={{ width: computedWidth, height: SVG_HEIGHT }}
        >
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
            </marker>
          </defs>

          {/* Parent-Child child branches */}
          <g>
            {parentEdges.map((e) => (
              <motion.line
                key={e.id}
                initial={false}
                animate={{
                  x1: e.x1,
                  y1: e.y1,
                  x2: e.x2,
                  y2: e.y2,
                }}
                transition={{ type: 'spring', stiffness: 120, damping: 14 }}
                stroke="#475569"
                strokeWidth={2.5}
                strokeLinecap="round"
              />
            ))}
          </g>

          {/* Leaf Linked-List Range-Query paths */}
          <g>
            {leafNextEdges.map((e) => (
              <motion.line
                key={e.id}
                initial={false}
                animate={{
                  x1: e.x1,
                  y1: e.y1,
                  x2: e.x2,
                  y2: e.y2,
                }}
                transition={{ type: 'spring', stiffness: 120, damping: 14 }}
                stroke="#10b981"
                strokeWidth={2.5}
                strokeDasharray="4 3"
                markerEnd="url(#arrow)"
              />
            ))}
          </g>
        </svg>

        {/* HTML Node blocks */}
        <div style={{ width: computedWidth, height: SVG_HEIGHT, position: 'absolute', top: 0, left: 0 }}>
          {layoutsList.map((layout) => {
            const { node, x, y, width, capacity } = layout;
            
            const isHighlighted = highlightedNodeIds.has(node.id);
            const isLeaf = node.isLeaf;

            // Highlight border if active splitting or path traversal is occurring
            const borderColor = isHighlighted
              ? '#0ea5e9' // Sky blue glow
              : isLeaf
              ? '#1e293b' // Dark slate for leaves
              : '#334155'; // Grey for index blocks

            // Row 1 (Keys slots): capacity cells
            const keySlots = Array.from({ length: capacity });
            // Row 2 (Pointers slots): capacity + 1 cells
            const pointerSlots = Array.from({ length: capacity + 1 });
            const bottomCellWidth = width / (capacity + 1);

            return (
              <motion.div
                key={node.id}
                layoutId={node.id}
                initial={false}
                animate={{
                  x: x - width / 2,
                  y: y - BLOCK_HEIGHT / 2,
                }}
                transition={{ type: 'spring', stiffness: 120, damping: 14 }}
                className="absolute flex flex-col bg-slate-900 rounded-lg shadow-md border-2 p-0.5 overflow-hidden"
                style={{
                  height: BLOCK_HEIGHT,
                  width: width,
                  borderColor: borderColor,
                  left: 0,
                  top: 0,
                }}
              >
                {/* Row 1: Keys Row (LTR Forced) */}
                <div dir="ltr" className="flex flex-row w-full h-[28px]">
                  {keySlots.map((_, slotIdx) => {
                    const keyVal = node.keys[slotIdx];
                    const hasKey = keyVal !== undefined;

                    return (
                      <div
                        key={slotIdx}
                        className="flex-1 h-full border-r last:border-r-0 border-slate-800 flex items-center justify-center relative select-none"
                      >
                        {hasKey ? (
                          <motion.span
                            layoutId={`val-${keyVal}`}
                            className="font-extrabold text-sm text-slate-100"
                            style={{ fontFamily: 'Outfit, sans-serif' }}
                          >
                            {keyVal}
                          </motion.span>
                        ) : (
                          <span className="text-slate-700 font-bold text-xs">-</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Row 2: Pointer Dots Row (LTR Forced) */}
                <div dir="ltr" className="flex flex-row w-full h-[28px] border-t border-slate-800">
                  {pointerSlots.map((_, pIdx) => {
                    // Decide if dot should be colored emerald for leaf sibling chain
                    const isLastLeafPointer = isLeaf && pIdx === capacity;
                    
                    return (
                      <div
                        key={pIdx}
                        className="border-r last:border-r-0 border-slate-800 flex items-center justify-center relative select-none"
                        style={{ width: bottomCellWidth }}
                      >
                        <span className={`font-black text-sm ${isLastLeafPointer ? 'text-emerald-400' : 'text-slate-500'}`}>
                          •
                        </span>
                      </div>
                    );
                  })}
                </div>

              </motion.div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default BPlusTreeCanvas;
