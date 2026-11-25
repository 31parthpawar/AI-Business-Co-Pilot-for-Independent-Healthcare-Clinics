// Turns sheet rows (arrays of cells, as SheetJS gives them) into the data model.
// Works on the clinic's own column names, finds the header row itself, and reports rows it can't read.
import { addDays, addYears, format, isValid, parseISO } from 'date-fns'
import type { Membership, PayMode, ServiceCat, Session, Settings, VaccineRecord, Visit } from '../types'

export type Cell = string | number | boolean | Date | null | undefined
export type Row = Cell[]
export type TableKind = 'visits' | 'memberships' | 'vaccines'

export interface ParseIssue {
  sheet: string
  row: number
  reason: string
}

export interface ParsedTable {
  sheet: string
  kind: TableKind | null
  rowsRead: number
  issues: ParseIssue[]
  visits?: Visit[]
  memberships?: Membership[]
  vaccines?: VaccineRecord[]
  hasSourceColumn?: boolean
}

const norm = (v: Cell) =>
  String(v ?? '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()

const ALIASES: Record<string, string[]> = {
  date: ['date'],
  session: ['mopd/eopd', 'mopd', 'session', 'm/e'],
  name: ['name', 'patient name', 'child name'],
  caseNo: ['case no', 'case no.', 'case number', 'case'],
  service: ['service'],
  detail: ['detail'],
  amount: ['amount', 'fee'],
  mode: ['mode', 'payment mode'],
  remark: ['remark', 'remarks'],
  source: ['source', 'how did you hear'],
  dob: ['dob', 'date of birth'],
  program: ['programe name', 'programme name', 'program name', 'program', 'programe'],
  buying: ['buying', 'type'],
  join: ['joining date', 'join date', 'start date'],
  expiry: ['expiry date', 'expiry', 'expiry dt'],
  vaccine: ['vaccine name', 'vaccine', 'vaccination'],
  given: ['given date', 'date given', 'given on', 'given'],
  due: ['due date', 'due on', 'due'],
}

/** Maps field -> column index, matching each header at most once. */
function mapColumns(header: Row): Record<string, number> {
  const cols = header.map(norm)
  const used = new Set<number>()
  const out: Record<string, number> = {}
  // Exact matches first, then prefix matches, so "date" doesn't grab "due date".
  for (const pass of ['exact', 'prefix'] as const) {
    for (const [field, aliases] of Object.entries(ALIASES)) {
      if (field in out) continue
      for (const alias of aliases) {
        const i = cols.findIndex(
          (c, idx) => !used.has(idx) && c !== '' && (pass === 'exact' ? c === alias : c.startsWith(alias)),
        )
        if (i >= 0) {
          out[field] = i
          used.add(i)
          break
        }
      }
    }
  }
  return out
}

function classify(cols: Record<string, number>): TableKind | null {
  if ('expiry' in cols && 'caseNo' in cols) return 'memberships'
  if ('due' in cols && 'caseNo' in cols) return 'vaccines'
  if ('service' in cols && 'caseNo' in cols && 'date' in cols) return 'visits'
  return null
}

function findHeader(rows: Row[]): number {
  for (let i = 0; i < Math.min(rows.length, 15); i++) {
    if (rows[i]?.some((c) => /^case\s*(no|number)/.test(norm(c)))) return i
  }
  return -1
}

/** Excel serial date (1900 system) to a local Date. */
function fromSerial(n: number): Date {
  const ms = Math.round((n - 25569) * 86400 * 1000)
  const d = new Date(ms)
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
}

/** Day-first, as dates are written in India. Returns '' if unreadable. */
export function parseDate(v: Cell): string {
  if (v == null || v === '') return ''
  if (v instanceof Date) return isValid(v) ? format(v, 'yyyy-MM-dd') : ''
  if (typeof v === 'number') return v > 20000 && v < 80000 ? format(fromSerial(v), 'yyyy-MM-dd') : ''
  const s = String(v).trim()
  let m = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/)
  if (m) return safe(+m[1], +m[2], +m[3])
  m = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})$/)
  if (m) {
    const y = +m[3] < 100 ? 2000 + +m[3] : +m[3]
    return safe(y, +m[2], +m[1])
  }
  return ''
}

