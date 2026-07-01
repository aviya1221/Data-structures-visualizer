
---

# GitHub Copilot Master Prompt — Interactive Data Structures Visualizer (Hebrew, RTL)

> **Instructions for Copilot:** This prompt is **fully self-contained**. All algorithmic logic, visual conventions, Hebrew translations, and UX rules are defined inline below. You do **not** need any external PDF or file. Follow every rule **exactly as written** — do not substitute with generic implementations.

---

## Role & Project Overview

You are an expert **Frontend Developer** and **Data Structures Engineer** helping build a **React + TypeScript** interactive visualization platform for a university-level Computer Science course in Israel. The students use this tool to study for their exams. The logic must match the exact course material described below.

**Tech Stack:**
- React 18 + TypeScript
- Tailwind CSS (for styling)
- SVG (for all tree/graph rendering on canvas)
- Framer Motion (for smooth node position animations)
- Zustand (for global state management)
- Vite (build tool)

---

## Global UX & Application Rules

### Rule 1 — Full RTL & Hebrew UI
- Set `<html dir="rtl" lang="he">` globally.
- All text, labels, buttons, inputs, and panels must be in **Hebrew**.
- Flex/Grid layouts must respect RTL flow (use `flex-row-reverse` where needed or rely on RTL CSS).
- Font: Use a Hebrew-compatible web font such as **Heebo** or **Assistant** from Google Fonts.

### Rule 2 — Animation Queue & Input Locking
- Maintain a global `isAnimating: boolean` state.
- While `isAnimating === true`, the following must be **disabled** (visually grayed out + `disabled` attribute):
  - Insert input + button
  - Delete input + button
  - Undo button
- This prevents state corruption from concurrent operations.

### Rule 3 — Playback Controls
The control panel (fixed at the bottom of the screen) must contain:

| Control | Hebrew Label | Behavior |
|---|---|---|
| Play button | הפעל | Runs the animation queue automatically |
| Pause button | השהה | Pauses between steps |
| Next Step button | צעד הבא | Advances one step manually |
| Undo button | ביטול פעולה אחרונה | Reverts to the last stable snapshot |
| Speed slider | מהירות אנימציה | Range: 0.25x – 3x, default 1x |

- The visualization must be **step-by-step**: each meaningful algorithmic event is a discrete "step" that can be paused and stepped through manually.
- Store a `stepHistory: Snapshot[]` array. Each "Undo" pops the last snapshot and restores it.

### Rule 4 — Pan & Zoom Canvas
- The SVG canvas must support:
  - **Mouse drag** to pan
  - **Mouse wheel** to zoom (scale the SVG `viewBox` or use a `transform` wrapper)
  - **Touch gestures** (pinch-to-zoom, one-finger pan) for tablet support
- Implement using a `usePanZoom` custom hook or a `react-zoom-pan-pinch` library wrapper.
- The canvas must never clip tree nodes — use a large virtual canvas size (e.g., 4000x3000) with the viewport centered initially.

### Rule 5 — Duplicate Rejection Toast
- Before any insert operation, check if the value already exists in the data structure.
- If it exists: show a toast notification with the message **"הערך כבר קיים במבנה"** and abort immediately.
- Use a simple toast component (top-center, red background, auto-dismisses after 3 seconds).

### Rule 6 — Step Log Panel
- A fixed panel (bottom-left or below canvas) showing the **current step description in Hebrew**.
- Examples:
  - `"מוסיף צומת 15 למיקום הנכון לפי BST"`
  - `"סורק גובה כלפי מעלה — בצומת 10, גובה = 2"`
  - `"מזהה חוסר איזון בצומת 10 — גורם איזון = 2"`
  - `"מבצע סיבוב LL סביב צומת 10"`

### Rule 7 — Collapsible Theory Panel (Drawer)
- A side drawer (slides in from the right, since RTL) toggled by a button labeled **"תיאוריה"**.
- Content changes based on the currently selected data structure.
- Each panel has two sections:
  1. **עקרונות** (Core Principles)
  2. **סיבוכיות זמן** (Time Complexities)
- Full content for each structure is defined in the sections below.

