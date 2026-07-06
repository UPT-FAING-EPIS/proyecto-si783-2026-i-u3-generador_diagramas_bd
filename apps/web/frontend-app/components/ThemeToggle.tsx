'use client'
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import { useMounted } from '@/hooks/useMounted'

export function ThemeToggle() {
  const mounted = useMounted()
  const { resolvedTheme, setTheme } = useTheme()

  if (!mounted) return <div className="w-8 h-8" />

  return (
    <button
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-lg text-muted-foreground hover:text-[#1A6CF6] hover:bg-muted transition-colors"
      aria-label="Cambiar tema"
    >
      {resolvedTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}
