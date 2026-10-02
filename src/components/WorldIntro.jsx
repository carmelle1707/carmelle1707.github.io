import { useEffect, useState } from 'react'

function WorldIntro() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section
      aria-labelledby="world-intro-title"
      className="grid min-h-[100svh] place-items-center bg-[#191416] px-6 py-16 text-[#F2ECE6] sm:px-12"
    >
      <h2
        className={`max-w-4xl text-center font-serif text-4xl font-normal leading-[1.08] transition duration-1000 ease-out motion-reduce:scale-100 motion-reduce:opacity-100 motion-reduce:transition-none sm:text-6xl ${
          isVisible ? 'scale-100 opacity-100' : 'scale-[0.99] opacity-0'
        }`}
        id="world-intro-title"
      >
        BIENVENUE DANS MON MONDE
      </h2>
    </section>
  )
}

export default WorldIntro