// Charts. Thin marks, recessive axes, legend for 2+ series, hover tooltips, and a numbers table under each.
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipContentProps, type TooltipValueType } from 'recharts'

type TipProps = TooltipContentProps<TooltipValueType, string | number>
import type { NewPatientMonth, SourceShift } from './logic/newPatients'
import { monthLabel } from './logic/newPatients'
import type { Cohort } from './logic/metrics'
import { NOT_RECORDED } from './settings'
import { Icon, NumbersTable, pct, useTokens } from './ui'

const TOKENS = ['s1', 's2', 's3', 's4', 's5', 's-none', 'grid', 'axis', 'muted', 'surface', 'ink', 'ink-2', 'accent'] as const
const SERIES = ['s1', 's2', 's3', 's4', 's5'] as const

function Legend({ items }: { items: { label: string; color: string; dashed?: boolean }[] }) {
  return (
    <div className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-ink-2">
      {items.map((i) => (
        <span key={i.label} className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-[3px]" style={{ background: i.color }} />
          {i.label}
        </span>
      ))}
    </div>
  )
}

function TipBox({ title, rows, footer }: { title: string; rows: { label: string; value: string; color?: string }[]; footer?: string }) {
  return (
    <div className="min-w-[150px] rounded-lg border border-[var(--border)] bg-surface px-3 py-2 text-[12px] shadow-lg">
      <div className="mb-1 font-medium text-ink">{title}</div>
      {rows.map((r) => (
        <div key={r.label} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-ink-2">
            {r.color && <span className="inline-block h-2 w-2 rounded-sm" style={{ background: r.color }} />}
            {r.label}
          </span>
          <span className="tabular text-ink">{r.value}</span>
        </div>
      ))}
      {footer && <div className="mt-1 border-t border-line pt-1 text-ink-2">{footer}</div>}
    </div>
  )
}

const axisProps = (t: Record<string, string>) => ({
  tick: { fill: t.muted, fontSize: 11 },
  axisLine: { stroke: t.axis },
  tickLine: false,
})

