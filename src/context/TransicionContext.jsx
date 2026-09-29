import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMediaQuery } from '@mui/material'
import { gsap } from 'gsap'
import PaginasTransicion from '../components/PaginasTransicion'

// Al abrir un comic desde la colección, varias hojas de cómic se dan vuelta una tras otra hasta
// tapar la pantalla; ahí (con todo tapado) cambia la ruta, y las hojas se vuelven a pasar hacia el
// otro lado revelando la página nueva. Viven arriba del router, como las onomatopeyas.
const TransicionContext = createContext({ ir: () => {}, conPaginas: () => {}, espera: () => 0 })

const CUBRIR = { duration: 0.4, stagger: 0.07, ease: 'power2.inOut' }
const REVELAR = { duration: 0.5, stagger: 0.07, ease: 'power2.inOut' }

export function TransicionProvider({ children }) {
  const navigate = useNavigate()
  const reducirMovimiento = useMediaQuery('(prefers-reduced-motion: reduce)')
  const raiz = useRef(null)
  const ocupado = useRef(false)
  const terminaEn = useRef(0)
  // Corre las portadas de las hojas después de cada transición para que la próxima no sea igual.
  const [desfase, setDesfase] = useState(0)

  const ir = useCallback(
    (destino) => {
      const el = raiz.current
      // Sin animación si el usuario pidió menos movimiento o si ya hay una en curso.
      if (reducirMovimiento || !el || ocupado.current) {
        navigate(destino)
        return
      }
      ocupado.current = true
      el.style.display = 'block'
      const paginas = [...el.querySelectorAll('[data-pagina]')]
      const cerradas = { rotationY: -180 } // rotadas hacia la izquierda: fuera de la pantalla
      gsap.set(paginas, cerradas)

      const tl = gsap.timeline({
        onComplete: () => {
          el.style.display = 'none'
          gsap.set(paginas, cerradas)
          ocupado.current = false
          setDesfase((d) => d + 13)
        },
      })
      tl.to(paginas, { rotationY: 0, ...CUBRIR })
        .call(() => navigate(destino))
        .to([...paginas].reverse(), { rotationY: -180, ...REVELAR }, '+=0.05')
      terminaEn.current = performance.now() + tl.duration() * 1000
    },
    [navigate, reducirMovimiento],
  )

  // Para usar en el onClick de un enlace: respeta ctrl/cmd/shift/clic del medio (abrir en otra pestaña).
  const conPaginas = useCallback(
    (evento, destino) => {
      if (evento.defaultPrevented || evento.button !== 0 || evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.altKey) return
      evento.preventDefault()
      ir(destino)
    },
    [ir],
  )

  // Segundos que faltan para que las hojas terminen de revelar la página nueva (menos un margen):
  // las animaciones de entrada de esa página esperan para no pasar debajo de las hojas.
  const espera = useCallback(() => Math.max(0, (terminaEn.current - performance.now()) / 1000 - 0.3), [])

  const valor = useMemo(() => ({ ir, conPaginas, espera }), [ir, conPaginas, espera])

  return (
    <TransicionContext.Provider value={valor}>
      {children}
      <PaginasTransicion ref={raiz} desfase={desfase} />
    </TransicionContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTransicion() {
  return useContext(TransicionContext)
}
