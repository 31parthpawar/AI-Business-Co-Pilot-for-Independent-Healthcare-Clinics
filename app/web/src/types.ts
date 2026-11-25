// Data model, normalised from the clinic's sheets (see docs/prototype-spec.md).
// Dates are ISO strings (yyyy-MM-dd) so they store and compare cleanly.

export type Session = 'M' | 'E'
export type ServiceCat = 'OPD' | 'VACCINE' | 'AP' | 'OTHER'
export type PayMode = 'cash' | 'online' | 'other'

export interface Visit {
  date: string
  session: Session
  caseNo: string
  name: string
  serviceRaw: string
  service: ServiceCat
  detail: string
  vaccines: string[]
  amount: number
  mode: PayMode
  remark: string
  /** Optional Source column, filled for new patients (proposed for the pilot). */
  source: string
}

export interface Membership {
  caseNo: string
  name: string
  dob: string
  programName: string
  buying: 'new' | 'renewal' | 'unknown'
  amount: number
  paymentMode: PayMode
  joinDate: string
  expiryDate: string
}

export interface VaccineRecord {
  caseNo: string
  name: string
  vaccine: string
  givenDate: string
  dueDate: string
}

export interface Dataset {
  visits: Visit[]
  memberships: Membership[]
  vaccines: VaccineRecord[]
  kind: 'sample' | 'imported'
  importedAt: string
}

export type CallList = 'renewals' | 'vaccines' | 'lapsed' | 'unusedAp' | 'crossSell'
export type Outcome = 'reached' | 'not reached' | 'booked' | 'declined'

export interface CallOutcome {
  id?: number
  caseNo: string
  list: CallList
  date: string
  outcome: Outcome
}

export interface Targets {
  paidOpd: number
  apSales: number
  vaccinePatients: number
  opdRevenue: number
  apRevenue: number
}

export interface Settings {
  clinicName: string
  /** Shown at the end of posts. */
  clinicTimings: string
  /** Raw Service value (lower case) to category. */
  serviceMap: Record<string, ServiceCat>
  /** Canonical patient sources, in display order. */
  sources: string[]
  /** Words that map free text (Source or Remark) to a canonical source. */
  sourceKeywords: Record<string, string[]>
  targets: Targets
  thresholds: {
    renewalWindowDays: number
    lapsedMinVisits: number
    lapsedGapMultiple: number
    lapsedMinDays: number
    lapsedMaxDays: number
    unusedApMonths: number
    unusedApMaxVisits: number
    vaccineMaxOverdueDays: number
    /** Months at the start of the data where everyone looks "new"; excluded from new-patient counts. */
    warmupMonths: number
  }
  /** AP discount on vaccines, 0 to 1. Unknown until the clinic confirms. */
  apVaccineDiscount: number
  earningsOn: boolean
}
