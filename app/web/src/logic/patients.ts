import { addMonths, format, parseISO } from 'date-fns'
import type { Dataset, Membership, Settings, VaccineRecord, Visit } from '../types'
import { NOT_RECORDED } from '../settings'

export interface Patient {
  caseNo: string
  name: string
  visits: Visit[] // sorted by date
  memberships: Membership[] // sorted by join date
  vaccines: VaccineRecord[]
  firstVisit: string
  lastVisit: string
  /** Canonical source, or NOT_RECORDED. */
  source: string
  /** Where the source came from: the Source column, the Remark text, or nowhere. */
  sourceFrom: 'column' | 'remark' | 'none'
  /** A genuinely new patient, not an old one appearing for the first time in this data. */
  isNew: boolean
}

export interface Index {
  patients: Map<string, Patient>
  dataStart: string
  dataEnd: string
  /** Case numbers are numbers, so "new" can be told from the numbering (see buildIndex). */
  numericCases: boolean
}

const cmp = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0)

/** Maps free text to a canonical source. Single letters must be the whole value (register code). */
export function matchSource(text: string, settings: Settings): string | null {
  const s = text.toLowerCase().replace(/\s+/g, ' ').trim()
  if (!s) return null
  for (const src of settings.sources) if (s === src.toLowerCase()) return src
  for (const [src, words] of Object.entries(settings.sourceKeywords)) {
    for (const w of words) {
      if (w.length === 1 ? s === w : new RegExp(`(^|[^a-z])${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z]|$)`).test(s))
        return src
    }
  }
  return null
}

export function buildIndex(ds: Dataset, settings: Settings): Index {
  const patients = new Map<string, Patient>()
  const ensure = (caseNo: string, name: string) => {
    let p = patients.get(caseNo)
    if (!p) {
      p = { caseNo, name, visits: [], memberships: [], vaccines: [], firstVisit: '', lastVisit: '', source: NOT_RECORDED, sourceFrom: 'none', isNew: true }
      patients.set(caseNo, p)
    }
    if (!p.name && name) p.name = name
    return p
  }
  for (const v of ds.visits) ensure(v.caseNo, v.name).visits.push(v)
  for (const m of ds.memberships) ensure(m.caseNo, m.name).memberships.push(m)
  for (const r of ds.vaccines) ensure(r.caseNo, r.name).vaccines.push(r)

  let dataStart = ''
  let dataEnd = ''
  for (const p of patients.values()) {
    p.visits.sort((a, b) => cmp(a.date, b.date) || (a.session === b.session ? 0 : a.session === 'M' ? -1 : 1))
    p.memberships.sort((a, b) => cmp(a.joinDate, b.joinDate))
    p.firstVisit = p.visits[0]?.date ?? ''
    p.lastVisit = p.visits[p.visits.length - 1]?.date ?? ''
    if (p.firstVisit && (!dataStart || p.firstVisit < dataStart)) dataStart = p.firstVisit
    if (p.lastVisit && p.lastVisit > dataEnd) dataEnd = p.lastVisit
    // Source: the Source column on any visit first, then keywords in the first visit's remark.
    for (const v of p.visits) {
      const m = v.source && matchSource(v.source, settings)
      if (m) {
        p.source = m
        p.sourceFrom = 'column'
        break
      }
    }
    if (p.sourceFrom === 'none' && p.visits[0]?.remark) {
      const m = matchSource(p.visits[0].remark, settings)
      if (m) {
        p.source = m
        p.sourceFrom = 'remark'
      }
    }
  }
  // Telling new patients from old ones. When the data starts, every existing patient's first row
  // looks "new". Clinics issue case numbers in order, so a new patient's number is higher than any
  // number seen before their first visit; a returning old patient's is lower. (To confirm with the clinic.)
  const all = [...patients.values()].filter((p) => p.firstVisit)
  const numericCases = all.length > 0 && all.filter((p) => /^\d+$/.test(p.caseNo)).length / all.length > 0.9
  if (numericCases) {
    all.sort((a, b) => cmp(a.firstVisit, b.firstVisit))
    let maxBefore = 0
    let i = 0
    while (i < all.length) {
      const day = all[i].firstVisit
      let maxToday = maxBefore
      for (; i < all.length && all[i].firstVisit === day; i++) {
        const n = parseInt(all[i].caseNo, 10)
        all[i].isNew = Number.isFinite(n) && n > maxBefore
        if (n > maxToday) maxToday = n
      }
      maxBefore = maxToday
    }
  }
  return { patients, dataStart, dataEnd, numericCases }
}

/**
 * First month whose new patients can be trusted. With numbered case files, after the first month;
 * otherwise after a warm-up (everyone looks new at the start of the data).
 */
export function firstCountableMonth(idx: Index, settings: Settings): string {
  if (!idx.dataStart) return ''
  const months = idx.numericCases ? 1 : settings.thresholds.warmupMonths
  return format(addMonths(parseISO(idx.dataStart), months), 'yyyy-MM')
}

export const monthOf = (isoDate: string) => isoDate.slice(0, 7)

export function activeMembership(p: Patient, onDate: string): Membership | undefined {
  return p.memberships.find((m) => m.joinDate <= onDate && onDate <= m.expiryDate)
}
