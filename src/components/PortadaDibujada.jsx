import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Box, useMediaQuery } from '@mui/material'
import { gsap } from 'gsap'
import { useTransicion } from '../context/TransicionContext'
import { urlPortada } from '../lib/comics'
import { COLORES } from '../theme'
import Portada from './Portada'

// La portada se "dibuja" al entrar al detalle, como la mano del dibujante en Comix Zone:
//   1. un lápiz en diagonal recorre la hoja de la esquina superior izquierda a la inferior derecha,
//      yendo y viniendo a lo largo del frente, y va dejando el boceto (la misma portada convertida
//      en líneas con un filtro SVG de detección de bordes),
//   2. después la tinta y el color la barren igual, de esquina a esquina.
// Con "reducir movimiento", sin portada o si algo falla, se muestra la portada normal.
const ID_FILTRO = 'boceto-a-lapiz'
const PAPEL = '#f3e9cf'
const INCLINACION = -56 // grados: punta abajo a la izquierda, cuerpo hacia arriba a la derecha
const VAIVEN = 7

// Tiempos (s): boceto, vuelta del lápiz y barrido de color. PASADAS: idas y vueltas del lápiz.
const TB = 1.9
const TV = 0.35
const TC = 1.05
const TOTAL = TB + TV + TC
const PASADAS = 5

// Frente diagonal: la recta x + y = c (con x e y en fracciones del ancho y el alto) recorre la
// portada de la esquina superior izquierda (c = 0) a la inferior derecha (c = 2). Sus extremos:
//   a = arriba/derecha, b = abajo/izquierda. Sirve de recorte (todo lo que queda "antes" del frente)
//   y para ubicar el lápiz sobre él (u = 0 en a, u = 1 en b).
const extremos = (c) => ({
  a: [Math.min(c, 1), Math.max(c - 1, 0)],
  b: [Math.max(c - 1, 0), Math.min(c, 1)],
})
const poligono = (c) => {
  const { a, b } = extremos(c)
  return `polygon(0% 0%, ${a[0] * 100}% 0%, ${a[0] * 100}% ${a[1] * 100}%, ${b[0] * 100}% ${b[1] * 100}%, 0% ${b[1] * 100}%)`
}
const sobreFrente = (c, u) => {
  const { a, b } = extremos(c)
  return [a[0] + u * (b[0] - a[0]), a[1] + u * (b[1] - a[1])]
}
// Lo que queda "después" del frente: al borrar, se va lo que el frente ya pasó. Con c = 0 es toda la
// portada y con c = 2 no queda nada. Siempre tiene 5 puntos (algunos se repiten) para poder animarse.
const complemento = (c) => {
  const { a, b } = extremos(c)
  return `polygon(${a[0] * 100}% ${a[1] * 100}%, 100% ${a[1] * 100}%, 100% 100%, ${b[0] * 100}% 100%, ${b[0] * 100}% ${b[1] * 100}%)`
}

