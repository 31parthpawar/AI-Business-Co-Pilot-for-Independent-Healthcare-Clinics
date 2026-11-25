// Patient search and card: visits, spend, AP history, vaccines, call outcomes.
import { format, parseISO, subMonths } from 'date-fns'
import { useMemo, useState } from 'react'
import type { Nav } from '../App'
import { activeMembership } from '../logic/patients'
import { useApp } from '../store'
import { Card, Icon, inr } from '../ui'

const d = (iso: string) => (iso ? format(parseISO(iso), 'd MMM yyyy') : '')
const SERVICE: Record<string, string> = { OPD: 'Consultation', VACCINE: 'Vaccine', AP: 'AP purchase', OTHER: 'Other' }

export function Patients({ caseNo, nav }: { caseNo?: string; nav: Nav }) {
  const { derived, outcomes, settings } = useApp()
  const { idx, asOf } = derived!
  const [q, setQ] = useState('')

  const results = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return []
    return [...idx.patients.values()].filter((p) => p.caseNo.toLowerCase().startsWith(s) || p.name.toLowerCase().includes(s)).slice(0, 30)
  }, [q, idx])

  const p = caseNo ? idx.patients.get(caseNo) : undefined

  if (p) {
    const today = format(asOf, 'yyyy-MM-dd')
    const yearAgo = format(subMonths(asOf, 12), 'yyyy-MM-dd')
    const m = activeMembership(p, today)
    const spend12 = p.visits.filter((v) => v.date > yearAgo).reduce((a, v) => a + v.amount, 0)
    const total = p.visits.reduce((a, v) => a + v.amount, 0)
    const due = p.vaccines.filter((r) => !r.givenDate && r.dueDate).sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1))
    const given = p.vaccines.filter((r) => r.givenDate)
    const calls = outcomes.filter((o) => o.caseNo === p.caseNo)
    return (
      <div className="space-y-4">
        <button onClick={() => nav({ tab: 'patients' })} className="flex items-center gap-1 text-[14px] text-accent-ink">
          <Icon name="chevron" className="h-4 w-4 rotate-180" /> All patients
        </button>
        <Card>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-xl font-semibold text-ink">{p.name || 'Unnamed'}</h2>
            <span className="tabular text-[14px] text-muted">Case #{p.caseNo}</span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 text-[13px] sm:grid-cols-4">
            <Fact label="First visit" value={d(p.firstVisit)} />
            <Fact label="Last visit" value={d(p.lastVisit)} />
            <Fact label="Visits" value={String(p.visits.filter((v) => v.service !== 'AP').length)} />
            <Fact label="Came via" value={p.source + (p.sourceFrom === 'remark' ? ' (from remark)' : '')} />
            {settings.earningsOn && <Fact label="Spent, last 12 months" value={inr(spend12)} />}
            {settings.earningsOn && <Fact label="Spent, all time" value={inr(total)} />}
            <Fact label="AP" value={m ? `Member until ${d(m.expiryDate)}` : p.memberships.length ? `Lapsed ${d(p.memberships[p.memberships.length - 1].expiryDate)}` : 'Not a member'} />
            <Fact label="AP years" value={String(p.memberships.length)} />
          </div>
        </Card>

        {due.length > 0 && (
          <Card title="Vaccines due">
            <ul className="space-y-1 text-[14px]">
              {due.map((r, i) => (
                <li key={i} className="flex justify-between">
                  <span className="text-ink">{r.vaccine}</span>
                  <span className={`tabular ${r.dueDate < today ? 'font-medium text-critical-ink' : 'text-ink-2'}`}>
                    {r.dueDate < today ? 'Overdue since ' : 'Due '}
                    {d(r.dueDate)}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        <Card title="Visits" subtitle={given.length ? `${given.length} vaccine doses given` : undefined}>
          <ul className="divide-y divide-line">
            {[...p.visits].reverse().slice(0, 60).map((v, i) => (
              <li key={i} className="flex items-start justify-between gap-3 py-2 text-[14px]">
                <span className="min-w-0">
                  <span className="text-ink">{SERVICE[v.service]}</span>
                  {v.detail && <span className="text-ink-2"> · {v.detail}</span>}
                  <span className="block text-[12px] text-muted">
                    {d(v.date)}, {v.session === 'M' ? 'morning' : 'evening'}
                    {v.remark ? ` · ${v.remark}` : ''}
                  </span>
                </span>
                {settings.earningsOn && <span className="tabular shrink-0 text-ink-2">{v.amount ? inr(v.amount) : 'free'}</span>}
              </li>
            ))}
          </ul>
        </Card>

        {p.memberships.length > 0 && (
          <Card title="Annual program">
            <ul className="space-y-1 text-[14px]">
              {p.memberships.map((ms, i) => (
                <li key={i} className="flex justify-between gap-3">
                  <span className="text-ink">{ms.buying === 'renewal' ? 'Renewal' : ms.buying === 'new' ? 'Joined' : 'Membership'}</span>
                  <span className="tabular text-ink-2">
                    {d(ms.joinDate)} to {d(ms.expiryDate)}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {calls.length > 0 && (
          <Card title="Calls">
            <ul className="space-y-1 text-[14px] text-ink-2">
              {calls.map((o) => (
                <li key={o.id}>
                  {d(o.date)}: {o.outcome} ({o.list})
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card title="Find a patient" subtitle="By case number or name">
        <label className="flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-2.5 ring-1 ring-[var(--border)]">
          <Icon name="search" className="h-4 w-4 text-muted" />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. 2045 or Aarav" className="w-full bg-transparent text-ink outline-none placeholder:text-muted" inputMode="search" />
        </label>
        {q && (
          <ul className="mt-3 divide-y divide-line">
            {results.length === 0 && <li className="py-2 text-[14px] text-ink-2">No match.</li>}
            {results.map((r) => (
              <li key={r.caseNo}>
                <button onClick={() => nav({ tab: 'patients', caseNo: r.caseNo })} className="flex w-full items-center justify-between py-2.5 text-left">
                  <span>
                    <span className="text-[15px] text-ink">{r.name || 'Unnamed'}</span>
                    <span className="tabular ml-2 text-[12px] text-muted">#{r.caseNo}</span>
                  </span>
                  <span className="text-[12px] text-muted">last {d(r.lastVisit)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-muted">{label}</div>
      <div className="mt-0.5 text-ink">{value}</div>
    </div>
  )
}
