// The dashboard: what needs attention, how the month is going, who to call, and where patients come from.
import { format } from 'date-fns'
import { useMemo } from 'react'
import { LoadHeatmap, NewPatientsChart, RetentionChart, SeasonalityChart, SourceShifts } from '../charts'
import type { CallLists } from '../logic/callLists'
import { headline, pacing, retentionCohorts, sessionLoad, visitsByMonthAndYear } from '../logic/metrics'
import { firstServiceMix, newPatientsByMonth, sourceCoverage, sourceShifts } from '../logic/newPatients'
import { useApp } from '../store'
import { Card, compactInr, Icon, inr, PaceMeter, pct, StatTile, ToneMark } from '../ui'
import type { Nav } from '../App'

export const LIST_LABELS: Record<keyof CallLists, { title: string; short: string; why: string }> = {
  renewals: { title: 'AP renewals', short: 'Renewals', why: 'Expiring soon or just lapsed, ranked by how much they used it' },
  vaccines: { title: 'Vaccines overdue', short: 'Vaccines', why: 'Due date passed, no vaccine visit since' },
  lapsed: { title: 'Regulars who stopped coming', short: 'Lapsed', why: 'Away for more than twice their usual gap' },
  unusedAp: { title: 'AP members not using it', short: 'Unused AP', why: '0 or 1 visits in 6 months' },
  crossSell: { title: 'Offer the annual program', short: 'Offer AP', why: 'Non-members who would have saved by joining' },
}

