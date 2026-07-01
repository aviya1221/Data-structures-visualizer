# סטטוס פרויקט מעודכן

פרויקט זה הוא scaffold ראשוני לאפליקציית ויזואליזציה של מבני נתונים מבוססת React + TypeScript + Vite.
היישום מותאם ל-RTL בעברית וכולל תשתית ראשונית לניהול מצב ו-AVL.

## מצב נוכחי של התשתית

- `src/App.tsx` - קובץ הכניסה שמציב את היישום ב-RTL ומטען את דף ה-`Visualizer`.
- `src/main.tsx` - קובץ האתחול של React.
- `src/app/store.ts` - Zustand store מרכזי לניהול מצב ההפעלה, תור האנימציות וההיסטוריה.
- `src/pages/Visualizer.tsx` - דף הפריסה הראשי שמחלק את המסך בין Canvas, StepLog, ControlPanel ו-TheoryPanel.
- `src/components/Canvas.tsx` - Placeholder גרפי לאזור הוויזואליזציה בעברית.
- `src/components/StepLog.tsx` - תיבת סטטוס עבור שלבי אנימציה.
- `src/components/ControlPanel.tsx` - כפתורים לשליטה על ההפעלה וסליידר מהירות.
- `src/components/TheoryPanel.tsx` - פאנל תאוריה שמציין עקרונות AVL בעברית.
- `src/structures/avl/types.ts` - טיפוס `AVLNode` עם `id`, `value`, `height`, `left`, `right` ו-`x/y` אופציונליים.
- `src/structures/avl/avlAlgorithms.ts` - עזרי AVL ליצירת צומת, שכפול עץ, חישוב גובה, איזון וסיבובים.
- `src/structures/avl/avlAnimations.ts` - מחולל שלבי אנימציה להכנסת ערך ל-AVL.

## מבנה קבצים עדכני

```text
src/
 ├── app/
 │    └── store.ts
 │
 ├── components/
 │    ├── Canvas.tsx
 │    ├── ControlPanel.tsx
 │    ├── StepLog.tsx
 │    └── TheoryPanel.tsx
 │
 ├── pages/
 │    └── Visualizer.tsx
 │
 ├── structures/
 │    └── avl/
 │         ├── types.ts
 │         ├── avlAlgorithms.ts
 │         └── avlAnimations.ts
 │
 ├── App.tsx
 └── main.tsx
```

## השינויים האחרונים

- `src/app/store.ts` עודכן כדי להשתמש ב-`Step` במקום `AnimationStep`.
- `Step` כולל כעת:
  - `id`
  - `message`
  - `rootNode`
  - `highlightedNodeIds?`
  - `intenseHighlightId?`
- ב-`store.ts` נוספו פעולות נוספות:
  - `reset()` לאיפוס מלא
  - `enqueue(steps)` להוספת מערך שלבים
  - `nextStep()` לטיפול בקידום השלב הבא
  - `undo()` לביטול השלב האחרון והעברת מצב ההפעלה ל-`idle`
- `src/structures/avl/types.ts` שודרג עם `id` ו-`x/y` לצורך אנימציה ויזואלית.
- `src/structures/avl/avlAlgorithms.ts` כולל כעת:
  - `generateId()` ליצירת מזהים ייחודיים
  - `cloneTree()` לשכפול עמוק של העץ
  - `getHeight()`, `updateHeight()`, `getBalanceFactor()`
  - `rotateRight()` ו-`rotateLeft()`
  - `insertBST()` שהכנסת ערך כ-BST רגיל
- `src/structures/avl/avlAnimations.ts` בונה תרחיש שלבי אנימציה בהוספת ערך חדש:
  - הכנסת צומת בסיסית
  - סריקת גבהים
  - זיהוי חוסר איזון
  - ביצוע רוטציה (בסיסי)

## תשתית ה-AVL היום

- `AVLNode` מוגדר עם שדות בסיסיים לאחסון מידע ועומד להיות מורחב לייצוג גרפי.
- קיימת שכפול של העץ כדי לשמור על snapshot נקי עבור React.
- הסיבובים קיימים כעזרי לוגיקה, אך לא הושלמו לכל מקרים מורכבים.
- הכנסת ערך כיום מתבצעת כ-BST רגיל, והשלבים של איזון עדיין מבוססים על גישה פשטנית.

## סטור Zustand כיום

הסטור מנהל:

- `playback`: `idle | playing | paused`
- `speed`: מהירות אנימציה
- `stepIndex`: אינדקס הנוכחי בתור
- `animationQueue`: מערך של `Step`
- `history`: ערכים שכבר הוקדמו

וזהות הפעולות:

- `setPlayback(state)`
- `setSpeed(speed)`
- `enqueue(steps)`
- `nextStep()`
- `undo()`
- `reset()`

## מצב ה-UI כיום

- האפליקציה מופעלת ב-RTL ומציגה את ה-Visualizer במלואה.
- יש פריסה בשני חלקים:
  - תכולת תוכן מרכזית עם Canvas, StepLog ו-ControlPanel.
  - פאנל תאוריה קבוע בצד ימין.
- כל העיצוב מבוסס על Tailwind CSS.

## מה לא גמור עדיין

- אלגוריתם AVL מלא עבור כל המקרים (LR, RL, LL, RR).
- עדכון מיקומי `x/y` לצורך הצגת הצמתים בקנבס.
- בניית רינדור גרפי של העץ בתוך `Canvas`.
- לולאת ניגון אנימציות המצליחה לרוץ אוטומטית לפי `playback` ו-`speed`.
- קלט משתמש לאינטראקציה עם העץ.

## המלצות להמשך

- לבנות רכיב רינדור עץ ויזואלי שמצייר את הצמתים והקשתות.
- להרחיב את `avlAnimations` כדי לייצר שלבים עבור כל סוג רוטציה.
- לקשר את `ControlPanel` למצב `playback` וליצירת אנימציה רציפה.
- להוסיף בדיקות יחידה ל-`store.ts` ול-`avlAlgorithms.ts`.
