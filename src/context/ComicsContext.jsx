import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { listarComics } from '../lib/comics'

// Una colección personal son cientos o pocos miles de comics: se trae entera una vez
// y se filtra en memoria, así la búsqueda responde al instante mientras escribís.
const ComicsContext = createContext(null)

export function ComicsProvider({ children }) {
  const [comics, setComics] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const recargar = useCallback(async () => {
    setCargando(true)
    setError(null)
    try {
      setComics(await listarComics())
    } catch (e) {
      setError(e.message)
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial desde la API
    recargar()
  }, [recargar])

  // Después de guardar se actualiza la lista local en vez de volver a pedir todo.
  const guardarLocal = useCallback((comic) => {
    setComics((actuales) => {
      const sinEl = actuales.filter((c) => c.id !== comic.id)
      return [comic, ...sinEl]
    })
  }, [])

  const quitarLocal = useCallback((id) => {
    setComics((actuales) => actuales.filter((c) => c.id !== id))
  }, [])

  const valor = useMemo(
    () => ({ comics, cargando, error, recargar, guardarLocal, quitarLocal }),
    [comics, cargando, error, recargar, guardarLocal, quitarLocal],
  )

  return <ComicsContext.Provider value={valor}>{children}</ComicsContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useComics() {
  return useContext(ComicsContext)
}
