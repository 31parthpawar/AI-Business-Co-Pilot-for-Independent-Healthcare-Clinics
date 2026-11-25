// "What to post this month": topic ideas from the clinic's own data plus a seasonal calendar.
// Plain rules, no AI, so this works today. Writing the post itself is the AI part (coming soon).
import { addDays, addMonths, format } from 'date-fns'
import type { Dataset } from '../types'
import { sessionLoad, visitsByMonthAndYear } from './metrics'
import type { Index } from './patients'

export interface Topic {
  id: string
  title: string
  why: string
  kind: 'Health education' | 'Clinic notice'
  sampleId?: string
}

// A default calendar for a pediatric clinic in north India. Belongs in Settings once there are other specialties.
const SEASONAL: Record<number, { title: string; why: string; sampleId?: string }> = {
  0: { title: 'Keeping children warm without overheating', why: 'Peak winter' },
  1: { title: 'Exam-time sleep and food for school children', why: 'Board and school exams' },
  2: { title: 'Holi: protecting eyes and skin', why: 'Holi in March' },
  3: { title: 'Heat and hydration: signs of dehydration', why: 'Summer starts' },
  4: { title: 'Summer diarrhoea and ORS: how to make and give it', why: 'Peak heat' },
  5: { title: 'Safe water and food during the heat', why: 'Monsoon is near' },
  6: { title: 'Dengue season: signs to watch', why: 'Monsoon fevers begin', sampleId: 'dengue' },
  7: { title: 'Dengue and malaria: when to see a doctor', why: 'Peak monsoon fevers', sampleId: 'dengue' },
  8: { title: 'Typhoid: safe food and water after the rains', why: 'Late monsoon' },
  9: { title: 'Diwali safety: burns, noise and smoke', why: 'Festival season' },
  10: { title: 'Air pollution and children’s breathing', why: 'Smog season in Delhi NCR' },
  11: { title: 'Flu season: when a cough needs a doctor', why: 'Winter infections' },
}

export function postTopics(ds: Dataset, idx: Index, asOf: Date): Topic[] {
  const out: Topic[] = []

  // 1. A busy month ahead, from past years.
  const season = visitsByMonthAndYear(ds, asOf)
  const avgOf = (m: number) => {
    const vals = season.years.map((y) => season.rows[m][y]).filter((v): v is number => typeof v === 'number')
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0
  }
  const yearAvg = Array.from({ length: 12 }, (_, m) => avgOf(m)).reduce((a, b) => a + b, 0) / 12
  for (const ahead of [1, 2]) {
    const m = addMonths(asOf, ahead).getMonth()
    const lift = yearAvg ? avgOf(m) / yearAvg - 1 : 0
    if (lift >= 0.12) {
      const cal = SEASONAL[m]
      out.push({
        id: `busy-${m}`,
        title: cal.title,
        why: `Visits usually run ${Math.round(lift * 100)}% above average in ${format(new Date(2000, m, 1), 'MMMM')}. Posting now reaches parents before the rush.`,
        kind: 'Health education',
        sampleId: cal.sampleId,
      })
      break
    }
  }

  // 2. Vaccines coming due: answer parents' questions before they come in.
  const today = format(asOf, 'yyyy-MM-dd')
  const in30 = format(addDays(asOf, 30), 'yyyy-MM-dd')
  const due = new Map<string, Set<string>>()
  for (const p of idx.patients.values())
    for (const r of p.vaccines)
      if (!r.givenDate && r.dueDate >= today && r.dueDate <= in30) {
        const key = r.vaccine.replace(/\s*\d+$/, '').trim()
        if (!due.has(key)) due.set(key, new Set())
        due.get(key)!.add(p.caseNo)
      }
  const top = [...due.entries()].sort((a, b) => b[1].size - a[1].size)[0]
  if (top && top[1].size >= 5)
    out.push({
      id: 'vaccine-due',
      title: `${top[0]} vaccine: what parents ask`,
      why: `${top[1].size} children are due for ${top[0]} in the next 30 days. A post answers common questions before the visit.`,
      kind: 'Health education',
      sampleId: '9-months',
    })

  // 3. This month's seasonal topic.
  const cal = SEASONAL[asOf.getMonth()]
  if (!out.some((t) => t.title === cal.title))
    out.push({ id: `season-${asOf.getMonth()}`, title: cal.title, why: `${cal.why}. A timely topic parents are already asking about.`, kind: 'Health education', sampleId: cal.sampleId ?? 'fever-myths' })

  // 4. A clinic notice that spreads the load, when evenings are much busier than mornings.
  const load = sessionLoad(ds, asOf).slice(0, 6)
  const mor = load.reduce((a, d) => a + d.M, 0) / load.length
  const eve = load.reduce((a, d) => a + (d.E ?? 0), 0) / load.length
  if (eve > mor * 1.3)
    out.push({
      id: 'mornings',
      title: 'Notice: shorter waits in the morning',
      why: `Evenings average ${Math.round(eve)} patients a session against ${Math.round(mor)} in the morning. A notice with morning timings can spread the load.`,
      kind: 'Clinic notice',
      sampleId: 'notice',
    })

  return out.slice(0, 4)
}
