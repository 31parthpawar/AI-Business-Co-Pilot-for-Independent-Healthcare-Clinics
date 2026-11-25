// F4 retention, F5 target pacing, F6 load, and the headline numbers.
import { addDays, endOfMonth, format, getDay, parseISO, startOfMonth, subMonths } from 'date-fns'
import type { Dataset, Settings, Visit } from '../types'
import { activeMembership, firstCountableMonth, monthOf, type Index } from './patients'

const iso = (d: Date) => format(d, 'yyyy-MM-dd')

/** Sessions the clinic runs on a date: two a day, mornings only on Sunday. */
export const sessionsOn = (d: Date) => (getDay(d) === 0 ? 1 : 2)

export function sessionsBetween(from: Date, to: Date) {
  let n = 0
  for (let d = from; d <= to; d = addDays(d, 1)) n += sessionsOn(d)
  return n
}

// ---------- F4 retention ----------
export interface Cohort {
  month: string
  newPatients: number
  back3: number | null // share that returned within 90 days, null if too recent to tell
  back6: number | null
}

export function retentionCohorts(idx: Index, s: Settings, asOf: Date, months = 12): Cohort[] {
  const countable = firstCountableMonth(idx, s)
  const today = iso(asOf)
  const out: Cohort[] = []
  for (let i = months; i >= 1; i--) {
    const month = format(subMonths(asOf, i), 'yyyy-MM')
    if (month < countable) continue
    const ps = [...idx.patients.values()].filter((p) => p.isNew && p.firstVisit && monthOf(p.firstVisit) === month)
    const share = (windowDays: number) => {
      const end = iso(addDays(endOfMonth(parseISO(`${month}-01`)), windowDays))
      if (end > today) return null
      const back = ps.filter((p) => p.visits.some((v) => v.date > p.firstVisit && v.date <= iso(addDays(parseISO(p.firstVisit), windowDays))))
      return ps.length ? back.length / ps.length : null
    }
    out.push({ month, newPatients: ps.length, back3: share(90), back6: share(180) })
  }
  return out
}

// ---------- F5 target pacing ----------
export interface Pace {
  key: 'paidOpd' | 'apSales' | 'vaccinePatients' | 'opdRevenue' | 'apRevenue'
  label: string
  money: boolean
  actual: number
  target: number
  pctOfTarget: number
  projected: number
  projectedPct: number
  daysLeft: number
}

export function monthToDate(ds: Dataset, asOf: Date) {
  const from = iso(startOfMonth(asOf))
  const to = iso(asOf)
  return ds.visits.filter((v) => v.date >= from && v.date <= to)
}

export function pacing(ds: Dataset, s: Settings, asOf: Date): Pace[] {
  const mtd = monthToDate(ds, asOf)
  const done = sessionsBetween(startOfMonth(asOf), asOf)
  const total = sessionsBetween(startOfMonth(asOf), endOfMonth(asOf))
  const daysLeft = Math.max(0, endOfMonth(asOf).getDate() - asOf.getDate())
  const count = (f: (v: Visit) => boolean) => mtd.filter(f).length
  const sum = (f: (v: Visit) => boolean) => mtd.filter(f).reduce((a, v) => a + v.amount, 0)
  const items: [Pace['key'], string, boolean, number][] = [
    ['paidOpd', 'Paid consultations', false, count((v) => v.service === 'OPD' && v.amount > 0)],
    ['apSales', 'AP sales', false, count((v) => v.service === 'AP')],
    ['vaccinePatients', 'Vaccine visits', false, count((v) => v.service === 'VACCINE')],
    ['opdRevenue', 'Consultation revenue', true, sum((v) => v.service === 'OPD')],
    ['apRevenue', 'AP revenue', true, sum((v) => v.service === 'AP')],
  ]
  return items
    .filter(([key, , money]) => s.targets[key] > 0 && (!money || s.earningsOn))
    .map(([key, label, money, actual]) => {
      const target = s.targets[key]
      const projected = done ? Math.round((actual / done) * total) : 0
      return { key, label, money, actual, target, pctOfTarget: actual / target, projected, projectedPct: projected / target, daysLeft }
    })
}

