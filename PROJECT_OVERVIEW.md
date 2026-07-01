# תיאור פרויקט

זהו פרויקט React + TypeScript שנבנה עם Vite, מותאם לצפייה תמידית ב-RTL ובשפה העברית.
המטרה הראשונית היא ליצור זרימת scaffold עבור כלי ויזואליזציה של מבני נתונים, עם דגש על עקרונות AVL.

## מה קיים כיום

- `src/App.tsx` - נקודת הכניסה של היישום שמגדירה את ה-app מלא במסך מלא ומגדירה `dir="rtl"`.
- `src/main.tsx` - קובץ ההרצה של React שמפעיל את האפליקציה.
- `src/app/store.ts` - Zustand store לניהול מצב אנימציה ו-UI.
- `src/pages/Visualizer.tsx` - דף הוויזואלייזר הראשי שמרכז את רכיבי היישום.
- `src/components/Canvas.tsx` - אזור ויזואליזציה מרכזי עם טקסט מטא בעברית.
- `src/components/StepLog.tsx` - תיבת לוג של שלבים.
- `src/components/ControlPanel.tsx` - פאנל שליטה עם כפתורי Play / Pause / Next Step / Undo ומסך מהירות.
- `src/components/TheoryPanel.tsx` - פאנל תאוריה קבוע שמציג עקרונות AVL בעברית.
- `src/structures/avl/types.ts` - טיפוסי צומת AVL.
- `src/structures/avl/avlAlgorithms.ts` - סקיצה ראשונית של פונקציות AVL (לא ממומשות באופן מלא).
- `src/structures/avl/avlAnimations.ts` - סטאבים ראשוניים ליצירת אנימציות.

## מבנה התיקייה שנוצר

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

## סטור Zustand

הסטור מכיל:

- `playback` - מצב הפעלה: `idle | playing | paused`
- `speed` - מהירות אנימציה
- `stepIndex` - אינדקס השלב הנוכחי
- `animationQueue` - תור של שלבי אנימציה
- `history` - היסטוריית שלבים שכבר עברו

פעולות:

- `setPlayback` - עדכון מצב הפעלה
- `setSpeed` - עדכון מהירות
- `enqueue` - הוספת שלב לתור
- `nextStep` - קידום לשלב הבא
- `undo` - ביטול השלב האחרון

## UI ופריסה

הפריסה נבנתה בהתאם לדרישות:

- תצוגת מסך מלא בגובה התצוגה (`h-screen`).
- `Visualizer` מחלק את המסך לשני חלקים: תוכן מרכזי ופאנל תאוריה קבוע בצד הימני.
- בתוך התוכן המרכזי יש מיקום אנכי לרכיבים: `Canvas`, `StepLog`, `ControlPanel`.
- כל הרכיבים משתמשים ב-Tailwind CSS.
- האפליקציה רצה ב-RTL ומדגישה טקסט בעברית.

## מה נעשה בפועל

- יצרנו scaffold ראשוני ליישום ויזואליזציה של AVL.
- יצרנו רכיבי UI בסיסיים לשלב ההצגה והשליטה.
- יצרנו מבנה תיקיות מודולרי וברור.
- הוספנו Zustand store לניהול מצב.
- הוספנו קבצים ראשוניים ל-AVL אך לא מימשנו את האלגוריתמים המלאים עדיין.
- ביצענו בדיקת build של הפרויקט (`npm run build`) והכל עבר בהצלחה.

## מה עוד אפשר להוסיף

- לוגיקה מלאה ל-AVL: הוספה, מחיקה, סיבוב שמאל / ימין, שמירת גבהים.
- הצגת עץ AVL גרפי ב-`Canvas`.
- אנימציה של תורות בשלבי פעולה.
- אינטגרציה של קלט משתמש עבור ערכים שנכנסים/נמחקים.
- ניהול תרגום מלא של כל הממשק לעברית.
