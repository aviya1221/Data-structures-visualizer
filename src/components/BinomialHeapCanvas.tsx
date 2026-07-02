import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../app/store';
import type { BinomialTreeNode } from '../structures/binomial/binomialAlgorithms';

const NODE_SIZE = 52;
const SVG_WIDTH = 1000;
const SVG_HEIGHT = 520;

export const BinomialHeapCanvas: React.FC = () => {
  const { animationQueue, stepIndex, currentRoot } = useAppStore();
  const currentStep = animationQueue[stepIndex];
  const root = (animationQueue.length > 0 ? currentStep?.rootNode : currentRoot) as any | null;
  const forest: BinomialTreeNode[] = root?.binomialTrees ?? [];

  const highlightedNodeIds = new Set(currentStep?.highlightedNodeIds ?? []);

  // Compute Layouts for Binomial Forest
  const { flatNodes, edges } = useMemo(() => {
    const nodes: { node: BinomialTreeNode; x: number; y: number }[] = [];
    const eds: { id: string; from: string; to: string }[] = [];

    if (forest.length === 0) {
      return { flatNodes: nodes, edges: eds };
    }

    // Sort forest by order
    const sortedForest = [...forest].sort((a, b) => a.order - b.order);

    // Recursively layout a single binomial tree using interval subdivision
    const layoutTree = (
      node: BinomialTreeNode,
      leftBound: number,
      rightBound: number,
      y: number
    ) => {
      // The parent root is positioned at the center of its designated horizontal boundary
      const x = (leftBound + rightBound) / 2;
      nodes.push({ node, x, y });

      if (node.children.length === 0) return;

      // Children are ordered from order r-1 down to 0
      // Sum the leaf counts (2^order) of all children
      const totalLeaves = node.children.reduce((acc, child) => acc + Math.pow(2, child.order), 0);

      let currentLeft = leftBound;
      const width = rightBound - leftBound;

      node.children.forEach((child) => {
        const childLeaves = Math.pow(2, child.order);
        // Distribute the width slice proportionally to the subtree size
        const childWidth = width * (childLeaves / totalLeaves);
        const childRight = currentLeft + childWidth;

        eds.push({
          id: `be-${node.id}-${child.id}`,
          from: node.id,
          to: child.id,
        });

        // Recursively lay out the child in its slice
        layoutTree(child, currentLeft, childRight, y + 80);
        currentLeft = childRight;
      });
    };

    // Calculate total leaf count of the forest to divide the canvas space
    const forestLeavesSum = sortedForest.reduce((acc, tree) => acc + Math.pow(2, tree.order), 0);
    const canvasMargin = 60;
    const availableWidth = SVG_WIDTH - 2 * canvasMargin;

    let currentLeft = canvasMargin;

    sortedForest.forEach((tree) => {
      const treeLeaves = Math.pow(2, tree.order);
      const treeWidth = availableWidth * (treeLeaves / forestLeavesSum);
      const treeRight = currentLeft + treeWidth;

      layoutTree(tree, currentLeft, treeRight, 80);
      currentLeft = treeRight;
    });

    return { flatNodes: nodes, edges: eds };
  }, [forest]);

  const coord = useMemo(() => {
    const m = new Map<string, { x: number; y: number }>();
    flatNodes.forEach((fn) => m.set(fn.node.id, { x: fn.x, y: fn.y }));
    return m;
  }, [flatNodes]);

  if (forest.length === 0) {
    return (
      <div className="flex h-full min-h-[520px] items-center justify-center text-slate-400">
        <div className="space-y-3 text-center">
          <p className="text-lg font-semibold text-slate-200">הערימה הבינומית ריקה</p>
          <p className="text-sm text-slate-500">הזן ערך בלוח ההפעלה כדי להתחיל הכנסה של Binomial Heap</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[520px] rounded-[1.75rem] border border-slate-800 bg-slate-950 p-4 shadow-inner overflow-hidden">
      <div style={{ width: SVG_WIDTH, height: SVG_HEIGHT, position: 'relative', margin: '0 auto' }}>
        
        {/* SVG Edges Layer */}
        <svg
          className="absolute inset-0 block pointer-events-none"
          width={SVG_WIDTH}
          height={SVG_HEIGHT}
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          style={{ width: SVG_WIDTH, height: SVG_HEIGHT }}
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
        <div style={{ width: SVG_WIDTH, height: SVG_HEIGHT, position: 'absolute', top: 0, left: 0 }}>
          {flatNodes.map((fn) => {
            const isInserted = currentStep?.stepType === 'insert' && highlightedNodeIds.has(fn.node.id);
            const isRotation = currentStep?.stepType === 'rotation' && highlightedNodeIds.has(fn.node.id);
            const isRecolor = currentStep?.stepType === 'recolor' && highlightedNodeIds.has(fn.node.id);

            const fill = isInserted
              ? '#16a34a' // green for insert
              : isRotation
              ? '#8b5cf6' // violet for successful merge
              : isRecolor
              ? '#eab308' // amber for comparison/prepare merge
              : '#1e293b'; // slate base min-heap

            const border = isInserted
              ? '#15803d'
              : isRotation
              ? '#7c3aed'
              : isRecolor
              ? '#d97706'
              : '#384252';

            return (
              <motion.div
                key={fn.node.id}
                layoutId={fn.node.id}
                initial={false}
                animate={{
                  x: fn.x - NODE_SIZE / 2,
                  y: fn.y - NODE_SIZE / 2,
                }}
                transition={{ type: 'spring', stiffness: 120, damping: 14 }}
                className="absolute flex flex-col items-center justify-center rounded-full shadow-lg border-2"
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
                <span dir="ltr" className="font-extrabold text-sm" style={{ direction: 'ltr', unicodeBidi: 'embed', fontFamily: 'Outfit, sans-serif' }}>
                  {fn.node.value}
                </span>
                <span dir="ltr" className="absolute -top-3 text-[10px] font-bold text-slate-500" style={{ direction: 'ltr' }}>
                  deg: {fn.node.order}
                </span>
              </motion.div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default BinomialHeapCanvas;
