import { useLayoutEffect, useRef } from 'react'
import { aboutScene, intro } from '../content.js'
import AvatarSlot from './AvatarSlot.jsx'

// Fenêtres de progression (0 → 1) de chaque mouvement le long de la scène.
// Le dernier quart reste immobile avant que le bloc sticky ne se libère.
const PHASES = {
  invite: [0, 0.12],
  title: [0.03, 0.42],
  avatar: [0.06, 0.46],
  rule: [0.34, 0.52],
  label: [0.4, 0.54],
  hook: [0.44, 0.6],
  text: [0.52, 0.68],
  notes: [0.6, 0.76],
}

const clamp01 = (value) => Math.min(Math.max(value, 0), 1)

const easeInOut = (value) => value * value * (3 - 2 * value)

// Position dans la scène, sans tenir compte des transforms appliqués.
const getOffset = (element, stage) => {
  let x = 0
  let y = 0
  let current = element

  while (current && current !== stage) {
    x += current.offsetLeft
    y += current.offsetTop
    current = current.offsetParent
  }

  return { x, y }
}

// Même texte pour le titre et sa place finale, pour que les retours à la ligne coïncident.
function Greeting() {
  return (
    <>
      {intro.greeting} <span aria-hidden="true">{intro.wave}</span>
      <br className="sm:hidden" /> {intro.name}
    </>
  )
}

const greetingType = 'font-serif font-light leading-[1.02] tracking-[-0.02em] sm:whitespace-nowrap'

function Introduction({ isRevealed }) {
  const sceneRef = useRef(null)
  const stageRef = useRef(null)
  const titleRef = useRef(null)
  const titleGhostRef = useRef(null)
  const avatarRef = useRef(null)
  const avatarGhostRef = useRef(null)

  useLayoutEffect(() => {
    const scene = sceneRef.current
    const stage = stageRef.current
    let frameId

    const measure = () => {
      const title = getOffset(titleRef.current, stage)
      const titleGhost = getOffset(titleGhostRef.current, stage)
      const titleSize = parseFloat(getComputedStyle(titleRef.current).fontSize)
      const ghostSize = parseFloat(getComputedStyle(titleGhostRef.current).fontSize)
      scene.style.setProperty('--title-dx', `${titleGhost.x - title.x}px`)
      scene.style.setProperty('--title-dy', `${titleGhost.y - title.y}px`)
      scene.style.setProperty('--title-scale', (ghostSize / titleSize).toFixed(4))

      const avatar = getOffset(avatarRef.current, stage)
      const avatarGhost = getOffset(avatarGhostRef.current, stage)
      scene.style.setProperty('--avatar-dx', `${avatarGhost.x - avatar.x}px`)
      scene.style.setProperty('--avatar-dy', `${avatarGhost.y - avatar.y}px`)
      scene.style.setProperty(
        '--avatar-scale',
        (avatarGhostRef.current.offsetWidth / avatarRef.current.offsetWidth).toFixed(4),
      )
    }

    const update = () => {
      frameId = undefined

      const distance = scene.offsetHeight - stage.offsetHeight
      const progress = distance > 0
        ? clamp01(-scene.getBoundingClientRect().top / distance)
        : 0

      for (const [name, [start, end]] of Object.entries(PHASES)) {
        const phase = easeInOut(clamp01((progress - start) / (end - start)))
        scene.style.setProperty(`--p-${name}`, phase.toFixed(4))
      }
    }

    const requestUpdate = () => {
      frameId ??= window.requestAnimationFrame(update)
    }

    const resizeObserver = new ResizeObserver(() => {
      measure()
      requestUpdate()
    })

    measure()
    update()
    resizeObserver.observe(stage)
    resizeObserver.observe(titleRef.current)
    resizeObserver.observe(titleGhostRef.current)
    window.addEventListener('scroll', requestUpdate, { passive: true })

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('scroll', requestUpdate)
      if (frameId !== undefined) window.cancelAnimationFrame(frameId)
    }
  }, [])

  return (
    <div
      className="scene min-h-[220svh] lg:min-h-[240svh]"
      data-revealed={isRevealed || undefined}
      ref={sceneRef}
    >
      <div
        className="scene-stage sticky top-0 flex min-h-svh flex-col justify-center overflow-x-clip px-6 py-10 sm:px-12 sm:py-14"
        ref={stageRef}
      >
        <div className="scene-intro absolute inset-x-0 top-0 flex h-svh flex-col items-center justify-center px-6 sm:px-12">
          <h1
            className={`scene-title enter w-fit text-[clamp(2.75rem,14.5vw,3.75rem)] sm:text-[clamp(3rem,9vw,9rem)] ${greetingType}`}
            lang="en"
            ref={titleRef}
          >
            <Greeting />
          </h1>

          <div className="mt-10 sm:mt-12" ref={avatarRef}>
            <div className="enter" style={{ '--enter-delay': '200ms' }}>
              <AvatarSlot className="scene-avatar w-[4.5rem]" />
            </div>
          </div>

          <div className="enter absolute inset-x-6 bottom-8 sm:bottom-10" style={{ '--enter-delay': '450ms' }}>
            <p className="scene-invite text-center text-sm text-ivory/70 sm:text-base">
              {intro.invitation}
              <span aria-hidden="true" className="ml-2 text-coral">↓</span>
            </p>
          </div>
        </div>

        <div className="mx-auto w-full max-w-6xl">
          <p aria-hidden="true" className={`scene-ghost invisible w-fit text-[2.125rem] sm:text-[clamp(2.5rem,4.6vw,4.5rem)] ${greetingType}`} ref={titleGhostRef}>
            <Greeting />
          </p>

          <span aria-hidden="true" className="scene-rule mt-5 block h-px bg-coral sm:mt-7" />

          <section
            aria-labelledby="about-label"
            className="mt-8 grid grid-cols-[3rem_minmax(0,1fr)] items-center gap-x-4 gap-y-5 sm:mt-12 lg:grid-cols-12 lg:items-start lg:gap-x-10 lg:gap-y-6"
            lang="en"
          >
            <div
              aria-hidden="true"
              className="scene-ghost invisible w-12 lg:col-span-2 lg:row-span-2 lg:w-20"
              ref={avatarGhostRef}
            >
              <div className="aspect-square" />
            </div>

            <h2
              className="scene-reveal scene-label text-[0.95rem] font-medium text-coral lg:col-span-6 lg:col-start-3 lg:row-start-1"
              data-phase="label"
              id="about-label"
            >
              {aboutScene.label}
            </h2>

            <p
              className="scene-reveal col-span-2 max-w-[20ch] font-serif text-[1.625rem] italic leading-[1.18] sm:text-[clamp(2rem,3.4vw,3rem)] lg:col-span-6 lg:col-start-3 lg:row-start-2"
              data-phase="hook"
            >
              {aboutScene.hook}
            </p>

            <div className="col-span-2 lg:col-span-4 lg:col-start-9 lg:row-start-2 lg:pt-2">
              <p
                className="scene-reveal max-w-[42ch] text-[0.95rem] leading-relaxed text-ivory/75 sm:text-[1.0625rem]"
                data-phase="text"
              >
                {aboutScene.text}
              </p>

              <ul
                className="scene-reveal mt-5 space-y-1.5 border-t border-ivory/15 pt-4 text-sm text-ivory/60 sm:mt-7"
                data-phase="notes"
              >
                {aboutScene.notes.map(({ kind, detail }) => (
                  <li key={kind}>
                    <span className="text-ivory">{kind}</span> · {detail}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default Introduction
