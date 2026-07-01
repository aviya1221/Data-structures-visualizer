import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { useAppStore } from '../app/store';
import type { TreeNode } from '../structures/types';
import type { SkipListNode } from '../structures/skiplist/types';
import MaxHeapCanvas from './MaxHeapCanvas';
import BinomialHeapCanvas from './BinomialHeapCanvas';
import BPlusTreeCanvas from './BPlusTreeCanvas';
import TrieCanvas from './TrieCanvas';

const NODE_SIZE = 64; // px (used for tree circles)
const VERTICAL_SPACING = 100; // px (used for tree levels)
const SVG_HEIGHT = 520;

// Dimensions for Skip List boxes
const SKIP_NODE_WIDTH = 58;
const SKIP_NODE_HEIGHT = 38;

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
 * Calculates absolute coordinates for binary trees (AVL, RBT) starting from a fixed center root.
 * Ensures stable positions, no NaN, no layout shifting.
 */
const computeFlatLayout = (root: TreeNode | null) => {
  const flat: FlatNode[] = [];
  const edges: Edge[] = [];

  const traverse = (node: TreeNode | null, x: number, y: number, hSpacing: number) => {
    if (!node) return;

    flat.push({ node, x, y });

    if (node.left) {
      const edgeId = node.id < node.left.id ? `${node.id}-${node.left.id}` : `${node.left.id}-${node.id}`;
      edges.push({ id: edgeId, from: node.id, to: node.left.id });
      traverse(node.left as TreeNode, x - hSpacing, y + VERTICAL_SPACING, hSpacing * 0.5);
    }
    if (node.right) {
      const edgeId = node.id < node.right.id ? `${node.id}-${node.right.id}` : `${node.right.id}-${node.id}`;
      edges.push({ id: edgeId, from: node.id, to: node.right.id });
      traverse(node.right as TreeNode, x + hSpacing, y + VERTICAL_SPACING, hSpacing * 0.5);
    }
  };

  const startX = 500;
  const startY = 60;
  const initialHSpacing = 240;

  traverse(root, startX, startY, initialHSpacing);

  return { flat, edges };
};

/**
 * Calculates absolute coordinates for Skip List nodes mapped by level lanes.
 * X coordinates align vertically matching Level 0 value positions.
 */
const computeSkipListLayout = (nodes: SkipListNode[]) => {
  const flat: { node: SkipListNode; x: number; y: number }[] = [];
  const edges: { id: string; from: string; to: string; isVertical?: boolean }[] = [];

  // Group nodes by level
  const levelsMap = new Map<number, SkipListNode[]>();
  nodes.forEach((n) => {
    if (!levelsMap.has(n.level)) {
      levelsMap.set(n.level, []);
    }
    levelsMap.get(n.level)!.push(n);
  });

  const level0Nodes = levelsMap.get(0) ?? [];
  const sortedLevel0 = [...level0Nodes].sort((a, b) => {
    if (a.isHead) return -1;
    if (b.isHead) return 1;
    if (a.isTail) return 1;
    if (b.isTail) return -1;
    return a.value - b.value;
  });

  const valueToIndex = new Map<number, number>();
  sortedLevel0.forEach((n, idx) => {
    valueToIndex.set(n.value, idx);
  });

  const H_SPACING = 85;
  const V_SPACING = 80;
  const startX = 80;
  const startY = 420;

  nodes.forEach((n) => {
    let index = 0;
    if (n.isHead) {
      index = 0;
    } else if (n.isTail) {
      index = sortedLevel0.length - 1;
    } else {
      index = valueToIndex.get(n.value) ?? 0;
    }

    const x = startX + index * H_SPACING;
    const y = startY - n.level * V_SPACING;

    flat.push({ node: n, x, y });
  });

  const nodeCoords = new Map<string, { x: number; y: number }>();
  flat.forEach((f) => nodeCoords.set(f.node.id, { x: f.x, y: f.y }));

  nodes.forEach((n) => {
    if (n.next) {
      const nextNode = nodes.find((val) => val.id === n.next);
      if (nextNode) {
        edges.push({
          id: `h-${n.id}-${nextNode.id}`,
          from: n.id,
          to: nextNode.id,
        });
      }
    }
    if (n.down) {
      const downNode = nodes.find((val) => val.id === n.down);
      if (downNode) {
        edges.push({
          id: `v-${n.id}-${downNode.id}`,
          from: n.id,
          to: downNode.id,
          isVertical: true,
        });
      }
    }
  });

  const width = Math.max(1000, 160 + sortedLevel0.length * H_SPACING);

  return { flat, edges, width };
};

