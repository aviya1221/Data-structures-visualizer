interface TheoryPanelProps {
  activeTab: string;
}

const TheoryPanel = ({ activeTab }: TheoryPanelProps) => {
  return (
    <div className="flex h-full flex-col gap-6 rounded-[1.75rem] border border-slate-700 bg-slate-900 p-6 text-slate-100 shadow-xl">
      {activeTab === 'rbt' ? (
        <>
          <div>
            <h2 className="mb-4 text-2xl font-semibold text-white">עקרונות עץ אדום-שחור</h2>
            <ul className="list-disc space-y-3 pr-4 text-base leading-7 text-slate-200">
              <li>כל צומת הוא אדום או שחור.</li>
              <li>השורש הוא תמיד שחור.</li>
              <li>כל עלה NIL הוא שחור.</li>
              <li>לצומת אדום יש רק ילדים שחורים (אין צמתים אדומים עוקבים).</li>
              <li>כל הנתיבים מצומת כלשהו לעלי NIL מכילים מספר שווה של צמתים שחורים.</li>
              <li>הכנסות חדשות הן תמיד אדומות.</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-xl font-semibold text-white">סיבוכיות זמן</h3>
            <div className="space-y-2 rounded-3xl bg-slate-950/80 p-4 text-sm text-slate-200">
              <div>חיפוש: O(log n)</div>
              <div>הכנסה: O(log n)</div>
              <div>מחיקה: O(log n)</div>
            </div>
          </div>
        </>
      ) : activeTab === 'skiplist' ? (
        <>
          <div>
            <h2 className="mb-4 text-2xl font-semibold text-white">עקרונות רשימת דילוג</h2>
            <ul className="list-disc space-y-3 pr-4 text-base leading-7 text-slate-200">
              <li>רשימת דילוג 1-2-3 (מבוססת ספרי קורס).</li>
              <li>כל רמה i מהווה תת-רשימה ממוינת של הרמה מתחתיה i-1.</li>
              <li>מרווח האיברים ללא הורה בין כל שני צמתים מקודמים ברמה מעל חייב להיות 1 או 2 (כלומר, כל איבר שני או שלישי מועלה לרמה מעל).</li>
              <li><strong>חוק הכנסה:</strong> אם הכנסת איבר יוצרת רצף של בדיוק 3 איברים עוקבים ללא הורה ברמה מעל, הצומת האמצעי מקודם למעלה.</li>
              <li>הקידומים יכולים לעלות בצורה רקורסיבית (cascade) עד ליצירת רמה עליונה חדשה.</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-xl font-semibold text-white">סיבוכיות זמן</h3>
            <div className="space-y-2 rounded-3xl bg-slate-950/80 p-4 text-sm text-slate-200">
              <div>חיפוש: O(log n)</div>
              <div>הכנסה: O(log n)</div>
              <div>מחיקה: O(log n)</div>
            </div>
          </div>
        </>
      ) : activeTab === 'heap' ? (
        <>
          <div>
            <h2 className="mb-4 text-2xl font-semibold text-white">עקרונות ערימת מקסימום (Max-Heap)</h2>
            <ul className="list-disc space-y-3 pr-4 text-base leading-7 text-slate-200">
              <li>עץ בינארי כמעט מלא המיוצג במערך (Array-backed tree).</li>
              <li><strong>אינדקס 1-Based:</strong> השורש נמצא באינדקס 1. לכל צומת i:</li>
              <li>בן שמאלי באינדקס 2i, בן ימני באינדקס 2i+1, ואב באינדקס i/2 (מעוגל למטה).</li>
              <li><strong>תכונת ערימת מקסימום:</strong> לכל צומת i (מלבד השורש): ערכו של האב גדול או שווה לערכו של i.</li>
              <li>במהלך הכנסה, האיבר ממוקם בסוף ומבעבע מעלה (Heapify-Up).</li>
              <li>במחיקת מקסימום, מחליפים את השורש עם האיבר האחרון, מוחקים אותו ומבצעים שקיעה (Max-Heapify) מטה מהשורש.</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-xl font-semibold text-white">סיבוכיות זמן</h3>
            <div className="space-y-2 rounded-3xl bg-slate-950/80 p-4 text-sm text-slate-200">
              <div>מציאת מקסימום: O(1)</div>
              <div>הכנסה: O(log n)</div>
              <div>הפקת מקסימום: O(log n)</div>
            </div>
          </div>
        </>
      ) : activeTab === 'binomial' ? (
        <>
          <div>
            <h2 className="mb-4 text-2xl font-semibold text-white">עקרונות ערימה בינומית (Binomial Heap)</h2>
            <ul className="list-disc space-y-3 pr-4 text-base leading-7 text-slate-200">
              <li>אוסף (יער) של עצי בינומי השומרים על תכונת Min-Heap.</li>
              <li>עץ בינומי Bk הוא בעל שורש עם k בנים שסדריהם B(k-1), B(k-2), ..., B0.</li>
              <li>לכל דרגה k יש לכל היותר עץ אחד בערימה.</li>
              <li><strong>מיזוג עצים:</strong> כאשר מתמזגים שני עצים מסדר k, השורש בעל הערך הגדול יותר הופך לבן השמאלי ביותר של השורש הקטן יותר.</li>
              <li><strong>הפקת מינימום:</strong> מסירים את השורש הקטן ביותר ביער, והבנים שלו הופכים לערימה בינומית עצמאית שמתמזגת (Union) עם הערימה הראשית.</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-xl font-semibold text-white">סיבוכיות זמן</h3>
            <div className="space-y-2 rounded-3xl bg-slate-950/80 p-4 text-sm text-slate-200">
              <div>הכנסה: O(1) בממוצע אמורטיזציה, O(log n) במקרה הגרוע</div>
              <div>מציאת מינימום: O(log n) (או O(1) עם מצביע)</div>
              <div>איחוד (Union): O(log n)</div>
            </div>
          </div>
        </>
      ) : activeTab === 'bplus' ? (
        <>
          <div>
            <h2 className="mb-4 text-2xl font-semibold text-white">עקרונות עץ B+ (B+ Tree)</h2>
            <ul className="list-disc space-y-3 pr-4 text-base leading-7 text-slate-200">
              <li>עץ חיפוש רב-ענפי מאוזן בו כל המפתחות והמידע נשמרים בעלים בלבד.</li>
              <li>צמתים פנימיים (אינדקס) מכילים מפתחות ומצביעים לבנים בלבד ומשמשים לניווט.</li>
              <li><strong>רשימה מקושרת בעלים:</strong> כל העלים מקושרים ביניהם משמאל לימין לביצוע שאילתות טווח (Range Queries) יעילות.</li>
              <li><strong>חוק פיצול:</strong> כאשר מספר המפתחות בגוש חורג מקיבולת b:</li>
              <li>פיצול עלה: הגוש מפוצל לשניים, ומפתח ההפרדה מועתק (Copy) לאב.</li>
              <li>פיצול אינדקס: הגוש מפוצל לשניים, ומפתח ההפרדה מועבר (Move) לאב ומוסר מהבנים.</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-xl font-semibold text-white">סיבוכיות זמן</h3>
            <div className="space-y-2 rounded-3xl bg-slate-950/80 p-4 text-sm text-slate-200">
              <div>חיפוש טווח: O(log_b n + k)</div>
              <div>הכנסה: O(log_b n)</div>
              <div>מחיקה: O(log_b n)</div>
            </div>
          </div>
        </>
      ) : activeTab === 'trie' ? (
        <>
          <div>
            <h2 className="mb-4 text-2xl font-semibold text-white">עקרונות עץ אחזור (Trie)</h2>
            <ul className="list-disc space-y-3 pr-4 text-base leading-7 text-slate-200">
              <li>מבנה נתונים לייצוג קבוצת מילים מעל אלפבית.</li>
              <li>כל צומת מייצג אות (תו), והשורש מייצג מחרוזת ריקה.</li>
              <li><strong>סמל מיוחד $:</strong> כל מילה בעץ מסתיימת בתו המיוחד $ כבן נפרד, המציין את סוף המילה בדיוק כמו בספר הלימוד.</li>
              <li>המסלול מהשורש לעלה מייצג מילה שלמה.</li>
              <li><strong>מניעת כפילויות:</strong> מילים בעלות תחיליות משותפות חולקות את אותם צמתים בנתיב המשותף.</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-xl font-semibold text-white">סיבוכיות זמן</h3>
            <div className="space-y-2 rounded-3xl bg-slate-950/80 p-4 text-sm text-slate-200">
              <div>חיפוש מילה באורך m: O(m)</div>
              <div>הכנסת מילה באורך m: O(m)</div>
              <div>מחיקה: O(m)</div>
            </div>
          </div>
        </>
      ) : activeTab === 'suffix' ? (
        <>
          <div>
            <h2 className="mb-4 text-2xl font-semibold text-white">עקרונות עץ סיומת (Suffix Tree)</h2>
            <ul className="list-disc space-y-3 pr-4 text-base leading-7 text-slate-200">
              <li>מבנה נתונים המכיל את כל הסיומות של מחרוזת נתונה.</li>
              <li>עבור מחרוזת באורך n, מוכנסות לעץ n סיומות שונות.</li>
              <li><strong>סמל מיוחד $:</strong> כל סיומת מסתיימת בתו המיוחד $ כעלה נפרד, מה שמבטיח שכל סיומת תסתיים בעלה ולא תהיה תת-נתיב פנימי.</li>
              <li>מיועד לחיפוש מהיר של תת-מחרוזות בטקסט ארוך בזמן התלוי באורך השאילתה בלבד.</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-xl font-semibold text-white">סיבוכיות זמן</h3>
            <div className="space-y-2 rounded-3xl bg-slate-950/80 p-4 text-sm text-slate-200">
              <div>חיפוש תת-מחרוזת באורך m: O(m)</div>
              <div>בניית העץ למחרוזת באורך n: O(n)</div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div>
            <h2 className="mb-4 text-2xl font-semibold text-white">עקרונות עץ AVL</h2>
            <ul className="list-disc space-y-3 pr-4 text-base leading-7 text-slate-200">
              <li>עץ חיפוש בינארי (BST) מאוזן בקפדנות.</li>
              <li>הפרש הגבהים בין תת-העץ השמאלי לימני לכל צומת הוא לכל היותר 1.</li>
              <li>גובה עלה הוא 0.</li>
              <li>תת-עץ ריק מוגדר בגובה -1.</li>
              <li>גורם איזון = גובה(שמאל) - גובה(ימין).</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-xl font-semibold text-white">סיבוכיות זמן</h3>
            <div className="space-y-2 rounded-3xl bg-slate-950/80 p-4 text-sm text-slate-200">
              <div>חיפוש: O(log n)</div>
              <div>הכנסה: O(log n)</div>
              <div>מחיקה: O(log n)</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TheoryPanel;
