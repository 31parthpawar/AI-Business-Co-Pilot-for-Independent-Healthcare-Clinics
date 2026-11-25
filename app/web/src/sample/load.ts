// Builds the demo dataset by running the generated sheets through the real importer.
import { parseRows } from '../import/parse'
import type { Dataset, Settings, Targets } from '../types'
import { generateSample } from './generate'

export function sampleDataset(asOf: Date, settings: Settings): { dataset: Dataset; targets: Targets } {
  const t = generateSample(asOf)
  const visits = parseRows('Visit log', t.visitLog, settings).visits ?? []
  const memberships = parseRows('AP table', t.apTable, settings).memberships ?? []
  const vaccines = parseRows('Vaccine table', t.vaccineTable, settings).vaccines ?? []
  return {
    dataset: { visits, memberships, vaccines, kind: 'sample', importedAt: new Date().toISOString() },
    targets: t.suggestedTargets,
  }
}