function safe(y: number, mo: number, d: number): string {
  const dt = new Date(y, mo - 1, d)
  if (!isValid(dt) || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return ''
  return format(dt, 'yyyy-MM-dd')
}

const parseAmount = (v: Cell) => {
  if (typeof v === 'number') return v
  const n = parseFloat(String(v ?? '').replace(/[₹,\s]/g, ''))
  return Number.isFinite(n) ? n : 0
}

export function parseMode(v: Cell): PayMode {
  const s = norm(v)
  if (!s) return 'other'
  if (s.includes('cash')) return 'cash'
  if (/(online|upi|bank|card|gpay|g pay|paytm|phonepe|neft|imps|transfer)/.test(s)) return 'online'
  return 'other'
}

function parseSession(v: Cell): Session {
  const s = norm(v)
  return s.startsWith('e') ? 'E' : 'M'
}

export function mapService(v: Cell, settings: Settings): ServiceCat {
  const s = norm(v)
  if (settings.serviceMap[s]) return settings.serviceMap[s]
  for (const [k, cat] of Object.entries(settings.serviceMap)) if (k.length > 2 && s.includes(k)) return cat
  return 'OTHER'
}

export const splitVaccines = (detail: string) =>
  detail
    .split(/[,+/;&]| and /i)
    .map((x) => x.trim())
    .filter(Boolean)

const caseNoOf = (v: Cell) => {
  if (typeof v === 'number') return String(Math.round(v))
  return String(v ?? '').trim()
}

const get = (row: Row, cols: Record<string, number>, f: string): Cell => (f in cols ? row[cols[f]] : undefined)

export function parseRows(sheet: string, rows: Row[], settings: Settings): ParsedTable {
  const h = findHeader(rows)
  if (h < 0) return { sheet, kind: null, rowsRead: 0, issues: [] }
  const cols = mapColumns(rows[h])
  const kind = classify(cols)
  const issues: ParseIssue[] = []
  const body = rows.slice(h + 1)
  const isBlank = (r: Row) => !r || r.every((c) => c == null || String(c).trim() === '')

  if (kind === 'visits') {
    const visits: Visit[] = []
    let lastDate = ''
    let lastSession: Session = 'M'
    body.forEach((r, i) => {
      if (isBlank(r)) return
      const caseNo = caseNoOf(get(r, cols, 'caseNo'))
      // Clinics often write the date once per day; carry it down.
      const rawDate = get(r, cols, 'date')
      const date = rawDate == null || rawDate === '' ? lastDate : parseDate(rawDate)
      const rawSession = get(r, cols, 'session')
      const session = rawSession == null || rawSession === '' ? lastSession : parseSession(rawSession)
      if (!caseNo) return issues.push({ sheet, row: h + i + 2, reason: 'No case number' })
      if (!date) return issues.push({ sheet, row: h + i + 2, reason: 'Date not readable' })
      lastDate = date
      lastSession = session
      const serviceRaw = String(get(r, cols, 'service') ?? '').trim()
      const service = mapService(serviceRaw, settings)
      const detail = String(get(r, cols, 'detail') ?? '').trim()
      visits.push({
        date,
        session,
        caseNo,
        name: String(get(r, cols, 'name') ?? '').trim(),
        serviceRaw,
        service,
        detail,
        vaccines: service === 'VACCINE' ? splitVaccines(detail) : [],
        amount: parseAmount(get(r, cols, 'amount')),
        mode: parseMode(get(r, cols, 'mode')),
        remark: String(get(r, cols, 'remark') ?? '').trim(),
        source: String(get(r, cols, 'source') ?? '').trim(),
      })
    })
    return { sheet, kind, rowsRead: visits.length, issues, visits, hasSourceColumn: 'source' in cols }
  }

  if (kind === 'memberships') {
    const memberships: Membership[] = []
    body.forEach((r, i) => {
      if (isBlank(r)) return
      const caseNo = caseNoOf(get(r, cols, 'caseNo'))
      const joinDate = parseDate(get(r, cols, 'join'))
      if (!caseNo) return issues.push({ sheet, row: h + i + 2, reason: 'No case number' })
      if (!joinDate) return issues.push({ sheet, row: h + i + 2, reason: 'Joining date not readable' })
      const expiry =
        parseDate(get(r, cols, 'expiry')) || format(addDays(addYears(parseISO(joinDate), 1), -1), 'yyyy-MM-dd')
      const buying = norm(get(r, cols, 'buying'))
      memberships.push({
        caseNo,
        name: String(get(r, cols, 'name') ?? '').trim(),
        dob: parseDate(get(r, cols, 'dob')),
        programName: String(get(r, cols, 'program') ?? '').trim(),
        buying: buying.startsWith('renew') ? 'renewal' : buying.startsWith('new') ? 'new' : 'unknown',
        amount: parseAmount(get(r, cols, 'amount')),
        paymentMode: parseMode(get(r, cols, 'mode')),
        joinDate,
        expiryDate: expiry,
      })
    })
    return { sheet, kind, rowsRead: memberships.length, issues, memberships }
  }

  if (kind === 'vaccines') {
    const vaccines: VaccineRecord[] = []
    body.forEach((r, i) => {
      if (isBlank(r)) return
      const caseNo = caseNoOf(get(r, cols, 'caseNo'))
      const vaccine = String(get(r, cols, 'vaccine') ?? '').trim()
      if (!caseNo || !vaccine) return issues.push({ sheet, row: h + i + 2, reason: 'No case number or vaccine' })
      vaccines.push({
        caseNo,
        name: String(get(r, cols, 'name') ?? '').trim(),
        vaccine,
        givenDate: parseDate(get(r, cols, 'given')),
        dueDate: parseDate(get(r, cols, 'due')),
      })
    })
    return { sheet, kind, rowsRead: vaccines.length, issues, vaccines }
  }

  return { sheet, kind: null, rowsRead: 0, issues: [] }
}
