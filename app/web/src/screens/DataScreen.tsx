// Data in (sample or the clinic's Excel files), and Settings.
import { format, parseISO } from 'date-fns'
import { useRef, useState } from 'react'
import * as XLSX from 'xlsx'
import type { ImportReport } from '../import/readFiles'
import { generateSample } from '../sample/generate'
import { sampleWorkbooks } from '../sample/workbook'
import { useApp } from '../store'
import type { Settings, Targets } from '../types'
import { Card, Icon } from '../ui'

const KIND_LABEL = { visits: 'Visit log', memberships: 'AP table', vaccines: 'Vaccine table' } as const

export function DataScreen() {
  const { dataset, derived, loadSample, importFiles, clearData, settings, saveSettings } = useApp()
  const fileRef = useRef<HTMLInputElement>(null)
  const [report, setReport] = useState<ImportReport | null>(null)
  const [busy, setBusy] = useState(false)

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return
    setBusy(true)
    try {
      setReport(await importFiles([...files]))
    } finally {
      setBusy(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const downloadSamples = () => {
    for (const { name, wb } of sampleWorkbooks(generateSample(new Date()))) XLSX.writeFile(wb, `sample-${name}`, { compression: true })
  }

  return (
    <div className="space-y-4">
      <Card title="Your data" subtitle="Stays on this device. Nothing is uploaded anywhere.">
        {dataset ? (
          <div className="text-[14px] text-ink-2">
            <p>
              <span className="font-medium text-ink">{dataset.kind === 'sample' ? 'Sample data (a made-up clinic)' : 'Imported clinic data'}</span>
              {derived && (
                <>
                  : {derived.idx.patients.size.toLocaleString('en-IN')} patients, {dataset.visits.length.toLocaleString('en-IN')} visits, {dataset.memberships.length} AP rows, {dataset.vaccines.length.toLocaleString('en-IN')} vaccine rows. From {format(parseISO(derived.idx.dataStart), 'd MMM yyyy')} to {format(parseISO(derived.idx.dataEnd), 'd MMM yyyy')}.
                </>
              )}
            </p>
          </div>
        ) : (
          <p className="text-[14px] text-ink-2">No data yet. Load the sample to explore, or import the clinic's sheets.</p>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={() => fileRef.current?.click()} disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-[14px] font-medium text-white disabled:opacity-60">
            <Icon name="upload" className="h-4 w-4" /> {busy ? 'Reading…' : 'Import Excel or CSV'}
          </button>
          <input ref={fileRef} type="file" multiple accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv" className="hidden" onChange={(e) => onFiles(e.target.files)} />
          <button onClick={() => { setReport(null); loadSample() }} className="rounded-xl bg-surface-2 px-4 py-2.5 text-[14px] font-medium text-ink ring-1 ring-[var(--border)]">
            {dataset?.kind === 'sample' ? 'Reload sample data' : 'Load sample data'}
          </button>
          <button onClick={downloadSamples} className="inline-flex items-center gap-2 rounded-xl bg-surface-2 px-4 py-2.5 text-[14px] font-medium text-ink ring-1 ring-[var(--border)]">
            <Icon name="download" className="h-4 w-4" /> Sample sheets
          </button>
          {dataset && (
            <button onClick={() => { if (confirm('Remove all data and call outcomes from this device?')) { setReport(null); clearData() } }} className="rounded-xl px-4 py-2.5 text-[14px] font-medium text-critical-ink ring-1 ring-[var(--border)]">
              Clear data
            </button>
          )}
        </div>
        <p className="mt-3 text-[12px] text-muted">
          Import the visit log, AP table and vaccine table (one file each, or one workbook with three sheets). Column names are matched automatically. An optional <b>Source</b> column in the visit log records how each new patient found the clinic: a word or a letter (G Google, W word of mouth, R doctor referral, L walk-in, O other).
        </p>
      </Card>

      {report && <ImportResult report={report} />}

      <SettingsForm key={JSON.stringify(settings)} settings={settings} onSave={saveSettings} />
    </div>
  )
}

function ImportResult({ report }: { report: ImportReport }) {
  const read = report.tables.filter((t) => t.kind)
  return (
    <Card title="Import result">
      {read.length === 0 ? (
        <p className="text-[14px] text-critical-ink">No clinic tables found. Each sheet needs a header row with a "Case No." column.</p>
      ) : (
        <ul className="space-y-3 text-[14px]">
          {report.tables.map((t, i) => (
            <li key={i}>
              <div className="flex items-center gap-2">
                <span style={{ color: t.kind ? 'var(--good)' : 'var(--muted)' }}><Icon name={t.kind ? 'check' : 'x'} className="h-4 w-4" /></span>
                <span className="text-ink">{t.sheet}</span>
              </div>
              <p className="ml-6 text-[13px] text-ink-2">
                {t.kind ? `${KIND_LABEL[t.kind]}: ${t.rowsRead.toLocaleString('en-IN')} rows read` : 'Skipped: not a recognised table'}
                {t.kind === 'visits' && (t.hasSourceColumn ? '. Source column found.' : '. No Source column: sources come from remarks only.')}
              </p>
              {t.issues.length > 0 && (
                <details className="ml-6 text-[13px]">
                  <summary className="cursor-pointer text-critical-ink">{t.issues.length} rows not read</summary>
                  <ul className="mt-1 text-ink-2">
                    {t.issues.slice(0, 20).map((x, j) => <li key={j}>Row {x.row}: {x.reason}</li>)}
                  </ul>
                </details>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

const TARGETS: { key: keyof Targets; label: string; money?: boolean }[] = [
  { key: 'paidOpd', label: 'Paid consultations' },
  { key: 'apSales', label: 'AP sales' },
  { key: 'vaccinePatients', label: 'Vaccine visits' },
  { key: 'opdRevenue', label: 'Consultation revenue (₹)', money: true },
  { key: 'apRevenue', label: 'AP revenue (₹)', money: true },
]

function SettingsForm({ settings, onSave }: { settings: Settings; onSave: (s: Settings) => void }) {
  const [s, setS] = useState(settings)
  const [saved, setSaved] = useState(false)
  const dirty = JSON.stringify(s) !== JSON.stringify(settings)
  const num = (v: string) => Math.max(0, Number(v) || 0)
  const field = 'mt-1 w-full rounded-lg bg-surface-2 px-3 py-2 text-ink ring-1 ring-[var(--border)] outline-none focus:ring-accent'
  const th = s.thresholds
  const setTh = (k: keyof Settings['thresholds'], v: string) => setS({ ...s, thresholds: { ...th, [k]: num(v) } })

  return (
    <Card title="Settings" subtitle="Everything clinic-specific lives here, not in the code">
      <div className="space-y-5 text-[14px]">
        <label className="block">
          <span className="text-ink-2">Clinic name</span>
          <input className={field} value={s.clinicName} onChange={(e) => setS({ ...s, clinicName: e.target.value })} />
        </label>

        <label className="flex items-center justify-between gap-4 rounded-xl bg-surface-2 p-3">
          <span>
            <span className="block font-medium text-ink">Show earnings</span>
            <span className="text-[13px] text-ink-2">Off by default. Every feature works on visits alone.</span>
          </span>
          <input type="checkbox" className="h-5 w-5 accent-[var(--accent)]" checked={s.earningsOn} onChange={(e) => setS({ ...s, earningsOn: e.target.checked })} />
        </label>

        <fieldset>
          <legend className="font-medium text-ink">Monthly targets</legend>
          <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {TARGETS.filter((t) => !t.money || s.earningsOn).map((t) => (
              <label key={t.key} className="block">
                <span className="text-ink-2">{t.label}</span>
                <input className={`${field} tabular`} inputMode="numeric" value={s.targets[t.key] || ''} placeholder="Not set" onChange={(e) => setS({ ...s, targets: { ...s.targets, [t.key]: num(e.target.value) } })} />
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="font-medium text-ink">Call list rules</legend>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <label className="block"><span className="text-ink-2">Renewal window (days)</span><input className={`${field} tabular`} inputMode="numeric" value={th.renewalWindowDays} onChange={(e) => setTh('renewalWindowDays', e.target.value)} /></label>
            <label className="block"><span className="text-ink-2">Lapsed: × usual gap</span><input className={`${field} tabular`} inputMode="decimal" value={th.lapsedGapMultiple} onChange={(e) => setTh('lapsedGapMultiple', e.target.value)} /></label>
            <label className="block"><span className="text-ink-2">Unused AP: months</span><input className={`${field} tabular`} inputMode="numeric" value={th.unusedApMonths} onChange={(e) => setTh('unusedApMonths', e.target.value)} /></label>
            <label className="block"><span className="text-ink-2">Vaccines: max days overdue</span><input className={`${field} tabular`} inputMode="numeric" value={th.vaccineMaxOverdueDays} onChange={(e) => setTh('vaccineMaxOverdueDays', e.target.value)} /></label>
            <label className="block"><span className="text-ink-2">AP vaccine discount (%)</span><input className={`${field} tabular`} inputMode="numeric" value={Math.round(s.apVaccineDiscount * 100)} onChange={(e) => setS({ ...s, apVaccineDiscount: Math.min(100, num(e.target.value)) / 100 })} /></label>
          </div>
        </fieldset>

        <div className="flex items-center gap-3">
          <button disabled={!dirty} onClick={() => { onSave(s); setSaved(true); setTimeout(() => setSaved(false), 2000) }} className="rounded-xl bg-accent px-4 py-2.5 font-medium text-white disabled:opacity-40">
            Save settings
          </button>
          {saved && <span className="text-[13px] text-good-ink">Saved</span>}
        </div>
      </div>
    </Card>
  )
}
