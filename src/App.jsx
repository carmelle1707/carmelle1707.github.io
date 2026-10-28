import { useCallback, useState } from 'react'
import Introduction from './components/Introduction.jsx'
import Loader from './components/Loader.jsx'

function App() {
  const [isRevealed, setIsRevealed] = useState(false)
  const [isLoaderDone, setIsLoaderDone] = useState(false)

  const handleExit = useCallback(() => setIsRevealed(true), [])
  const handleDone = useCallback(() => setIsLoaderDone(true), [])

  return (
    <>
      {!isLoaderDone && <Loader onDone={handleDone} onExit={handleExit} />}
      <main>
        <Introduction isRevealed={isRevealed} />
      </main>
    </>
  )
}

export default App