// Al volver, el lápiz vuelve a aparecer con la goma hacia abajo y borra la portada.
const T_BORRAR = 0.85
const PASADAS_BORRAR = 3

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
  // Si se entra desde la transición de hojas, el dibujo espera a que terminen de revelar la página.
  const { espera, registrarBorrador } = useTransicion()
  const [retraso] = useState(() => espera())
  const animacionRef = useRef(null)

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
    const boceto = raiz.current.querySelector('[data-capa="boceto"]')
    const color = raiz.current.querySelector('[data-capa="color"]')
    const lapiz = lapizRef.current
    const giro = giroRef.current
    const suave = gsap.parseEase('power2.inOut')

    // Todo sale de un solo reloj (t, en segundos): el frente diagonal del boceto, el del color y
    // la posición del lápiz son funciones de t. Así no hay tramos que se pisen entre sí.
    //   [0, TB)          boceto: el frente avanza de la esquina superior izquierda a la inferior
    //                    derecha y el lápiz va y viene a lo largo de él
    //   [TB, TB+TV)      el lápiz vuelve a la esquina superior izquierda
    //   [TB+TV, TOTAL)   color: barrido diagonal, otra vez de esquina a esquina
    const reloj = { t: 0 }
    const pintar = (t) => {
      const r = caja.current.getBoundingClientRect()
      let pos
      let rotacion = INCLINACION
      let opacidad = 1

      if (t < TB) {
        const c = (2 * t) / TB
        const fase = (PASADAS * t) / TB
        const u = 0.5 - 0.5 * Math.cos(Math.PI * fase)
        boceto.style.clipPath = poligono(c)
        pos = sobreFrente(c, u)
        rotacion = INCLINACION + VAIVEN * Math.sin(Math.PI * fase * 2)
      } else if (t < TB + TV) {
        const e = suave((t - TB) / TV)
        boceto.style.clipPath = poligono(2)
        color.style.clipPath = poligono(0)
        pos = [1 - e, 1 - e]
      } else {
        const k = 2 * suave(Math.min((t - TB - TV) / TC, 1))
        color.style.clipPath = poligono(k)
        pos = sobreFrente(k, 0.5)
        opacidad = Math.max(0, Math.min(1, (TOTAL - t) / 0.3))
      }

      // El lápiz vive fuera del panel (que recorta lo que se sale) y sigue a la portada.
      lapiz.style.width = `${Math.max(96, Math.min(r.width * 0.46, 210))}px`
      lapiz.style.transform = `translate3d(${r.left + r.width * pos[0]}px, ${r.top + r.height * pos[1]}px, 0)`
      lapiz.style.opacity = String(opacidad)
      giro.style.transform = `rotate(${rotacion}deg)`
    }

    const animacion = gsap.to(reloj, {
      t: TOTAL, duration: TOTAL, ease: 'none', delay: 0.5 + retraso, onUpdate: () => pintar(reloj.t),
    })
    animacionRef.current = animacion
    return () => animacion.kill()
  }, [cargada, retraso])

  // Al tocar "Volver" la transición nos pide que nos borremos antes de dar vuelta las hojas: el
  // lápiz reaparece con la goma hacia abajo y borra el color y después el boceto, en diagonal y de
  // esquina a esquina, igual que al dibujar. Devuelve una promesa que se resuelve al terminar.
  useEffect(() => {
    if (!cargada) return undefined
    const borrar = () =>
      new Promise((resolver) => {
        const boceto = raiz.current.querySelector('[data-capa="boceto"]')
        const color = raiz.current.querySelector('[data-capa="color"]')
        const lapiz = lapizRef.current
        const giro = giroRef.current
        const suave = gsap.parseEase('power2.inOut')

        // Si el dibujo todavía estaba en curso se corta y se parte de la portada completa.
        animacionRef.current?.kill()
        boceto.style.clipPath = poligono(2)
        color.style.clipPath = poligono(2)
        // Lápiz "al revés": la goma (que era el extremo de la derecha) pasa a ser el punto de trazo.
        lapiz.querySelector('svg').style.transform = 'scaleX(-1)'

        const reloj = { t: 0 }
        const pintarBorrado = (t) => {
          const r = caja.current.getBoundingClientRect()
          const avance = suave(t / T_BORRAR)
          const c = 2 * avance
          const fase = (PASADAS_BORRAR * t) / T_BORRAR
          const u = 0.5 - 0.5 * Math.cos(Math.PI * fase)
          // El color se va primero y el boceto lo sigue un poco más atrás.
          color.style.clipPath = complemento(c)
          boceto.style.clipPath = complemento(Math.max(0, (c - 0.4) * 1.25))
          const pos = sobreFrente(c, u)
          lapiz.style.width = `${Math.max(96, Math.min(r.width * 0.46, 210))}px`
          lapiz.style.transform = `translate3d(${r.left + r.width * pos[0]}px, ${r.top + r.height * pos[1]}px, 0)`
          lapiz.style.opacity = '1'
          giro.style.transform = `rotate(${INCLINACION + VAIVEN * Math.sin(Math.PI * fase * 2)}deg)`
        }

        gsap.to(reloj, {
          t: T_BORRAR, duration: T_BORRAR, ease: 'none', onUpdate: () => pintarBorrado(reloj.t),
          onComplete: () => {
            lapiz.style.opacity = '0'
            resolver()
          },
        })
      })
    return registrarBorrador(borrar)
  }, [cargada, registrarBorrador])

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
