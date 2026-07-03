import { useAppStore } from '../app/store';

interface TheoryPanelProps {
  activeTab: string;
}

const TheoryPanel = ({ activeTab }: TheoryPanelProps) => {
  const { selectedSortingAlgorithm } = useAppStore();

  return (
    <div className="flex flex-1 min-h-0 flex-col gap-6 rounded-[1.75rem] border border-slate-700 bg-slate-900 p-6 pb-16 text-slate-100 shadow-xl overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
      {activeTab === 'rbt' ? (
        <>
          <div>
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
            <ul className="list-disc space-y-3 pr-4 text-base leading-7 text-slate-200">
              <li>עץ בינארי כמעט שלם המקיים את תכונת הערימה.</li>
              <li><strong>תכונת ערימה מקסימלית:</strong> מפתח כל צומת גדול או שווה למפתח של ילדיו.</li>
              <li>מיוצג במערך בצורה רציפה ללא רווחים:</li>
              <li className="list-none pr-4 text-sm text-slate-400">
                בן שמאלי של אינדקס i הוא ב- <code className="dir-ltr text-amber-400">2i + 1</code><br />
                בן ימני של אינדקס i הוא ב- <code className="dir-ltr text-amber-400">2i + 2</code><br />
                הורה של אינדקס i הוא ב- <code className="dir-ltr text-amber-400">Math.floor((i-1)/2)</code>
              </li>
              <li><strong>Max-Heapify:</strong> פעולה השומרת על תכונת הערימה ע"י תיקון מטה (בעזרת השוואה והחלפה עם הבן הגדול ביותר).</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-xl font-semibold text-white">סיבוכיות זמן</h3>
            <div className="space-y-2 rounded-3xl bg-slate-950/80 p-4 text-sm text-slate-200">
              <div>חיפוש מקסימום: O(1)</div>
              <div>הפקת מקסימום (Extract Max): O(log n)</div>
              <div>הכנסה (Insert): O(log n)</div>
            </div>
          </div>
        </>
      ) : activeTab === 'binomial' ? (
        <>
          <div>
            <ul className="list-disc space-y-3 pr-4 text-base leading-7 text-slate-200">
              <li>אוסף (יער) של עצים בינומיים המקיימים את תכונת ערימת המינימום.</li>
              <li>עץ בינומי $B_k$ מוגדר רקורסיבית ומכיל בדיוק $2^k$ צמתים.</li>
              <li><strong>תכונת ערימת מינימום:</strong> ערך כל שורש קטן או שווה לערכי ילדיו.</li>
              <li>אין שני עצים בינומיים באוסף בעלי אותו סדר גודל (מבטיח ייצוג בינארי של מספר הצמתים).</li>
              <li>השורש המינימלי הכללי נמצא תמיד באחד משורשי העצים ביער.</li>
              <li><strong>חיבור (Union):</strong> מיזוג שתי ערימות מבוצע בדומה לחיבור בינארי. זמן ריצה של $O(\log n)$.</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-xl font-semibold text-white">סיבוכיות זמן</h3>
            <div className="space-y-2 rounded-3xl bg-slate-950/80 p-4 text-sm text-slate-200">
              <div>מציאת מינימום: O(log n) - או O(1) עם מצביע מתוחזק</div>
              <div>חיבור ערימות (Union): O(log n)</div>
              <div>הפקת מינימום (Extract Min): O(log n)</div>
              <div>הכנסת איבר: O(log n) - או O(1) בממוצע אמוטיזציוני</div>
            </div>
          </div>
        </>
      ) : activeTab === 'bplus' ? (
        <>
          <div>
            <ul className="list-disc space-y-3 pr-4 text-base leading-7 text-slate-200">
              <li>עץ חיפוש רב-ענפי מאוזן שנועד למערכות קבצים ובסיסי נתונים.</li>
              <li>כל הנתונים (המפתחות והערכים) נשמרים <strong>בלעדית בעלי העץ</strong>.</li>
              <li>הצמתים הפנימיים מכילים רק מפתחות מכוונים ומשמשים לניקוב הדרך (אינדקס).</li>
              <li>העלים מקושרים ביניהם ברשימה מקושרת חד-כיוונית המאפשרת סריקה רציפה מהירה (Range Queries).</li>
              <li>כל צומת פנימי (חוץ מהשורש) חייב להכיל לפחות $\lceil b/2 \rceil$ ילדים ולכל היותר $b$ ילדים.</li>
              <li>מרחק כל העלים מהשורש שווה תמיד (איזון מושלם).</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-xl font-semibold text-white">סיבוכיות זמן</h3>
            <div className="space-y-2 rounded-3xl bg-slate-950/80 p-4 text-sm text-slate-200">
              <div>חיפוש: $O(\log_b n)$ (או $O(\log n)$ בחיפוש בינארי)</div>
              <div>הכנסת איבר: $O(b \log_b n)$ (או $O(\log n)$ במבנה מאוזן המאפשר פיצול וחיבור)</div>
              <div>מחיקת איבר: $O(b \log_b n)$ (או $O(\log n)$ במבנה מאוזן המאפשר פיצול וחיבור)</div>
            </div>
          </div>
        </>
      ) : activeTab === 'trie' ? (
        <>
          <div>
            <ul className="list-disc space-y-3 pr-4 text-base leading-7 text-slate-200">
              <li>מבנה נתונים מבוסס עץ לאחסון וחיפוש יעיל של מחרוזות ומילים.</li>
              <li>השורש מייצג מחרוזת ריקה, וכל קשת מייצגת תו יחיד.</li>
              <li>כל מילה היא מסלול מהשורש לצומת המסומן כסוף מילה (בעזרת התו $ או דגל).</li>
              <li>חיפוש מילה באורך $m$ מתבצע בזמן $O(m)$ ואינו תלוי במספר המילים הכולל בעץ!</li>
              <li>שימושי מאוד להשלמה אוטומטית (Autofill), בדיקת איות ומילונים.</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-xl font-semibold text-white">סיבוכיות זמן</h3>
            <div className="space-y-2 rounded-3xl bg-slate-950/80 p-4 text-sm text-slate-200">
              <div>חיפוש: $O(m)$ (כאשר m הוא גודל השאילתא)</div>
              <div>הוספת איבר: $O(n)$ (כאשר n הוא סכום האותיות של המילים במאגר)</div>
            </div>
          </div>
        </>
      ) : activeTab === 'suffix' ? (
        <>
          <div>
            <ul className="list-disc space-y-3 pr-4 text-base leading-7 text-slate-200">
              <li>עץ אחזור דחוס המכיל את <strong>כל הסיומות</strong> של מחרוזת נתונה.</li>
              <li>דחיסה: כל שרשרת קשתות יחידות ממוזגת לקשת יחידה המכילה תת-מחרוזת.</li>
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
      ) : activeTab === 'sorting' ? (
        <>
          {selectedSortingAlgorithm === 'heap' && (
            <div>
              <h2 className="mb-4 text-2xl font-semibold text-white">עקרונות מיון ערמה (Heap Sort)</h2>
              <ul className="list-disc space-y-3 pr-4 text-base leading-7 text-slate-200">
                <li>מיון יציב במקום (In-place) המבוסס על תכונות ערימת מקסימום.</li>
                <li><strong>שלב א' (Build Max Heap):</strong> הפיכת המערך הלא ממוין לערימת מקסימום תקינה ע"י תיקון מטה של כל האיברים מהחצי ומטה, בזמן $O(n)$.</li>
                <li><strong>שלב ב' (Sorting loop):</strong> החלפת האיבר הראשון (הגדול ביותר) עם האיבר האחרון במערך הפעיל, והפעלת Max-Heapify על השורש כדי לתקן מטה.</li>
              </ul>
              <h3 className="mt-4 mb-2 text-lg font-semibold text-white">סיבוכיות זמן</h3>
              <div className="space-y-1 rounded-2xl bg-slate-950/85 p-3 text-sm text-slate-200">
                <div>מקרה גרוע: O(n log n)</div>
                <div>מקרה ממוצע: O(n log n)</div>
                <div>זיכרון עזר: O(1) - מיון במקום</div>
              </div>
            </div>
          )}

          {selectedSortingAlgorithm === 'quick' && (
            <div>
              <h2 className="mb-4 text-2xl font-semibold text-white">עקרונות מיון מהיר (Quick Sort)</h2>
              <ul className="list-disc space-y-3 pr-4 text-base leading-7 text-slate-200">
                <li>אלגוריתם מיון רקורסיבי מהיר הפועל בשיטת "חלק וכבוש" (Divide & Conquer).</li>
                <li><strong>בחירת ציר (Pivot):</strong> בחירת איבר שעל פיו יחולק המערך (בסימולציה נבחר האיבר האחרון).</li>
                <li><strong>חלוקה (Partition):</strong> סידור המערך כך שכל האיברים הקטנים או שווים לציר ממוקמים משמאלו, והגדולים ממנו מימינו.</li>
                <li>ביצוע קריאות רקורסיביות עבור שני חלקי המערך שנוצרו משמאל ומימין לציר.</li>
              </ul>
              <h3 className="mt-4 mb-2 text-lg font-semibold text-white">סיבוכיות זמן</h3>
              <div className="space-y-1 rounded-2xl bg-slate-950/85 p-3 text-sm text-slate-200">
                <div>מקרה ממוצע: O(n log n)</div>
                <div>מקרה גרוע: O(n²) - קורה כאשר המערך כבר ממוין או הפוך והציר אינו מאוזן</div>
                <div>זיכרון עזר: O(log n) - של רקורסיית המחסנית</div>
              </div>
            </div>
          )}

          {selectedSortingAlgorithm === 'merge' && (
            <div>
              <h2 className="mb-4 text-2xl font-semibold text-white">עקרונות מיון מיזוג (Merge Sort)</h2>
              <ul className="list-disc space-y-3 pr-4 text-base leading-7 text-slate-200">
                <li>אלגוריתם מיון יציב לחלוטין העובד בשיטת "חלק וכבוש".</li>
                <li><strong>חלוקה:</strong> פיצול המערך באופן רקורסיבי לחצאים עד להגעה לתת-מערכים בעלי איבר בודד (שהם ממוינים בהגדרה).</li>
                <li><strong>מיזוג (Merge):</strong> שילוב של שני חצאים ממוינים למערך ממוין מאוחד ע"י מעבר והשוואת איברים משני הצדדים.</li>
                <li>אלגוריתם זה אינו ממוין במקום ודורש מערך עזר נוסף.</li>
              </ul>
              <h3 className="mt-4 mb-2 text-lg font-semibold text-white">סיבוכיות זמן</h3>
              <div className="space-y-1 rounded-2xl bg-slate-950/85 p-3 text-sm text-slate-200">
                <div>מקרה גרוע: O(n log n)</div>
                <div>מקרה ממוצע: O(n log n)</div>
                <div>זיכרון עזר: O(n) - עבור מערך העזר למיזוג</div>
              </div>
            </div>
          )}

          {selectedSortingAlgorithm === 'insertion' && (
            <div>
              <h2 className="mb-4 text-2xl font-semibold text-white">עקרונות מיון הכנסה (Insertion Sort)</h2>
              <ul className="list-disc space-y-3 pr-4 text-base leading-7 text-slate-200">
                <li>אלגוריתם מיון פשוט, יציב ואינטואיטיבי הממיין את המערך בהדרגה משמאל לימין.</li>
                <li>בכל שלב נבחר איבר מפתח (Key) ומוכנס למקומו היחסי הנכון בתוך המקטע שכבר ממוין משמאלו.</li>
                <li>הכנסת האיבר דורשת הזזה של כל האיברים הגדולים ממנו במקטע הממוין ימינה כדי לפנות מקום.</li>
                <li>יעיל מאוד עבור מערכים קטנים או מערכים שכבר כמעט ממוינים לחלוטין.</li>
              </ul>
              <h3 className="mt-4 mb-2 text-lg font-semibold text-white">סיבוכיות זמן</h3>
              <div className="space-y-1 rounded-2xl bg-slate-950/85 p-3 text-sm text-slate-200">
                <div>מקרה ממוצע: O(n²)</div>
                <div>מקרה גרוע: O(n²) - כשהמערך ממוין בסדר הפוך</div>
                <div>מקרה טוב: O(n) - כשהמערך כבר ממוין</div>
              </div>
            </div>
          )}

          {selectedSortingAlgorithm === 'counting' && (
            <div>
              <h2 className="mb-4 text-2xl font-semibold text-white">עקרונות מיון מנייה (Counting Sort)</h2>
              <ul className="list-disc space-y-3 pr-4 text-base leading-7 text-slate-200">
                <li><strong>מיון שאינו מבוסס השוואות:</strong> מתבסס על הנחה מקדימה שכל הערכים במערך הם אי-שליליים ובטווח חסום $[0, k]$.</li>
                <li><strong>מערך מונים (C):</strong> יוצר מערך בגודל $k+1$ שבו כל תא מודד כמה פעמים כל ערך מופיע במערך המקור.</li>
                <li><strong>סכימה מצטברת:</strong> מעדכן את מערך המונים כך שכל תא יחזיק את סכום האיברים שלפניו. ערך זה קובע את טווח האינדקסים המדויק של כל מספר במערך הממוין.</li>
                <li><strong>מערך מוצא (B):</strong> השמה סופית של האיברים במקומם תוך סריקה של מערך המקור מסופו לתחילתו (כדי להבטיח את יציבות המיון).</li>
              </ul>
              <h3 className="mt-4 mb-2 text-lg font-semibold text-white">סיבוכיות זמן וזיכרון</h3>
              <div className="space-y-1 rounded-2xl bg-slate-950/85 p-3 text-sm text-slate-200">
                <div>זמן ריצה: O(n + k) - ליניארי כאשר k קטן או פרופורציונלי ל-n</div>
                <div>זיכרון עזר: O(n + k) - דורש מערך מונים ומערך מוצא</div>
              </div>
            </div>
          )}

          {selectedSortingAlgorithm === 'radix' && (
            <div>
              <h2 className="mb-4 text-2xl font-semibold text-white">עקרונות מיון בסיס (Radix Sort)</h2>
              <ul className="list-disc space-y-3 pr-4 text-base leading-7 text-slate-200">
                <li><strong>מיון שאינו מבוסס השוואות:</strong> מיועד למספרים המורכבים מ-$d$ ספרות לכל היותר (בבסיס כלשהו, לדוגמה בסיס 10).</li>
                <li>ממיין את המספרים ספרה אחר ספרה, החל מהספרה הכי פחות משמעותית (LSD - אחדות) ועד לספרה הכי משמעותית (MSD).</li>
                <li><strong>מיון יציב כתת-תהליך:</strong> בכל סבב משתמשים באלגוריתם מיון יציב (כגון מיון מנייה או מיון הכנסה) כדי למיין לפי הספרה הנוכחית בלבד.</li>
                <li>יציבות המיון מבטיחה שסדר האיברים שנקבע על פי הספרות הקודמות יישמר.</li>
              </ul>
              <h3 className="mt-4 mb-2 text-lg font-semibold text-white">סיבוכיות זמן וזיכרון</h3>
              <div className="space-y-1 rounded-2xl bg-slate-950/85 p-3 text-sm text-slate-200">
                <div>זמן ריצה: O(d * (n + k)) - כאשר d מספר הספרות ו-k הבסיס</div>
                <div>זיכרון עזר: O(n + k) - תלוי במיון היציב הנבחר</div>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <div>
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
