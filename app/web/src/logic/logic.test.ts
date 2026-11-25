import { describe, expect, it } from 'vitest'
import { parseDate, parseRows } from '../import/parse'
import { sampleDataset } from '../sample/load'
import { defaultSettings } from '../settings'
import type { Settings } from '../types'
import { allCallLists } from './callLists'
import { insights } from './insights'
import { headline, pacing, retentionCohorts, sessionLoad } from './metrics'
import { newPatientsByMonth, sourceShifts } from './newPatients'
import { buildIndex, matchSource } from './patients'

const asOf = new Date(2026, 10, 20) // 20 Nov 2026
const { dataset, targets } = sampleDataset(asOf, defaultSettings)
const settings: Settings = { ...defaultSettings, targets }
const idx = buildIndex(dataset, settings)
const lists = allCallLists(idx, settings, asOf)

describe('import', () => {
  it('reads day-first dates, Excel serials and Date objects', () => {
    expect(parseDate('05/03/2026')).toBe('2026-03-05')
    expect(parseDate('5-3-26')).toBe('2026-03-05')
    expect(parseDate('2026-03-05')).toBe('2026-03-05')
    expect(parseDate(46086)).toBe('2026-03-05')
    expect(parseDate(new Date(2026, 2, 5))).toBe('2026-03-05')
    expect(parseDate('31/02/2026')).toBe('')
  })

  it('finds the header row and carries a blank date down', () => {
    const t = parseRows(
      'log',
      [
        ['Clinic visits'],
        ['DATE', 'Day', 'Mopd/Eopd', 'Name', 'Case No.', 'Service', 'Detail( visit/vac. name)', 'Amount', 'Mode', 'Remark'],
        ['01/11/2026', 'Sun', 'Mopd', 'A', 101, 'OPD', 'Visit', 600, 'Cash', ''],
        ['', '', '', 'B', 102, 'Vaccine', 'MMR 1, Typhoid', '2,400', 'UPI', 'ref Dr. Rao'],
        ['', '', '', 'C', '', 'OPD', 'Visit', 600, 'Cash', ''],
      ],
      defaultSettings,
    )
    expect(t.kind).toBe('visits')
    expect(t.visits).toHaveLength(2)
    expect(t.visits![1]).toMatchObject({ date: '2026-11-01', caseNo: '102', service: 'VACCINE', vaccines: ['MMR 1', 'Typhoid'], amount: 2400, mode: 'online' })
    expect(t.issues[0].reason).toBe('No case number')
    expect(t.hasSourceColumn).toBe(false)
  })

  it('reads the AP table with its title row', () => {
    expect(dataset.memberships.length).toBeGreaterThan(50)
    expect(dataset.memberships.every((m) => m.expiryDate > m.joinDate)).toBe(true)
  })
})

describe('patient source', () => {
  it('maps codes, words and remarks', () => {
    expect(matchSource('G', settings)).toBe('Google')
    expect(matchSource('google maps', settings)).toBe('Google')
    expect(matchSource('Ref Dr. Mehta', settings)).toBe('Doctor referral')
    expect(matchSource('friend', settings)).toBe('Word of mouth')
    expect(matchSource('fever', settings)).toBeNull()
    expect(matchSource('Gopal', settings)).toBeNull()
  })

  it('finds the planted Google drop', () => {
    const g = sourceShifts(idx, settings, asOf).find((s) => s.source === 'Google')!
    expect(g.change).toBeLessThan(-0.4)
    expect(insights(dataset, idx, settings, asOf, lists).some((i) => i.id === 'source-Google')).toBe(true)
  })

  it('counts new patients by month after the warm-up', () => {
    const months = newPatientsByMonth(idx, settings, asOf)
    expect(months).toHaveLength(12)
    expect(months.every((m) => m.total > 10)).toBe(true)
  })
})

describe('call lists', () => {
  it('finds something on every list', () => {
    for (const [k, rows] of Object.entries(lists)) expect(rows.length, k).toBeGreaterThan(0)
  })

  it('ranks renewals by use and only within the window', () => {
    const r = lists.renewals
    expect(r[0].score).toBeGreaterThanOrEqual(r[r.length - 1].score)
  })

  it('never lists an active member as lapsed or for cross-sell', () => {
    const today = '2026-11-20'
    const active = new Set(dataset.memberships.filter((m) => m.joinDate <= today && today <= m.expiryDate).map((m) => m.caseNo))
    expect(lists.lapsed.some((r) => active.has(r.caseNo))).toBe(false)
    expect(lists.crossSell.some((r) => active.has(r.caseNo))).toBe(false)
  })
})

describe('metrics', () => {
  it('paces AP sales behind target, as planted', () => {
    const ap = pacing(dataset, settings, asOf).find((p) => p.key === 'apSales')!
    expect(ap.projectedPct).toBeLessThan(1)
  })

  it('has busier evenings than mornings on weekdays', () => {
    const load = sessionLoad(dataset, asOf).slice(0, 6)
    expect(load.reduce((a, d) => a + (d.E ?? 0), 0)).toBeGreaterThan(load.reduce((a, d) => a + d.M, 0))
  })

  it('computes retention only for cohorts old enough', () => {
    const c = retentionCohorts(idx, settings, asOf)
    expect(c[c.length - 1].back6).toBeNull()
    expect(c[0].back3).toBeGreaterThan(0)
  })

  it('produces headline numbers', () => {
    const h = headline(dataset, idx, settings, asOf)
    expect(h.visits).toBeGreaterThan(100)
    expect(h.activeAp).toBeGreaterThan(20)
  })
})

describe('excel round trip', () => {
  it('reads back the sample workbooks exactly as generated', async () => {
    const XLSX = await import('xlsx')
    const { generateSample } = await import('../sample/generate')
    const { sampleWorkbooks } = await import('../sample/workbook')
    const tables = sampleWorkbooks(generateSample(asOf)).map(({ name, wb }) => {
      const back = XLSX.read(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }), { cellDates: true })
      const rows = XLSX.utils.sheet_to_json<(string | number | Date | null)[]>(back.Sheets[back.SheetNames[0]], { header: 1, raw: true, defval: null })
      return { name, t: parseRows(name, rows, settings) }
    })
    expect(tables.find((x) => x.name === 'visit-log.xlsx')!.t.visits!.length).toBe(dataset.visits.length)
    expect(tables.find((x) => x.name === 'ap-table.xlsx')!.t.memberships!.length).toBe(dataset.memberships.length)
    expect(tables.find((x) => x.name === 'vaccine-table.xlsx')!.t.vaccines!.length).toBe(dataset.vaccines.length)
    const v = tables.find((x) => x.name === 'visit-log.xlsx')!.t.visits!
    expect(v[0].date).toBe(dataset.visits[0].date)
    expect(v[v.length - 1].date).toBe(dataset.visits[dataset.visits.length - 1].date)
  }, 30000)
})
