import { useEffect, useRef, useState } from 'react'
import { Box, useMediaQuery } from '@mui/material'
import { gsap } from 'gsap'
import { urlPortada } from '../lib/comics'
import { COLORES } from '../theme'
import Portada from './Portada'

// La portada se "dibuja" al entrar al detalle, como la mano del dibujante en Comix Zone:
//   1. un lápiz recorre la hoja en zigzag y va dejando el boceto (la misma portada convertida
//      en líneas con un filtro SVG de detección de bordes),
//   2. después la tinta y el color la barren de izquierda a derecha.
// Con "reducir movimiento", sin portada o si algo falla, se muestra la portada normal.
const ID_FILTRO = 'boceto-a-lapiz'
const PAPEL = '#f3e9cf'

// Bordes de la imagen: pasa a grises, marca los contornos (Laplaciano), los invierte para que las
// líneas queden oscuras sobre blanco y los engrosa un poco, como trazo de lápiz.
function FiltroBoceto() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <filter id={ID_FILTRO} colorInterpolationFilters="sRGB" x="0" y="0" width="100%" height="100%">
        <feColorMatrix type="saturate" values="0" />
        <feConvolveMatrix order="3" kernelMatrix="-1 -1 -1 -1 8 -1 -1 -1 -1" divisor="1" preserveAlpha="true" />
        <feColorMatrix type="matrix" values="-3.2 0 0 0 1.05  -3.2 0 0 0 1.05  -3.2 0 0 0 1.05  0 0 0 1 0" />
        <feMorphology operator="erode" radius="0.6" />
      </filter>
    </svg>
  )
}

// Lápiz horizontal con la punta a la izquierda (ahí queda anclado el trazo).
function Lapiz() {
  const contorno = { stroke: COLORES.tinta, strokeWidth: 1.6, strokeLinejoin: 'round' }
  return (
    <svg viewBox="0 0 122 24" width="100%" style={{ display: 'block', overflow: 'visible', filter: 'drop-shadow(2px 3px 0 rgba(0,0,0,.45))' }}>
      <polygon points="1,12 22,3 22,21" fill="#e9c58f" {...contorno} />
      <polygon points="1,12 9.5,8.4 9.5,15.6" fill="#2b2b33" {...contorno} strokeWidth={1} />
      <rect x="22" y="3" width="70" height="18" fill={COLORES.sol} {...contorno} />
      <rect x="22" y="9.5" width="70" height="5" fill="#e0b400" />
      <rect x="92" y="3" width="8" height="18" fill="#b9b9cb" {...contorno} />
      <rect x="100" y="3" width="21" height="18" rx="5" fill={COLORES.magenta} {...contorno} />
    </svg>
  )
}

function Dibujando({ url, comic }) {
  const raiz = useRef(null)
  const [cargada, setCargada] = useState(false)
  const [fallo, setFallo] = useState(false)

  // Se espera a tener la imagen entera: dibujar sobre una imagen a medio bajar se vería cortado.
  useEffect(() => {
    const img = new Image()
    img.onload = () => setCargada(true)
    img.onerror = () => setFallo(true)
    img.src = url
    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [url])

  useEffect(() => {
    if (!cargada) return
    const contexto = gsap.context(() => {
      const $ = (nombre) => raiz.current.querySelector(`[data-capa="${nombre}"]`)
      const [boceto, color, lapiz] = [$('boceto'), $('color'), $('lapiz')]
      const tl = gsap.timeline({ delay: 0.5 })

      // Boceto: el lápiz baja recorriendo la hoja en zigzag (5 pasadas) y deja el dibujo detrás.
      tl.set(lapiz, { opacity: 1 })
        .fromTo(boceto, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.7, ease: 'none' }, 0)
        .fromTo(lapiz, { top: '0%' }, { top: '100%', duration: 1.7, ease: 'none' }, 0)
        .fromTo(lapiz, { left: '6%' }, { left: '94%', duration: 0.34, ease: 'sine.inOut', repeat: 4, yoyo: true }, 0)
        // Vuelve al borde izquierdo y entinta: barrido de izquierda a derecha con el color.
        .to(lapiz, { left: '0%', top: '50%', duration: 0.3, ease: 'power2.inOut' }, '>')
        .fromTo(color, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.0, ease: 'power2.inOut' }, '>+0.05')
        .to(lapiz, { left: '100%', top: '46%', duration: 1.0, ease: 'power2.inOut' }, '<')
        .to(lapiz, { opacity: 0, y: -14, duration: 0.3, ease: 'power1.in' }, '>')
    }, raiz)
    return () => contexto.revert()
  }, [cargada])

  if (fallo) return <Portada comic={comic} />

  const capa = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }
  return (
    <Box ref={raiz} sx={{ position: 'relative' }}>
      <FiltroBoceto />
      <Box sx={{ position: 'relative', aspectRatio: '2 / 3', overflow: 'hidden', bgcolor: PAPEL }}>
        {cargada && (
          <>
            {/* Boceto: mismo dibujo en líneas; multiply deja el papel a la vista donde no hay trazo. */}
            <Box component="img" data-capa="boceto" src={url} alt="" aria-hidden="true"
              sx={{ ...capa, filter: `url(#${ID_FILTRO})`, mixBlendMode: 'multiply', clipPath: 'inset(0% 0% 100% 0%)' }} />
            <Box component="img" data-capa="color" src={url} alt={`Portada de ${comic.titulo}`}
              sx={{ ...capa, clipPath: 'inset(0% 100% 0% 0%)' }} />
          </>
        )}
      </Box>
      {cargada && (
        <Box data-capa="lapiz" aria-hidden="true"
          sx={{ position: 'absolute', left: 0, top: 0, width: { xs: '34%', sm: '30%' }, opacity: 0, pointerEvents: 'none', zIndex: 3, transformOrigin: '0 50%', transform: 'rotate(-34deg)' }}>
          <Lapiz />
        </Box>
      )}
    </Box>
  )
}

export default function PortadaDibujada({ comic }) {
  const reducirMovimiento = useMediaQuery('(prefers-reduced-motion: reduce)')
  const url = urlPortada(comic.portada_path)
  if (!url || reducirMovimiento) return <Portada comic={comic} />
  return <Dibujando key={url} url={url} comic={comic} />
}
