// Rule-based "needs attention" lines for the dashboard. Each names a number and points to an action.
// Suggestions were the most wanted feature in the survey (65%); these stay tied to the clinic's own data.
import type { Dataset, Settings } from '../types'
import type { CallLists } from './callLists'
import { pacing, retentionCohorts } from './metrics'
import { sourceCoverage, sourceShifts } from './newPatients'
import type { Index } from './patients'

export type Tone = 'critical' | 'warning' | 'info' | 'good'
export interface Insight {
  id: string
  tone: Tone
  title: string
  detail: string
  /** Where the action lives. */
  link?: { tab: 'calls' | 'insights' | 'data'; list?: keyof CallLists }
  priority: number
}

const pct = (x: number) => `${Math.round(x * 100)}%`

export function insights(ds: Dataset, idx: Index, s: Settings, asOf: Date, lists: CallLists): Insight[] {
  const out: Insight[] = []

  for (const sh of sourceShifts(idx, s, asOf)) {
    // Flag only changes bigger than normal week-to-week noise (about 2 standard deviations, Poisson).
    const noise = 2 * Math.sqrt(sh.expected)
    if (sh.expected >= 5 && sh.change <= -0.4 && sh.recent <= sh.expected - noise) {
      out.push({
        id: `source-${sh.source}`,
        tone: 'critical',
        title: `New patients from ${sh.source} are down ${pct(-sh.change)}`,
        detail: `${sh.recent} in the last 60 days, against about ${Math.round(sh.expected)} usually.${sh.source === 'Google' ? ' Check that the Google Business profile is up to date: timings, phone, photos.' : ''}`,
        link: { tab: 'insights' },
        priority: 100 + Math.round(-sh.change * 10),
      })
    } else if (sh.expected >= 5 && sh.change >= 0.5 && sh.recent >= sh.expected + noise) {
      out.push({
        id: `source-up-${sh.source}`,
        tone: 'good',
        title: `More new patients from ${sh.source} (+${pct(sh.change)})`,
        detail: `${sh.recent} in the last 60 days, against about ${Math.round(sh.expected)} usually.`,
        link: { tab: 'insights' },
        priority: 40,
      })
    }
  }

  for (const p of pacing(ds, s, asOf)) {
    if (p.daysLeft > 0 && p.projectedPct < 0.85) {
      out.push({
        id: `pace-${p.key}`,
        tone: p.projectedPct < 0.6 ? 'critical' : 'warning',
        title: `${p.label} at ${pct(p.pctOfTarget)} of target`,
        detail: `${p.daysLeft} days left. At this pace the month ends at ${pct(p.projectedPct)}.${p.key === 'apSales' && lists.crossSell.length ? ` ${lists.crossSell.length} non-members would save by joining.` : ''}`,
        link: p.key === 'apSales' ? { tab: 'calls', list: 'crossSell' } : undefined,
        priority: 90 - Math.round(p.projectedPct * 20),
      })
    }
  }

  if (lists.renewals.length)
    out.push({
      id: 'renewals',
      tone: 'warning',
      title: `${lists.renewals.length} AP memberships to renew`,
      detail: `Expiring in the next ${s.thresholds.renewalWindowDays} days or recently lapsed. ${lists.renewals.filter((r) => r.reason.includes('easy renewal')).length} used it a lot.`,
      link: { tab: 'calls', list: 'renewals' },
      priority: 80,
    })
  if (lists.vaccines.length)
    out.push({
      id: 'vaccines',
      tone: 'warning',
      title: `${lists.vaccines.length} children have overdue vaccines`,
      detail: 'Due date passed with no vaccine visit since.',
      link: { tab: 'calls', list: 'vaccines' },
      priority: 75,
    })

  const cov = sourceCoverage(idx, asOf)
  if (cov.total >= 10 && cov.share < 0.7)
    out.push({
      id: 'coverage',
      tone: 'info',
      title: `Source unknown for ${pct(1 - cov.share)} of new patients`,
      detail: `${cov.total - cov.known} of ${cov.total} in the last 90 days. A one-letter code in the Source column (G, W, R, L, O) is enough.`,
      link: { tab: 'data' },
      priority: 60,
    })

  const cohorts = retentionCohorts(idx, s, asOf).filter((c) => c.back3 !== null && c.newPatients >= 10)
  if (cohorts.length >= 4) {
    const last = cohorts[cohorts.length - 1]
    const prev = cohorts.slice(-7, -1)
    const avg = prev.reduce((a, c) => a + (c.back3 ?? 0), 0) / prev.length
    if (last.back3 !== null && avg - last.back3 > 0.1)
      out.push({
        id: 'retention',
        tone: 'warning',
        title: `Fewer new patients coming back`,
        detail: `${pct(last.back3)} of new patients from ${last.month} returned within 3 months, against ${pct(avg)} usually.`,
        link: { tab: 'insights' },
        priority: 70,
      })
  }

  return out.sort((a, b) => b.priority - a.priority)
}
