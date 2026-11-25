// Posts for social media: topic ideas from the clinic's data (works now) and the AI post writer (coming soon).
// Health education and neutral clinic notices only (NMC guidelines, Oct 2026).
import { useMemo, useState } from 'react'
import { POST_RULES, samplePosts, type SamplePost, type Slide } from '../content/samples'
import { postTopics } from '../logic/topics'
import { useApp } from '../store'
import { Card, ComingSoon, Icon, Sheet } from '../ui'

// Post colours are fixed: they stand in for the image that gets shared, so they don't follow the app theme.
const POST = { blue: '#2a78d6', deep: '#0d366b', ink: '#0b0b0b', ink2: '#52514e', paper: '#ffffff', warm: '#fff4e5', warmEdge: '#ec835a' }

function SlideCard({ slide, i, n, story, footer }: { slide: Slide; i: number; n: number; story: boolean; footer: string }) {
  const cover = slide.tone === 'cover'
  const warn = slide.tone === 'warning'
  const bg = cover ? POST.blue : warn ? POST.warm : POST.paper
  const fg = cover ? '#ffffff' : POST.ink
  return (
    <div
      className={`flex shrink-0 snap-center flex-col overflow-hidden rounded-2xl p-5 shadow-sm ${story ? 'aspect-[9/16] w-[210px]' : 'aspect-square w-[270px] sm:w-[300px]'}`}
      style={{ background: bg, color: fg, border: warn ? `2px solid ${POST.warmEdge}` : '1px solid rgba(11,11,11,0.08)' }}
    >
      <div className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: cover ? 'rgba(255,255,255,0.8)' : POST.blue }}>
        {n > 1 ? `${i + 1} / ${n}` : 'Post'}
      </div>
      <div className={`mt-2 font-bold leading-tight ${cover ? 'text-[26px]' : 'text-[19px]'}`}>{slide.heading}</div>
      {slide.body && <p className="mt-2 text-[14px] leading-snug" style={{ color: cover ? 'rgba(255,255,255,0.9)' : POST.ink2 }}>{slide.body}</p>}
      {slide.points && (
        <ul className="mt-3 space-y-1.5 text-[13.5px] leading-snug">
          {slide.points.map((p) => (
            <li key={p} className="flex gap-2">
              <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: warn ? POST.warmEdge : POST.blue }} />
              <span>{p}</span>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-auto pt-3 text-[10.5px] leading-tight" style={{ color: cover ? 'rgba(255,255,255,0.85)' : POST.ink2 }}>
        {footer}
      </div>
    </div>
  )
}

export function PostPreview({ post, sign }: { post: SamplePost; sign: string }) {
  const [copied, setCopied] = useState(false)
  const story = post.format.startsWith('Story')
  const text = `${post.caption}\n\n${post.hashtags.join(' ')}\n\n${post.disclaimer === sign ? sign : `${post.disclaimer}\n${sign}`}`
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // Clipboard blocked: the text is still visible to select by hand.
    }
  }
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 text-[12px]">
        <span className="rounded-full bg-accent-soft px-2 py-0.5 font-medium text-accent-ink">{post.kind}</span>
        <span className="text-ink-2">{post.format}</span>
        <span className="text-muted">·</span>
        <span className="text-ink-2">{post.language}</span>
      </div>
      <h3 className="mt-1.5 text-[16px] font-semibold text-ink">{post.title}</h3>
      <p className="mt-0.5 text-[13px] text-ink-2">{post.why}</p>
      <div className="-mx-5 mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2">
        {post.slides.map((s, i) => (
          <SlideCard key={i} slide={s} i={i} n={post.slides.length} story={story} footer={i === post.slides.length - 1 || post.slides.length === 1 ? `${post.disclaimer === sign ? '' : post.disclaimer + ' '}${sign}` : sign} />
        ))}
      </div>
      {post.slides.length > 1 && <p className="text-[12px] text-muted">Swipe to see all {post.slides.length} slides.</p>}
      <div className="mt-3 rounded-xl bg-surface p-3 text-[13px] ring-1 ring-[var(--border)]">
        <div className="mb-1 flex items-center justify-between">
          <span className="font-medium text-ink">Caption</span>
          <button onClick={copy} className="inline-flex items-center gap-1 text-accent-ink">
            <Icon name={copied ? 'check' : 'copy'} className="h-4 w-4" /> {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <p className="whitespace-pre-line text-ink-2">{text}</p>
      </div>
    </div>
  )
}

