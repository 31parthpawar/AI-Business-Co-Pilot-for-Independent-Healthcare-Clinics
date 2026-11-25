// Reads Excel or CSV files in the browser with SheetJS and parses every sheet.
import * as XLSX from 'xlsx'
import type { Dataset, Settings } from '../types'
import { parseRows, type ParsedTable, type Row } from './parse'

export interface ImportReport {
  tables: ParsedTable[]
  files: string[]
}

export async function readFiles(files: File[], settings: Settings): Promise<ImportReport> {
  const tables: ParsedTable[] = []
  for (const f of files) {
    const wb = XLSX.read(await f.arrayBuffer(), { cellDates: true, dense: true })
    for (const name of wb.SheetNames) {
      const rows = XLSX.utils.sheet_to_json<Row>(wb.Sheets[name], { header: 1, raw: true, defval: null })
      const label = wb.SheetNames.length > 1 ? `${f.name} / ${name}` : f.name
      tables.push(parseRows(label, rows, settings))
    }
  }
  return { tables, files: files.map((f) => f.name) }
}

/** Replaces each kind of table that was found in the import; keeps the rest. */
export function mergeImport(prev: Dataset | null, report: ImportReport): Dataset {
  const found = (k: ParsedTable['kind']) => report.tables.filter((t) => t.kind === k)
  const visits = found('visits').flatMap((t) => t.visits ?? [])
  const memberships = found('memberships').flatMap((t) => t.memberships ?? [])
  const vaccines = found('vaccines').flatMap((t) => t.vaccines ?? [])
  const keep = prev?.kind === 'imported' ? prev : null
  return {
    visits: found('visits').length ? visits : keep?.visits ?? [],
    memberships: found('memberships').length ? memberships : keep?.memberships ?? [],
    vaccines: found('vaccines').length ? vaccines : keep?.vaccines ?? [],
    kind: 'imported',
    importedAt: new Date().toISOString(),
  }
}
