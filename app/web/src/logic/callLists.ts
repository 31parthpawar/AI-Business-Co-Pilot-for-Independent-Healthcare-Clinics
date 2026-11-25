// F1 who to call today, and F2 cross-sell to AP. Every row says why the patient is on the list.
import { addDays, differenceInCalendarDays, format, parseISO, subMonths } from 'date-fns'
import type { CallList, Settings } from '../types'
import { activeMembership, type Index, type Patient } from './patients'

export interface CallRow {
  caseNo: string
  name: string
  list: CallList
  reason: string
  lastVisit: string
  /** Higher sorts first. */
  score: number
}

const iso = (d: Date) => format(d, 'yyyy-MM-dd')
const days = (a: string, b: string) => differenceInCalendarDays(parseISO(a), parseISO(b))
const fmt = (d: string) => format(parseISO(d), 'd MMM')
const spend = (p: Patient, from: string, to: string) =>
  p.visits.filter((v) => v.date > from && v.date <= to).reduce((s, v) => s + v.amount, 0)
const visitsBetween = (p: Patient, from: string, to: string) =>
  p.visits.filter((v) => v.date >= from && v.date <= to && v.service !== 'AP').length

/** a. AP renewals: expiring in the next N days, or expired in the last N and not renewed. Sorted by use. */
export function renewals(idx: Index, s: Settings, asOf: Date): CallRow[] {
  const today = iso(asOf)
  const w = s.thresholds.renewalWindowDays
  const lo = iso(addDays(asOf, -w))
  const hi = iso(addDays(asOf, w))
  const rows: CallRow[] = []
  for (const p of idx.patients.values()) {
    const m = p.memberships[p.memberships.length - 1]
    if (!m || m.expiryDate < lo || m.expiryDate > hi) continue
    const used = visitsBetween(p, m.joinDate, m.expiryDate < today ? m.expiryDate : today)
    const d = days(m.expiryDate, today)
    const when = d >= 0 ? `Expires ${fmt(m.expiryDate)} (in ${d} days)` : `Expired ${-d} days ago, not renewed`
    const use = used >= 4 ? `used ${used} times: easy renewal` : used === 0 ? 'never used: explain what they missed' : `used ${used} time${used === 1 ? '' : 's'}`
    rows.push({ caseNo: p.caseNo, name: p.name, list: 'renewals', reason: `${when}; ${use}`, lastVisit: p.lastVisit, score: used * 1000 - Math.abs(d) })
  }
  return rows.sort((a, b) => b.score - a.score)
}

/** b. Vaccines overdue: due date passed, not given, and no vaccine visit since. */
export function overdueVaccines(idx: Index, s: Settings, asOf: Date): CallRow[] {
  const today = iso(asOf)
  const oldest = iso(addDays(asOf, -s.thresholds.vaccineMaxOverdueDays))
  const rows: CallRow[] = []
  for (const p of idx.patients.values()) {
    const overdue = p.vaccines.filter((r) => !r.givenDate && r.dueDate && r.dueDate < today && r.dueDate >= oldest)
    if (!overdue.length) continue
    const earliest = overdue.reduce((a, b) => (a.dueDate < b.dueDate ? a : b)).dueDate
    if (p.visits.some((v) => v.service === 'VACCINE' && v.date >= earliest)) continue
    const late = days(today, earliest)
    const names = [...new Set(overdue.map((r) => r.vaccine))]
    rows.push({
      caseNo: p.caseNo,
      name: p.name,
      list: 'vaccines',
      reason: `${names.slice(0, 3).join(', ')}${names.length > 3 ? ` +${names.length - 3}` : ''} overdue by ${late} days`,
      lastVisit: p.lastVisit,
      score: late,
    })
  }
  return rows.sort((a, b) => b.score - a.score)
}

