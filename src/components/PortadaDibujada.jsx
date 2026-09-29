import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Box, useMediaQuery } from '@mui/material'
import { gsap } from 'gsap'
import { urlPortada } from '../lib/comics'
import { COLORES } from '../theme'
import Portada from './Portada'

// La portada se "dibuja" al entrar al detalle, como la mano del dibujante en Comix Zone:
//   1. un lápiz en diagonal recorre la hoja en zigzag y va dejando el boceto (la misma portada
//      convertida en líneas con un filtro SVG de detección de bordes),
//   2. después la tinta y el color la barren de izquierda a derecha.
// Con "reducir movimiento", sin portada o si algo falla, se muestra la portada normal.
const ID_FILTRO = 'boceto-a-lapiz'
const PAPEL = '#f3e9cf'
const INCLINACION = -56 // grados: punta abajo a la izquierda, cuerpo hacia arriba a la derecha
const VAIVEN = 7

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

// Lápiz de dibujito: contorno grueso, facetas de luz y sombra, brillos, virola con estrías y goma
// rosa. La punta queda en (2, 17), a la izquierda: ahí se ancla el trazo.
function Lapiz() {
  const t = COLORES.tinta
  const contorno = { stroke: t, strokeWidth: 3, strokeLinejoin: 'round', strokeLinecap: 'round' }
  return (
    <svg viewBox="0 0 152 34" width="100%" style={{ display: 'block', overflow: 'visible', filter: 'drop-shadow(3px 4px 0 rgba(0,0,0,.5))' }}>
      {/* madera afilada con el borde dentado */}
      <path d="M2 17 L31 3.5 L36 8 L33 11 L37 14.5 L34 17 L37 19.5 L33 23 L36 26 L31 30.5 Z" fill="#f0c98d" {...contorno} />
      {/* mina */}
      <path d="M2 17 L13 12 L13 22 Z" fill="#2b2b33" {...contorno} strokeWidth={2.4} />
      <path d="M6.5 15.2 L10.5 13.6" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" opacity=".6" />
      {/* cuerpo con tres facetas */}
      <rect x="36" y="3.5" width="82" height="27" rx="2.5" fill="#ffd83a" {...contorno} />
      <rect x="38" y="5.2" width="78" height="7" fill="#fff09a" />
      <rect x="38" y="21.5" width="78" height="7.5" fill="#e6a800" />
      <path d="M42 8.4 H104" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity=".75" />
      <rect x="58" y="12.5" width="34" height="9" fill={COLORES.magenta} stroke={t} strokeWidth="2" />
      <path d="M63 17 H87" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" opacity=".7" />
      {/* virola metálica */}
      <rect x="118" y="3.5" width="15" height="27" fill="#cfd2de" {...contorno} />
      <path d="M123 5.5 V28.5 M128 5.5 V28.5" stroke={t} strokeWidth="2" opacity=".55" />
      <path d="M120.5 7 V12" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      {/* goma */}
      <rect x="133" y="4.5" width="17" height="25" rx="8" fill={COLORES.magenta} {...contorno} />
      <path d="M137 10 V17" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" opacity=".7" />
    </svg>
  )
}

function Dibujando({ url, comic }) {
  const raiz = useRef(null)
  const caja = useRef(null)
  const lapizRef = useRef(null)
  const giroRef = useRef(null)
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
      const $ = (sel) => raiz.current.querySelector(sel)
      const boceto = $('[data-capa="boceto"]')
      const color = $('[data-capa="color"]')
      const lapiz = lapizRef.current
      const giro = giroRef.current

      // El lápiz vive fuera del panel (que recorta lo que se sale) y sigue a la portada:
      // su posición se calcula en % del rectángulo de la portada en cada cuadro.
      const p = { x: 6, y: 0 }
      const colocar = () => {
        const r = caja.current.getBoundingClientRect()
        lapiz.style.width = `${Math.max(96, Math.min(r.width * 0.46, 210))}px`
        lapiz.style.transform = `translate3d(${r.left + (r.width * p.x) / 100}px, ${r.top + (r.height * p.y) / 100}px, 0)`
      }
      gsap.set(giro, { rotation: INCLINACION, transformOrigin: '0 50%' })
      gsap.set(lapiz, { opacity: 0 })

      const tl = gsap.timeline({ delay: 0.5, onUpdate: colocar })

      // Boceto: el lápiz baja recorriendo la hoja en zigzag (5 pasadas), inclinándose un poco a
      // cada lado, y deja el dibujo detrás.
      tl.set(lapiz, { opacity: 1 })
        .fromTo(boceto, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.7, ease: 'none' }, 0)
        .fromTo(p, { y: 0 }, { y: 100, duration: 1.7, ease: 'none' }, 0)
        .fromTo(p, { x: 6 }, { x: 94, duration: 0.34, ease: 'sine.inOut', repeat: 4, yoyo: true }, 0)
        .fromTo(giro, { rotation: INCLINACION - VAIVEN }, { rotation: INCLINACION + VAIVEN, duration: 0.17, ease: 'sine.inOut', repeat: 9, yoyo: true }, 0)
        // Vuelve al borde izquierdo y entinta: barrido de izquierda a derecha con el color.
        .to(p, { x: 0, y: 50, duration: 0.3, ease: 'power2.inOut' }, '>')
        .to(giro, { rotation: INCLINACION, duration: 0.3 }, '<')
        .addLabel('tinta', '>+0.05')
        .fromTo(color, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.0, ease: 'power2.inOut' }, 'tinta')
        .to(p, { x: 100, y: 46, duration: 1.0, ease: 'power2.inOut' }, 'tinta')
        .to(lapiz, { opacity: 0, duration: 0.3, ease: 'power1.in' }, 'tinta+=1.0')
    }, raiz)
    return () => contexto.revert()
  }, [cargada])

  if (fallo) return <Portada comic={comic} />

  const capa = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }
  return (
    <Box ref={raiz} sx={{ position: 'relative' }}>
      <FiltroBoceto />
      <Box ref={caja} sx={{ position: 'relative', aspectRatio: '2 / 3', overflow: 'hidden', bgcolor: PAPEL }}>
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
      {cargada &&
        createPortal(
          <Box ref={lapizRef} aria-hidden="true"
            sx={{ position: 'fixed', left: 0, top: 0, opacity: 0, pointerEvents: 'none', zIndex: 1250, willChange: 'transform' }}>
            <Box ref={giroRef} sx={{ transformOrigin: '0 50%' }}>
              <Lapiz />
            </Box>
          </Box>,
          document.body,
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
