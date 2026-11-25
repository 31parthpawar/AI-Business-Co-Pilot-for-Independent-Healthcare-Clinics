// Synthetic data for a small pediatric clinic, written in the clinic's exact sheet layout
// (docs/prototype-spec.md). Fake names only. Deterministic for a given seed and end date.
//
// Planted patterns, so each feature has something to find:
// - Google-sourced new patients drop sharply in the last ~10 weeks
// - Regulars who stop coming in the last year
// - Children with recently overdue vaccine doses
// - AP members who never use it; renewals more likely when the membership was used
// - Monsoon peak (Jul to Sep); evenings busier than mornings; no Sunday evening session
// - AP sales running behind target in the current month
import { addDays, differenceInDays, format, getDay, getMonth, startOfDay, subMonths, isBefore } from 'date-fns'
import type { Row } from '../import/parse'
import type { Targets } from '../types'

export interface SampleTables {
  visitLog: Row[]
  apTable: Row[]
  vaccineTable: Row[]
  suggestedTargets: Targets
}

export const VISIT_HEADERS = ['DATE', 'Day', 'Mopd/Eopd', 'Name', 'Case No.', 'Service', 'Detail( visit/vac. name)', 'Amount', 'Mode', 'Remark', 'Source']
export const AP_HEADERS = ['Count', 'Case No.', 'Name', 'DOB', 'Age', 'Programe name', 'Buying', 'Amount', 'Payment mode', 'Joining date', 'Expiry Date', '', 'Year']
export const VACCINE_HEADERS = ['Case No.', 'Name', 'Vaccine', 'Given Date', 'Due Date']

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const FIRST = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan', 'Kabir', 'Rudra', 'Atharv', 'Dhruv', 'Shaurya', 'Advik', 'Ananya', 'Diya', 'Saanvi', 'Aadhya', 'Pari', 'Anika', 'Navya', 'Myra', 'Kiara', 'Sara', 'Ira', 'Riya', 'Aarohi', 'Prisha', 'Meher', 'Avni', 'Tara', 'Zoya', 'Inaya', 'Kavya', 'Nysa', 'Vanya', 'Arnav', 'Yash']
const LAST = ['Sharma', 'Verma', 'Gupta', 'Singh', 'Kumar', 'Agarwal', 'Jain', 'Malhotra', 'Kapoor', 'Mehta', 'Bansal', 'Chopra', 'Arora', 'Khanna', 'Sethi', 'Bhatia', 'Saxena', 'Tiwari', 'Mishra', 'Rastogi', 'Khan', 'Ahmed', 'Das', 'Nair']
const SOURCES = ['Word of mouth', 'Google', 'Doctor referral', 'Walk-in', 'Other']
const SOURCE_CODE: Record<string, string> = { 'Word of mouth': 'W', Google: 'G', 'Doctor referral': 'R', 'Walk-in': 'L', Other: 'O' }
const REFERRERS = ['Ref Dr. Mehta', 'Ref Dr. Kapoor', 'Ref Rainbow Hospital', 'Ref Dr. Arora (Gynae)']

// Generator-only schedule (the app never calculates schedules; it reads due dates).
const SCHEDULE: [number, string[]][] = [
  [0, ['BCG', 'OPV 0', 'Hep B 1']],
  [42, ['Hexa 1', 'PCV 1', 'Rota 1']],
  [70, ['Hexa 2', 'PCV 2', 'Rota 2']],
  [98, ['Hexa 3', 'PCV 3', 'Rota 3']],
  [183, ['Influenza 1']],
  [213, ['Influenza 2']],
  [274, ['MMR 1', 'Typhoid']],
  [365, ['Hep A 1']],
  [456, ['MMR 2', 'Varicella 1', 'PCV Booster']],
  [548, ['Hexa Booster', 'Hep A 2']],
  [1460, ['DTaP Booster', 'Varicella 2']],
]
const PRICE: Record<string, number> = { BCG: 300, OPV: 100, Hep: 900, Hexa: 2800, PCV: 3800, Rota: 1200, Influenza: 1800, MMR: 600, Typhoid: 1800, Varicella: 2200, DTaP: 2500 }
const priceOf = (v: string) => PRICE[v.split(' ')[0]] ?? 900

