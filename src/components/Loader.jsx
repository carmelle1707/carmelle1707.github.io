import { useEffect, useRef, useState } from 'react'

const messages = [
  'Opening my sketchbook…',
  'Mixing ideas with code…',
  'Following my curiosity…',
  'Okay, come on in.',
]

// Environ 3 s : quatre messages de 650 ms, puis 450 ms de fondu.
const TIMINGS = {
  default: { step: 650, exit: 450 },
  reducedMotion: { step: 250, exit: 0 },
}

const DISMISS_EVENTS = ['wheel', 'touchstart', 'keydown', 'pointerdown']

function Loader({ onExit, onDone }) {
  const [index, setIndex] = useState(0)
  const [isLeaving, setIsLeaving] = useState(false)
  const [timing] = useState(() =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? TIMINGS.reducedMotion
      : TIMINGS.default,
  )
  const leaveRef = useRef(() => setIsLeaving(true))

  useEffect(() => {
    const timers = messages.slice(1).map((_, i) =>
      window.setTimeout(() => setIndex(i + 1), (i + 1) * timing.step),
    )
    timers.push(window.setTimeout(leaveRef.current, messages.length * timing.step))

    return () => timers.forEach(window.clearTimeout)
  }, [timing])

  // Le loader ne retient jamais le visiteur : le moindre geste le fait partir.
  useEffect(() => {
    const leave = leaveRef.current
    DISMISS_EVENTS.forEach((type) => window.addEventListener(type, leave, { passive: true }))
    return () => DISMISS_EVENTS.forEach((type) => window.removeEventListener(type, leave))
  }, [])

  useEffect(() => {
    if (!isLeaving) return undefined
    onExit()
    const timer = window.setTimeout(onDone, timing.exit)
    return () => window.clearTimeout(timer)
  }, [isLeaving, onDone, onExit, timing])

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center bg-plum px-6 transition-opacity duration-[450ms] ease-out motion-reduce:transition-none sm:px-12 ${
        isLeaving ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
      lang="en"
      role="status"
    >
      <div className="mx-auto w-full max-w-md">
        <p className="min-h-[1.3em] font-serif text-[1.75rem] font-light italic leading-tight sm:text-4xl">
          <span className="loader-message inline-block" key={messages[index]}>
            {messages[index]}
          </span>
        </p>
        <span aria-hidden="true" className="mt-6 block h-px bg-ivory/15">
          <span
            className="loader-stroke block h-full bg-coral"
            style={{ '--loader-duration': `${messages.length * timing.step}ms` }}
          />
        </span>
      </div>
    </div>
  )
}

export default Loader
