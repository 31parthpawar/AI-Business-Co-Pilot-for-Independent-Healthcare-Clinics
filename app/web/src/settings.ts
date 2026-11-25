import type { Settings } from './types'

// Nothing clinic-specific belongs in code: these are defaults the Settings screen can change.
export const NOT_RECORDED = 'Not recorded'

export const defaultSettings: Settings = {
  clinicName: 'Demo Pediatric Clinic',
  clinicTimings: 'Mon to Sat 10 am to 1 pm, 5 to 8 pm · Sun 10 am to 1 pm',
  serviceMap: {
    opd: 'OPD',
    consultation: 'OPD',
    vaccine: 'VACCINE',
    vaccination: 'VACCINE',
    vac: 'VACCINE',
    ap: 'AP',
    'annual program': 'AP',
  },
  sources: ['Word of mouth', 'Google', 'Doctor referral', 'Walk-in', 'Other'],
  sourceKeywords: {
    // Single letters only match a whole value (the register's one-letter code), longer words match anywhere.
    'Word of mouth': ['word of mouth', 'wom', 'friend', 'relative', 'family', 'neighbour', 'neighbor', 'w'],
    Google: ['google', 'maps', 'search', 'g'],
    'Doctor referral': ['ref', 'referral', 'referred', 'dr', 'hospital', 'r'],
    'Walk-in': ['walk', 'nearby', 'near', 'board', 'passing', 'l'],
    Other: ['practo', 'justdial', 'instagram', 'facebook', 'camp', 'school', 'other', 'o'],
  },
  targets: { paidOpd: 0, apSales: 0, vaccinePatients: 0, opdRevenue: 0, apRevenue: 0 },
  thresholds: {
    renewalWindowDays: 30,
    lapsedMinVisits: 3,
    lapsedGapMultiple: 2,
    lapsedMinDays: 60,
    lapsedMaxDays: 365,
    unusedApMonths: 6,
    unusedApMaxVisits: 1,
    vaccineMaxOverdueDays: 120,
    warmupMonths: 3,
  },
  apVaccineDiscount: 0.1,
  earningsOn: false,
}
