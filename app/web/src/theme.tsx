// Light / dark / follow the phone. Remembered per device (a viewer convenience, so localStorage is fine).
import { useEffect, useState } from 'react'
import { Icon } from './ui'

export type ThemePref = 'system' | 'light' | 'dark'
const KEY = 'clinic-copilot-theme'

function read(): ThemePref {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'light' || v === 'dark' ? v : 'system'
  } catch {
    return 'system'
  }
}

export function applyTheme(pref: ThemePref) {
  const root = document.documentElement
  if (pref === 'system') root.removeAttribute('data-theme')
  else root.setAttribute('data-theme', pref)
  // Keep the phone's status bar in step with the page.
  const dark = pref === 'dark' || (pref === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => {
    m.setAttribute('content', dark ? '#0d0d0d' : '#f4f4f1')
    m.removeAttribute('media')
  })
}

/** Apply the saved choice before React renders, so there's no flash of the wrong theme. */
export const initTheme = () => applyTheme(read())

const NEXT: Record<ThemePref, ThemePref> = { system: 'light', light: 'dark', dark: 'system' }
const LABEL: Record<ThemePref, string> = { system: 'Auto', light: 'Light', dark: 'Dark' }

export function ThemeToggle() {
  const [pref, setPref] = useState<ThemePref>(read)
  useEffect(() => {
    applyTheme(pref)
    try {
      if (pref === 'system') localStorage.removeItem(KEY)
      else localStorage.setItem(KEY, pref)
    } catch {
      // Private mode or blocked storage: the choice just isn't remembered.
    }
    if (pref !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const on = () => applyTheme('system')
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [pref])
  return (
    <button
      onClick={() => setPref(NEXT[pref])}
      className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-[13px] text-ink-2 ring-1 ring-[var(--border)]"
      aria-label={`Theme: ${LABEL[pref]}. Tap to change.`}
      title="Light, dark, or follow the phone"
    >
      <Icon name={pref === 'light' ? 'sun' : pref === 'dark' ? 'moon' : 'auto'} className="h-4 w-4" />
      {LABEL[pref]}
    </button>
  )
}
