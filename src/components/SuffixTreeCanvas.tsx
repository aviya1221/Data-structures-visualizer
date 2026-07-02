import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { useAppStore } from '../app/store';
import { type SuffixTreeNode } from '../structures/suffix/types';

const NODE_SIZE = 50;
const V_SPACING = 85;
const SVG_HEIGHT = 520;

export const SuffixTreeCanvas: React.FC = () => {
  const { animationQueue, stepIndex, currentRoot } = useAppStore();
  const currentStep = animationQueue[stepIndex];
  const root = (animationQueue.length > 0 ? currentStep?.rootNode : currentRoot) as any | null;
  const suffixNodes: SuffixTreeNode[] = root?.suffixNodes ?? [];
  const rootId: string | null = root?.rootId ?? null;

  const highlightedNodeIds = new Set(currentStep?.highlightedNodeIds ?? []);

  // Compute Layouts
  const { flatNodes, edges, computedWidth } = useMemo(() => {
    const nodes: { node: SuffixTreeNode; x: number; y: number }[] = [];
    const eds: { id: string; from: string; to: string }[] = [];

    if (suffixNodes.length === 0 || !rootId) {
      return { flatNodes: nodes, edges: eds, computedWidth: 1000 };
    }

    const nodesMap = new Map<string, SuffixTreeNode>();
    suffixNodes.forEach((n) => nodesMap.set(n.id, n));

    const widthsMap = new Map<string, number>();

    // 1. Calculate subtree widths recursively to prevent overlapping branches
    const computeWidth = (nodeId: string): number => {
      const node = nodesMap.get(nodeId);
      if (!node) return 0;
      
      if (node.children.length === 0) {
        widthsMap.set(nodeId, 45); // base leaf width
        return 45;
      }

      let totalWidth = 0;
      node.children.forEach((childId) => {
        totalWidth += computeWidth(childId);
      });

      // Add gaps between children
      const totalGaps = (node.children.length - 1) * 35;
      const computed = Math.max(45, totalWidth + totalGaps);
      
      widthsMap.set(nodeId, computed);
      return computed;
    };

    const treeWidth = computeWidth(rootId);
    const cWidth = Math.max(1000, treeWidth + 240);

    // 2. Position nodes recursively
    const layout = (nodeId: string, x: number, y: number) => {
      const node = nodesMap.get(nodeId);
      if (!node) return;

      nodes.push({ node, x, y });

      const nodeWidth = widthsMap.get(nodeId) || 45;
      
      // Sort children alphabetically so they render in a consistent alphabetical order!
      const sortedChildren = [...node.children].sort((a, b) => {
        const charA = nodesMap.get(a)?.char ?? '';
        const charB = nodesMap.get(b)?.char ?? '';
        return charA.localeCompare(charB);
      });

      let currentLeft = x - nodeWidth / 2;

      sortedChildren.forEach((childId) => {
        const childWidth = widthsMap.get(childId) || 45;
        const childX = currentLeft + childWidth / 2;
        const childY = y + V_SPACING;

        eds.push({
          id: `se-${nodeId}-${childId}`,
          from: nodeId,
          to: childId,
        });

        layout(childId, childX, childY);
        currentLeft += childWidth + 35; // move boundary
      });
    };

    layout(rootId, cWidth / 2, 70);

    return { flatNodes: nodes, edges: eds, computedWidth: cWidth };
  }, [suffixNodes, rootId]);

  const coord = useMemo(() => {
    const m = new Map<string, { x: number; y: number }>();
    flatNodes.forEach((fn) => m.set(fn.node.id, { x: fn.x, y: fn.y }));
    return m;
  }, [flatNodes]);

  if (suffixNodes.length === 0 || !rootId) {
    return (
      <div className="flex h-full min-h-[520px] items-center justify-center text-slate-400">
        <div className="space-y-3 text-center">
          <p className="text-lg font-semibold text-slate-200">עץ סיומת (Suffix Tree) ריק</p>
          <p className="text-sm text-slate-500">הזן מחרוזת בלוח ההפעלה כדי להתחיל בניית עץ סיומת</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[520px] rounded-[1.75rem] border border-slate-800 bg-slate-950 p-4 shadow-inner overflow-x-auto overflow-y-hidden">
      <TransformWrapper
        wheel={{ disabled: false, step: 0.12 }}
        pinch={{ disabled: false }}
        doubleClick={{ disabled: true }}
        panning={{ disabled: false }}
        initialScale={1}
        initialPositionX={0}
        initialPositionY={0}
      >
        <TransformComponent
          wrapperStyle={{ width: '100%', height: '100%', minHeight: '520px' }}
          contentStyle={{ width: computedWidth, height: SVG_HEIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div style={{ width: computedWidth, height: SVG_HEIGHT, position: 'relative' }}>
            
            {/* SVG Edges Layer */}
            <svg
              className="absolute inset-0 block pointer-events-none"
              width={computedWidth}
              height={SVG_HEIGHT}
              viewBox={`0 0 ${computedWidth} ${SVG_HEIGHT}`}
              style={{ width: computedWidth, height: SVG_HEIGHT }}
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
            <div style={{ width: computedWidth, height: SVG_HEIGHT, position: 'absolute', top: 0, left: 0 }}>
              {flatNodes.map((fn) => {
                const node = fn.node;
                const isRoot = node.char === '';
                const isDollar = node.char === '$';
                
                const isHighlighted = highlightedNodeIds.has(node.id);
                
                const fill = isRoot
                  ? '#0f172a'
                  : isDollar
                  ? '#991b1b' // red-800 for dollar
                  : isHighlighted
                  ? '#16a34a'
                  : '#1e293b';

                const border = isHighlighted
                  ? '#15803d'
                  : isRoot
                  ? '#334155'
                  : isDollar
                  ? '#ef4444'
                  : '#475569';

                const isSquare = isDollar;

                return (
                  <motion.div
                    key={node.id}
                    layoutId={node.id}
                    initial={false}
                    animate={{
                      x: fn.x - NODE_SIZE / 2,
                      y: fn.y - NODE_SIZE / 2,
                    }}
                    transition={{ type: 'spring', stiffness: 120, damping: 14 }}
                    className={`absolute flex items-center justify-center shadow-lg border-2 ${
                      isSquare ? 'rounded-lg' : 'rounded-full'
                    }`}
                    style={{
                      width: NODE_SIZE,
                      height: NODE_SIZE,
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
                      {isRoot ? 'R' : node.char}
                    </span>
                  </motion.div>
                );
              })}
            </div>

          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
};

export default SuffixTreeCanvas;
