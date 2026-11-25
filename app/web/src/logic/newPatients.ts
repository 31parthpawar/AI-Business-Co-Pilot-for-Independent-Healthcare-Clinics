// New patients: how many, from where, and what changed. The survey's top pain (48%).
import { addDays, format, parseISO, subMonths } from 'date-fns'
import type { Settings } from '../types'
import { NOT_RECORDED } from '../settings'
import { firstCountableMonth, monthOf, type Index } from './patients'

export interface NewPatientMonth {
  month: string // yyyy-MM
  total: number
  bySource: Record<string, number>
}

export function newPatientsByMonth(idx: Index, settings: Settings, asOf: Date, months = 12): NewPatientMonth[] {
  const from = firstCountableMonth(idx, settings)
  const out: NewPatientMonth[] = []
  for (let i = months - 1; i >= 0; i--) {
    const month = format(subMonths(asOf, i), 'yyyy-MM')
    if (month < from) continue
    const bySource: Record<string, number> = Object.fromEntries([...settings.sources, NOT_RECORDED].map((s) => [s, 0]))
    out.push({ month, total: 0, bySource })
  }
  const byMonth = new Map(out.map((m) => [m.month, m]))
  for (const p of idx.patients.values()) {
    const m = p.firstVisit && byMonth.get(monthOf(p.firstVisit))
    if (!m || !p.isNew) continue
    m.total++
    m.bySource[p.source] = (m.bySource[p.source] ?? 0) + 1
  }
  return out
}

export interface SourceShift {
  source: string
  recent: number // last `recentDays`
  expected: number // same-length average over the previous `baselineDays`
  change: number // (recent - expected) / expected
}

/** Compares each source's last 60 days with its pace over the 6 months before. */
export function sourceShifts(idx: Index, settings: Settings, asOf: Date, recentDays = 60, baselineDays = 180): SourceShift[] {
  const asOfIso = format(asOf, 'yyyy-MM-dd')
  const recentFrom = format(addDays(asOf, -recentDays), 'yyyy-MM-dd')
  const baseFrom = format(addDays(asOf, -recentDays - baselineDays), 'yyyy-MM-dd')
  const countable = firstCountableMonth(idx, settings)
  const recent: Record<string, number> = {}
  const base: Record<string, number> = {}
  for (const p of idx.patients.values()) {
    const f = p.firstVisit
    if (!f || !p.isNew || monthOf(f) < countable || f > asOfIso) continue
    if (f > recentFrom) recent[p.source] = (recent[p.source] ?? 0) + 1
    else if (f > baseFrom) base[p.source] = (base[p.source] ?? 0) + 1
  }
  return settings.sources.map((source) => {
    const expected = ((base[source] ?? 0) * recentDays) / baselineDays
    const r = recent[source] ?? 0
    return { source, recent: r, expected, change: expected > 0 ? (r - expected) / expected : 0 }
  })
}

/** Share of new patients in a period whose source is known, and where it came from. */
export function sourceCoverage(idx: Index, asOf: Date, days = 90) {
  const from = format(addDays(asOf, -days), 'yyyy-MM-dd')
  const asOfIso = format(asOf, 'yyyy-MM-dd')
  let total = 0
  let column = 0
  let remark = 0
  for (const p of idx.patients.values()) {
    if (!p.isNew || !p.firstVisit || p.firstVisit <= from || p.firstVisit > asOfIso) continue
    total++
    if (p.sourceFrom === 'column') column++
    if (p.sourceFrom === 'remark') remark++
  }
  return { total, column, remark, known: column + remark, share: total ? (column + remark) / total : 0 }
}

/** What a new patient's first visit was for: a proxy for how they found the clinic. */
export function firstServiceMix(idx: Index, settings: Settings, asOf: Date, months = 12) {
  const from = format(subMonths(asOf, months), 'yyyy-MM-dd')
  const countable = firstCountableMonth(idx, settings)
  const mix: Record<string, number> = { OPD: 0, VACCINE: 0, AP: 0, OTHER: 0 }
  for (const p of idx.patients.values()) {
    const v = p.visits.find((x) => x.service !== 'AP')
    if (!v || !p.isNew || v.date <= from || monthOf(v.date) < countable || v.date > format(asOf, 'yyyy-MM-dd')) continue
    mix[v.service]++
  }
  return mix
}

export const monthLabel = (m: string) => format(parseISO(`${m}-01`), 'MMM yy')
