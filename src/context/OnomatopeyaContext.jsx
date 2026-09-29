import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { useMediaQuery } from '@mui/material'
import Onomatopeyas from '../components/Onomatopeyas'

// Las onomatopeyas viven arriba del router: si el clic navega (abrir un comic, guardar),
// la explosión termina de animarse sobre la página nueva en vez de cortarse.
const OnomatopeyaContext = createContext(() => {})

const DURACION_MS = 750

// Con mouse o touch se usa el punto exacto del clic. Con teclado (clientX = 0) o sin evento,
// el centro del elemento, así la explosión sale del botón que se activó.
function puntoDe(origen) {
  if (origen && 'clientX' in origen && (origen.clientX || origen.clientY)) {
    return { x: origen.clientX, y: origen.clientY }
  }
  const elemento = origen?.currentTarget ?? origen
  if (elemento?.getBoundingClientRect) {
    const r = elemento.getBoundingClientRect()
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
  }
  return { x: window.innerWidth / 2, y: window.innerHeight / 2 }
}

export function OnomatopeyaProvider({ children }) {
  const [explosiones, setExplosiones] = useState([])
  const siguienteId = useRef(0)
  const reducirMovimiento = useMediaQuery('(prefers-reduced-motion: reduce)')

  const explotar = useCallback(
    (origen, palabra) => {
      if (reducirMovimiento) return
      const id = siguienteId.current++
      const { x, y } = puntoDe(origen)
      // Un giro al azar para que dos explosiones seguidas no se vean idénticas.
      const giro = Math.round(Math.random() * 24 - 12)
      setExplosiones((actuales) => [...actuales, { id, x, y, palabra, giro }])
      setTimeout(() => setExplosiones((actuales) => actuales.filter((e) => e.id !== id)), DURACION_MS)
    },
    [reducirMovimiento],
  )

  const valor = useMemo(() => explotar, [explotar])

  return (
    <OnomatopeyaContext.Provider value={valor}>
      {children}
      <Onomatopeyas explosiones={explosiones} duracion={DURACION_MS} />
    </OnomatopeyaContext.Provider>
  )
}

// Uso: const explotar = useOnomatopeya(); explotar(evento, '¡BAM!')
// eslint-disable-next-line react-refresh/only-export-components
export function useOnomatopeya() {
  return useContext(OnomatopeyaContext)
}