// ---------- New patients by source ----------
export function NewPatientsChart({ data, sources, partialMonth }: { data: NewPatientMonth[]; sources: string[]; partialMonth: string }) {
  const t = useTokens(TOKENS)
  const keys = [...sources, NOT_RECORDED]
  const color = (k: string) => (k === NOT_RECORDED ? t['s-none'] : t[SERIES[sources.indexOf(k) % SERIES.length]])
  const rows = data.map((m) => ({ label: monthLabel(m.month) + (m.month === partialMonth ? '*' : ''), ...m.bySource, total: m.total }))
  return (
    <div>
      <Legend items={keys.map((k) => ({ label: k, color: color(k) }))} />
      <div className="h-56 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} margin={{ top: 8, right: 4, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke={t.grid} />
            <XAxis dataKey="label" {...axisProps(t)} interval="preserveStartEnd" minTickGap={8} />
            <YAxis {...axisProps(t)} axisLine={false} allowDecimals={false} width={40} />
            <Tooltip
              cursor={{ fill: t.grid, opacity: 0.5 }}
              content={(p: TipProps) =>
                p.active && p.payload?.length ? (
                  <TipBox
                    title={String(p.label)}
                    rows={[...p.payload].reverse().filter((x) => (x.value as number) > 0).map((x) => ({ label: String(x.name), value: String(x.value), color: color(String(x.name)) }))}
                    footer={`Total ${p.payload[0].payload.total}`}
                  />
                ) : null
              }
            />
            {keys.map((k, i) => (
              <Bar key={k} dataKey={k} stackId="a" fill={color(k)} stroke={t.surface} strokeWidth={1.5} maxBarSize={24} radius={i === keys.length - 1 ? [4, 4, 0, 0] : 0} isAnimationActive={false} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-1 text-[12px] text-muted">* this month so far</p>
      <NumbersTable head={['Month', ...keys, 'Total']} rows={data.map((m) => [monthLabel(m.month), ...keys.map((k) => m.bySource[k] ?? 0), m.total])} />
    </div>
  )
}

// ---------- Source shifts: last 60 days vs usual ----------
export function SourceShifts({ shifts, sources }: { shifts: SourceShift[]; sources: string[] }) {
  const t = useTokens(TOKENS)
  const max = Math.max(1, ...shifts.flatMap((s) => [s.recent, s.expected]))
  return (
    <div className="space-y-3">
      {shifts.map((s) => {
        const noise = 2 * Math.sqrt(s.expected)
        const flagged = s.expected >= 5 && Math.abs(s.recent - s.expected) >= noise && Math.abs(s.change) >= 0.4
        const color = t[SERIES[sources.indexOf(s.source) % SERIES.length]]
        return (
          <div key={s.source}>
            <div className="flex items-center justify-between text-[13px]">
              <span className="flex items-center gap-1.5 text-ink">
                <span className="inline-block h-2.5 w-2.5 rounded-[3px]" style={{ background: color }} />
                {s.source}
              </span>
              <span className={`tabular flex items-center gap-1 ${flagged ? (s.change < 0 ? 'font-medium text-critical-ink' : 'font-medium text-good-ink') : 'text-ink-2'}`}>
                {flagged && <Icon name={s.change < 0 ? 'down' : 'up'} className="h-3.5 w-3.5" />}
                {s.recent} <span className="text-muted">vs ~{Math.round(s.expected)} usual</span>
              </span>
            </div>
            {/* Bar = last 60 days; tick = usual pace. */}
            <div className="relative mt-1.5 h-2 rounded-full bg-surface-2">
              <div className="h-full rounded-full" style={{ width: `${(s.recent / max) * 100}%`, background: color }} />
              <div className="absolute -top-1 h-4 w-[2px] rounded bg-ink" style={{ left: `calc(${(s.expected / max) * 100}% - 1px)` }} />
            </div>
          </div>
        )
      })}
      <p className="text-[12px] text-muted">Bar: new patients in the last 60 days. Tick: the usual pace over the 6 months before. Flagged only when the change is bigger than normal ups and downs.</p>
    </div>
  )
}

// ---------- Seasonality: visits per month, one line per year ----------
export function SeasonalityChart({ years, rows }: { years: string[]; rows: Record<string, number | string | null>[] }) {
  const t = useTokens(TOKENS)
  // Older years recede; the current year carries the accent.
  const colors = years.map((_, i) => (i === years.length - 1 ? t.s1 : i === years.length - 2 ? t.s2 : t['s-none']))
  return (
    <div>
      <Legend items={years.map((y, i) => ({ label: y, color: colors[i] }))} />
      <div className="h-56 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke={t.grid} />
            <XAxis dataKey="month" {...axisProps(t)} interval="preserveStartEnd" minTickGap={6} />
            <YAxis {...axisProps(t)} axisLine={false} width={40} allowDecimals={false} />
            <Tooltip
              cursor={{ stroke: t.axis }}
              content={(p: TipProps) =>
                p.active && p.payload?.length ? (
                  <TipBox title={String(p.label)} rows={p.payload.filter((x) => x.value != null).map((x) => ({ label: String(x.name), value: String(x.value), color: colors[years.indexOf(String(x.name))] }))} />
                ) : null
              }
            />
            {years.map((y, i) => (
              <Line key={y} dataKey={y} stroke={colors[i]} strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: t.surface }} connectNulls={false} isAnimationActive={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <NumbersTable head={['Month', ...years]} rows={rows.map((r) => [String(r.month), ...years.map((y) => (r[y] == null ? '' : String(r[y])))])} />
    </div>
  )
}

// ---------- Retention ----------
export function RetentionChart({ cohorts }: { cohorts: Cohort[] }) {
  const t = useTokens(TOKENS)
  const rows = cohorts.map((c) => ({ label: monthLabel(c.month), '3 months': c.back3 == null ? null : Math.round(c.back3 * 100), '6 months': c.back6 == null ? null : Math.round(c.back6 * 100), n: c.newPatients }))
  const series = [
    { key: '3 months', color: t.s1 },
    { key: '6 months', color: t.s2 },
  ]
  return (
    <div>
      <Legend items={series.map((s) => ({ label: `Came back within ${s.key}`, color: s.color }))} />
      <div className="h-52 sm:h-60">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke={t.grid} />
            <XAxis dataKey="label" {...axisProps(t)} interval="preserveStartEnd" minTickGap={8} />
            <YAxis {...axisProps(t)} axisLine={false} width={40} domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={(v) => `${v}%`} />
            <Tooltip
              cursor={{ stroke: t.axis }}
              content={(p: TipProps) =>
                p.active && p.payload?.length ? (
                  <TipBox
                    title={`New in ${p.label}`}
                    rows={p.payload.filter((x) => x.value != null).map((x) => ({ label: `Back within ${x.name}`, value: `${x.value}%`, color: series.find((s) => s.key === x.name)?.color }))}
                    footer={`${p.payload[0].payload.n} new patients`}
                  />
                ) : null
              }
            />
            {series.map((s) => (
              <Line key={s.key} dataKey={s.key} stroke={s.color} strokeWidth={2} dot={{ r: 3, fill: s.color, stroke: t.surface, strokeWidth: 2 }} activeDot={{ r: 5, stroke: t.surface, strokeWidth: 2 }} connectNulls={false} isAnimationActive={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-1 text-[12px] text-muted">Recent months fill in once enough time has passed to tell.</p>
      <NumbersTable head={['First visit', 'New patients', 'Back in 3 months', 'Back in 6 months']} rows={cohorts.map((c) => [monthLabel(c.month), c.newPatients, c.back3 == null ? 'too soon' : pct(c.back3), c.back6 == null ? 'too soon' : pct(c.back6)])} />
    </div>
  )
}

// ---------- Session load heatmap ----------
export function LoadHeatmap({ data }: { data: { day: string; M: number; E: number | null }[] }) {
  const steps = ['--seq-1', '--seq-2', '--seq-3', '--seq-4', '--seq-5', '--seq-6', '--seq-7']
  const vals = data.flatMap((d) => [d.M, d.E ?? 0])
  const max = Math.max(1, ...vals)
  const cell = (v: number | null) => {
    if (v == null) return { bg: 'var(--surface-2)', fg: 'var(--muted)', text: 'closed' }
    const i = Math.min(steps.length - 1, Math.floor((v / max) * steps.length))
    // Text color per step and theme (set in index.css), so every cell stays readable.
    return { bg: `var(${steps[i]})`, fg: `var(--heat-fg-${i + 1})`, text: v.toFixed(0) }
  }
  return (
    <div>
      <div className="grid grid-cols-[64px_repeat(7,1fr)] gap-[2px] text-center text-[12px]">
        <div />
        {data.map((d) => <div key={d.day} className="pb-1 text-muted">{d.day}</div>)}
        {(['M', 'E'] as const).map((s) => (
          <div key={s} className="contents">
            <div className="flex items-center text-left text-muted">{s === 'M' ? 'Morning' : 'Evening'}</div>
            {data.map((d) => {
              const c = cell(d[s])
              return (
                <div key={d.day + s} className="tabular flex h-11 items-center justify-center rounded-md font-medium" style={{ background: c.bg, color: c.fg }} title={`${d.day} ${s === 'M' ? 'morning' : 'evening'}: ${d[s] == null ? 'no session' : `${d[s]!.toFixed(1)} patients on average`}`}>
                  {c.text}
                </div>
              )
            })}
          </div>
        ))}
      </div>
      <p className="mt-2 text-[12px] text-muted">Average patients per session over the last 6 months. Stronger blue is busier.</p>
    </div>
  )
}
