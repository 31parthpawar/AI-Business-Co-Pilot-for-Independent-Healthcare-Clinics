// Small shared UI pieces.
import { useEffect, useState, type ReactNode } from 'react'
import type { Tone } from './logic/insights'

export const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`
export const compactInr = (n: number) =>
  n >= 1e7 ? `₹${(n / 1e7).toFixed(1)} Cr` : n >= 1e5 ? `₹${(n / 1e5).toFixed(1)} L` : n >= 1e3 ? `₹${(n / 1e3).toFixed(1)}K` : `₹${n}`
export const pct = (x: number) => `${Math.round(x * 100)}%`

export function Card({ title, subtitle, action, children, id, className = '' }: { title?: string; subtitle?: ReactNode; action?: ReactNode; children: ReactNode; id?: string; className?: string }) {
  return (
    <section id={id} className={`rounded-2xl border border-[var(--border)] bg-surface p-4 sm:p-5 ${className}`}>
      {(title || action) && (
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-[15px] font-semibold text-ink">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-[13px] text-ink-2">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

/** Stat tile: label, value, optional delta vs a named period. Up is good unless goodWhenUp is false. */
export function StatTile({ label, value, delta, deltaLabel, goodWhenUp = true, hint }: { label: string; value: string; delta?: number; deltaLabel?: string; goodWhenUp?: boolean; hint?: string }) {
  const hasDelta = delta !== undefined && Number.isFinite(delta)
  const good = hasDelta && (delta! >= 0) === goodWhenUp
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-surface p-4">
      <div className="text-[13px] text-ink-2">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-ink sm:text-[28px]">{value}</div>
      {hasDelta && (
        <div className={`mt-1 flex items-center gap-1 text-[13px] ${Math.abs(delta!) < 0.005 ? 'text-muted' : good ? 'text-good-ink' : 'text-critical-ink'}`}>
          <Icon name={delta! >= 0 ? 'up' : 'down'} className="h-3.5 w-3.5" />
          <span className="tabular">{delta! >= 0 ? '+' : ''}{Math.round(delta! * 100)}%</span>
          <span className="text-muted">{deltaLabel}</span>
        </div>
      )}
      {hint && <div className="mt-1 text-[12px] text-muted">{hint}</div>}
    </div>
  )
}

const TONE: Record<Tone, { color: string; icon: IconName; label: string }> = {
  critical: { color: 'var(--critical)', icon: 'alert', label: 'Needs attention' },
  warning: { color: 'var(--warning)', icon: 'clock', label: 'To do' },
  info: { color: 'var(--accent)', icon: 'info', label: 'Note' },
  good: { color: 'var(--good)', icon: 'check', label: 'Going well' },
}

/** Status always ships with an icon and a label, never color alone. */
export function ToneMark({ tone }: { tone: Tone }) {
  const t = TONE[tone]
  return (
    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full" style={{ background: `color-mix(in srgb, ${t.color} 16%, transparent)`, color: t.color }} title={t.label} aria-label={t.label}>
      <Icon name={t.icon} className="h-4 w-4" />
    </span>
  )
}

export type IconName = 'alert' | 'clock' | 'info' | 'check' | 'up' | 'down' | 'home' | 'phone' | 'users' | 'folder' | 'search' | 'chevron' | 'upload' | 'download' | 'x' | 'sun' | 'moon' | 'auto' | 'sparkle' | 'image' | 'copy'
export function Icon({ name, className = 'h-5 w-5' }: { name: IconName; className?: string }) {
  const p: Record<IconName, ReactNode> = {
    alert: <><path d="M12 9v4" /><path d="M12 17h.01" /><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5" /><path d="M12 8h.01" /></>,
    check: <path d="m5 12 5 5 9-10" />,
    up: <path d="m6 15 6-6 6 6" />,
    down: <path d="m6 9 6 6 6-6" />,
    home: <><path d="M3 11.5 12 4l9 7.5" /><path d="M5 10v10h14V10" /></>,
    phone: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />,
    users: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><path d="M16 4.5a3.5 3.5 0 0 1 0 7" /><path d="M18 14a6.5 6.5 0 0 1 3.5 6" /></>,
    folder: <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
    chevron: <path d="m9 6 6 6-6 6" />,
    upload: <><path d="M12 15V4" /><path d="m7 9 5-5 5 5" /><path d="M5 20h14" /></>,
    download: <><path d="M12 4v11" /><path d="m7 10 5 5 5-5" /><path d="M5 20h14" /></>,
    x: <><path d="M6 6l12 12" /><path d="M18 6 6 18" /></>,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
    moon: <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />,
    auto: <><circle cx="12" cy="12" r="9" /><path d="M12 3v18" /><path d="M12 3a9 9 0 0 1 0 18" fill="currentColor" /></>,
    sparkle: <><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8Z" /><path d="M19 16l.7 1.8L21.5 18.5l-1.8.7L19 21l-.7-1.8-1.8-.7 1.8-.7Z" /></>,
    image: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="m21 16-5-5-9 9" /></>,
    copy: <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>,
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      {p[name]}
    </svg>
  )
}

/** Meter for target pacing: filled to actual, tick at the projected month end. */
export function PaceMeter({ label, actual, target, projected, display }: { label: string; actual: number; target: number; projected: number; display: (n: number) => string }) {
  const fill = Math.min(1, actual / target)
  const proj = Math.min(1, projected / target)
  const p = projected / target
  const tone: Tone = p >= 1 ? 'good' : p >= 0.85 ? 'warning' : 'critical'
  const color = tone === 'good' ? 'var(--good)' : tone === 'warning' ? 'var(--warning)' : 'var(--critical)'
  const word = tone === 'good' ? 'On track' : tone === 'warning' ? 'Slightly behind' : 'Behind'
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[14px] font-medium text-ink">{label}</span>
        <span className="tabular text-[13px] text-ink-2">
          {display(actual)} <span className="text-muted">of {display(target)}</span>
        </span>
      </div>
      <div className="relative mt-2 h-2.5 rounded-full" style={{ background: `color-mix(in srgb, ${color} 18%, transparent)` }}>
        <div className="h-full rounded-full" style={{ width: `${fill * 100}%`, background: color }} />
        <div className="absolute -top-1 h-[18px] w-[2px] rounded bg-ink" style={{ left: `calc(${proj * 100}% - 1px)` }} title={`Projected: ${display(projected)}`} />
      </div>
      <div className="mt-1.5 flex items-center justify-between text-[12px]">
        <span className="flex items-center gap-1 text-ink-2">
          <span style={{ color }}><Icon name={tone === 'good' ? 'check' : tone === 'warning' ? 'clock' : 'alert'} className="h-3.5 w-3.5" /></span>
          {word}
        </span>
        <span className="tabular text-muted">Projected {display(projected)} ({pct(p)})</span>
      </div>
    </div>
  )
}

/** Hides children behind a "show the numbers" toggle: the table view for each chart. */
export function NumbersTable({ head, rows }: { head: string[]; rows: (string | number)[][] }) {
  return (
    <details className="mt-3 text-[13px]">
      <summary className="cursor-pointer select-none text-accent-ink">Show the numbers</summary>
      <div className="mt-2 overflow-x-auto">
        <table className="tabular w-full text-left">
          <thead>
            <tr className="text-muted">{head.map((h) => <th key={h} className="py-1 pr-3 font-normal">{h}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-line">{r.map((c, j) => <td key={j} className="py-1 pr-3 text-ink-2">{c}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  )
}

/** Reads the current value of CSS color tokens, and updates when light/dark changes. */
export function useTokens<T extends string>(names: readonly T[]): Record<T, string> {
  const read = () => {
    const cs = getComputedStyle(document.documentElement)
    return Object.fromEntries(names.map((n) => [n, cs.getPropertyValue(`--${n}`).trim()])) as Record<T, string>
  }
  const [vals, setVals] = useState(read)
  useEffect(() => {
    // Re-read when the phone's theme changes or the in-app switch sets data-theme.
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const on = () => setVals(read())
    mq.addEventListener('change', on)
    const mo = new MutationObserver(on)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => {
      mq.removeEventListener('change', on)
      mo.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return vals
}

/** Bottom sheet on phones, centred dialog on wider screens. Closes on the button, backdrop or Escape. */
export function Sheet({ title, subtitle, onClose, children }: { title: string; subtitle?: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-black/45" onClick={onClose} />
      <div className="safe-bottom relative flex max-h-[92dvh] w-full flex-col rounded-t-3xl bg-page shadow-2xl sm:max-w-3xl sm:rounded-3xl">
        <div className="flex items-start justify-between gap-3 border-b border-[var(--border)] px-5 py-4">
          <div>
            <div className="text-[16px] font-semibold text-ink">{title}</div>
            {subtitle && <div className="mt-0.5 text-[13px] text-ink-2">{subtitle}</div>}
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 text-ink-2 ring-1 ring-[var(--border)]" aria-label="Close">
            <Icon name="x" className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>
  )
}

/** A feature that needs AI (and API credits): what it will do, plus a sample of the output. */
export function ComingSoon({ title, description, points, sampleTitle, sample, id }: { title: string; description: string; points: string[]; sampleTitle?: string; sample: ReactNode; id?: string }) {
  const [open, setOpen] = useState(false)
  return (
    <section id={id} className="rounded-2xl border border-dashed border-[var(--axis)] bg-surface p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent-ink">
          <Icon name="sparkle" className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
            <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-ink-2 ring-1 ring-[var(--border)]">Coming soon</span>
          </div>
          <p className="mt-1 text-[13px] text-ink-2">{description}</p>
          <ul className="mt-2 space-y-1 text-[13px] text-ink-2">
            {points.map((p) => (
              <li key={p} className="flex gap-2">
                <span className="mt-[3px] text-accent-ink"><Icon name="check" className="h-3.5 w-3.5" /></span>
                {p}
              </li>
            ))}
          </ul>
          <button onClick={() => setOpen(true)} className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-accent px-3.5 py-2 text-[14px] font-medium text-white">
            See a sample <Icon name="chevron" className="h-4 w-4" />
          </button>
        </div>
      </div>
      {open && (
        <Sheet title={sampleTitle ?? `${title}: sample`} subtitle="A sample of what this will produce. Not generated live: it needs AI, which isn't switched on yet." onClose={() => setOpen(false)}>
          {sample}
        </Sheet>
      )}
    </section>
  )
}
