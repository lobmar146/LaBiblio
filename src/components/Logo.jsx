import { COLORES } from '../theme'

// Un libro abierto: una página naranja y una celeste. Es el mismo dibujo que public/favicon.svg.
export default function Logo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="14" fill={COLORES.tinta} />
      <path d="M14 16h16a4 4 0 0 1 4 4v30a3 3 0 0 0-3-3H14z" fill={COLORES.naranja} />
      <path d="M50 16H38a4 4 0 0 0-4 4v30a3 3 0 0 1 3-3h13z" fill={COLORES.celeste} />
    </svg>
  )
}
