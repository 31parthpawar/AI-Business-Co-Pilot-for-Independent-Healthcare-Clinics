// App state: the dataset, settings and call outcomes, persisted in IndexedDB, plus everything derived from them.
import { format, parseISO, startOfDay } from 'date-fns'
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { db, getKV, requestPersistence, setKV } from './db'
import { mergeImport, readFiles, type ImportReport } from './import/readFiles'
import { allCallLists } from './logic/callLists'
import { insights } from './logic/insights'
import { buildIndex } from './logic/patients'
import { sampleDataset } from './sample/load'
import { defaultSettings } from './settings'
import type { CallList, CallOutcome, Dataset, Outcome, Settings } from './types'

function useDerived(dataset: Dataset | null, settings: Settings) {
  return useMemo(() => {
    if (!dataset || !dataset.visits.length) return null
    const idx = buildIndex(dataset, settings)
    // Sample data runs up to today. Imported data is read as of its last entry.
    const asOf = dataset.kind === 'sample' ? startOfDay(new Date()) : parseISO(idx.dataEnd)
    const lists = allCallLists(idx, settings, asOf)
    return { idx, asOf, lists, insights: insights(dataset, idx, settings, asOf, lists) }
  }, [dataset, settings])
}

type Derived = NonNullable<ReturnType<typeof useDerived>>

interface AppState {
  ready: boolean
  dataset: Dataset | null
  settings: Settings
  derived: Derived | null
  outcomes: CallOutcome[]
  loadSample: () => Promise<void>
  importFiles: (files: File[]) => Promise<ImportReport>
  clearData: () => Promise<void>
  saveSettings: (s: Settings) => Promise<void>
  recordOutcome: (caseNo: string, list: CallList, outcome: Outcome) => Promise<void>
}

const Ctx = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [dataset, setDataset] = useState<Dataset | null>(null)
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [outcomes, setOutcomes] = useState<CallOutcome[]>([])

  useEffect(() => {
    ;(async () => {
      const [d, s, o] = await Promise.all([getKV<Dataset>('dataset'), getKV<Settings>('settings'), db.outcomes.toArray()])
      if (s) setSettings({ ...defaultSettings, ...s, thresholds: { ...defaultSettings.thresholds, ...s.thresholds } })
      if (d) setDataset(d)
      setOutcomes(o)
      setReady(true)
      requestPersistence()
    })()
  }, [])

  const saveSettings = useCallback(async (s: Settings) => {
    setSettings(s)
    await setKV('settings', s)
  }, [])

  const loadSample = useCallback(async () => {
    const { dataset: d, targets } = sampleDataset(new Date(), settings)
    const s = { ...settings, targets }
    await Promise.all([setKV('dataset', d), setKV('settings', s), db.outcomes.clear()])
    setOutcomes([])
    setSettings(s)
    setDataset(d)
  }, [settings])

  const importFiles = useCallback(
    async (files: File[]) => {
      const report = await readFiles(files, settings)
      if (report.tables.some((t) => t.kind)) {
        const d = mergeImport(dataset, report)
        if (dataset?.kind === 'sample') {
          await db.outcomes.clear()
          setOutcomes([])
        }
        await setKV('dataset', d)
        setDataset(d)
      }
      return report
    },
    [dataset, settings],
  )

  const clearData = useCallback(async () => {
    await Promise.all([db.kv.delete('dataset'), db.outcomes.clear()])
    setDataset(null)
    setOutcomes([])
  }, [])

  const recordOutcome = useCallback(async (caseNo: string, list: CallList, outcome: Outcome) => {
    const o: CallOutcome = { caseNo, list, outcome, date: format(new Date(), 'yyyy-MM-dd') }
    o.id = await db.outcomes.add(o)
    setOutcomes((prev) => [...prev, o])
  }, [])

  const derived = useDerived(dataset, settings)

  return (
    <Ctx.Provider value={{ ready, dataset, settings, derived, outcomes, loadSample, importFiles, clearData, saveSettings, recordOutcome }}>
      {children}
    </Ctx.Provider>
  )
}

export function useApp() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useApp outside AppProvider')
  return c
}
