// Samples for AI features that aren't live yet ("Ask about your clinic", the plain-language weekly summary).
// Written from the clinic's real numbers by fixed rules, to show what the AI version would say.
import { addDays, format, parseISO, subMonths } from 'date-fns'
import type { Dataset, Settings } from '../types'
import type { CallLists } from './callLists'
import type { Insight } from './insights'
import { headline, visitsByMonthAndYear } from './metrics'
import { sourceShifts } from './newPatients'
import type { Index } from './patients'

const pct = (x: number) => `${Math.round(x * 100)}%`

export function askSamples(ds: Dataset, idx: Index, s: Settings, asOf: Date): { q: string; a: string }[] {
  const out: { q: string; a: string }[] = []
  const h = headline(ds, idx, s, asOf)
  const shifts = sourceShifts(idx, s, asOf)
  const worst = [...shifts].sort((a, b) => a.recent - a.expected - (b.recent - b.expected))[0]
  const best = [...shifts].sort((a, b) => b.recent - b.expected - (a.recent - a.expected))[0]
  const change = h.newPatientsLast ? (h.newPatients - h.newPatientsLast) / h.newPatientsLast : 0
  out.push({
    q: change < 0 ? 'Why are new patients down this month?' : 'How are new patients doing this month?',
    a:
      `${h.newPatients} new patients so far this month, against ${h.newPatientsLast} at the same point last month (${change >= 0 ? '+' : ''}${pct(change)}). ` +
      (worst && worst.expected > 3 && worst.recent < worst.expected * 0.7
        ? `Most of the change is ${worst.source}: ${worst.recent} in the last 60 days, against about ${Math.round(worst.expected)} usually. `
        : '') +
      (best && best.recent > best.expected * 1.2 ? `${best.source} is up (${best.recent} against about ${Math.round(best.expected)}). ` : '') +
      (worst?.source === 'Google' ? 'Worth checking the Google Business profile: timings, phone number and photos.' : ''),
  })

  const season = visitsByMonthAndYear(ds, asOf)
  const lastYear = String(asOf.getFullYear() - 1)
  if (season.years.includes(lastYear)) {
    const rows = season.rows.map((r) => ({ m: String(r.month), v: r[lastYear] as number | null })).filter((r) => r.v != null) as { m: string; v: number }[]
    const top = [...rows].sort((a, b) => b.v - a.v)[0]
    const low = [...rows].sort((a, b) => a.v - b.v)[0]
    if (top && low)
      out.push({
        q: `Which months were busiest in ${lastYear}?`,
        a: `${top.m} was the busiest with ${top.v.toLocaleString('en-IN')} patient visits, and ${low.m} the quietest with ${low.v.toLocaleString('en-IN')}. ${top.m} had ${pct(top.v / low.v - 1)} more visits than ${low.m}, so plan staff and vaccine stock a month ahead.`,
      })
  }

  // Renewal rate: memberships that ended in the last 12 months, and how many renewed.
  const from = format(subMonths(asOf, 12), 'yyyy-MM-dd')
  let ended = 0
  let renewed = 0
  let usedRenewed = 0
  let usedEnded = 0
  for (const p of idx.patients.values()) {
    p.memberships.forEach((m, i) => {
      if (m.expiryDate < from || m.expiryDate >= format(addDays(asOf, -15), 'yyyy-MM-dd')) return
      ended++
      const used = p.visits.filter((v) => v.date >= m.joinDate && v.date <= m.expiryDate && v.service !== 'AP').length >= 4
      if (used) usedEnded++
      if (i < p.memberships.length - 1) {
        renewed++
        if (used) usedRenewed++
      }
    })
  }
  if (ended >= 10)
    out.push({
      q: 'How many AP members renew?',
      a: `In the last 12 months ${ended} memberships ended and ${renewed} renewed (${pct(renewed / ended)}). Members who came in 4 or more times renewed ${pct(usedEnded ? usedRenewed / usedEnded : 0)} of the time; the others ${pct(ended - usedEnded ? (renewed - usedRenewed) / (ended - usedEnded) : 0)}. Calling members who haven't used it yet is likely to help renewals.`,
    })
  return out
}

export function weeklySummarySample(ds: Dataset, idx: Index, s: Settings, asOf: Date, lists: CallLists, insights: Insight[]): string {
  const iso = (d: Date) => format(d, 'yyyy-MM-dd')
  const end = iso(asOf)
  const start = iso(addDays(asOf, -6))
  const prevStart = iso(addDays(asOf, -13))
  const prevEnd = iso(addDays(asOf, -7))
  const visits = (a: string, b: string) => ds.visits.filter((v) => v.date >= a && v.date <= b && v.service !== 'AP').length
  const thisWeek = visits(start, end)
  const lastWeek = visits(prevStart, prevEnd)
  const newThisWeek = [...idx.patients.values()].filter((p) => p.isNew && p.firstVisit >= start && p.firstVisit <= end)
  const bySource = new Map<string, number>()
  for (const p of newThisWeek) bySource.set(p.source, (bySource.get(p.source) ?? 0) + 1)
  const topSource = [...bySource.entries()].sort((a, b) => b[1] - a[1])[0]
  const change = lastWeek ? (thisWeek - lastWeek) / lastWeek : 0
  const lines = [
    `Good morning, Doctor. Your week at ${s.clinicName} (${format(parseISO(start), 'd MMM')} to ${format(asOf, 'd MMM')}):`,
    '',
    `• ${thisWeek} patient visits, ${change >= 0 ? 'up' : 'down'} ${pct(Math.abs(change))} on the week before.`,
    `• ${newThisWeek.length} new patients${topSource ? `, most through ${topSource[0].toLowerCase()} (${topSource[1]})` : ''}.`,
    ...insights.slice(0, 2).map((i) => `• ${i.title}. ${i.detail}`),
    '',
    `This week's calls: ${lists.renewals.length} AP renewals and ${lists.vaccines.length} overdue vaccines. The top 10 of each are on the Calls screen.`,
    '',
    'Reply with any question about your clinic.',
  ]
  return lines.join('\n')
}
