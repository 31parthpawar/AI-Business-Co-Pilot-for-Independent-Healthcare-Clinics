// Shell: header, tabs (bottom bar on phones, top on wider screens), and a tiny hash router
// so the browser and Android back buttons work.
import { useCallback, useEffect, useState } from 'react'
import type { CallLists } from './logic/callLists'
import { Calls } from './screens/Calls'
import { Dashboard } from './screens/Dashboard'
import { DataScreen } from './screens/DataScreen'
import { Patients } from './screens/Patients'
import { Posts } from './screens/Posts'
import { ThemeToggle } from './theme'
import { useApp } from './store'
import { Icon, type IconName } from './ui'

type Tab = 'dashboard' | 'calls' | 'patients' | 'posts' | 'data'
export interface Route {
  tab: Tab
  list?: keyof CallLists
  caseNo?: string
}
export type Nav = (r: Route) => void

const TABS: { tab: Tab; label: string; icon: IconName }[] = [
  { tab: 'dashboard', label: 'Dashboard', icon: 'home' },
  { tab: 'calls', label: 'Calls', icon: 'phone' },
  { tab: 'patients', label: 'Patients', icon: 'users' },
  { tab: 'posts', label: 'Posts', icon: 'image' },
  { tab: 'data', label: 'Data', icon: 'folder' },
]

const toHash = (r: Route) => `#/${r.tab}${r.list ? `/${r.list}` : ''}${r.caseNo ? `/${encodeURIComponent(r.caseNo)}` : ''}`
function fromHash(h: string): Route {
  const [tab, arg] = h.replace(/^#\/?/, '').split('/')
  if (tab === 'calls') return { tab, list: (arg as keyof CallLists) || 'renewals' }
  if (tab === 'patients') return { tab, caseNo: arg ? decodeURIComponent(arg) : undefined }
  if (tab === 'data' || tab === 'posts') return { tab }
  return { tab: 'dashboard' }
}

export default function App() {
  const { ready, derived, dataset, settings, loadSample } = useApp()
  const [route, setRoute] = useState<Route>(() => fromHash(location.hash))

  useEffect(() => {
    const on = () => setRoute(fromHash(location.hash))
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])

  const nav: Nav = useCallback((r) => {
    location.hash = toHash(r)
    window.scrollTo({ top: 0 })
  }, [])

  if (!ready) return <div className="p-8 text-center text-ink-2">Loading…</div>

  const hasData = !!derived
  const tab = hasData ? route.tab : 'data'

  return (
    <div className="min-h-dvh">
      <header className="safe-top sticky top-0 z-20 border-b border-[var(--border)] bg-page/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <div className="truncate text-[16px] font-semibold text-ink">{settings.clinicName}</div>
            <div className="text-[12px] text-ink-2">Clinic Co-Pilot{dataset?.kind === 'sample' ? ' · sample data' : ''}</div>
          </div>
          <div className="flex items-center gap-2">
          <nav className="hidden gap-1 md:flex">
            {TABS.map((t) => (
              <button key={t.tab} disabled={!hasData && t.tab !== 'data'} onClick={() => nav({ tab: t.tab })} className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-[14px] disabled:opacity-40 ${tab === t.tab ? 'bg-surface font-medium text-ink ring-1 ring-[var(--border)]' : 'text-ink-2'}`}>
                <Icon name={t.icon} className="h-4 w-4" />
                {t.label}
              </button>
            ))}
          </nav>
          <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-28 pt-4 md:pb-10">
        {!hasData && (
          <div className="mb-4 rounded-2xl border border-[var(--border)] bg-accent-soft p-4 text-[14px] text-ink">
            <p className="font-medium">Welcome. Start with the sample clinic to see how it works.</p>
            <button onClick={loadSample} className="mt-3 rounded-xl bg-accent px-4 py-2.5 font-medium text-white">Load sample data</button>
          </div>
        )}
        {tab === 'dashboard' && <Dashboard nav={nav} />}
        {tab === 'calls' && <Calls list={route.list ?? 'renewals'} nav={nav} />}
        {tab === 'patients' && <Patients caseNo={route.caseNo} nav={nav} />}
        {tab === 'posts' && <Posts />}
        {tab === 'data' && <DataScreen />}
      </main>

      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-20 border-t border-[var(--border)] bg-surface/95 backdrop-blur md:hidden">
        <div className="grid grid-cols-5">
          {TABS.map((t) => (
            <button key={t.tab} disabled={!hasData && t.tab !== 'data'} onClick={() => nav({ tab: t.tab })} className={`flex flex-col items-center gap-0.5 py-2 text-[11px] disabled:opacity-40 ${tab === t.tab ? 'text-accent-ink' : 'text-muted'}`}>
              <Icon name={t.icon} className="h-[22px] w-[22px]" />
              {t.label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