/** c. Lapsed regulars: 3+ visits, and away for more than 2x their usual gap. Sorted by past spend. */
export function lapsedRegulars(idx: Index, s: Settings, asOf: Date): CallRow[] {
  const t = s.thresholds
  const today = iso(asOf)
  const rows: CallRow[] = []
  for (const p of idx.patients.values()) {
    // Visits within 10 days of each other are one illness (visit plus follow-up).
    const dates: string[] = []
    for (const d of [...new Set(p.visits.filter((v) => v.service !== 'AP').map((v) => v.date))].sort())
      if (!dates.length || days(d, dates[dates.length - 1]) > 10) dates.push(d)
    if (dates.length < t.lapsedMinVisits) continue
    if (activeMembership(p, today)) continue // handled by "AP members not using it"
    // Must have been a regular recently: 2+ earlier episodes in the year before their last one.
    const lastEp = dates[dates.length - 1]
    if (dates.filter((d) => d < lastEp && days(lastEp, d) <= 365).length < 2) continue
    const gaps = dates.slice(1).map((d, i) => days(d, dates[i])).sort((a, b) => a - b)
    const usual = gaps[Math.floor(gaps.length / 2)]
    const away = days(today, dates[dates.length - 1])
    if (away < Math.max(t.lapsedMinDays, usual * t.lapsedGapMultiple) || away > t.lapsedMaxDays) continue
    const last = dates[dates.length - 1]
    const value = spend(p, iso(subMonths(parseISO(last), 12)), last)
    rows.push({
      caseNo: p.caseNo,
      name: p.name,
      list: 'lapsed',
      reason: `Usually every ${usual} days; not seen for ${away} days (${dates.length} illnesses, ₹${value.toLocaleString('en-IN')} in their last year)`,
      lastVisit: last,
      score: value,
    })
  }
  return rows.sort((a, b) => b.score - a.score)
}

/** d. AP members not using it: active, joined over a month ago, 0 or 1 visits in the last 6 months. */
export function unusedMemberships(idx: Index, s: Settings, asOf: Date): CallRow[] {
  const today = iso(asOf)
  const rows: CallRow[] = []
  for (const p of idx.patients.values()) {
    const m = activeMembership(p, today)
    if (!m || days(today, m.joinDate) < 30) continue
    if (days(m.expiryDate, today) <= s.thresholds.renewalWindowDays) continue // on the renewals list
    const from = [m.joinDate, iso(subMonths(asOf, s.thresholds.unusedApMonths))].sort()[1]
    const n = visitsBetween(p, from, today)
    if (n > s.thresholds.unusedApMaxVisits) continue
    const left = days(m.expiryDate, today)
    rows.push({
      caseNo: p.caseNo,
      name: p.name,
      list: 'unusedAp',
      reason: `${n === 0 ? 'No visits' : '1 visit'} since ${fmt(from)}; membership ends in ${left} days`,
      lastVisit: p.lastVisit,
      score: -left,
    })
  }
  return rows.sort((a, b) => b.score - a.score)
}

export interface CrossSellRow extends CallRow {
  consultFees: number
  vaccineSpend: number
  wouldSave: number
  apPrice: number
}

/** F2: non-members whose last 12 months of spend would have been covered by AP. */
export function crossSell(idx: Index, s: Settings, asOf: Date): CrossSellRow[] {
  const today = iso(asOf)
  const from = iso(subMonths(asOf, 12))
  const latest = [...idx.patients.values()].flatMap((p) => p.memberships).sort((a, b) => (a.joinDate < b.joinDate ? 1 : -1))[0]
  const apPrice = latest?.amount ?? 0
  if (!apPrice) return []
  const rows: CrossSellRow[] = []
  for (const p of idx.patients.values()) {
    if (activeMembership(p, today)) continue
    const recent = p.visits.filter((v) => v.date > from && v.date <= today)
    const consultFees = recent.filter((v) => v.service === 'OPD').reduce((a, v) => a + v.amount, 0)
    const vaccineSpend = recent.filter((v) => v.service === 'VACCINE').reduce((a, v) => a + v.amount, 0)
    const wouldSave = Math.round(consultFees + vaccineSpend * s.apVaccineDiscount)
    if (wouldSave < apPrice) continue
    const paidVisits = recent.filter((v) => v.service === 'OPD' && v.amount > 0).length
    rows.push({
      caseNo: p.caseNo,
      name: p.name,
      list: 'crossSell',
      reason: `${paidVisits} paid consultations (₹${consultFees.toLocaleString('en-IN')}) in 12 months; would have saved ₹${wouldSave.toLocaleString('en-IN')} vs AP at ₹${apPrice.toLocaleString('en-IN')}`,
      lastVisit: p.lastVisit,
      score: wouldSave,
      consultFees,
      vaccineSpend,
      wouldSave,
      apPrice,
    })
  }
  return rows.sort((a, b) => b.score - a.score)
}

export function allCallLists(idx: Index, s: Settings, asOf: Date) {
  return {
    renewals: renewals(idx, s, asOf),
    vaccines: overdueVaccines(idx, s, asOf),
    lapsed: lapsedRegulars(idx, s, asOf),
    unusedAp: unusedMemberships(idx, s, asOf),
    crossSell: crossSell(idx, s, asOf),
  }
}
export type CallLists = ReturnType<typeof allCallLists>
