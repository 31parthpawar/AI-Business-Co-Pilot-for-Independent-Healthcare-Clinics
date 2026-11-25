// Everything stays on this device, in the browser's IndexedDB. Nothing is sent anywhere.
import Dexie, { type Table } from 'dexie'
import type { CallOutcome } from './types'

interface KV {
  key: string
  value: unknown
}

class ClinicDB extends Dexie {
  kv!: Table<KV, string>
  outcomes!: Table<CallOutcome, number>
  constructor() {
    super('clinic-copilot')
    this.version(1).stores({ kv: 'key', outcomes: '++id, caseNo, list, date' })
  }
}

export const db = new ClinicDB()

export async function getKV<T>(key: string): Promise<T | undefined> {
  return (await db.kv.get(key))?.value as T | undefined
}
export const setKV = (key: string, value: unknown) => db.kv.put({ key, value })

/** Asks the browser not to evict our data (matters most on iOS Safari). */
export async function requestPersistence() {
  try {
    if (navigator.storage?.persist && !(await navigator.storage.persisted())) await navigator.storage.persist()
  } catch {
    // Not supported: data still works, it just may be cleared under storage pressure.
  }
}
