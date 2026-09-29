import { COLORES } from '../theme'

// Un globo de cómic con una "B". Es el mismo dibujo que public/favicon.svg.
const GLOBO = 'M22 8H40A13 13 0 0 1 53 21V33A13 13 0 0 1 40 46H31L14 58L21 46H22A13 13 0 0 1 9 33V21A13 13 0 0 1 22 8Z'

export default function Logo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="14" fill={COLORES.tinta} />
      <path transform="translate(4 4)" fill={COLORES.magenta} d={GLOBO} />
      <path fill={COLORES.crema} stroke={COLORES.tinta} strokeWidth="2.5" strokeLinejoin="round" d={GLOBO} />
      <path
        fill={COLORES.tinta}
        fillRule="evenodd"
        d="M21 15h11.5c4.7 0 7.5 2.5 7.5 6.2 0 2.7-1.5 4.6-3.7 5.4 3 .8 5 3.1 5 6.2 0 4.4-3.3 7.2-8.4 7.2H21zM27 19.6v5.2h4.6c2 0 3.2-1 3.2-2.6s-1.2-2.6-3.2-2.6zM27 29.4v6h5.2c2.2 0 3.6-1.2 3.6-3s-1.4-3-3.6-3z"
      />
    </svg>
  )
}
