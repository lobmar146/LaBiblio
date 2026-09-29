import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMediaQuery } from '@mui/material'
import { gsap } from 'gsap'
import PaginasTransicion from '../components/PaginasTransicion'

// Cambios de página con hojas de cómic que se dan vuelta en 3D. Viven arriba del router, como las
// onomatopeyas.
//   ir(destino)       al abrir un comic: las hojas se pasan hacia adelante (de derecha a izquierda)
//                     hasta tapar la pantalla; con todo tapado cambia la ruta y se vuelven a pasar
//                     revelando la página nueva.
//   volver(navegar)   al volver: primero el lápiz borra la portada (ver PortadaDibujada) y después
//                     las hojas se pasan hacia atrás (de izquierda a derecha), más rápido.
const TransicionContext = createContext({
  ir: () => {}, volver: (navegar) => navegar(), conPaginas: () => {}, espera: () => 0, registrarBorrador: () => () => {},
})

const TIEMPOS = {
  adelante: { cubrir: { duration: 0.4, stagger: 0.07, ease: 'power2.inOut' }, revelar: { duration: 0.5, stagger: 0.07, ease: 'power2.inOut' } },
  atras: { cubrir: { duration: 0.32, stagger: 0.05, ease: 'power2.inOut' }, revelar: { duration: 0.4, stagger: 0.05, ease: 'power2.inOut' } },
}

export function TransicionProvider({ children }) {
  const navigate = useNavigate()
  const reducirMovimiento = useMediaQuery('(prefers-reduced-motion: reduce)')
  const raiz = useRef(null)
  const ocupado = useRef(false)
  const terminaEn = useRef(0)
  // Quién sabe "borrarse" antes de volver (la portada dibujada del detalle): cada uno devuelve una
  // promesa que se resuelve cuando termina.
  const borradores = useRef(new Set())
  // Corre las portadas de las hojas después de cada transición para que la próxima no sea igual.
  const [desfase, setDesfase] = useState(0)

  // Las hojas: `navegar` se ejecuta cuando la pantalla ya está tapada. El lomo va a la izquierda al
  // ir y a la derecha al volver, y las hojas arrancan fuera de la pantalla, del lado del lomo.
  const correr = useCallback(
    (navegar, atras) => {
      const el = raiz.current
      if (!el) {
        navegar()
        return
      }
      ocupado.current = true
      el.style.display = 'block'
      el.style.perspectiveOrigin = atras ? '100% 50%' : '0% 50%'
      const paginas = [...el.querySelectorAll('[data-pagina]')]
      const cerradas = { rotationY: atras ? 180 : -180, transformOrigin: atras ? '100% 50%' : '0% 50%' }
      const tiempos = atras ? TIEMPOS.atras : TIEMPOS.adelante
      gsap.set(paginas, cerradas)

      const tl = gsap.timeline({
        onComplete: () => {
          el.style.display = 'none'
          gsap.set(paginas, cerradas)
          ocupado.current = false
          setDesfase((d) => d + 13)
        },
      })
      tl.to(paginas, { rotationY: 0, ...tiempos.cubrir })
        .call(navegar)
        .to([...paginas].reverse(), { rotationY: cerradas.rotationY, ...tiempos.revelar }, '+=0.05')
      terminaEn.current = performance.now() + tl.duration() * 1000
    },
    [],
  )

  // Sin animación si el usuario pidió menos movimiento o si ya hay una en curso.
  const ir = useCallback(
    (destino) => {
      if (reducirMovimiento || ocupado.current) navigate(destino)
      else correr(() => navigate(destino), false)
    },
    [navigate, reducirMovimiento, correr],
  )

  const volver = useCallback(
    async (navegar) => {
      if (reducirMovimiento || ocupado.current) {
        navegar()
        return
      }
      ocupado.current = true
      try {
        await Promise.all([...borradores.current].map((borrar) => borrar()))
      } finally {
        ocupado.current = false
      }
      correr(navegar, true)
    },
    [reducirMovimiento, correr],
  )

  const registrarBorrador = useCallback((borrar) => {
    borradores.current.add(borrar)
    return () => borradores.current.delete(borrar)
  }, [])

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

  const valor = useMemo(
    () => ({ ir, volver, conPaginas, espera, registrarBorrador }),
    [ir, volver, conPaginas, espera, registrarBorrador],
  )

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
