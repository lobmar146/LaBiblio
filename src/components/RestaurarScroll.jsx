import { useEffect, useLayoutEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

// Al entrar a otra página, arrancar arriba; al volver atrás, volver a donde se estaba.
// Se hace a mano porque el navegador restaura el scroll antes de que React dibuje la página
// (y la grilla mide su ancho recién después), así que llegaba tarde y a una página todavía corta.
const posiciones = new Map()
const claveActual = () => window.history.state?.key ?? 'default'

function irA(y) {
  window.scrollTo(0, y)
  if (y === 0) return
  // La página puede tardar unos cuadros en tener el alto suficiente: reintenta hasta que llegue.
  let intentos = 0
  const reintentar = () => {
    if (Math.abs(window.scrollY - y) <= 2 || ++intentos > 40) return
    window.scrollTo(0, y)
    requestAnimationFrame(reintentar)
  }
  requestAnimationFrame(reintentar)
}

export default function RestaurarScroll() {
  const { pathname, key } = useLocation()
  const tipo = useNavigationType()
  const pathAnterior = useRef(pathname)

  useEffect(() => {
    window.history.scrollRestoration = 'manual'
    const guardar = () => posiciones.set(claveActual(), window.scrollY)
    window.addEventListener('scroll', guardar, { passive: true })
    return () => window.removeEventListener('scroll', guardar)
  }, [])

  useLayoutEffect(() => {
    if (tipo === 'POP') irA(posiciones.get(key) ?? 0)
    // Solo si cambia la página: los filtros de la colección reemplazan la URL en cada tecla.
    else if (pathname !== pathAnterior.current) irA(0)
    pathAnterior.current = pathname
  }, [key, pathname, tipo])

  return null
}
