import { Box } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { COLORES, LETRAS, LETRAS_TITULO } from '../theme'

const { tinta, crema, sol, magenta, celeste, lima, papel } = COLORES

// Piezas de "página de cómic" para que los textos vivan dentro de la historieta:
//   Recuadro  caja de rótulo (las cajas de narración amarillas)
//   Globo     globo de diálogo con cola, o de grito (explosión)
//   Panel     viñeta con dos esquinas cortadas en diagonal, marco color papel y sombra dura

// Caja de rótulo: letras mayúsculas de rotulista sobre un rectángulo de color.
export function Recuadro({ children, color = sol, texto = tinta, inclinar = 0, sx, ...props }) {
  return (
    <Box
      {...props}
      sx={{
        display: 'inline-block', bgcolor: color, color: texto, border: `3px solid ${tinta}`,
        boxShadow: '3px 3px 0 rgba(0, 0, 0, 0.6)', px: 1.25, py: 0.4,
        fontFamily: LETRAS, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em',
        fontSize: '0.85rem', lineHeight: 1.25, transform: inclinar ? `rotate(${inclinar}deg)` : 'none',
        ...sx,
      }}
    >
      {children}
    </Box>
  )
}

// Globo de diálogo. `cola`: dónde sale el piquito ('izquierda' | 'derecha' | 'ninguna').
export function Globo({ children, cola = 'izquierda', color = crema, sx, ...props }) {
  const alIzquierda = cola === 'izquierda'
  return (
    <Box
      {...props}
      sx={{
        position: 'relative', bgcolor: color, color: tinta, border: `3px solid ${tinta}`, borderRadius: '26px',
        boxShadow: '4px 4px 0 rgba(0, 0, 0, 0.6)', px: 2.25, py: 1.5, fontFamily: LETRAS, fontWeight: 700,
        lineHeight: 1.45, mb: cola === 'ninguna' ? 0 : 2.5,
        // La cola son dos triángulos: el de atrás es el contorno de tinta y el de adelante el relleno.
        ...(cola !== 'ninguna' && {
          '&::before, &::after': {
            content: '""', position: 'absolute', [alIzquierda ? 'left' : 'right']: 34, width: 0, height: 0,
            borderStyle: 'solid', borderColor: 'transparent',
          },
          '&::before': {
            bottom: -26, borderWidth: alIzquierda ? '26px 4px 0 22px' : '26px 22px 0 4px', borderTopColor: tinta,
          },
          '&::after': {
            bottom: -19, [alIzquierda ? 'left' : 'right']: 37, borderWidth: alIzquierda ? '20px 2px 0 15px' : '20px 15px 0 2px', borderTopColor: color,
          },
        }),
        ...sx,
      }}
    >
      {children}
    </Box>
  )
}

// Explosión de grito: contorno dentado para lo que tiene que sonar fuerte (¡VACÍO!, ¡KABOOM!).
const PUNTAS = 16
function dentado(radioExterior, radioInterior) {
  return Array.from({ length: PUNTAS * 2 }, (_, i) => {
    const r = i % 2 === 0 ? radioExterior : radioInterior
    const a = (Math.PI * i) / PUNTAS
    return `${(50 + r * Math.cos(a)).toFixed(1)}% ${(50 + r * Math.sin(a)).toFixed(1)}%`
  }).join(', ')
}
const CONTORNO = `polygon(${dentado(50, 41)})`
const RELLENO = `polygon(${dentado(46.5, 38)})`

export function Grito({ children, color = sol, sx }) {
  return (
    <Box sx={{ position: 'relative', display: 'inline-block', filter: 'drop-shadow(6px 6px 0 rgba(0, 0, 0, 0.55))', ...sx }}>
      <Box sx={{ bgcolor: tinta, clipPath: CONTORNO, p: { xs: 3.5, sm: 6 } }}>
        <Box sx={{ bgcolor: color, clipPath: RELLENO, position: 'absolute', inset: 0 }} />
        <Box sx={{ position: 'relative', color: tinta, textAlign: 'center', fontFamily: LETRAS_TITULO, letterSpacing: '0.05em', lineHeight: 1.05 }}>
          {children}
        </Box>
      </Box>
    </Box>
  )
}

// Viñeta con esquinas cortadas en diagonal (arriba a la izquierda y abajo a la derecha).
// La sombra va en el contenedor porque `filter` se aplica antes que `clip-path` en el mismo elemento.
export function Panel({ children, corte = 16, marco = crema, fondo = papel, sombra = magenta, grosor = 3, sombraTam = 5, llenar = false, sx, contenido, ...props }) {
  const poligono = (c) => `polygon(${c}px 0, 100% 0, 100% calc(100% - ${c}px), calc(100% - ${c}px) 100%, 0 100%, 0 ${c}px)`
  const alto = llenar ? { height: '100%' } : {}
  return (
    <Box {...props} sx={{ filter: `drop-shadow(${sombraTam}px ${sombraTam}px 0 ${sombra})`, ...alto, ...sx }}>
      <Box sx={{ bgcolor: marco, clipPath: poligono(corte), p: `${grosor}px`, boxSizing: 'border-box', ...alto }}>
        <Box sx={{ bgcolor: fondo, clipPath: poligono(Math.max(corte - grosor * 0.6, 2)), ...alto, ...contenido }}>
          {children}
        </Box>
      </Box>
    </Box>
  )
}

const TONOS = { magenta, celeste, sol, lima }

// Una viñeta de la página con un dato: rótulo pegado arriba a la izquierda, el valor en letras de
// historietista y una trama de puntos del color de la viñeta, solo en el costado derecho para que
// el texto quede sobre fondo limpio. Va dentro de una grilla (ver ComicDetalle).
export function Cuadro({ etiqueta, children, tono = 'magenta', corte = 14, sx }) {
  const color = TONOS[tono] ?? magenta
  return (
    <Panel
      llenar
      corte={corte}
      sombra={color}
      sombraTam={4}
      sx={sx}
      contenido={{
        position: 'relative', overflow: 'hidden', px: 2, pt: 4.5, pb: 1.75, display: 'flex', alignItems: 'flex-end',
        // Sombreado de tinta más clara hacia un lado, como el color plano de una página impresa.
        backgroundImage: `linear-gradient(115deg, transparent 45%, ${alpha(color, 0.2)} 100%)`,
        '&::after': {
          content: '""', position: 'absolute', top: 0, right: 0, bottom: 0, width: '55%', pointerEvents: 'none',
          backgroundImage: `radial-gradient(${alpha(color, 0.55)} 1.7px, transparent 2.1px)`, backgroundSize: '9px 9px',
          maskImage: 'linear-gradient(to left, #000, transparent)', WebkitMaskImage: 'linear-gradient(to left, #000, transparent)',
        },
      }}
    >
      <Recuadro
        sx={{
          position: 'absolute', top: 0, left: `${corte}px`, zIndex: 1, fontSize: '0.75rem', boxShadow: 'none',
          borderTop: 0, borderLeft: 0,
        }}
      >
        {etiqueta}
      </Recuadro>
      <Box sx={{ position: 'relative', zIndex: 1, fontFamily: LETRAS, fontWeight: 700, fontSize: '1.25rem', lineHeight: 1.2, color: crema }}>
        {children}
      </Box>
    </Panel>
  )
}
