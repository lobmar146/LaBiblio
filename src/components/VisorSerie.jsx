import { Component, lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Box, Button } from '@mui/material'
import { useOnomatopeya } from '../context/OnomatopeyaContext'
import { useTransicion } from '../context/TransicionContext'
import { urlPortada } from '../lib/comics'
import { nombreCompleto } from '../lib/coleccion'
import { COLORES } from '../theme'
import Portada from './Portada'

// gsap + WebGL pesan bastante: solo se descargan al llegar a la vista por serie.
const MorphSlider = lazy(() => import('./ReactBits/MorphSlider'))

const ANCHO_VISOR = { xs: 150, sm: 190 }

// Si el navegador no tiene WebGL, el slider falla al montarse: se queda la portada fija.
class SoloSiFunciona extends Component {
  state = { fallo: false }
  static getDerivedStateFromError() {
    return { fallo: true }
  }
  render() {
    return this.state.fallo ? this.props.alternativa : this.props.children
  }
}

// Cada slider es un contexto WebGL y los navegadores aguantan ~16: se monta solo mientras
// la fila está (casi) en pantalla y se libera al alejarse.
function useVisible() {
  const [nodo, setNodo] = useState(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    if (!nodo) return
    const observador = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: '200px' })
    observador.observe(nodo)
    return () => observador.disconnect()
  }, [nodo])
  return [setNodo, visible]
}

export default function VisorSerie({ comics }) {
  const explotar = useOnomatopeya()
  const { ir, conPaginas } = useTransicion()
  const inicioClic = useRef(null)
  const [refCaja, visible] = useVisible()
  const [indice, setIndice] = useState(0)

  // El slider recrea su motor si cambia `items`: tiene que ser el mismo array mientras no cambie la serie.
  const conPortada = useMemo(() => comics.filter((c) => c.portada_path), [comics])
  const items = useMemo(
    () => conPortada.map((c) => ({ image: urlPortada(c.portada_path), caption: nombreCompleto(c) })),
    [conPortada],
  )
  const actual = conPortada[Math.min(indice, conPortada.length - 1)]

  const alElegir = useCallback((i) => setIndice(i), [])

  if (conPortada.length === 0) return null

  // Clic sobre la portada = abrir el comic que se está viendo. Un arrastre (cambiar de slide) o
  // un clic en las flechas y puntitos no cuentan: el slider ya los maneja.
  const abrirActual = (e) => {
    explotar(e, '¡ZAS!')
    ir(`/comic/${actual.id}`)
  }
  const alBajar = (e) => {
    inicioClic.current = { x: e.clientX, y: e.clientY }
  }
  const alHacerClic = (e) => {
    if (e.target.closest('button')) return
    const inicio = inicioClic.current
    if (inicio && Math.hypot(e.clientX - inicio.x, e.clientY - inicio.y) > 6) return
    abrirActual(e)
  }
  const alTeclear = (e) => {
    // Enter sobre el slider enfocado; las flechas ya cambian de slide.
    if (e.key === 'Enter' && !e.target.closest('button')) abrirActual(e.currentTarget)
  }

  const fija = <Portada comic={conPortada[0]} sx={{ width: '100%', height: '100%', aspectRatio: 'auto' }} />

  return (
    <Box sx={{ width: ANCHO_VISOR, flexShrink: 0 }}>
      <Box
        ref={refCaja}
        onPointerDown={alBajar}
        onClick={alHacerClic}
        onKeyDown={alTeclear}
        sx={{ width: '100%', aspectRatio: '2 / 3', border: `3px solid ${COLORES.crema}`, bgcolor: COLORES.tinta }}
      >
        {items.length > 1 && visible ? (
          <SoloSiFunciona alternativa={fija}>
            <Suspense fallback={fija}>
              <MorphSlider
                items={items}
                transition="pageturn"
                duration={0.9}
                intensity={0.75}
                radius={0}
                overlayColor={COLORES.tinta}
                showCaptions={false}
                showIndicators={items.length <= 8}
                onIndexChange={alElegir}
              />
            </Suspense>
          </SoloSiFunciona>
        ) : (
          fija
        )}
      </Box>
      {items.length > 1 && (
        <Button
          component={RouterLink}
          to={`/comic/${actual.id}`}
          onClick={(e) => {
            explotar(e, '¡ZAS!')
            conPaginas(e, `/comic/${actual.id}`)
          }}
          size="small"
          fullWidth
          sx={{ mt: 0.75 }}
        >
          {actual.numero ? `Ver #${actual.numero}` : `Ver ${actual.titulo}`}
        </Button>
      )}
    </Box>
  )
}