// ---------- F6 load ----------
export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

/** Average patients per session, by weekday and session, over the last N months. */
export function sessionLoad(ds: Dataset, asOf: Date, months = 6) {
  const from = subMonths(asOf, months)
  const fromIso = iso(from)
  const today = iso(asOf)
  const visits = ds.visits.filter((v) => v.date > fromIso && v.date <= today && v.service !== 'AP')
  const counts: Record<string, number> = {}
  for (const v of visits) {
    const wd = (getDay(parseISO(v.date)) + 6) % 7
    counts[`${wd}${v.session}`] = (counts[`${wd}${v.session}`] ?? 0) + 1
  }
  const occurrences: Record<number, number> = {}
  for (let d = addDays(from, 1); d <= asOf; d = addDays(d, 1)) {
    const wd = (getDay(d) + 6) % 7
    occurrences[wd] = (occurrences[wd] ?? 0) + 1
  }
  return WEEKDAYS.map((day, wd) => ({
    day,
    M: occurrences[wd] ? (counts[`${wd}M`] ?? 0) / occurrences[wd] : 0,
    E: wd === 6 ? null : occurrences[wd] ? (counts[`${wd}E`] ?? 0) / occurrences[wd] : 0,
  }))
}

/** Patient visits per calendar month, one series per year (seasonality). */
export function visitsByMonthAndYear(ds: Dataset, asOf: Date) {
  const today = iso(asOf)
  const years = new Set<number>()
  const counts: Record<string, number> = {}
  for (const v of ds.visits) {
    if (v.date > today || v.service === 'AP') continue
    const y = +v.date.slice(0, 4)
    years.add(y)
    const k = `${y}-${v.date.slice(5, 7)}`
    counts[k] = (counts[k] ?? 0) + 1
  }
  const ys = [...years].sort().slice(-3)
  const rows = Array.from({ length: 12 }, (_, m) => {
    const row: Record<string, number | string | null> = { month: format(new Date(2000, m, 1), 'MMM') }
    for (const y of ys) {
      const k = `${y}-${String(m + 1).padStart(2, '0')}`
      // Leave months that haven't happened yet (or are partly done) empty rather than low.
      const monthEnd = iso(endOfMonth(new Date(y, m, 1)))
      row[String(y)] = monthEnd > today ? null : counts[k] ?? 0
    }
    return row
  })
  return { years: ys.map(String), rows }
}

// ---------- Headline numbers ----------
export function headline(ds: Dataset, idx: Index, s: Settings, asOf: Date) {
  const today = iso(asOf)
  const mtd = monthToDate(ds, asOf)
  // Same point last month, for a fair comparison.
  const lastFrom = iso(startOfMonth(subMonths(asOf, 1)))
  const lastTo = iso(subMonths(asOf, 1))
  const lastMtd = ds.visits.filter((v) => v.date >= lastFrom && v.date <= lastTo)
  const patientVisits = (vs: Visit[]) => vs.filter((v) => v.service !== 'AP').length
  const countable = firstCountableMonth(idx, s)
  const newIn = (from: string, to: string) =>
    [...idx.patients.values()].filter((p) => p.isNew && p.firstVisit >= from && p.firstVisit <= to && monthOf(p.firstVisit) >= countable).length
  const thisFrom = iso(startOfMonth(asOf))
  let activeAp = 0
  for (const p of idx.patients.values()) if (activeMembership(p, today)) activeAp++
  let activeApLastMonth = 0
  for (const p of idx.patients.values()) if (activeMembership(p, lastTo)) activeApLastMonth++
  return {
    visits: patientVisits(mtd),
    visitsLast: patientVisits(lastMtd),
    newPatients: newIn(thisFrom, today),
    newPatientsLast: newIn(lastFrom, lastTo),
    activeAp,
    activeApLastMonth,
    revenue: mtd.reduce((a, v) => a + v.amount, 0),
    revenueLast: lastMtd.reduce((a, v) => a + v.amount, 0),
  }
}