### Rule 8 — Data Structure Selector
- Top navigation bar with tabs for each structure:
  - `עץ AVL`
  - `עץ אדום-שחור`
  - `עץ ערמה`
  - `ערמה בינומית`
  - `עץ B+`
  - `רשימת דילוג דטרמיניסטית`
  - `עץ סיומת`
- Switching tabs resets the canvas and clears the step log.

---

## Data Structure Specifications

---

### 1. AVL Tree — עץ AVL *(Implement This First)*

#### Visual Conventions
- Draw the tree as an SVG with nodes as circles (radius ~24px).
- Next to each node, display a **small red number** showing the node's **height** (leaves = height 0).
- Edges are lines/curves between parent and child circles.
- Node colors:
  - Default: dark blue fill, white text
  - Currently scanned (height update): yellow highlight
  - Imbalanced node detected: **orange/amber** intense highlight with a pulsing border
  - Rotation participants: **purple** highlight

#### Algorithmic Logic (STRICT — matches course material)

**Height definition:**
- A leaf node has height `0`.
- Height of a node = `1 + max(height(left), height(right))`.
- An empty subtree (null) has height `-1`.

**Balance Factor:**
- `BF(node) = height(left subtree) - height(right subtree)`
- AVL property: `|BF| <= 1` for all nodes.
- Violation: `|BF| == 2`

**Rotation Cases (match these exactly):**

| Case | Condition | Action |
|---|---|---|
| LL | BF(z) = +2, BF(y) >= 0 | Right rotation around z |
| RR | BF(z) = -2, BF(y) <= 0 | Left rotation around z |
| LR | BF(z) = +2, BF(y) < 0 | Left rotation around y, then right rotation around z |
| RL | BF(z) = -2, BF(y) > 0 | Right rotation around y, then left rotation around z |

Where: z = unbalanced node, y = child of z in the tall direction, x = child of y in the tall direction.

#### MANDATORY 5-Step Animation Flow for Insert

Every single insertion MUST animate through these 5 steps. Do not skip any:

**Step 1 — Standard BST Insert**
- Traverse from root: go left if `newValue < currentNode.value`, right if `newValue > currentNode.value`.
- Place the new node as a leaf in the correct position.
- Assign it height `0` and color it **green** temporarily.
- Step log: `"הוספת צומת [value] — מיקום נכון לפי כללי BST"`
- DO NOT balance yet. Show the tree in its potentially unbalanced state.

**Step 2 — Bottom-Up Height Scan**
- Starting from the newly inserted node, walk upward to the root.
- For each node visited:
  - Highlight it in **yellow**.
  - Recalculate its height: `1 + max(height(left), height(right))`.
  - Animate the red height number changing to the new value.
  - Step log: `"עדכון גובה בצומת [value] — גובה חדש: [h]"`
- This must be one step per node — the student can pause here and see each individual node's height update.

**Step 3 — Imbalance Detection Pause**
- While scanning upward (continuing from Step 2), after updating each height, check the Balance Factor.
- If `|BF| == 2`:
  - **PAUSE the animation automatically.**
  - Highlight the imbalanced node in **orange/amber** with a pulsing animation.
  - Display the balance factor in the step log.
  - Step log: `"חוסר איזון זוהה בצומת [value] — גורם איזון: [BF]"`
  - Do not proceed until the user clicks "Next Step" or "Play".

**Step 4 — Rotation Nodes Highlight**
- Identify z (imbalanced), y (tall child), x (tall grandchild).
- Highlight all three in **purple** simultaneously.
- Determine the rotation case (LL/RR/LR/RL) and display it.
- Step log: `"מכין סיבוב [LL/RR/LR/RL] — צמתים משתתפים: [z], [y], [x]"`
- Pause. Wait for user to proceed.

**Step 5 — Physical Position Glide Animation**
- Execute the rotation.
- Use **Framer Motion** `animate` prop to smoothly move each node's `cx`, `cy` (SVG) or `x`, `y` (HTML) to their new computed positions.
- The animation duration should be controlled by the speed slider (default ~0.6s).
- **Critical:** Do NOT swap text values inside static circles. The actual node elements must move to new x/y coordinates.
- After animation completes, update the height numbers for all affected nodes.
- Step log: `"סיבוב [type] הושלם — העץ מאוזן"`

