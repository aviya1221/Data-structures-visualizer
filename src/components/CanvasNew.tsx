import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../app/store';
import type { TreeNode } from '../structures/types';

const NODE_RADIUS = 76;
const NODE_VALUE_FONT_SIZE = 34;
const HORIZONTAL_SPACING = 240;
const VERTICAL_SPACING = 210;
const CANVAS_WIDTH = 2400;
const CANVAS_HEIGHT = 1200;

const cloneWithLayout = (node: TreeNode | null, depth = 0, counter = { value: 0 }): TreeNode | null => {
  if (!node) return null;

  const left = cloneWithLayout(node.left, depth + 1, counter);
  const x = counter.value * HORIZONTAL_SPACING + 80;
  counter.value += 1;
  const right = cloneWithLayout(node.right, depth + 1, counter);

  return {
    ...node,
    left,
    right,
    x,
    y: depth * VERTICAL_SPACING + 80,
  };
};

const getTreeBounds = (node: TreeNode | null, bounds = {
  minX: Number.POSITIVE_INFINITY,
  maxX: Number.NEGATIVE_INFINITY,
  minY: Number.POSITIVE_INFINITY,
  maxY: Number.NEGATIVE_INFINITY,
}) => {
  if (!node) return bounds;

  bounds.minX = Math.min(bounds.minX, node.x ?? 0);
  bounds.maxX = Math.max(bounds.maxX, node.x ?? 0);
  bounds.minY = Math.min(bounds.minY, node.y ?? 0);
  bounds.maxY = Math.max(bounds.maxY, node.y ?? 0);

  if (node.left) getTreeBounds(node.left, bounds);
  if (node.right) getTreeBounds(node.right, bounds);

  return bounds;
};

const flattenTree = (node: TreeNode | null, collector: Map<string, TreeNode>) => {
  if (!node || collector.has(node.id)) return;
  collector.set(node.id, node);
  flattenTree(node.left, collector);
  flattenTree(node.right, collector);
};