type Kind = 'opd' | 'followup' | 'vaccine' | 'apNew' | 'apRenew'
interface Ev {
  date: Date
  session: 'M' | 'E'
  kind: Kind
  vaccines?: string[]
  amount: number
}

export function generateSample(asOfInput: Date, seed = 42): SampleTables {
  const rnd = mulberry32(seed)
  const pick = <T,>(xs: T[]) => xs[Math.floor(rnd() * xs.length)]
  const between = (a: number, b: number) => a + Math.floor(rnd() * (b - a + 1))
  const expo = (mean: number) => -Math.log(1 - rnd()) * mean
  const poisson = (l: number) => {
    let k = 0
    let p = Math.exp(-l)
    let s = p
    const u = rnd()
    while (u > s) {
      k++
      p *= l / k
      s += p
    }
    return k
  }

  const asOf = startOfDay(asOfInput)
  // The data covers 36 months, but the clinic is older: patients are simulated from 3 years
  // earlier so the data starts with an established practice, as a real clinic's records would.
  const start = startOfDay(subMonths(asOf, 36))
  const simStart = startOfDay(subMonths(start, 36))
  const priceSwitch = new Date(asOf.getFullYear() - 1, 3, 1)
  const apPrice = (d: Date) => (isBefore(d, priceSwitch) ? 3500 : 4000)
  const opdFee = (d: Date) => (isBefore(d, priceSwitch) ? 500 : 600)
  const season = (d: Date) => [1.15, 1, 0.95, 0.85, 0.85, 0.95, 1.3, 1.4, 1.35, 1.15, 1, 1.1][getMonth(d)]
  const sessionFor = (d: Date): 'M' | 'E' => (getDay(d) === 0 ? 'M' : rnd() < 0.62 ? 'E' : 'M')
  const googleDropFrom = addDays(asOf, -72)
  const sourceColumnFrom = addDays(asOf, -365)

  const visitRows: { date: Date; session: 'M' | 'E'; order: number; row: Row }[] = []
  const apRows: Row[] = []
  const vaccineRows: Row[] = []
  let caseNo = 2001
  let order = 0

  for (let day = simStart; !isBefore(asOf, day); day = addDays(day, 1)) {
    const growth = 0.8 + 0.3 * (differenceInDays(day, simStart) / differenceInDays(asOf, simStart))
    const n = poisson(1.3 * season(day) * growth)
    for (let k = 0; k < n; k++) {
      const id = String(caseNo++)
      const name = `${pick(FIRST)} ${pick(LAST)}`
      const infant = rnd() < 0.45
      const dob = infant ? addDays(day, -between(0, 75)) : addDays(day, -between(400, 3600))
      const type = rnd() < 0.3 ? 'regular' : rnd() < 0.64 ? 'occasional' : 'oneoff'
      const lapses = type === 'regular' && rnd() < 0.22
      const end = lapses ? addDays(asOf, -between(110, 330)) : asOf

      // Source: Google share falls in the last ~10 weeks.
      const w = isBefore(day, googleDropFrom) ? [0.48, 0.24, 0.12, 0.1, 0.06] : [0.6, 0.06, 0.15, 0.12, 0.07]
      let r = rnd()
      let si = 0
      while (si < w.length - 1 && r > w[si]) r -= w[si++]
      const source = SOURCES[si]

      const evs: Ev[] = []
      // Vaccines (infants follow the schedule; some drop out, some recent doses are overdue).
      if (infant) {
        let dropped = false
        for (const [age, vs] of SCHEDULE) {
          const due = addDays(dob, age)
          if (isBefore(due, addDays(day, -10))) continue
          if (isBefore(addDays(asOf, 60), due)) break
          if (!dropped && rnd() < 0.015) dropped = true
          const given = addDays(due, between(0, 14))
          const recentlyDue = !isBefore(due, addDays(asOf, -75)) && isBefore(due, asOf)
          const skip = dropped || isBefore(end, given) || isBefore(asOf, given) || (recentlyDue && rnd() < 0.12)
          // The vaccine table holds doses due from the data start (older ones are history).
          if (!isBefore(due, start)) for (const v of vs) vaccineRows.push([id, name, v, skip ? '' : given, due])
          if (!skip) evs.push({ date: given, session: sessionFor(given), kind: 'vaccine', vaccines: vs, amount: 0 })
        }
      }
      // Illness visits.
      const mean = type === 'regular' ? 55 : type === 'occasional' ? 170 : 0
      const firstIsVaccine = evs.length > 0 && differenceInDays(evs[0].date, day) <= 3
      if (!firstIsVaccine) evs.push({ date: day, session: sessionFor(day), kind: 'opd', amount: 0 })
      if (mean) {
        let t = addDays(day, Math.round(expo(mean)))
        while (isBefore(t, end)) {
          // Sundays have one short session; most of those patients come on Monday instead.
          if (getDay(t) === 0 && rnd() < 0.7) t = addDays(t, 1)
          if (rnd() < season(t) / 1.4) {
            evs.push({ date: t, session: sessionFor(t), kind: 'opd', amount: 0 })
            if (rnd() < 0.3) {
              const f = addDays(t, between(3, 7))
              if (isBefore(f, asOf)) evs.push({ date: f, session: sessionFor(f), kind: 'followup', amount: 0 })
            }
          }
          t = addDays(t, Math.max(7, Math.round(expo(mean))))
        }
      }
      evs.sort((a, b) => a.date.getTime() - b.date.getTime())

      // Walk the timeline: AP purchases, renewals, member pricing.
      // Members are mostly families who come often; one-off patients never buy.
      const pBuy = type === 'regular' ? 0.045 : type === 'occasional' ? (infant ? 0.02 : 0.006) : 0
      type M = { join: Date; expiry: Date; unused: boolean; used: number }
      const st: { m: M | null } = { m: null }
      const cur = (): M | null => st.m
      const out: Ev[] = []
      const periods: M[] = []
      const addMembership = (d: Date, renew: boolean) => {
        const expiry = addDays(d, 364)
        st.m = { join: d, expiry, unused: !renew && rnd() < 0.07, used: 0 }
        periods.push(st.m)
        const amount = apPrice(d)
        out.push({ date: d, session: sessionFor(d), kind: renew ? 'apRenew' : 'apNew', amount })
        // The AP table keeps memberships still running at the data start and everything after.
        if (!isBefore(expiry, start)) apRows.push([null, id, name, dob, Math.floor(differenceInDays(d, dob) / 365), 'Annual Program', renew ? 'Renewal' : 'New', amount, rnd() < 0.6 ? 'Online' : 'Cash', d, expiry, '', d.getFullYear()])
      }
      const maybeRenew = (m: M, likelyUsed: number, likelyUnused: number) => {
        const rd = addDays(m.expiry, between(-10, 12))
        st.m = null
        if (rnd() < (m.used >= 4 ? likelyUsed : m.used >= 2 ? 0.5 : likelyUnused) && isBefore(rd, asOf) && isBefore(rd, end)) addMembership(rd, true)
      }
      for (const e of evs) {
        // Membership ended before this event: maybe a renewal happened.
        for (let m = cur(); m && isBefore(m.expiry, e.date); m = cur()) maybeRenew(m, 0.8, 0.22)
        if (cur()?.unused) continue
        if (!cur() && e.kind !== 'followup' && rnd() < pBuy && !isBefore(asOf, e.date)) addMembership(e.date, false)
        const m = cur()
        if (e.kind === 'opd') e.amount = m ? 0 : opdFee(e.date)
        if (e.kind === 'vaccine') e.amount = Math.round((e.vaccines ?? []).reduce((s, v) => s + priceOf(v), 0) * (m ? 0.9 : 1))
        if (m && e.kind !== 'followup') m.used++
        out.push(e)
      }
      // Membership expiring around now: renewal pending or already done.
      const last = cur()
      if (last && isBefore(last.expiry, addDays(asOf, 12))) maybeRenew(last, 0.7, 0.2)

      // Consultations are free for members, so they come in more often.
      for (const m of periods) {
        if (m.unused) continue
        const stop = [m.expiry, end, asOf].reduce((a, b) => (isBefore(a, b) ? a : b))
        const span = differenceInDays(stop, m.join)
        for (let x = poisson(Math.max(0, span) / 75); x > 0; x--) {
          const d = addDays(m.join, between(1, Math.max(1, span)))
          if (isBefore(asOf, d)) continue
          out.push({ date: d, session: sessionFor(d), kind: 'opd', amount: 0 })
        }
      }

      // Rows for the visit log.
      out.sort((a, b) => a.date.getTime() - b.date.getTime())
      out.forEach((e, idx) => {
        if (isBefore(asOf, e.date) || isBefore(e.date, start)) return
        const first = idx === 0
        let srcCell = ''
        let remark = ''
        if (first && !isBefore(day, sourceColumnFrom) && rnd() < 0.85) srcCell = rnd() < 0.4 ? SOURCE_CODE[source] : source
        if (first && source === 'Doctor referral' && rnd() < 0.5) remark = pick(REFERRERS)
        const service = e.kind === 'opd' || e.kind === 'followup' ? 'OPD' : e.kind === 'vaccine' ? 'Vaccine' : 'AP'
        const detail =
          e.kind === 'opd' ? (e.amount === 0 ? 'AP visit' : 'Visit') : e.kind === 'followup' ? 'Follow up' : e.kind === 'vaccine' ? (e.vaccines ?? []).join(', ') : e.kind === 'apNew' ? 'New AP' : 'Renewal'
        visitRows.push({
          date: e.date,
          session: e.session,
          order: order++,
          row: [e.date, format(e.date, 'EEE'), e.session === 'M' ? 'Mopd' : 'Eopd', name, id, service, detail, e.amount, e.amount > 0 ? (rnd() < 0.55 ? 'Online' : 'Cash') : '', remark, srcCell],
        })
      })
    }
  }

  visitRows.sort((a, b) => a.date.getTime() - b.date.getTime() || (a.session === b.session ? a.order - b.order : a.session === 'M' ? -1 : 1))
  apRows.sort((a, b) => (a[9] as Date).getTime() - (b[9] as Date).getTime())
  apRows.forEach((r, i) => (r[0] = i + 1))

  // Targets: around the last 12 full months' average; AP set higher so the month runs behind (planted).
  const from = subMonths(new Date(asOf.getFullYear(), asOf.getMonth(), 1), 12)
  const to = new Date(asOf.getFullYear(), asOf.getMonth(), 1)
  const inRange = visitRows.filter((v) => !isBefore(v.date, from) && isBefore(v.date, to)).map((v) => v.row)
  const sum = (f: (r: Row) => number) => inRange.reduce((s, r) => s + f(r), 0) / 12
  const round = (n: number, to: number) => Math.round(n / to) * to
  const suggestedTargets: Targets = {
    paidOpd: round(sum((r) => (r[5] === 'OPD' && (r[7] as number) > 0 ? 1 : 0)) * 0.95, 5),
    apSales: Math.max(5, Math.round(sum((r) => (r[5] === 'AP' ? 1 : 0)) * 1.25)),
    vaccinePatients: round(sum((r) => (r[5] === 'Vaccine' ? 1 : 0)) * 0.95, 5),
    opdRevenue: round(sum((r) => (r[5] === 'OPD' ? (r[7] as number) : 0)) * 0.95, 1000),
    apRevenue: round(sum((r) => (r[5] === 'AP' ? (r[7] as number) : 0)) * 1.25, 1000),
  }

  return {
    visitLog: [VISIT_HEADERS, ...visitRows.map((v) => v.row)],
    apTable: [['', 'ANNUAL PROGRAM'], AP_HEADERS, ...apRows],
    vaccineTable: [VACCINE_HEADERS, ...vaccineRows],
    suggestedTargets,
  }
}

