import { useEffect, useState } from 'react'
import Canvas from '../components/Canvas'
import { ControlPanel } from '../components/ControlPanelNew'
import StepLog from '../components/StepLog'
import TheoryPanel from '../components/TheoryPanel'
import { useAppStore } from '../app/store'

const structureTabs = [
  { id: 'avl', label: 'עץ AVL' },
  { id: 'rbt', label: 'עץ אדום-שחור' },
  { id: 'heap', label: 'עץ ערמה' },
  { id: 'binomial', label: 'ערמה בינומית' },
  { id: 'bplus', label: 'עץ B+' },
  { id: 'skiplist', label: 'רשימת דילוג' },
  { id: 'trie', label: 'עץ אחזור (Trie)' },
  { id: 'suffix', label: 'עץ סיומת' },
]

const Visualizer = () => {
  const [activeTab, setActiveTab] = useState('avl')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [welcomeOpen, setWelcomeOpen] = useState(false)
  const reset = useAppStore((state) => state.reset)

  useEffect(() => {
    const shown = sessionStorage.getItem('welcomeModalShown')
    if (!shown) {
      setWelcomeOpen(true)
    }
  }, [])

  const handleCloseWelcome = () => {
    sessionStorage.setItem('welcomeModalShown', 'true')
    setWelcomeOpen(false)
  }

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId)
    setMenuOpen(false)
    reset()
  }

  return (
    <div className="min-h-screen h-auto md:h-screen overflow-y-auto md:overflow-hidden bg-slate-950 text-slate-50">
      <header className="relative md:sticky top-0 z-40 border-b border-slate-800 bg-slate-950/95 px-4 py-3 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex flex-col md:flex-row max-w-[1600px] items-center justify-between gap-3">
          <div className="flex w-full md:w-auto items-center justify-between md:justify-start gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMenuOpen((current) => !current)}
                className="rounded-full border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 shadow-sm transition hover:bg-slate-800"
              >
                ☰
              </button>
              <div>
                <p className="text-sm text-slate-400">בחר מבנה נתונים</p>
                <h1 className="text-xl font-semibold text-white">{structureTabs.find((tab) => tab.id === activeTab)?.label}</h1>
              </div>
            </div>
            {/* Principles button on mobile is placed inside the header stack */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="md:hidden rounded-full bg-sky-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-sky-500/30 transition hover:bg-sky-500"
            >
              עקרונות
            </button>
          </div>

          <div className="w-full md:flex-1 px-0 md:px-4">
            <div className="rounded-3xl bg-slate-950/95 p-3 shadow-2xl shadow-slate-950/40">
              <ControlPanel activeTab={activeTab} />
            </div>
          </div>

          <button
            onClick={() => setDrawerOpen(true)}
            className="hidden md:block rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-sky-500/30 transition hover:bg-sky-500"
          >
            {`עקרונות ${structureTabs.find((tab) => tab.id === activeTab)?.label}`}
          </button>
        </div>

      </header>

      <main className="mx-auto flex flex-col md:flex-row h-auto md:h-[calc(100vh-96px)] max-w-[1600px] gap-4 px-4 py-4 md:overflow-hidden">
        <aside className="flex w-full md:w-[360px] shrink-0 flex-col gap-4 overflow-hidden h-[300px] md:h-full order-last md:order-none">
          <StepLog />
        </aside>

        <section className="flex flex-1 flex-col gap-4 min-h-[580px] md:min-h-0 overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/90 shadow-inner">
            <div className="flex-1 p-2 overflow-auto relative">
              <Canvas activeTab={activeTab} />
            </div>
        </section>
      </main>

      {menuOpen ? (
        <>
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setMenuOpen(false)} />
          <div className="fixed right-0 top-0 z-50 flex h-full w-72 flex-col justify-between rounded-l-3xl border-l border-slate-700 bg-slate-950 p-4 shadow-2xl shadow-slate-950/60 transition-transform duration-300 ease-out">
            <div className="overflow-y-auto flex-1 pb-4">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">בחר מבנה נתונים</p>
                  <h2 className="text-lg font-semibold text-white">ניווט</h2>
                </div>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="rounded-full border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
                >
                  סגור
                </button>
              </div>
              <div className="space-y-3">
                {structureTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    className={`w-full rounded-2xl px-4 py-3 text-right text-sm font-medium transition ${
                      activeTab === tab.id
                        ? 'bg-sky-500 text-white'
                        : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Spotify Link */}
            <div className="border-t border-slate-800 pt-4 mt-auto">
              <a
                href="https://open.spotify.com/show/033HrQoxENZtoWDFIZtEPz?si=351974988d934dfd"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-2xl bg-slate-900 border border-slate-800 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-slate-800 hover:border-emerald-500 group shadow-md"
              >
                <svg
                  className="h-5 w-5 text-[#1DB954] transition group-hover:scale-110"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.565.387-.86.207-2.377-1.454-5.37-1.783-8.894-.982-.336.076-.67-.135-.746-.472-.076-.336.135-.67.472-.746 3.854-.88 7.15-.502 9.82 1.134.296.18.388.565.208.86zm1.224-2.723c-.226.367-.707.487-1.074.26-2.72-1.672-6.87-2.157-10.08-1.182-.413.125-.847-.107-.972-.52-.125-.413.107-.847.52-.972 3.67-1.114 8.243-.574 11.347 1.33.367.227.487.708.26 1.075zm.105-2.825C14.392 8.78 8.552 8.587 5.175 9.612c-.52.157-1.073-.143-1.23-.663-.158-.52.143-1.07.663-1.228 3.882-1.178 10.334-.954 14.39 1.454.468.278.622.883.344 1.35-.278.468-.883.622-1.35.344z"/>
                </svg>
                <div className="flex flex-col">
                  <span className="text-[11px] text-slate-400 font-semibold leading-tight">הפודקאסט של הקורס</span>
                  <span className="text-xs font-extrabold text-white leading-normal group-hover:text-emerald-400 transition">האזנה בספוטיפיי</span>
                </div>
              </a>
            </div>
          </div>
        </>
      ) : null}

      {drawerOpen ? (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm">
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-slate-950 p-6 shadow-2xl shadow-slate-950/60">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-semibold">
                {`עקרונות ${structureTabs.find((tab) => tab.id === activeTab)?.label}`}
              </h2>
              <button
                onClick={() => setDrawerOpen(false)}
                className="rounded-full border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
              >
                סגור
              </button>
            </div>
            <TheoryPanel activeTab={activeTab} />
          </div>
        </div>
      ) : null}

      {welcomeOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-xl animate-fade-in text-slate-100">
            <div className="mb-4 text-center">
              <span className="text-4xl">🚀</span>
              <h2 className="mt-2 text-2xl font-bold text-white">ויזואלייזר מבני נתונים מתקדם</h2>
              <p className="mt-1 text-sm text-slate-400">ברוכים הבאים! כלי אינטראקטיבי להמחשת מבני הנתונים של הקורס</p>
            </div>
            
            <div className="my-6 space-y-4 max-h-[360px] overflow-y-auto pr-2">
              <div className="flex gap-3 items-start">
                <span className="text-xl">🌲</span>
                <div>
                  <h4 className="font-semibold text-sky-400">עצי חיפוש בינאריים מאוזנים (AVL & RBT)</h4>
                  <p className="text-xs text-slate-300">מעקב אינטראקטיבי אחר רוטציות, איזון צמתים וצביעת אדום-שחור מדויקת.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <span className="text-xl">📈</span>
                <div>
                  <h4 className="font-semibold text-emerald-400">רשימת דילוג (Skip List)</h4>
                  <p className="text-xs text-slate-300">הצגת רמות גובה אינדקס שונות. הכנסה של כל איבר שני או שלישי לרמה הבאה.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <span className="text-xl">🥞</span>
                <div>
                  <h4 className="font-semibold text-amber-400">ערימות (Max-Heap & Binomial Heap)</h4>
                  <p className="text-xs text-slate-300">סימולציית פעולות הכנסה (Insert), הפקה (Extract Max/Min) ומיזוג עצים בינומיים.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <span className="text-xl">🔑</span>
                <div>
                  <h4 className="font-semibold text-purple-400">עץ B+ ואינדוקס</h4>
                  <p className="text-xs text-slate-300">חלוקת בלוקים (Key splitting), פוינטרים, ופרומולציית מפתחות מינימום מדויקת.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <span className="text-xl">🔍</span>
                <div>
                  <h4 className="font-semibold text-rose-400">עצי תחיליות וסיומות (Trie & Suffix Tree)</h4>
                  <p className="text-xs text-slate-300">תומך בבניית העצים ובמצב "חפש" (Search) מונפש המסמן התאמות בירוק וכשלונות באדום.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <span className="text-xl">🎧</span>
                <div>
                  <h4 className="font-semibold text-green-400">הפודקאסט של הקורס</h4>
                  <p className="text-xs text-slate-300">גישה מהירה לפודקאסט הרשמי דרך כפתור הספוטיפיי בתחתית התפריט!</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleCloseWelcome}
              className="w-full rounded-2xl bg-sky-600 py-3 text-sm font-bold text-white shadow-lg shadow-sky-500/20 transition hover:bg-sky-500 hover:shadow-sky-500/30"
            >
              הבנתי, בוא נתחיל!
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default Visualizer