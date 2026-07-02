import { useState } from 'react'
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
  const reset = useAppStore((state) => state.reset)

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId)
    setMenuOpen(false)
    reset()
  }

  return (
    <div className="h-screen overflow-hidden bg-slate-950 text-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/95 px-4 py-3 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3">
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

          <div className="flex-1 px-4">
            <div className="rounded-3xl bg-slate-950/95 p-3 shadow-2xl shadow-slate-950/40">
              <ControlPanel activeTab={activeTab} />
            </div>
          </div>

          <button
            onClick={() => setDrawerOpen(true)}
            className="rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-sky-500/30 transition hover:bg-sky-500"
          >
            {`עקרונות ${structureTabs.find((tab) => tab.id === activeTab)?.label}`}
          </button>
        </div>

      </header>

      <main className="mx-auto flex h-[calc(100vh-96px)] max-w-[1600px] gap-4 px-4 py-4 overflow-hidden">
        <aside className="hidden w-[360px] shrink-0 flex-col gap-4 overflow-hidden lg:flex">
          <StepLog />
        </aside>

        <section className="flex flex-1 flex-col gap-4 overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/90 shadow-inner">
            <div className="flex-1 p-2 overflow-auto relative">
              <Canvas activeTab={activeTab} />
            </div>
        </section>
      </main>

      {menuOpen ? (
        <>
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setMenuOpen(false)} />
          <div className="fixed right-0 top-0 z-50 flex h-full w-72 flex-col overflow-y-auto rounded-l-3xl border-l border-slate-700 bg-slate-950 p-4 shadow-2xl shadow-slate-950/60 transition-transform duration-300 ease-out">
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
    </div>
  )
}

export default Visualizer