import { Box } from '@mui/material'
import { COLORES, LETRAS, LETRAS_TITULO } from '../theme'

const { tinta, crema, sol, magenta, papel } = COLORES

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
export function Panel({ children, corte = 16, marco = crema, fondo = papel, sombra = magenta, grosor = 3, sx, contenido, ...props }) {
  const poligono = (c) => `polygon(${c}px 0, 100% 0, 100% calc(100% - ${c}px), calc(100% - ${c}px) 100%, 0 100%, 0 ${c}px)`
  return (
    <Box {...props} sx={{ filter: `drop-shadow(5px 5px 0 ${sombra})`, ...sx }}>
      <Box sx={{ bgcolor: marco, clipPath: poligono(corte), p: `${grosor}px` }}>
        <Box sx={{ bgcolor: fondo, clipPath: poligono(Math.max(corte - grosor * 0.6, 2)), ...contenido }}>
          {children}
        </Box>
      </Box>
    </Box>
  )
}
