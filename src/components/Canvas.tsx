import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { useAppStore } from '../app/store';
import type { TreeNode } from '../structures/types';

const NODE_SIZE = 64; // px
const HORIZONTAL_SPACING = 160;
const VERTICAL_SPACING = 120;
const SVG_WIDTH = 1000;
const SVG_HEIGHT = 520;
const CANVAS_PADDING = 20;

interface FlatNode {
  node: TreeNode;
  x: number;
  y: number;
}

interface Edge {
  id: string;
  from: string;
  to: string;
}

/**
 * Improved hierarchical layout:
 * 1) Assign leaf indices via inorder traversal
 * 2) For each node compute min/max leaf index in its subtree
 * 3) Node x = average(min,max) * HORIZONTAL_SPACING
 */
const computeFlatLayout = (root: TreeNode | null) => {
  const flat: FlatNode[] = [];
  const edges: Edge[] = [];
  let leafCounter = 0;

  // assign leaf indices
  const assignLeaf = (n: TreeNode | null) => {
    if (!n) return;
    assignLeaf(n.left as TreeNode | null);
    if (!n.left && !n.right) {
      (n as any).__leafIndex = leafCounter++;
    }
    assignLeaf(n.right as TreeNode | null);
  };

  assignLeaf(root);

  // compute min/max and positions
  const compute = (n: TreeNode | null, depth: number): { min: number; max: number } | null => {
    if (!n) return null;
    const left = compute(n.left as TreeNode | null, depth + 1);
    const right = compute(n.right as TreeNode | null, depth + 1);

    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;

    if (!n.left && !n.right) {
      const idx = (n as any).__leafIndex ?? leafCounter++;
      min = max = idx;
    } else {
      if (left) {
        min = Math.min(min, left.min);
        max = Math.max(max, left.max);
      }
      if (right) {
        min = Math.min(min, right.min);
        max = Math.max(max, right.max);
      }
    }

    // center position between min and max
    const center = (min + max) / 2;
    const x = center * HORIZONTAL_SPACING;
    const y = depth * VERTICAL_SPACING;
    flat.push({ node: n, x, y });

    if (n.left) edges.push({ id: `${n.id}-${n.left.id}`, from: n.id, to: n.left.id });
    if (n.right) edges.push({ id: `${n.id}-${n.right.id}`, from: n.id, to: n.right.id });

    return { min, max };
  };

  compute(root, 0);

  // normalize into absolute canvas coordinates centered in the SVG viewBox
  if (flat.length > 0) {
    let minX = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;

    flat.forEach((item) => {
      minX = Math.min(minX, item.x);
      maxX = Math.max(maxX, item.x);
      minY = Math.min(minY, item.y);
      maxY = Math.max(maxY, item.y);
    });

    const contentWidth = Math.max(1, maxX - minX);
    const contentHeight = Math.max(1, maxY - minY);
    const offsetX = (SVG_WIDTH - contentWidth) / 2 - minX;
    const offsetY = (SVG_HEIGHT - contentHeight) / 2 - minY;

    for (const item of flat) {
      item.x = Number.isFinite(item.x) ? item.x + offsetX : SVG_WIDTH / 2;
      item.y = Number.isFinite(item.y) ? item.y + offsetY : CANVAS_PADDING;
    }
  }

  // cleanup temporary leaf indices
  const cleanup = (n: TreeNode | null) => {
    if (!n) return;
    delete (n as any).__leafIndex;
    cleanup(n.left as TreeNode | null);
    cleanup(n.right as TreeNode | null);
  };
  cleanup(root);

  return { flat, edges };
};

const Canvas: React.FC<{ activeTab: string }> = ({ activeTab }) => {
  const { animationQueue, stepIndex, currentRoot } = useAppStore();
  const currentStep = animationQueue[stepIndex];
  const root = (animationQueue.length > 0 ? currentStep?.rootNode : currentRoot) as TreeNode | null;

  const { flat, edges } = useMemo(() => computeFlatLayout(root), [root]);

  if (typeof window !== 'undefined') {
    console.log('Canvas flat layout', {
      rootExists: !!root,
      rootNode: root,
      flatLength: flat.length,
      flat,
      edgesLength: edges.length,
      edges,
    });
  }

  // map for quick lookup of coords
  const coord = useMemo(() => {
    const m = new Map<string, { x: number; y: number }>();
    flat.forEach((f) => m.set(f.node.id, { x: f.x, y: f.y }));
    return m;
  }, [flat]);

  const highlightedNodeIds = new Set(currentStep?.highlightedNodeIds ?? []);
  const intenseHighlightId = currentStep?.intenseHighlightId;
  const width = SVG_WIDTH;
  const height = SVG_HEIGHT;

  return (
    <div className="relative w-full min-h-[520px] overflow-hidden rounded-[1.5rem] bg-transparent p-4">
      <TransformWrapper
        wheel={{ disabled: false, step: 0.12 }}
        pinch={{ disabled: false }}
        doubleClick={{ disabled: true }}
        panning={{ disabled: false }}
      >
        <TransformComponent>
          <svg className="block" width={width} height={height} viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} preserveAspectRatio="xMinYMin meet">
            <g>
              {edges.map((e) => {
                const from = coord.get(e.from)!;
                const to = coord.get(e.to)!;
                return (
                  <motion.line
                    key={e.id}
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke="#94a3b8"
                    strokeWidth={2}
                    initial={false}
                    animate={{ x1: from.x, y1: from.y, x2: to.x, y2: to.y }}
                    transition={{ type: 'spring', stiffness: 120, damping: 14 }}
                  />
                );
              })}
            </g>
          </svg>

          {/* Node layer: absolute positioned container inside the transform */}
          <div style={{ width, height, position: 'relative' }}>
            {flat.map((f) => {
              const isIntense = f.node.id === intenseHighlightId;
              const isHighlighted = highlightedNodeIds.has(f.node.id);
              const nodeColor = (f.node as any).color === 'red' ? '#ef4444' : '#0f172a';
              const background = isIntense ? '#fb923c' : isHighlighted ? '#fbbf24' : nodeColor;
              const borderColor = isIntense ? '#f97316' : isHighlighted ? '#f59e0b' : 'rgba(255,255,255,0.06)';

              return (
                <motion.div
                  key={f.node.id}
                  initial={false}
                  animate={{ x: f.x - NODE_SIZE / 2, y: f.y - NODE_SIZE / 2 }}
                  transition={{ type: 'spring', stiffness: 120, damping: 14 }}
                  className="absolute flex items-center justify-center rounded-full shadow-md"
                  style={{ width: NODE_SIZE, height: NODE_SIZE, background, color: '#fff', border: `2px solid ${borderColor}`, userSelect: 'none', touchAction: 'none' }}
                >
                <div className="flex flex-col items-center justify-center text-center pointer-events-none">
                  <div style={{ fontWeight: 800, fontSize: 18 }}>{f.node.value}</div>
                  {activeTab === 'avl' ? (
                    <div style={{ fontSize: 14, color: '#ff7a7a', marginTop: 6 }}>{(f.node as any).height ?? ''}</div>
                  ) : null}
                </div>
              </motion.div>
            );
          })}
          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
};

export default Canvas;
