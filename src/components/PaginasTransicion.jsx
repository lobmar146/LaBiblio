import { forwardRef, useEffect, useMemo } from 'react'
import { Box } from '@mui/material'
import { useComics } from '../context/ComicsContext'
import { urlPortada } from '../lib/comics'
import { COLORES, LETRAS_TITULO } from '../theme'

// Las hojas de cómic que se dan vuelta al cambiar de página (ver context/TransicionContext).
// Cada hoja tiene dos caras con una distribución de viñetas distinta: cuando se da vuelta se ve
// una y, ya del otro lado, la otra. Las viñetas muestran portadas de la propia colección (ya
// están en memoria y en la caché del navegador), recortadas distinto en cada una; si todavía no
// hay ninguna, quedan de color. Viven ocultas hasta que empieza la transición.
export const CANTIDAD = 5

const { tinta, crema, magenta, celeste, sol, lima } = COLORES
const TINTAS = [magenta, celeste, sol, lima]
const PALABRAS = ['¡POW!', '¡ZAS!', '¡BAM!', '¡KRAK!', '¡BOOM!', '¡ZOOM!', '¡WHAM!', '¡SLAM!']
// Qué parte de la portada se ve en cada viñeta: arriba (título), al medio, abajo, y un costado.
const ENCUADRES = ['50% 12%', '50% 50%', '50% 88%', '15% 35%', '85% 60%']

// Viñetas como [izquierda, arriba, ancho, alto] en % de la hoja, con una canaleta de 3%.
const DISENOS = [
  [[3, 3, 60, 44], [66, 3, 31, 44], [3, 50, 31, 47], [37, 50, 60, 47]],
  [[3, 3, 94, 30], [3, 36, 45, 30], [51, 36, 46, 30], [3, 69, 94, 28]],
  [[3, 3, 30, 94], [36, 3, 61, 45], [36, 51, 29, 46], [68, 51, 29, 46]],
  [[3, 3, 45, 60], [51, 3, 46, 28], [51, 34, 46, 29], [3, 66, 94, 31]],
]

function Vineta({ caja, color, imagen, encuadre, palabra, inclinar }) {
  const [x, y, w, h] = caja
  return (
    <Box
      sx={{
        position: 'absolute', left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%`, overflow: 'hidden',
        bgcolor: color, border: `4px solid ${tinta}`, boxSizing: 'border-box',
        display: 'grid', placeItems: 'center',
      }}
    >
      {imagen && (
        <Box component="img" src={imagen} alt="" draggable={false} decoding="async"
          sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: encuadre, display: 'block' }} />
      )}
      {/* Trama de puntos y un destello en diagonal por encima, como color de imprenta. */}
      <Box sx={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `radial-gradient(rgba(13, 6, 32, ${imagen ? 0.28 : 0.22}) 2px, transparent 2.6px), linear-gradient(115deg, transparent 52%, rgba(255, 255, 255, 0.24) 52% 60%, transparent 60%)`,
        backgroundSize: '11px 11px, 100% 100%',
      }} />
      {palabra && (
        <Box component="span" sx={{
          position: 'relative', fontFamily: LETRAS_TITULO, letterSpacing: '0.05em', fontSize: 'clamp(30px, 8vw, 96px)', lineHeight: 1,
          color: crema, WebkitTextStroke: `3px ${tinta}`, paintOrder: 'stroke fill', textShadow: `4px 4px 0 ${tinta}`,
          transform: `rotate(${inclinar}deg)`,
        }}>
          {palabra}
        </Box>
      )}
    </Box>
  )
}

function Cara({ semilla, dorso, portadas, desfase }) {
  const diseno = DISENOS[semilla % DISENOS.length]
  return (
    <Box
      sx={{
        // La hoja es negra: las canaletas entre viñetas quedan en negro. Un filete crema en el borde
        // deja ver el canto de la hoja sobre el fondo oscuro de la página.
        position: 'absolute', inset: 0, bgcolor: tinta, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
        transform: dorso ? 'rotateY(180deg)' : 'none',
        // Brillo del lomo: la hoja se curva un poco hacia el borde izquierdo.
        boxShadow: `inset 0 0 0 3px ${crema}, ${dorso ? 'inset -40px 0 50px -40px rgba(255, 244, 214, 0.28)' : 'inset 40px 0 50px -40px rgba(255, 244, 214, 0.28)'}`,
      }}
    >
      {diseno.map((caja, j) => {
        const n = semilla * 4 + j + desfase // viñetas seguidas = portadas distintas
        return (
          <Vineta
            key={j}
            caja={caja}
            color={TINTAS[(semilla + j) % TINTAS.length]}
            imagen={portadas.length ? portadas[n % portadas.length] : null}
            encuadre={ENCUADRES[(semilla + j * 2) % ENCUADRES.length]}
            // Con imágenes, el efecto de sonido solo en algunas viñetas para no taparlas.
            palabra={(semilla * 3 + j) % (portadas.length ? 5 : 3) === 0 ? PALABRAS[(semilla * 2 + j) % PALABRAS.length] : null}
            inclinar={((semilla + j) % 2 ? -1 : 1) * (5 + ((semilla * 7 + j) % 6))}
          />
        )
      })}
    </Box>
  )
}

// `desfase` cambia después de cada transición: así la siguiente muestra otras portadas.
const PaginasTransicion = forwardRef(function PaginasTransicion({ desfase = 0 }, ref) {
  const { comics } = useComics()
  const portadas = useMemo(() => comics.filter((c) => c.portada_path).map((c) => urlPortada(c.portada_path)), [comics])

  // Las hojas están ocultas hasta la primera transición: se decodifican las imágenes de antemano
  // para que no se vean de color (mientras cargan) cuando las hojas empiezan a girar.
  useEffect(() => {
    portadas.slice(0, 24).forEach((url) => {
      const imagen = new Image()
      imagen.src = url
      imagen.decode?.().catch(() => {})
    })
  }, [portadas])

  return (
    <Box
      ref={ref}
      aria-hidden="true"
      // Por debajo de las onomatopeyas (2000) para que el "¡POW!" del clic se vea encima de las hojas.
      // Tapa la pantalla y bloquea los clics mientras dura; el punto de fuga está en el lomo (izquierda).
      sx={{ display: 'none', position: 'fixed', inset: 0, zIndex: 1900, perspective: '2400px', perspectiveOrigin: '0% 50%', overflow: 'hidden' }}
    >
      {Array.from({ length: CANTIDAD }, (_, i) => (
        <Box
          key={i}
          data-pagina=""
          sx={{ position: 'absolute', inset: 0, transformOrigin: '0% 50%', transformStyle: 'preserve-3d', transform: 'rotateY(-180deg)' }}
        >
          <Cara semilla={i * 2} portadas={portadas} desfase={desfase} />
          <Cara semilla={i * 2 + 1} dorso portadas={portadas} desfase={desfase} />
        </Box>
      ))}
    </Box>
  )
})

export default PaginasTransicion