#### Right Rotation Algorithm (for reference — implement exactly):
```
rightRotate(z):
  y = z.left
  T3 = y.right
  y.right = z
  z.left = T3
  z.height = 1 + max(height(z.left), height(z.right))
  y.height = 1 + max(height(y.left), height(y.right))
  return y  // y is the new root of this subtree
```

#### Left Rotation Algorithm:
```
leftRotate(z):
  y = z.right
  T2 = y.left
  y.left = z
  z.right = T2
  z.height = 1 + max(height(z.left), height(z.right))
  y.height = 1 + max(height(y.left), height(y.right))
  return y
```

#### Node Position Calculation
- Use a recursive tree layout algorithm (e.g., Reingold-Tilford or simpler recursive horizontal spacing).
- Each node at depth `d` has `y = d * 80` (pixels from top).
- Horizontal positions must update when rotations occur.
- Pass computed `{x, y}` positions as animated props.

#### Theory Panel — עץ AVL

**עקרונות:**
- עץ חיפוש בינארי (BST) מאוזן בקפדנות.
- גובה תת-העץ השמאלי ותת-העץ הימני של כל צומת שונה לכל היותר ב-1.
- גורם האיזון (Balance Factor) = גובה(שמאל) - גובה(ימין). ערכים חוקיים: {-1, 0, 1}.
- עלה מוגדר בגובה 0. תת-עץ ריק מוגדר בגובה -1.
- חוסר איזון (BF = ±2) מתוקן על-ידי סיבובים: LL, RR, LR, RL.

**סיבוכיות זמן:**

| פעולה | סיבוכיות |
|---|---|
| חיפוש | O(log n) |
| הכנסה | O(log n) |
| מחיקה | O(log n) |

---

### 2. Red-Black Tree — עץ אדום-שחור

#### Visual Conventions
- Nodes are circles: **black fill** for Black nodes, **red fill** for Red nodes (white text on both).
- Null leaves (NIL sentinels) shown as small black squares.
- New insertions always start as **Red**.

#### Algorithmic Logic (STRICT)

**Properties (must all hold after every operation):**
1. Every node is Red or Black.
2. The root is always **Black**.
3. Every NIL leaf is **Black**.
4. A Red node's children are always **Black** (no two consecutive red nodes on any path).
5. All simple paths from any node to its descendant NIL leaves contain the **same number of Black nodes** (black-depth).

**Insert Fix-Up Cases:**

After BST insert (node colored Red), walk up and fix:

| Case | Condition | Action |
|---|---|---|
| Case 1 | Uncle is **Red** | Recolor: Parent -> Black, Uncle -> Black, Grandparent -> Red. Move pointer to Grandparent, continue loop. |
| Case 2 | Uncle is **Black**, node is inner child (LR or RL) | Rotate parent in opposite direction to straighten. Falls into Case 3. |
| Case 3 | Uncle is **Black**, node is outer child (LL or RR) | Rotate grandparent, swap colors of parent and grandparent. |

After all fix-ups: force root to Black.

#### Theory Panel — עץ אדום-שחור

**עקרונות:**
- כל צומת הוא אדום או שחור.
- השורש הוא תמיד שחור.
- כל עלה NIL הוא שחור.
- לצומת אדום יש רק ילדים שחורים (אין שני אדומים רצופים).
- כל הנתיבים מצומת כלשהו לעלי NIL מכילים מספר שווה של צמתים שחורים.
- הכנסות חדשות הן תמיד אדומות.

**סיבוכיות זמן:**

| פעולה | סיבוכיות |
|---|---|
| חיפוש | O(log n) |
| הכנסה | O(log n) |
| מחיקה | O(log n) |

---

### 3. Max-Heap — עץ ערמה מקסימלית

#### Visual Conventions
- Draw the **tree structure** (complete binary tree) on the upper portion of the canvas.
- Draw the **array representation** as a horizontal row of boxes at the **bottom of the canvas**.
- **Array indices start at 1** (index 0 is unused/grayed out).
- When a swap occurs: highlight the swapping elements in **both the tree and the array simultaneously** (same color highlight on both).

