interface TheoryPanelProps {
  activeTab: string;
}

const TheoryPanel = ({ activeTab }: TheoryPanelProps) => {
  return (
    <div className="flex h-full flex-col gap-6 rounded-[1.75rem] border border-slate-700 bg-slate-900 p-6 text-slate-100 shadow-xl">
      {activeTab === 'rbt' ? (
        <>
          <div>
            <h2 className="mb-4 text-2xl font-semibold text-white">עקרונות</h2>
            <ul className="list-disc space-y-3 pr-4 text-base leading-7 text-slate-200">
              <li>כל צומת הוא אדום או שחור.</li>
              <li>השורש הוא תמיד שחור.</li>
              <li>כל עלה NIL הוא שחור.</li>
              <li>לצומת אדום יש רק ילדים שחורים.</li>
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
      ) : (
        <>
          <div>
            <h2 className="mb-4 text-2xl font-semibold text-white">עקרונות</h2>
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
  )
}

export default TheoryPanel
