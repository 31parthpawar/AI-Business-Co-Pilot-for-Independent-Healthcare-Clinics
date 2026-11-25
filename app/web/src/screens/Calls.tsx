// Who to call today: one list at a time, top 10 by priority, an outcome button on every row.
import { differenceInCalendarDays, format, parseISO } from 'date-fns'
import { useMemo, useState } from 'react'
import type { Nav } from '../App'
import type { CallLists } from '../logic/callLists'
import { useApp } from '../store'
import type { CallOutcome, Outcome } from '../types'
import { Card } from '../ui'
import { LIST_LABELS } from './Dashboard'

const OUTCOMES: { key: Outcome; label: string }[] = [
  { key: 'booked', label: 'Booked' },
  { key: 'reached', label: 'Reached' },
  { key: 'not reached', label: 'No answer' },
  { key: 'declined', label: 'Declined' },
]
const RECENT_DAYS = 14

export function Calls({ list, nav }: { list: keyof CallLists; nav: Nav }) {
  const { derived, outcomes, recordOutcome } = useApp()
  const lists = derived!.lists
  const [showAll, setShowAll] = useState(false)

  // Latest outcome per patient on this list, if recent.
  const latest = useMemo(() => {
    const m = new Map<string, CallOutcome>()
    for (const o of outcomes) {
      if (o.list !== list || differenceInCalendarDays(new Date(), parseISO(o.date)) > RECENT_DAYS) continue
      const prev = m.get(o.caseNo)
      if (!prev || (prev.id ?? 0) < (o.id ?? 0)) m.set(o.caseNo, o)
    }
    return m
  }, [outcomes, list])

  const rows = lists[list]
  // Patients already called recently drop to the bottom.
  const ordered = useMemo(() => [...rows.filter((r) => !latest.has(r.caseNo)), ...rows.filter((r) => latest.has(r.caseNo))], [rows, latest])
  const shown = showAll ? ordered : ordered.slice(0, 10)
  const done = rows.filter((r) => latest.has(r.caseNo)).length

  return (
    <div className="space-y-4">
      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-2">
          {(Object.keys(LIST_LABELS) as (keyof CallLists)[]).map((k) => (
            <button
              key={k}
              onClick={() => {
                setShowAll(false)
                nav({ tab: 'calls', list: k })
              }}
              className={`shrink-0 rounded-full px-3.5 py-2 text-[13px] font-medium ${k === list ? 'bg-ink text-surface' : 'bg-surface text-ink-2 ring-1 ring-[var(--border)]'}`}
            >
              {LIST_LABELS[k].short} <span className="tabular opacity-70">{lists[k].length}</span>
            </button>
          ))}
        </div>
      </div>

      <Card
        title={LIST_LABELS[list].title}
        subtitle={`${LIST_LABELS[list].why}. ${done ? `${done} called in the last ${RECENT_DAYS} days.` : ''}`}
      >
        {rows.length === 0 ? (
          <p className="text-[14px] text-ink-2">Nobody on this list right now.</p>
        ) : (
          <>
            <ul className="divide-y divide-line">
              {shown.map((r, i) => {
                const o = latest.get(r.caseNo)
                return (
                  <li key={r.caseNo} className={`py-3 ${o ? 'opacity-60' : ''}`}>
                    <div className="flex items-start gap-3">
                      <span className="tabular mt-0.5 w-5 shrink-0 text-right text-[12px] text-muted">{i + 1}</span>
                      <div className="min-w-0 flex-1">
                        <button className="text-left" onClick={() => nav({ tab: 'patients', caseNo: r.caseNo })}>
                          <span className="text-[15px] font-medium text-ink">{r.name || 'Unnamed'}</span>
                          <span className="tabular ml-2 text-[12px] text-muted">#{r.caseNo}</span>
                        </button>
                        <p className="mt-0.5 text-[13px] text-ink-2">{r.reason}</p>
                        <p className="mt-0.5 text-[12px] text-muted">Last visit {r.lastVisit ? format(parseISO(r.lastVisit), 'd MMM yyyy') : 'never'}</p>
                        {o ? (
                          <p className="mt-2 text-[13px] font-medium text-ink">
                            {OUTCOMES.find((x) => x.key === o.outcome)?.label} on {format(parseISO(o.date), 'd MMM')}
                          </p>
                        ) : (
                          <div className="mt-2 grid max-w-md grid-cols-4 gap-1.5">
                            {OUTCOMES.map((x) => (
                              <button key={x.key} onClick={() => recordOutcome(r.caseNo, list, x.key)} className="rounded-lg bg-surface-2 px-1 py-2 text-[13px] text-ink ring-1 ring-[var(--border)] active:bg-accent-soft">
                                {x.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
            {rows.length > 10 && (
              <button onClick={() => setShowAll((s) => !s)} className="mt-2 w-full rounded-xl bg-surface-2 py-2.5 text-[14px] font-medium text-accent-ink">
                {showAll ? 'Show today’s top 10' : `Show all ${rows.length}`}
              </button>
            )}
          </>
        )}
      </Card>
      <p className="px-1 text-[12px] text-muted">The clinic's records have no phone numbers yet, so calls are made from the clinic's own diary. Outcomes are saved on this device and show whether the lists bring patients back.</p>
    </div>
  )
}