#### Algorithmic Logic (STRICT — matches course pseudocode)

**Array Index Relationships:**
- Parent of node at index `i`: `floor(i / 2)`
- Left child of node at index `i`: `2i`
- Right child of node at index `i`: `2i + 1`

**Insert (uses Heap-Increase-Key / sift-up):**
```
insert(value):
  heap.size++
  heap[heap.size] = -infinity
  heap-increase-key(heap, heap.size, value)

heap-increase-key(heap, i, key):
  heap[i] = key
  while i > 1 and heap[floor(i/2)] < heap[i]:
    swap(heap[i], heap[floor(i/2)])
    i = floor(i/2)
```

**Extract-Max (uses Max-Heapify / sift-down):**
```
extract-max(heap):
  max = heap[1]
  heap[1] = heap[heap.size]
  heap.size--
  max-heapify(heap, 1)
  return max

max-heapify(heap, i):
  left = 2i
  right = 2i + 1
  largest = i
  if left <= heap.size and heap[left] > heap[largest]: largest = left
  if right <= heap.size and heap[right] > heap[largest]: largest = right
  if largest != i:
    swap(heap[i], heap[largest])
    max-heapify(heap, largest)
```

#### Theory Panel — עץ ערמה מקסימלית

**עקרונות:**
- עץ בינארי שלם המיוצג כמערך.
- תכונת המקס-ערמה: ההורה גדול מכל ילדיו.
- אב של אינדקס i נמצא באינדקס floor(i/2).
- ילד שמאל של i נמצא באינדקס 2i. ילד ימין — 2i+1.
- האינדקסים מתחילים ב-1 (לא ב-0).

**סיבוכיות זמן:**

| פעולה | סיבוכיות |
|---|---|
| Max-Heapify | O(log n) |
| הכנסה | O(log n) |
| Extract-Max | O(log n) |
| Build-Max-Heap | O(n) |
| Heap-Sort | O(n log n) |

---

### 4. Binomial Heap — ערמה בינומית

#### Visual Conventions
- Draw as a **forest** of Binomial Trees side by side on the canvas.
- Each Binomial Tree of order `k` is labeled `B_k`.
- Show parent-child relationships as edges.

#### Algorithmic Logic (STRICT)

**Binomial Tree Properties:**
- `B_0`: A single node.
- `B_k`: Formed by linking two `B_{k-1}` trees: the root of one becomes the **leftmost child** of the root of the other.
- `B_k` has exactly `2^k` nodes.
- `B_k` has height `k`.
- The root of `B_k` has degree `k` (exactly k children: `B_0, B_1, ..., B_{k-1}`).

**Heap Property:** Max-heap — every parent's key >= children's keys.

**Constraint:** At most ONE binomial tree of each order in the heap. (Like binary representation of n.)

**Merge/Union of two heaps:**
- Similar to binary addition. Merge trees of the same order.
- When merging two trees of the same order `k`: the tree whose **root has the smaller key** becomes a **child** of the other root. Result is a `B_{k+1}` tree.

**Insert:**
- Create a `B_0` tree with the new value.
- Union it with the existing heap.
- Step log: show each "carry" (merge of same-order trees) as a separate step.

#### Theory Panel — ערמה בינומית

**עקרונות:**
- יער של עצי ערמה בינומיים עם תכונת מקס-ערמה.
- עץ בינומי מסדר k מכיל בדיוק 2^k צמתים.
- לכל היותר עץ אחד מכל סדר (דומה לייצוג בינארי של n).
- מיזוג שני עצים מאותו סדר k יוצר עץ מסדר k+1.
- השורש הקטן יותר הופך לילד של השורש הגדול יותר.

**סיבוכיות זמן:**

| פעולה | סיבוכיות |
|---|---|
| Merge / Union | O(log n) |
| הכנסה | O(log n) |
| Extract-Max | O(log n) |

---

### 5. B+ Tree — עץ B+

#### Visual Conventions
- Draw nodes as **horizontal arrays/blocks** (rectangles divided into cells).
- Each block shows its keys in order.
- **Leaf nodes** are connected to each other via **right-pointing arrows** (linked list).
- Internal nodes show routing keys only (no data).
- The order `b` (fanout) is configurable by the user (default: b = 3).

