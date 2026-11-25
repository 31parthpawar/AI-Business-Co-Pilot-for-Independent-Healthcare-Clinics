// Writes the sample clinic's sheets to app/sample-data/ in the clinic's layout.
// Run: npm run sample   (optional end date: npm run sample -- 2026-12-09)
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import * as XLSX from 'xlsx'
import { generateSample } from '../src/sample/generate'
import { sampleWorkbooks } from '../src/sample/workbook'

const asOf = process.argv[2] ? new Date(`${process.argv[2]}T00:00:00`) : new Date()
const dir = resolve(import.meta.dirname, '../../sample-data')
mkdirSync(dir, { recursive: true })
for (const { name, wb } of sampleWorkbooks(generateSample(asOf))) {
  writeFileSync(resolve(dir, name), XLSX.write(wb, { type: 'buffer', bookType: 'xlsx', compression: true }))
  console.log('wrote', name)
}
