import { useEffect, useRef, useState } from 'react'

function Introduction() {
  const sceneRef = useRef(null)
  const [immersionProgress, setImmersionProgress] = useState(0)

  useEffect(() => {
    let animationFrameId

    const updateProgress = () => {
      animationFrameId = undefined

      const scene = sceneRef.current
      if (!scene) return

      const sceneStart = window.scrollY + scene.getBoundingClientRect().top
      const scrollDistance = scene.offsetHeight - window.innerHeight
      const distanceScrolled = window.scrollY - sceneStart
      const nextProgress = scrollDistance > 0
        ? Math.min(Math.max(distanceScrolled / scrollDistance, 0), 1)
        : 0

      setImmersionProgress(nextProgress)
    }

    const handleScroll = () => {
      if (animationFrameId === undefined) {
        animationFrameId = window.requestAnimationFrame(updateProgress)
      }
    }

    updateProgress()
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
      if (animationFrameId !== undefined) {
        window.cancelAnimationFrame(animationFrameId)
      }
    }
  }, [])

  return (
    <main
      className="min-h-[140svh] bg-[#191416] text-[#F2ECE6]"
      data-immersion-progress={immersionProgress.toFixed(3)}
      ref={sceneRef}
    >
      <div className="sticky top-0 grid min-h-[100svh] place-items-center overflow-hidden px-6 py-16 sm:px-12">
        <section className="scene-enter w-full max-w-4xl text-center">
          <h1 className="font-serif text-5xl font-normal leading-[1.08] sm:text-7xl">
            Hey <span aria-hidden="true">👋🏾</span> I'm Carmelle.
          </h1>
        </section>

        <aside className="absolute inset-x-6 bottom-8 flex flex-col items-center gap-4 text-center sm:bottom-10">
          <div
            aria-label="Emplacement réservé au mini-avatar de Carmelle"
            className="h-16 w-16 rounded-full border border-[#F2ECE6]/20"
            data-avatar-slot
          />
          <p className="max-w-xs font-sans text-sm text-[#F2ECE6]/70 sm:text-base">
            Viens, je vais te montrer mon monde
            <span aria-hidden="true" className="ml-2 text-[#C8796A]">↓</span>
          </p>
        </aside>
      </div>
    </main>
  )
}

export default Introduction