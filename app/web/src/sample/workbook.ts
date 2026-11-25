// Writes the sample tables as .xlsx files in the clinic's layout (used by the app and the CLI script).
import * as XLSX from 'xlsx'
import type { SampleTables } from './generate'

export function sampleWorkbooks(t: SampleTables): { name: string; wb: XLSX.WorkBook }[] {
  const book = (sheet: string, rows: SampleTables['visitLog'], widths: number[]) => {
    const ws = XLSX.utils.aoa_to_sheet(rows, { cellDates: true, dateNF: 'dd/mm/yyyy' })
    ws['!cols'] = widths.map((w) => ({ wch: w }))
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, sheet)
    return wb
  }
  return [
    { name: 'visit-log.xlsx', wb: book('Visit log', t.visitLog, [11, 5, 9, 18, 9, 9, 28, 8, 8, 22, 14]) },
    { name: 'ap-table.xlsx', wb: book('Annual program', t.apTable, [6, 9, 18, 11, 5, 16, 9, 8, 13, 12, 12, 4, 6]) },
    { name: 'vaccine-table.xlsx', wb: book('Vaccines', t.vaccineTable, [9, 18, 16, 12, 12]) },
  ]
}