#### Algorithmic Logic (STRICT)

**Node Capacity:** Each node holds between `ceil(b/2) - 1` and `b - 1` keys (except root).

**Key Convention for Internal Nodes:**
- Internal nodes store the **smallest key of each right subtree** as routing keys.
- Navigation: go to child[i] if `key < routingKey[i]`, else child[i+1].

**Insert:**
```
1. Search for the correct leaf using routing keys.
2. Insert key into the leaf in sorted order.
3. If leaf overflows (has b keys):
   a. Split the leaf into two.
   b. The SMALLEST KEY OF THE RIGHT HALF is promoted/copied up to the parent.
   c. Link the two new leaves in the leaf linked list.
4. If parent overflows, split recursively upward.
5. If root splits, create a new root.
```

**Split detail:**
- Leaf with keys [k1, k2, k3, k4] (when b=3, overflow at 4 keys):
  - Left leaf: [k1, k2]
  - Right leaf: [k3, k4]
  - Promoted key (copy): k3

#### Theory Panel — עץ B+

**עקרונות:**
- כל הנתונים נמצאים **אך ורק בעלים** (nodes פנימיים מכילים מפתחות ניתוב בלבד).
- העלים מחוברים ברשימה מקושרת לסריקה עוקבת יעילה.
- כאשר עלה מתמלא, הוא מפוצל ומפתח מועתק (לא מועבר) לאב.
- מספר מינימלי של מפתחות בצומת (חוץ משורש): ceil(b/2) - 1.

**סיבוכיות זמן:**

| פעולה | סיבוכיות |
|---|---|
| חיפוש | O(log_b n) |
| הכנסה | O(b * log_b n) |
| מחיקה | O(b * log_b n) |
| שאילתת טווח | O(log n + k) |

---

### 6. Deterministic Skip List — רשימת דילוג דטרמיניסטית

#### Visual Conventions
- Draw multiple horizontal linked list levels stacked vertically.
- Level 0 (bottom) = full sorted list.
- Each level above is a sparser "express lane".
- Nodes on multiple levels are drawn as **stacked boxes** connected by vertical lines.
- Show `-inf` (negative infinity) sentinel on the left and `+inf` on the right at all levels.

#### Algorithmic Logic (STRICT — NO RANDOMNESS)

**The 1-2-3 Rule (Deterministic Promotion):**
- At every level, the **gap** between consecutive promoted elements must be **2 or 3** (never 4 or more).
- A gap of 4 is illegal and triggers promotion.

**Insert Algorithm:**
```
1. Insert the new value into Level 0 in sorted order.
2. Scan Level 0 for "gaps of 4" (4 consecutive elements not promoted to Level 1).
3. If a gap of 4 exists: promote the MIDDLE element of that gap to Level 1.
4. Repeat scan at Level 1 for gaps of 4, promote upward if needed.
5. Continue until no level has a gap of 4.
```

**Promotion rule detail:**
- Look at groups of elements between two already-promoted neighbors.
- If there are 3 elements in the gap (making a gap of 4 including the boundaries), promote element #2 (the middle one).

**Search Algorithm:**
```
1. Start at the top-left (highest level, leftmost sentinel).
2. Move RIGHT along the current level as long as next.value <= searchValue.
3. When next.value > searchValue, DROP DOWN one level.
4. Repeat until Level 0 is reached.
5. If current.right.value == searchValue: FOUND. Else: NOT FOUND.
```

#### Theory Panel — רשימת דילוג דטרמיניסטית

**עקרונות:**
- במקום קידום אקראי, קיים כלל דטרמיניסטי קפדני.
- כלל 1-2-3: הפסקה בין אלמנטים מקודמים ברמה מסוימת חייבת להיות 2 או 3 (לא 4 ויותר).
- כאשר פסק של 4 נוצר, האלמנט האמצעי מקודם לרמה מעל.
- הגובה המקסימלי של הרשימה: O(log n).

**סיבוכיות זמן:**

