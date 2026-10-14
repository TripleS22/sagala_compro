import type { ReactNode } from 'react'
import AnimatedContent from '@/components/AnimatedContent'

const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/** Muncul halus saat di-scroll; tanpa animasi bila pengguna meminta gerak dikurangi. */
export default function Reveal({
  children,
  delay = 0,
  distance = 28,
  className = '',
}: {
  children: ReactNode
  delay?: number
  distance?: number
  className?: string
}) {
  if (reduced) return <div className={className}>{children}</div>
  return (
    <AnimatedContent distance={distance} duration={0.9} delay={delay} ease="power3.out" threshold={0.12} className={className}>
      {children}
    </AnimatedContent>
  )
}
