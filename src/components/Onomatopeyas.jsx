import { Box } from '@mui/material'
import { keyframes } from '@mui/material/styles'
import { COLORES } from '../theme'

// Estrella de explosión de 12 puntas, alternando radio largo y corto.
const PUNTAS = 12
const ESTRELLA = Array.from({ length: PUNTAS * 2 }, (_, i) => {
  const radio = i % 2 === 0 ? 50 : 32
  const angulo = (Math.PI * i) / PUNTAS
  return `${(50 + radio * Math.cos(angulo)).toFixed(1)},${(50 + radio * Math.sin(angulo)).toFixed(1)}`
}).join(' ')

const CHISPAS = 10

const estallar = keyframes`
  0%   { transform: translate(-50%, -50%) scale(0.2) rotate(calc(var(--giro) - 25deg)); opacity: 0; }
  30%  { transform: translate(-50%, -50%) scale(1.15) rotate(var(--giro)); opacity: 1; }
  45%  { transform: translate(-50%, -50%) scale(0.95) rotate(var(--giro)); }
  75%  { transform: translate(-50%, -50%) scale(1) rotate(var(--giro)); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(1.1) rotate(var(--giro)); opacity: 0; }
`

const chispa = keyframes`
  0%   { transform: rotate(var(--angulo)) translateX(20px) scaleX(0.3); opacity: 1; }
  100% { transform: rotate(var(--angulo)) translateX(95px) scaleX(1); opacity: 0; }
`

export default function Onomatopeyas({ explosiones, duracion }) {
  return (
    <Box aria-hidden="true" sx={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 2000, overflow: 'hidden' }}>
      {explosiones.map(({ id, x, y, palabra, giro }) => (
        <Box key={id} sx={{ position: 'absolute', left: x, top: y }}>
          {/* Chispas: líneas que salen disparadas desde el centro. */}
          {Array.from({ length: CHISPAS }, (_, i) => (
            <Box
              key={i}
              style={{ '--angulo': `${(360 / CHISPAS) * i + giro}deg` }}
              sx={{
                position: 'absolute', left: 0, top: -2, width: 26, height: 4, borderRadius: 2,
                transformOrigin: '0 50%', bgcolor: i % 2 ? COLORES.magenta : COLORES.celeste,
                animation: `${chispa} ${duracion * 0.6}ms ease-out forwards`,
              }}
            />
          ))}
          <Box
            style={{ '--giro': `${giro}deg` }}
            sx={{
              position: 'absolute', left: 0, top: 0, width: 150, height: 150,
              display: 'grid', placeItems: 'center',
              animation: `${estallar} ${duracion}ms cubic-bezier(.2,.9,.3,1.3) forwards`,
            }}
          >
            <svg viewBox="0 0 100 100" width="150" height="150" style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
              <polygon points={ESTRELLA} fill={COLORES.sol} stroke={COLORES.tinta} strokeWidth="3" strokeLinejoin="round" />
            </svg>
            <Box
              component="span"
              sx={{
                position: 'relative', fontFamily: '"Bangers", Impact, sans-serif', letterSpacing: '0.04em',
                fontSize: palabra.length > 6 ? 26 : 34, lineHeight: 1, color: COLORES.magenta,
                WebkitTextStroke: `2px ${COLORES.tinta}`, paintOrder: 'stroke fill', textShadow: `3px 3px 0 ${COLORES.tinta}`, whiteSpace: 'nowrap',
              }}
            >
              {palabra}
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
  )
}