| פעולה | סיבוכיות |
|---|---|
| חיפוש | O(log n) |
| הכנסה | O(log n) |
| מחיקה | O(log n) |

---

### 7. Suffix Tree & Compressed Trie — עץ סיומת

#### Visual Conventions
- Input: a string (e.g., "banana").
- **Uncompressed Trie:** Each edge represents a **single character**.
- **Compressed Trie (Patricia Trie):** Chains of single-child nodes are **merged** into one edge labeled with a string.
- Every suffix must end at a leaf node. Leaves are drawn as **squares** (not circles) with a **`$`** symbol to indicate end-of-suffix. The `$` prevents one suffix from being a prefix of another.
- Animate the compression step-by-step: highlight chains being merged.

#### Algorithmic Logic (STRICT)

**Build Suffix Trie:**
```
For string S of length n:
  Add '$' at the end: S = S + '$'
  For each suffix S[i..n] (i from 0 to n):
    Insert suffix into the trie character by character.
```

**Compress to Suffix Tree:**
```
While any node has exactly 1 child:
  Merge that node with its child.
  Concatenate their edge labels.
```

**Search for pattern P:**
```
1. Start at root.
2. For each character of P, follow the matching edge.
3. If at any point no matching edge exists: NOT FOUND.
4. If all characters of P matched: FOUND (count leaf descendants = number of occurrences).
Time: O(m) where m = length of P.
```

#### Theory Panel — עץ סיומת

**עקרונות:**
- עץ הסיומת מבוסס על כל הסיומות של מחרוזת נתונה.
- כל סיומת מסתיימת ב-`$` כדי למנוע מצב שבו סיומת אחת היא קידומת של אחרת.
- עץ קשיח (Compressed Trie) מאחד רצפי צמתים בעלי ילד יחיד לקשת אחת.
- חיפוש תבנית: O(m) בלבד (m = אורך התבנית), ללא תלות בגודל הטקסט.

**סיבוכיות זמן:**

| פעולה | סיבוכיות |
|---|---|
| בניית העץ | O(n) |
| חיפוש תבנית P | O(m) |
| מציאת כל ההופעות | O(m + k) |

---

## File & Component Architecture

```
src/
  main.tsx                    # Entry point, sets dir="rtl"
  App.tsx                     # Tab navigation, global layout
  store/
    useAppStore.ts            # Zustand: isAnimating, selectedDS, stepLog, snapshotHistory
  hooks/
    usePanZoom.ts             # Pan & zoom logic for SVG canvas
    useAnimationQueue.ts      # Step queue, play/pause/next/speed
  components/
    layout/
      TopNav.tsx              # Data structure tabs
      ControlPanel.tsx        # Play/Pause/Next/Undo/Speed
      StepLog.tsx             # Current step text display
      TheoryDrawer.tsx        # Collapsible RTL side drawer
      Toast.tsx               # Duplicate rejection toast
    canvas/
      PanZoomCanvas.tsx       # SVG wrapper with pan/zoom
    structures/
      avl/
        AVLTree.ts            # Pure logic: insert, rotate, heights
        AVLVisualizer.tsx     # SVG rendering + Framer Motion animations
        AVLTheory.tsx         # Theory panel content
      redblack/
        ...
      heap/
        ...
      binomialHeap/
        ...
      bplusTree/
        ...
      skipList/
        ...
      suffixTree/
        ...
```

---

## Development Order

1. **Phase 1 (Now):** UI scaffolding + AVL Tree (full 5-step animation flow).
2. **Phase 2:** Red-Black Tree.
3. **Phase 3:** Max-Heap (tree + array dual view).
4. **Phase 4:** Binomial Heap.
5. **Phase 5:** B+ Tree.
6. **Phase 6:** Deterministic Skip List.
7. **Phase 7:** Suffix Tree.

**Start with Phase 1 only. Wait for feedback before proceeding to Phase 2.**

---

> **Copilot Note:** All algorithm specifications above are final. Do not use alternative implementations found in external sources. The course material uses specific conventions (e.g., leaf height = 0, array indices starting at 1 for heap, deterministic 1-2-3 rule for skip lists) that differ from some textbooks. Follow the rules in this prompt exactly.