const Canvas: React.FC<{ activeTab: string }> = ({ activeTab }) => {
  const { animationQueue, stepIndex, currentRoot } = useAppStore();
  const currentStep = animationQueue[stepIndex];
  const root = (animationQueue.length > 0 ? currentStep?.rootNode : currentRoot) ?? null;

  const layoutedRoot = useMemo(() => cloneWithLayout(root), [root]);
  const bounds = useMemo(() => getTreeBounds(layoutedRoot), [layoutedRoot]);
  const treeWidth = Math.max(1, bounds.maxX - bounds.minX + NODE_RADIUS * 2 + 140);
  const treeHeight = Math.max(1, bounds.maxY - bounds.minY + NODE_RADIUS * 2 + 140);
  const scale = Math.min(1, (CANVAS_WIDTH - 260) / treeWidth, (CANVAS_HEIGHT - 260) / treeHeight);
  const offsetX = (CANVAS_WIDTH - treeWidth * scale) / 2 - bounds.minX * scale + 70;
  const offsetY = (CANVAS_HEIGHT - treeHeight * scale) / 2 - bounds.minY * scale + 70;
  const treeTransform = `translate(${offsetX}, ${offsetY}) scale(${scale})`;

  const renderEdges = (node: TreeNode | null): React.ReactNode => {
    if (!node) return null;
    return (
      <>
        {node.left && (
          <motion.line
            key={`${node.id}-left`}
            initial={false}
            animate={{
              x1: node.x,
              y1: node.y,
              x2: node.left.x,
              y2: node.left.y,
            }}
            transition={{ type: 'spring', stiffness: 140, damping: 18 }}
            stroke="#7dd3fc"
            strokeWidth="3"
            strokeLinecap="round"
          />
        )}
        {node.right && (
          <motion.line
            key={`${node.id}-right`}
            initial={false}
            animate={{
              x1: node.x,
              y1: node.y,
              x2: node.right.x,
              y2: node.right.y,
            }}
            transition={{ type: 'spring', stiffness: 140, damping: 18 }}
            stroke="#7dd3fc"
            strokeWidth="3"
            strokeLinecap="round"
          />
        )}
        {renderEdges(node.left)}
        {renderEdges(node.right)}
      </>
    );
  };

  const renderNodes = (node: TreeNode | null): React.ReactNode => {
    if (!node) return null;

    const isInserted = currentStep?.stepType === 'insert' && currentStep.highlightedNodeIds?.includes(node.id);
    const isHeight = currentStep?.stepType === 'height' && currentStep.highlightedNodeIds?.includes(node.id);
    const isRotation = currentStep?.stepType === 'rotation' && currentStep.highlightedNodeIds?.includes(node.id);
    const isRecolor = currentStep?.stepType === 'recolor' && currentStep.highlightedNodeIds?.includes(node.id);
    const isImbalance = node.id === currentStep?.intenseHighlightId;

    const baseFill = 'color' in node
      ? node.color === 'red'
        ? '#dc2626'
        : '#0f172a'
      : '#0f172a';

    const fill = isInserted && !('color' in node)
      ? '#16a34a'
      : isRecolor
      ? '#fbbf24'
      : isImbalance
      ? '#f59e0b'
      : isRotation
      ? '#7c3aed'
      : isHeight
      ? '#fbbf24'
      : baseFill;

    const border = isImbalance ? '#c2410c' : isRotation ? '#6d28d9' : isRecolor ? '#f59e0b' : 'color' in node ? '#94a3b8' : '#0ea5e9';
    const transitionDuration = isRotation ? 3 : 0.7;

    return (
      <React.Fragment key={node.id}>
        <motion.g
          layout
          layoutId={node.id}
          initial={false}
          animate={{ x: node.x ?? 0, y: node.y ?? 0, scale: isRotation ? 1.05 : 1 }}
          transition={{
            x: { type: 'spring', stiffness: isRotation ? 50 : 140, damping: 18, duration: transitionDuration },
            y: { type: 'spring', stiffness: isRotation ? 50 : 140, damping: 18, duration: transitionDuration },
            scale: { type: 'spring', stiffness: 140, damping: 18, duration: transitionDuration },
          }}
        >
          <circle cx={0} cy={0} r={NODE_RADIUS} fill={fill} stroke={border} strokeWidth={isRotation || isImbalance ? 4 : 3} />
          <text
            x={0}
            y={0}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#f8fafc"
            fontSize={NODE_VALUE_FONT_SIZE}
            fontWeight="800"
          >
            {node.value}
          </text>
          {'height' in node && (
            <text
              x={0}
              y={-NODE_RADIUS - 24}
              textAnchor="middle"
              fill="#ef4444"
              fontSize={22}
              fontWeight="800"
            >
              {node.height}
            </text>
          )}
        </motion.g>
        {renderNodes(node.left)}
        {renderNodes(node.right)}
      </React.Fragment>
    );
  };

  return (
    <div className="relative w-full h-full overflow-auto rounded-4xl bg-slate-900/90 p-4 shadow-2xl shadow-slate-950/30">
      <div className="absolute inset-x-0 top-0 h-20 bg-linear-to-b from-sky-500/10 to-transparent" />
      <div className="relative flex h-full flex-col rounded-3xl border border-slate-700/80 bg-slate-950/90 p-4 shadow-inner">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-400">אזור ויזואליזציה</p>
            <h2 className="text-2xl font-semibold text-white">
              {activeTab === 'rbt' ? 'עץ אדום-שחור' : 'עץ AVL'}
            </h2>
          </div>
          <span className="rounded-full bg-sky-800 px-3 py-1 text-sm text-sky-100">
            {activeTab === 'rbt' ? 'Red-Black Insert Flow' : 'AVL Insert Flow'}
          </span>
        </div>

        <div className="relative flex-1 overflow-hidden rounded-3xl border border-slate-700 bg-slate-950 p-4">
          {layoutedRoot ? (
            <svg className="absolute inset-0" width="100%" height="100%" viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}>
              <rect x={0} y={0} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill="transparent" />
              <g transform={treeTransform}>
                {renderEdges(layoutedRoot)}
                {renderNodes(layoutedRoot)}
              </g>
            </svg>
          ) : (
            <div className="flex h-full items-center justify-center text-slate-400">
              <div className="space-y-3 text-center">
                <p className="text-lg font-semibold text-slate-200">העץ ריק</p>
                <p className="text-sm text-slate-500">הזן ערך בלוח ההפעלה כדי להתחיל אינסרט של AVL</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Canvas;
