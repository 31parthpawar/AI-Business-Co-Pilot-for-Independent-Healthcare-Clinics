// Sample posts for the "See a sample" view of the post generator (an AI feature, not live yet).
// Health education and neutral clinic notices only: NMC guidelines (Oct 2026) bar promotional claims,
// offers, testimonials and misleading AI-generated promotion. Every post carries a disclaimer and the
// doctor approves it before sharing.

export interface Slide {
  heading: string
  body?: string
  points?: string[]
  tone?: 'cover' | 'plain' | 'warning'
}

export interface SamplePost {
  id: string
  kind: 'Health education' | 'Clinic notice'
  format: string
  language: 'English' | 'Hindi'
  title: string
  why: string
  slides: Slide[]
  caption: string
  hashtags: string[]
  disclaimer: string
}

export function samplePosts(clinicName: string, timings: string): SamplePost[] {
  const sign = `${clinicName} · ${timings}`
  const disclaimer = 'For information only. Please consult your doctor about your child.'
  return [
    {
      id: 'dengue',
      kind: 'Health education',
      format: 'Carousel, 5 slides',
      language: 'English',
      title: 'Dengue season: signs to watch in your child',
      why: 'Picked when the clinic’s visits usually rise in the months ahead (monsoon fevers). Posting before the peak reaches parents early.',
      slides: [
        { tone: 'cover', heading: 'Dengue season is here', body: 'What every parent should watch for' },
        { heading: 'Common signs', points: ['High fever for 2 to 7 days', 'Headache, pain behind the eyes', 'Body and joint ache', 'Rash'] },
        { tone: 'warning', heading: 'See a doctor at once if', points: ['Severe belly pain or repeated vomiting', 'Bleeding gums or nose', 'Very sleepy or restless', 'Cold, clammy hands and feet'], body: 'Danger signs often appear as the fever comes down.' },
        { heading: 'At home', points: ['Plenty of fluids: water, ORS, coconut water', 'Paracetamol only for fever', 'No ibuprofen or aspirin'] },
        { heading: 'Stop the mosquito', points: ['Empty coolers, pots and trays every week', 'Full sleeves, especially in the daytime', 'Nets and repellent'] },
      ],
      caption:
        'Dengue cases rise every monsoon. Most children recover well, but a few warning signs need a doctor straight away. Save this post and share it with other parents.',
      hashtags: ['#DengueAwareness', '#ChildHealth', '#MonsoonCare', '#Parenting'],
      disclaimer,
    },
    {
      id: '9-months',
      kind: 'Health education',
      format: 'Carousel, 4 slides',
      language: 'English',
      title: "Your baby at 9 months: what's due",
      why: 'Picked when many children in the vaccine table are due for 9-month vaccines. A post answers parents before they come in.',
      slides: [
        { tone: 'cover', heading: 'Your baby at 9 months', body: 'Vaccines, milestones and food' },
        { heading: 'Vaccines usually due', points: ['MMR, first dose (measles, mumps, rubella)', 'Typhoid conjugate vaccine, now or soon after'], body: 'Your doctor will confirm what your child needs.' },
        { heading: 'Milestones', points: ['Sits without support', 'Crawls or tries to', 'Babbles "mama", "dada"', 'Picks things up with thumb and finger'] },
        { heading: 'Food', points: ['Three small meals of mashed family food', 'Continue breastfeeding', 'No added salt or sugar'] },
      ],
      caption: "Nine months is a busy check-up: vaccines, milestones and moving to family food. Bring your child's vaccination card to the visit.",
      hashtags: ['#BabyMilestones', '#Vaccination', '#ChildHealth'],
      disclaimer,
    },
    {
      id: 'fever-myths',
      kind: 'Health education',
      format: 'Single post',
      language: 'English',
      title: 'Fever: 3 myths and facts',
      why: 'Fever is the most common reason children are brought in. Myth-and-fact posts are easy to read and share.',
      slides: [
        {
          tone: 'plain',
          heading: 'Fever: myths and facts',
          points: [
            'Myth: every fever needs antibiotics. Fact: most fevers in children are viral, and antibiotics don’t work on viruses.',
            'Myth: the higher the fever, the more serious. Fact: how your child looks and behaves matters more.',
            'Myth: sponge with cold water or ice. Fact: use lukewarm water, only if your child is uncomfortable.',
          ],
        },
      ],
      caption: 'Fever is the body fighting an infection. See a doctor if your child is under 3 months, very sleepy, breathing fast, not drinking, or has had fever for more than 3 days.',
      hashtags: ['#FeverInKids', '#MythVsFact', '#ChildHealth'],
      disclaimer,
    },
    {
      id: 'fever-hindi',
      kind: 'Health education',
      format: 'Single post',
      language: 'Hindi',
      title: 'बुखार: 3 गलतफहमियाँ',
      why: 'The same post in Hindi. The generator would write in English, Hindi or Hinglish.',
      slides: [
        {
          tone: 'plain',
          heading: 'बुखार: गलतफहमी और सच',
          points: [
            'हर बुखार में एंटीबायोटिक ज़रूरी नहीं। बच्चों में ज़्यादातर बुखार वायरल होते हैं।',
            'बुखार कितना है, उससे ज़्यादा ज़रूरी है कि बच्चा कैसा दिख रहा है।',
            'ठंडे पानी या बर्फ़ से पट्टी न करें। गुनगुने पानी से पोंछें।',
          ],
        },
      ],
      caption: 'बच्चा बहुत सुस्त हो, तेज़ साँस ले रहा हो, पानी न पी रहा हो, या 3 दिन से ज़्यादा बुखार हो, तो डॉक्टर को दिखाएँ।',
      hashtags: ['#बच्चोंकीसेहत', '#ChildHealth'],
      disclaimer: 'केवल जानकारी के लिए। कृपया अपने डॉक्टर से सलाह लें।',
    },
    {
      id: 'notice',
      kind: 'Clinic notice',
      format: 'Story',
      language: 'English',
      title: 'Vaccination morning this Sunday',
      why: 'Picked when evenings are much busier than mornings. A notice about a vaccination morning spreads the load. Notices give facts only, no offers.',
      slides: [
        { tone: 'cover', heading: 'Vaccination morning', body: 'Sunday, 7 December · 10 am to 1 pm' },
        { heading: 'Please bring', points: ["Your child's vaccination card", 'Any recent reports'], body: 'Walk in or call the clinic to book a time.' },
      ],
      caption: 'Vaccination morning this Sunday, 10 am to 1 pm. Bring the vaccination card.',
      hashtags: ['#Vaccination', '#ClinicUpdate'],
      disclaimer: sign,
    },
  ]
}

/** What posts never include. Shown on the Posts screen. */
export const POST_RULES = [
  'Health education and clinic notices only',
  'No offers, discounts or packages',
  'No patient photos, stories or testimonials',
  'No "best", "guaranteed" or before-and-after claims',
  'Every post says it is for information only',
  'The doctor reads and approves every post before it is shared',
]
