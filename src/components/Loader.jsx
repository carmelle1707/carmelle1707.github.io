import { useEffect, useState } from 'react'

const LOADING_DURATION_MS = 5600
const READY_DURATION_MS = 1100
const EXIT_DURATION_MS = 750

const messages = [
  { text: 'Initializing Carmelle.exe...', threshold: 5 },
  { text: 'Loading creativity...', threshold: 23 },
  { text: 'Loading projects...', threshold: 41 },
  { text: 'Connecting to AI...', threshold: 59 },
  { text: 'Exploring new technologies...', threshold: 77 },
]

function Loader({ onComplete }) {
  const [progress, setProgress] = useState(0)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const startTime = performance.now()
    const intervalId = window.setInterval(() => {
      const elapsed = performance.now() - startTime
      const nextProgress = Math.min(
        Math.floor((elapsed / LOADING_DURATION_MS) * 100),
        100,
      )

      setProgress(nextProgress)

      if (nextProgress === 100) {
        window.clearInterval(intervalId)
      }
    }, 40)

    return () => window.clearInterval(intervalId)
  }, [])

  useEffect(() => {
    if (progress < 100) return undefined

    const exitTimer = window.setTimeout(
      () => setIsExiting(true),
      READY_DURATION_MS,
    )
    const completeTimer = window.setTimeout(
      onComplete,
      READY_DURATION_MS + EXIT_DURATION_MS,
    )

    return () => {
      window.clearTimeout(exitTimer)
      window.clearTimeout(completeTimer)
    }
  }, [onComplete, progress])

  const activeMessage = messages
    .filter((message) => progress >= message.threshold)
    .at(-1)

  return (
    <main
      aria-label="Chargement de Carmelle"
      className={`fixed inset-0 z-50 flex min-h-[100svh] items-center overflow-y-auto bg-[#191416] px-6 py-12 text-[#F2ECE6] transition-opacity duration-700 ease-out motion-reduce:transition-none sm:px-12 sm:py-16 ${
        isExiting ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
      <section className="mx-auto w-full max-w-4xl">
        <div className="mt-24 max-w-xl sm:mt-32">
          <p
            aria-live="polite"
            className="min-h-7 font-sans text-base text-[#F2ECE6]/80 sm:text-lg"
          >
            {progress === 100 ? (
              'SYSTEM READY'
            ) : activeMessage ? (
              <span key={activeMessage.text} className="log-enter inline-block">
                {activeMessage.text}
              </span>
            ) : null}
          </p>

          <div className="mt-7 flex max-w-xs items-center gap-3 sm:mt-8">
          <div
            aria-label="Progression du chargement"
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={progress}
            className="h-px flex-1 bg-[#F2ECE6]/20"
            role="progressbar"
          >
            <span
              className="block h-full bg-[#C8796A] transition-[width] duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
            <span className="w-9 text-right font-sans text-xs tabular-nums text-[#F2ECE6]/60">
              {progress}%
            </span>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Loader