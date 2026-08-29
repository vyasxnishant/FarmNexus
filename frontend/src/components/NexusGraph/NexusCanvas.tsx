import { Suspense, lazy } from 'react'
import { useIsMobile } from '../../hooks/useIsMobile'
import { useReducedMotion } from '../../hooks/useReducedMotion'

const NexusScene = lazy(() => import('./NexusScene'))

interface NexusCanvasProps {
  scrollProgress: number
}

export function NexusCanvas({ scrollProgress }: NexusCanvasProps) {
  const isMobile = useIsMobile()
  const reducedMotion = useReducedMotion()

  // Mobile fallback: static/CSS-animated background instead of full R3F
  if (isMobile) {
    return (
      <div
        className="fixed inset-0 z-0"
        aria-hidden="true"
      >
        {/* Animated dot pattern fallback for mobile */}
        <div className="absolute inset-0 bg-monsoon">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `radial-gradient(circle, #5FD0C0 1px, transparent 1px), radial-gradient(circle, #E4A335 1px, transparent 1px)`,
            backgroundSize: '60px 60px, 90px 90px',
            backgroundPosition: '0 0, 30px 30px',
            animation: reducedMotion ? 'none' : 'mobilePulse 4s ease-in-out infinite',
          }} />
        </div>
        <style>{`
          @keyframes mobilePulse {
            0%, 100% { opacity: 0.15; }
            50% { opacity: 0.3; }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 z-0"
      aria-hidden="true"
      role="presentation"
    >
      <Suspense fallback={
        <div className="w-full h-full bg-monsoon" />
      }>
        <NexusScene scrollProgress={scrollProgress} reducedMotion={reducedMotion} />
      </Suspense>
    </div>
  )
}