export function Dashboard({ nav }: { nav: Nav }) {
  const { dataset, settings, derived } = useApp()
  const d = derived!
  const ds = dataset!
  const { asOf, idx, lists } = d

  const m = useMemo(
    () => ({
      head: headline(ds, idx, settings, asOf),
      pace: pacing(ds, settings, asOf),
      np: newPatientsByMonth(idx, settings, asOf),
      shifts: sourceShifts(idx, settings, asOf),
      coverage: sourceCoverage(idx, asOf),
      firstService: firstServiceMix(idx, settings, asOf),
      cohorts: retentionCohorts(idx, settings, asOf),
      load: sessionLoad(ds, asOf),
      season: visitsByMonthAndYear(ds, asOf),
    }),
    [ds, idx, settings, asOf],
  )
  const h = m.head
  const delta = (a: number, b: number) => (b ? (a - b) / b : undefined)
  const fsTotal = Object.values(m.firstService).reduce((a, b) => a + b, 0)
  const partialMonth = format(asOf, 'yyyy-MM')

  return (
    <div className="space-y-4">
      {/* Needs attention */}
      <Card title="Needs attention" subtitle={`As of ${format(asOf, 'EEEE, d MMMM yyyy')}`}>
        {d.insights.length === 0 ? (
          <p className="text-[14px] text-ink-2">Nothing unusual right now.</p>
        ) : (
          <ul className="divide-y divide-line">
            {d.insights.slice(0, 5).map((i) => (
              <li key={i.id}>
                <button
                  className="flex w-full items-start gap-3 py-3 text-left first:pt-0"
                  onClick={() => (i.link?.tab === 'calls' ? nav({ tab: 'calls', list: i.link.list }) : i.link?.tab === 'data' ? nav({ tab: 'data' }) : document.getElementById(i.id.startsWith('retention') ? 'retention' : 'new-patients')?.scrollIntoView({ behavior: 'smooth' }))}
                >
                  <ToneMark tone={i.tone} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-medium text-ink">{i.title}</span>
                    <span className="mt-0.5 block text-[13px] text-ink-2">{i.detail}</span>
                  </span>
                  {i.link && <Icon name="chevron" className="mt-1 h-4 w-4 shrink-0 text-muted" />}
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Headline numbers */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Patient visits this month" value={h.visits.toLocaleString('en-IN')} delta={delta(h.visits, h.visitsLast)} deltaLabel="vs last month" />
        <StatTile label="New patients this month" value={String(h.newPatients)} delta={delta(h.newPatients, h.newPatientsLast)} deltaLabel="vs last month" />
        <StatTile label="Active AP members" value={String(h.activeAp)} delta={delta(h.activeAp, h.activeApLastMonth)} deltaLabel="vs last month" />
        {settings.earningsOn ? (
          <StatTile label="Collected this month" value={compactInr(h.revenue)} delta={delta(h.revenue, h.revenueLast)} deltaLabel="vs last month" />
        ) : (
          <StatTile label="Calls waiting" value={String(lists.renewals.length + lists.vaccines.length)} hint="Renewals and overdue vaccines" />
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Target pacing */}
        <Card title="This month against target" subtitle="Bar: done so far. Tick: where the month ends at this pace.">
          {m.pace.length === 0 ? (
            <p className="text-[14px] text-ink-2">
              No targets set. <button className="text-accent-ink underline" onClick={() => nav({ tab: 'data' })}>Add monthly targets</button>
            </p>
          ) : (
            <div className="space-y-5">
              {m.pace.map((p) => (
                <PaceMeter key={p.key} label={p.label} actual={p.actual} target={p.target} projected={p.projected} display={p.money ? compactInr : (n) => n.toLocaleString('en-IN')} />
              ))}
            </div>
          )}
        </Card>

        {/* Who to call */}
        <Card title="Who to call" subtitle="Tap a list. Each patient comes with the reason.">
          <div className="grid grid-cols-1 gap-2">
            {(Object.keys(LIST_LABELS) as (keyof CallLists)[]).map((k) => (
              <button key={k} onClick={() => nav({ tab: 'calls', list: k })} className="flex items-center justify-between gap-3 rounded-xl bg-surface-2 px-3 py-2.5 text-left">
                <span className="min-w-0">
                  <span className="block text-[14px] font-medium text-ink">{LIST_LABELS[k].title}</span>
                  <span className="block truncate text-[12px] text-ink-2">{LIST_LABELS[k].why}</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="tabular text-[18px] font-semibold text-ink">{lists[k].length}</span>
                  <Icon name="chevron" className="h-4 w-4 text-muted" />
                </span>
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* New patients */}
      <div id="new-patients" className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Card title="New patients by source" subtitle="From the Source column, or the remark when the column is blank">
          <NewPatientsChart data={m.np} sources={settings.sources} partialMonth={partialMonth} />
        </Card>
        <Card title="What changed" subtitle="Last 60 days against the usual pace">
          <SourceShifts shifts={m.shifts} sources={settings.sources} />
          <div className="mt-4 rounded-xl bg-surface-2 p-3 text-[13px] text-ink-2">
            <div className="font-medium text-ink">Source known for {pct(m.coverage.share)} of new patients</div>
            Last 90 days: {m.coverage.column} from the Source column, {m.coverage.remark} from remarks, {m.coverage.total - m.coverage.known} unknown.
          </div>
          {fsTotal > 0 && (
            <div className="mt-3 text-[13px] text-ink-2">
              <span className="font-medium text-ink">First visit was for: </span>
              illness {pct(m.firstService.OPD / fsTotal)}, vaccines {pct(m.firstService.VACCINE / fsTotal)}
              {m.firstService.AP ? `, AP ${pct(m.firstService.AP / fsTotal)}` : ''} (last 12 months)
            </div>
          )}
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card id="retention" title="Do new patients come back?" subtitle="Share of each month's new patients who visited again">
          <RetentionChart cohorts={m.cohorts} />
        </Card>
        <Card title="Busy months" subtitle="Patient visits per month, by year">
          <SeasonalityChart years={m.season.years} rows={m.season.rows} />
        </Card>
      </div>

      <Card title="Busy sessions" subtitle="Morning and evening OPD by weekday">
        <LoadHeatmap data={m.load} />
      </Card>

      <p className="pb-2 text-center text-[12px] text-muted">
        {ds.kind === 'sample' ? 'Sample data: a made-up pediatric clinic. ' : ''}
        {idx.patients.size.toLocaleString('en-IN')} patients, {ds.visits.length.toLocaleString('en-IN')} visits. {settings.earningsOn ? `Collected this month: ${inr(h.revenue)}.` : 'Earnings are off (Settings).'}
      </p>
    </div>
  )
}