function SampleGallery({ posts, sign, start }: { posts: SamplePost[]; sign: string; start?: string }) {
  const [id, setId] = useState(start ?? posts[0].id)
  const post = posts.find((p) => p.id === id) ?? posts[0]
  return (
    <div>
      <div className="-mx-5 mb-4 flex gap-2 overflow-x-auto px-5">
        {posts.map((p) => (
          <button key={p.id} onClick={() => setId(p.id)} className={`shrink-0 rounded-full px-3 py-1.5 text-[13px] ${p.id === id ? 'bg-ink text-surface' : 'bg-surface text-ink-2 ring-1 ring-[var(--border)]'}`}>
            {p.language === 'Hindi' ? 'Hindi' : p.kind === 'Clinic notice' ? 'Notice' : p.format.split(',')[0]}: {p.title.length > 22 ? p.title.slice(0, 22) + '…' : p.title}
          </button>
        ))}
      </div>
      <PostPreview post={post} sign={sign} />
    </div>
  )
}

export function Posts() {
  const { dataset, derived, settings } = useApp()
  const { idx, asOf } = derived!
  const sign = `${settings.clinicName} · ${settings.clinicTimings}`
  const posts = useMemo(() => samplePosts(settings.clinicName, settings.clinicTimings), [settings.clinicName, settings.clinicTimings])
  const topics = useMemo(() => postTopics(dataset!, idx, asOf), [dataset, idx, asOf])
  const [openSample, setOpenSample] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      <Card title="Posts for social media" subtitle="Health education and clinic notices for Instagram, Facebook and WhatsApp status. They keep the clinic in front of families without advertising.">
        <div className="rounded-xl bg-surface-2 p-3">
          <div className="text-[13px] font-medium text-ink">Every post follows the NMC advertising guidelines (Oct 2026)</div>
          <ul className="mt-1.5 grid gap-1 text-[13px] text-ink-2 sm:grid-cols-2">
            {POST_RULES.map((r) => (
              <li key={r} className="flex gap-2">
                <span className="mt-[3px] text-good-ink"><Icon name="check" className="h-3.5 w-3.5" /></span>
                {r}
              </li>
            ))}
          </ul>
        </div>
      </Card>

      <Card title="What to post this month" subtitle="Picked from your clinic's data and the season. Works today; writing the post is coming soon.">
        <ul className="divide-y divide-line">
          {topics.map((t) => (
            <li key={t.id} className="py-3 first:pt-0 last:pb-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[14px] font-medium text-ink">{t.title}</span>
                <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] text-ink-2 ring-1 ring-[var(--border)]">{t.kind}</span>
              </div>
              <p className="mt-0.5 text-[13px] text-ink-2">{t.why}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {t.sampleId && (
                  <button onClick={() => setOpenSample(t.sampleId!)} className="rounded-lg bg-surface-2 px-3 py-1.5 text-[13px] text-ink ring-1 ring-[var(--border)]">
                    See a sample
                  </button>
                )}
                <button disabled className="rounded-lg px-3 py-1.5 text-[13px] text-muted ring-1 ring-[var(--border)]" title="Needs AI: coming soon">
                  Write this post · coming soon
                </button>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <ComingSoon
        title="Post and carousel writer"
        description="Turns a topic into a ready-to-share post in the clinic's name, for the doctor to check and approve."
        points={[
          'Carousels, single posts and stories, as images in the clinic’s colours',
          'English, Hindi or Hinglish',
          'Ends with the clinic’s name, timings and an "information only" line',
          'A monthly calendar: what to post and when, from the clinic’s busy months and vaccines due',
          'Checks every draft against the NMC rules above before showing it',
        ]}
        sampleTitle="Sample posts"
        sample={<SampleGallery posts={posts} sign={sign} />}
      />

      {openSample && (
        <Sheet title="Sample post" subtitle="Written by hand to show what the post writer will produce." onClose={() => setOpenSample(null)}>
          <SampleGallery posts={posts} sign={sign} start={openSample} />
        </Sheet>
      )}
    </div>
  )
}