const Canvas: React.FC<{ activeTab: string }> = ({ activeTab }) => {
  if (activeTab === 'heap') {
    return <MaxHeapCanvas />;
  }
  if (activeTab === 'binomial') {
    return <BinomialHeapCanvas />;
  }
  if (activeTab === 'bplus') {
    return <BPlusTreeCanvas />;
  }
  if (activeTab === 'trie') {
    return <TrieCanvas />;
  }

  const { animationQueue, stepIndex, currentRoot } = useAppStore();
  const currentStep = animationQueue[stepIndex];
  const root = (animationQueue.length > 0 ? currentStep?.rootNode : currentRoot) as any | null;

  const isSkipList = activeTab === 'skiplist';

  // Compute Layouts
  const { flat, edges, computedWidth } = useMemo(() => {
    if (isSkipList) {
      const listNodes = root?.skipListNodes as SkipListNode[] ?? [];
      const res = computeSkipListLayout(listNodes);
      return { flat: res.flat, edges: res.edges, computedWidth: res.width };
    } else {
      const res = computeFlatLayout(root as TreeNode | null);
      return { flat: res.flat, edges: res.edges, computedWidth: 1000 };
    }
  }, [root, isSkipList]);

  const coord = useMemo(() => {
    const m = new Map<string, { x: number; y: number }>();
    flat.forEach((f) => m.set(f.node.id, { x: f.x, y: f.y }));
    return m;
  }, [flat]);

  const intenseHighlightId = currentStep?.intenseHighlightId;

  // Background lanes for Skip List
  const laneLines = useMemo(() => {
    if (!isSkipList || flat.length === 0) return [];
    const maxLvl = Math.max(0, ...Array.from(new Set(flat.map(f => (f.node as SkipListNode).level))));
    const lines = [];
    for (let i = 0; i <= maxLvl; i++) {
      lines.push({
        y: 420 - i * 80,
        label: `רמה ${i}`,
      });
    }
    return lines;
  }, [isSkipList, flat]);

  const hasContent = isSkipList ? (root?.skipListNodes?.length > 0) : !!root;

  return (
    <div className={`relative w-full h-full min-h-[520px] rounded-[1.75rem] border border-slate-800 bg-slate-950 p-4 shadow-inner ${
      isSkipList ? 'overflow-x-auto overflow-y-hidden' : 'overflow-hidden'
    }`}>
      {hasContent ? (
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
              
              {/* Lane Lines Background for Skip List */}
              {isSkipList && (
                <div className="absolute inset-0 pointer-events-none select-none">
                  {laneLines.map((lane) => (
                    <div
                      key={lane.label}
                      className="absolute left-4 right-4 border-t border-dashed border-slate-800/60 flex items-center justify-end text-xs text-slate-650 font-bold"
                      style={{ top: lane.y, transform: 'translateY(-50%)' }}
                    >
                      <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-900 translate-x-12">
                        {lane.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* SVG Edges Layer */}
              <svg
                className="absolute inset-0 block pointer-events-none"
                width={computedWidth}
                height={SVG_HEIGHT}
                viewBox={`0 0 ${computedWidth} ${SVG_HEIGHT}`}
                preserveAspectRatio="xMidYMid meet"
                style={{ width: computedWidth, height: SVG_HEIGHT }}
              >
                <g>
                  {edges.map((e) => {
                    const from = coord.get(e.from);
                    const to = coord.get(e.to);
                    if (!from || !to) return null;

                    const isVerticalEdge = (e as any).isVertical;

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
                        stroke={isVerticalEdge ? '#ef4444' : '#475569'}
                        strokeWidth={isVerticalEdge ? 2.5 : 3}
                        strokeDasharray={isVerticalEdge ? '4 4' : undefined}
                        strokeLinecap="round"
                      />
                    );
                  })}
                </g>
              </svg>

              {/* HTML Nodes Layer */}
              <div style={{ width: computedWidth, height: SVG_HEIGHT, position: 'absolute', top: 0, left: 0 }}>
                {flat.map((f) => {
                  const node = f.node;
                  const isInserted = currentStep?.highlightedNodeIds?.includes(node.id) && currentStep?.stepType === 'insert';
                  const isRotation = currentStep?.highlightedNodeIds?.includes(node.id) && currentStep?.stepType === 'rotation';
                  const isRecolor = currentStep?.highlightedNodeIds?.includes(node.id) && currentStep?.stepType === 'recolor';
                  const isImbalance = node.id === intenseHighlightId;

                  // Render Skip List rectangular cards
                  if (isSkipList) {
                    const listNode = node as SkipListNode;
                    const isSentinel = listNode.isHead || listNode.isTail;

                    const fill = isSentinel
                      ? '#7f1d1d' // Dark red sentinel
                      : isImbalance
                      ? '#f97316' // Orange active split
                      : isInserted
                      ? '#16a34a' // Green inserted
                      : isRecolor
                      ? '#fbbf24' // Yellow candidate list
                      : isRotation
                      ? '#8b5cf6' // Violet promoted
                      : '#1e293b'; // Slate base node

                    const border = isImbalance
                      ? '#ea580c'
                      : isInserted
                      ? '#15803d'
                      : isRotation
                      ? '#7c3aed'
                      : isSentinel
                      ? '#b91c1c'
                      : '#334155';

                    return (
                      <motion.div
                        key={listNode.id}
                        layoutId={listNode.id}
                        initial={false}
                        animate={{
                          x: f.x - SKIP_NODE_WIDTH / 2,
                          y: f.y - SKIP_NODE_HEIGHT / 2,
                        }}
                        transition={{ type: 'spring', stiffness: 120, damping: 14 }}
                        className="absolute flex items-center justify-center rounded-lg shadow-md border"
                        style={{
                          width: SKIP_NODE_WIDTH,
                          height: SKIP_NODE_HEIGHT,
                          background: fill,
                          borderColor: border,
                          color: '#fff',
                          left: 0,
                          top: 0,
                          userSelect: 'none',
                          touchAction: 'none',
                        }}
                      >
                        <span style={{ fontWeight: 800, fontSize: 13, fontFamily: 'Outfit, sans-serif' }}>
                          {listNode.isHead ? 'H' : listNode.isTail ? 'N' : listNode.value}
                        </span>
                      </motion.div>
                    );
                  }

                  // Render Circle Tree nodes (AVL / RBT)
                  const isHeight = currentStep?.stepType === 'height' && currentStep.highlightedNodeIds?.includes(node.id);

                  const baseFill = 'color' in node
                    ? node.color === 'red'
                      ? '#dc2626'
                      : '#1e293b'
                    : '#0f172a';

                  const fill = isInserted && !('color' in node)
                    ? '#16a34a'
                    : isRecolor
                    ? '#eab308'
                    : isImbalance
                    ? '#f97316'
                    : isRotation
                    ? '#8b5cf6'
                    : isHeight
                    ? '#eab308'
                    : baseFill;

                  const border = isImbalance
                    ? '#c2410c'
                    : isRotation
                    ? '#6d28d9'
                    : isRecolor
                    ? '#d97706'
                    : 'color' in node
                    ? '#64748b'
                    : '#0ea5e9';

                  return (
                    <motion.div
                      key={node.id}
                      layoutId={node.id}
                      initial={false}
                      animate={{
                        x: f.x - NODE_SIZE / 2,
                        y: f.y - NODE_SIZE / 2,
                      }}
                      transition={{ type: 'spring', stiffness: 120, damping: 14 }}
                      className="absolute flex items-center justify-center rounded-full shadow-lg"
                      style={{
                        width: NODE_SIZE,
                        height: NODE_SIZE,
                        background: fill,
                        color: '#fff',
                        border: `3px solid ${border}`,
                        userSelect: 'none',
                        touchAction: 'none',
                        left: 0,
                        top: 0,
                      }}
                    >
                      {activeTab === 'avl' && 'height' in node ? (
                        <div 
                          className="absolute -top-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 border border-white text-white font-extrabold shadow-sm select-none"
                          style={{ fontSize: '13px', lineHeight: 1 }}
                        >
                          {node.height}
                        </div>
                      ) : null}
                      
                      <div className="flex flex-col items-center justify-center text-center pointer-events-none">
                        <div style={{ fontWeight: 800, fontSize: 18, fontFamily: 'Outfit, sans-serif' }}>
                          {node.value}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

            </div>
          </TransformComponent>
        </TransformWrapper>
      ) : (
        <div className="flex min-h-[520px] items-center justify-center text-slate-400">
          <div className="space-y-3 text-center">
            <p className="text-lg font-semibold text-slate-200">המבנה ריק</p>
            <p className="text-sm text-slate-500">
              {isSkipList 
                ? 'הזן ערך בלוח ההפעלה כדי להתחיל להכניס לרשימת הדילוג'
                : 'הזן ערך בלוח ההפעלה כדי להתחיל להכניס לעץ'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Canvas;
