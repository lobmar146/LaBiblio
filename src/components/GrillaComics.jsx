import { useEffect, useState } from 'react'
import { ImageList, useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import Vineta from './Vineta'

// Cada cuántos comics aparece otra viñeta grande (2x2), para que la página no sea una planilla.
const RITMO_DESTACADOS = 12

function useColumnas() {
  const theme = useTheme()
  const sm = useMediaQuery(theme.breakpoints.up('sm'))
  const md = useMediaQuery(theme.breakpoints.up('md'))
  const lg = useMediaQuery(theme.breakpoints.up('lg'))
  const xl = useMediaQuery(theme.breakpoints.up('xl'))
  // Columnas de más a propósito: con menos, la viñeta 2x2 queda más alta que la pantalla.
  if (xl) return 7
  if (lg) return 6
  if (md) return 5
  if (sm) return 3
  return 2
}

// ImageList necesita el alto de fila en píxeles; se calcula del ancho real para que
// cada celda tenga la proporción de una tapa (2:3).
function useAncho() {
  const [nodo, setNodo] = useState(null)
  const [ancho, setAncho] = useState(0)
  useEffect(() => {
    if (!nodo) return
    // Medida inicial ya mismo: el observer recién avisa en el próximo pintado.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lectura del DOM recién montado
    setAncho(nodo.getBoundingClientRect().width)
    const observador = new ResizeObserver(([entrada]) => setAncho(entrada.contentRect.width))
    observador.observe(nodo)
    return () => observador.disconnect()
  }, [nodo])
  return [setNodo, ancho]
}

export default function GrillaComics({ comics, etiquetaPrimero }) {
  const columnas = useColumnas()
  const [refContenedor, ancho] = useAncho()
  const gap = columnas === 2 ? 10 : 16
  const celda = (ancho - gap * (columnas - 1)) / columnas
  const altoFila = Math.max(1, Math.round(celda * 1.5))

  const esDestacado = (i) => i === 0 || (columnas >= 4 && i % RITMO_DESTACADOS === 7)

  return (
    <div ref={refContenedor}>
      {ancho > 0 && (
        <ImageList
          variant="quilted"
          cols={columnas}
          gap={gap}
          rowHeight={altoFila}
          // dense: las viñetas grandes no dejan huecos, las chicas rellenan alrededor.
          sx={{ m: 0, overflow: 'visible', gridAutoFlow: 'dense' }}
        >
          {comics.map((comic, i) => {
            const grande = esDestacado(i)
            return (
              <Vineta
                key={comic.id}
                comic={comic}
                cols={grande ? 2 : 1}
                rows={grande ? 2 : 1}
                grande={grande}
                etiqueta={i === 0 ? etiquetaPrimero : null}
              />
            )
          })}
        </ImageList>
      )}
    </div>
  )
}
