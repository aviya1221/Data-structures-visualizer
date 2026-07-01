# Data Structures Visualizer

A modern interactive application built with React, TypeScript, and Tailwind CSS that displays step-by-step animated visualizations of advanced data structures, strictly adhering to course rules and lecture summaries. The application utilizes Framer Motion to fluidly animate node gliding and structural modifications without destroying and recreating DOM elements.

---

## 🚀 Supported Data Structures

### 1. AVL Tree
* **Balancing Rules**: A binary search tree that maintains a height difference of at most 1 for every node.
* **Visualization**: The balance factor and height of each node are prominently displayed as an attached floating badge.
* **Rotations**: Full simulation of single (LL, RR) and double (LR, RL) rotations, featuring nodes smoothly gliding into their new positions.

### 2. Red-Black Tree
* **Balancing Rules**: A balanced binary search tree where the root is always black, leaf nodes (NIL) are black, and red nodes only have black children.
* **Insertion Rules**: Checks for a red uncle (recoloring and propagating upwards) or a black/NIL uncle (rotation and color swapping).

### 3. Max-Heap
* **Representation**: Array-backed implementation utilizing 1-based indexing logic (Root at `i=1`, Left child at `2i`, Right child at `2i+1`, Parent at `i/2`).
* **Visualization**: Simultaneously displays both the 2D tree representation and the linear array structure at the bottom of the screen.
* **Operations**: Supports insertion and extraction of the maximum element with an interactive, step-by-step heapify (bubble-up / sink-down) animation.

### 4. Binomial Heap
* **Union and Merge**: A forest/collection of binomial trees maintaining the Min-Heap property.
* **Duplicate Prevention**: Merges trees of the same order by making the tree with the larger root value the leftmost child of the smaller root to form the next order.
* **Overlap-Free Visualization**: A custom Subdivision Layout algorithm that prevents branches and leaves from overlapping on the canvas.

### 5. B+ Tree
* **Dual-Row Structure**: Each block is represented exactly like the lecture diagrams (top row for keys/values, bottom row for pointer cells containing dots `•`).
* **Leaf Connectivity**: Green dashed arrows linking leaf nodes from left to right to support Range Queries.
* **Minimum Key Rule**: Keys in internal nodes precisely represent the minimum key of their respective subtrees.
* **Balancing**: Forced LTR layout presenting keys in strictly ascending order from left to right.

### 6. Skip List
* **Promotion Rules**: A systematic approach where every 2nd or 3rd element is promoted to the level above it.
* **Triplet Correction**: Automatic, cascading promotion of the middle element whenever a sequence of exactly 3 consecutive elements is formed at a level without existing in the level above.

### 7. Trie & Suffix Tree
* **Word Representation (Trie)**: A text retrieval tree where each path from the root represents a character string.
* **End-of-Word Marker**: Utilizes the special character `$` represented as a distinct red rectangular node at the end of every word or suffix.
* **Visualization**: Overlap-free distributed layout with built-in canvas zooming and panning (Zoom & Pan) support.

---

## 🛠️ Core Technologies

* **React 18** - Component-driven user interface.
* **TypeScript** - Strict type safety and robust code compilation.
* **Framer Motion** - Fluid animations using `layoutId` to provide smooth node-gliding effects across animation steps.
* **Zustand** - State management for the animation queue, playback control (Play, Pause, Next Step), speed adjustments, and historical undo functionality.
* **Tailwind CSS** - Advanced, highly customized dark mode styling.
* **React Zoom Pan Pinch** - Seamless canvas panning and zooming support for the Skip List and Trie/Suffix views.

---

## 💻 Local Setup

1. **Install Dependencies**:
   ```bash
   npm install

2. **Run Development Server**:
   ```bash
   npm run dev
   
5. **Build for Production:**
   ```bash
   npm run build
