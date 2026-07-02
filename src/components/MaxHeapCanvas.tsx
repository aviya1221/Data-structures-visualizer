import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../app/store';
import type { HeapNode } from '../structures/heap/heapAlgorithms';

const NODE_SIZE = 60; // circular nodes for tree
const BOX_SIZE = 52;  // square boxes for array
const V_SPACING = 90; // vertical level spacing
const SVG_HEIGHT = 520;

export const MaxHeapCanvas: React.FC = () => {
  const { animationQueue, stepIndex, currentRoot } = useAppStore();
  const currentStep = animationQueue[stepIndex];
  const root = (animationQueue.length > 0 ? currentStep?.rootNode : currentRoot) as any | null;
  const heap: HeapNode[] = root?.heapArray ?? [];

  const highlightedNodeIds = new Set(currentStep?.highlightedNodeIds ?? []);

  // Compute dynamic width for scrolling
  const computedWidth = useMemo(() => {
    return Math.max(1000, heap.length * 68 + 160);
  }, [heap]);

  // Compute Layouts for Tree & Array
  const { treeNodes, edges, arrayNodes } = useMemo(() => {
    const tNodes: { node: HeapNode; x: number; y: number; index: number }[] = [];
    const aNodes: { node: HeapNode; x: number; y: number; index: number }[] = [];
    const eds: { id: string; from: string; to: string }[] = [];

    if (heap.length === 0) {
      return { treeNodes: tNodes, edges: eds, arrayNodes: aNodes };
    }

    const A = [null, ...heap];
    const size = heap.length;

    // 1. Compute Tree Layout (top half)
    const traverseTree = (i: number, x: number, y: number, hSpacing: number) => {
      if (i > size || !A[i]) return;

      tNodes.push({ node: A[i]!, x, y, index: i });

      const leftIdx = 2 * i;
      const rightIdx = 2 * i + 1;

      if (leftIdx <= size && A[leftIdx]) {
        eds.push({
          id: `he-${A[i]!.id}-${A[leftIdx]!.id}`,
          from: A[i]!.id,
          to: A[leftIdx]!.id,
        });
        traverseTree(leftIdx, x - hSpacing, y + V_SPACING, hSpacing * 0.5);
      }

      if (rightIdx <= size && A[rightIdx]) {
        eds.push({
          id: `he-${A[i]!.id}-${A[rightIdx]!.id}`,
          from: A[i]!.id,
          to: A[rightIdx]!.id,
        });
        traverseTree(rightIdx, x + hSpacing, y + V_SPACING, hSpacing * 0.5);
      }
    };

    const rootX = computedWidth / 2;
    const rootY = 60;
    const initialHSpacing = Math.min(220, computedWidth / 5);
    traverseTree(1, rootX, rootY, initialHSpacing);

    // 2. Compute Array Layout (bottom half)
    const arrayStartX = Math.max(80, (computedWidth - size * 68) / 2);
    const arrayY = 430;

    for (let i = 1; i <= size; i++) {
      if (A[i]) {
        aNodes.push({
          node: A[i]!,
          x: arrayStartX + (i - 1) * 68 + BOX_SIZE / 2,
          y: arrayY + BOX_SIZE / 2,
          index: i,
        });
      }
    }

    return { treeNodes: tNodes, edges: eds, arrayNodes: aNodes };
  }, [heap, computedWidth]);

  // Combined lookup coordinate mapping
  const coord = useMemo(() => {
    const m = new Map<string, { x: number; y: number }>();
    treeNodes.forEach((t) => m.set(t.node.id, { x: t.x, y: t.y }));
    return m;
  }, [treeNodes]);

  if (heap.length === 0) {
    return (
      <div className="flex h-full min-h-[520px] items-center justify-center text-slate-400">
        <div className="space-y-3 text-center">
          <p className="text-lg font-semibold text-slate-200">הערימה ריקה</p>
          <p className="text-sm text-slate-500">הזן ערך בלוח ההפעלה כדי להתחיל הכנסה של Max-Heap</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[520px] rounded-[1.75rem] border border-slate-800 bg-slate-950 p-4 shadow-inner overflow-x-auto overflow-y-hidden">
      <div style={{ width: computedWidth, height: SVG_HEIGHT, position: 'relative' }}>
        
        {/* Array Separation Line Label */}
        <div 
          className="absolute left-4 right-4 border-t border-slate-850 flex items-center justify-start text-xs font-bold text-slate-500 pointer-events-none select-none"
          style={{ top: 380 }}
        >
          <span className="bg-slate-950 px-3 py-1 rounded border border-slate-900 -translate-y-1/2">
            ייצוג מערך (1-based index)
          </span>
        </div>

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
                  strokeWidth={3}
                  strokeLinecap="round"
                />
              );
            })}
          </g>
        </svg>

        {/* Tree Nodes Layer */}
        <div style={{ width: computedWidth, height: SVG_HEIGHT, position: 'absolute', top: 0, left: 0 }}>
          {treeNodes.map((t) => {
            const isInserted = currentStep?.stepType === 'insert' && highlightedNodeIds.has(t.node.id);
            const isRotation = currentStep?.stepType === 'rotation' && highlightedNodeIds.has(t.node.id);
            const isRecolor = currentStep?.stepType === 'recolor' && highlightedNodeIds.has(t.node.id);

            const fill = isInserted
              ? '#16a34a' // green
              : isRotation
              ? '#8b5cf6' // violet
              : isRecolor
              ? '#eab308' // amber
              : '#1e293b'; // base slate

            const border = isInserted
              ? '#15803d'
              : isRotation
              ? '#7c3aed'
              : isRecolor
              ? '#d97706'
              : '#384252';

            return (
              <motion.div
                key={`tree-${t.node.id}`}
                layoutId={`tree-${t.node.id}`}
                initial={false}
                animate={{
                  x: t.x - NODE_SIZE / 2,
                  y: t.y - NODE_SIZE / 2,
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
                <span dir="ltr" className="font-extrabold text-base" style={{ direction: 'ltr', unicodeBidi: 'embed', fontFamily: 'Outfit, sans-serif' }}>
                  {t.node.value}
                </span>
                <span className="absolute -bottom-5 text-xxs font-bold text-slate-500">
                  idx: {t.index}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Array Representation Layer */}
        <div style={{ width: computedWidth, height: SVG_HEIGHT, position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
          {arrayNodes.map((a) => {
            const isInserted = currentStep?.stepType === 'insert' && highlightedNodeIds.has(a.node.id);
            const isRotation = currentStep?.stepType === 'rotation' && highlightedNodeIds.has(a.node.id);
            const isRecolor = currentStep?.stepType === 'recolor' && highlightedNodeIds.has(a.node.id);

            const fill = isInserted
              ? '#16a34a'
              : isRotation
              ? '#8b5cf6'
              : isRecolor
              ? '#eab308'
              : '#0f172a';

            const border = isInserted
              ? '#15803d'
              : isRotation
              ? '#7c3aed'
              : isRecolor
              ? '#d97706'
              : '#1e293b';

            return (
              <motion.div
                key={`arr-${a.node.id}`}
                layoutId={`arr-${a.node.id}`}
                initial={false}
                animate={{
                  x: a.x - BOX_SIZE / 2,
                  y: a.y - BOX_SIZE / 2,
                }}
                transition={{ type: 'spring', stiffness: 120, damping: 14 }}
                className="absolute flex flex-col items-center justify-center rounded-lg shadow-md border-2"
                style={{
                  width: BOX_SIZE,
                  height: BOX_SIZE,
                  background: fill,
                  borderColor: border,
                  color: '#fff',
                  left: 0,
                  top: 0,
                  userSelect: 'none',
                }}
              >
                <span dir="ltr" className="font-extrabold text-sm" style={{ direction: 'ltr', unicodeBidi: 'embed', fontFamily: 'Outfit, sans-serif' }}>
                  {a.node.value}
                </span>
                <span dir="ltr" className="absolute -bottom-5 text-xxs font-bold text-slate-500" style={{ direction: 'ltr' }}>
                  [{a.index}]
                </span>
              </motion.div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default MaxHeapCanvas;
