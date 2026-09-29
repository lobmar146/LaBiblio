import { useMediaQuery } from '@mui/material'
import AnimatedContent from './ReactBits/AnimatedContent'
import './Aparecer.css'

// Envoltorio de AnimatedContent (React Bits) para que todo elemento entre con la misma animación.
//
//   <Aparecer>…</Aparecer>                      sube desde abajo con un fundido
//   <Aparecer i={3}>…</Aparecer>                escalonado: cada `i` espera un poco más
//   <Aparecer lado="izquierda">…</Aparecer>     entra desde un costado
//   <Aparecer llenar>…</Aparecer>               ocupa el alto del contenedor (viñetas de la grilla)
//
// Con "reducir movimiento" activado en el sistema no anima nada: muestra el contenido tal cual.
const ESCALON_S = 0.05
const ESCALON_MAX_S = 0.5

export default function Aparecer({ children, i = 0, lado = 'abajo', distancia = 36, escala = 0.97, llenar = false, ...props }) {
  const reducirMovimiento = useMediaQuery('(prefers-reduced-motion: reduce)')
  const clase = llenar ? 'aparecer aparecer--llenar' : 'aparecer'

  if (reducirMovimiento) return <div className={clase}>{children}</div>

  return (
    <AnimatedContent
      className={clase}
      direction={lado === 'abajo' || lado === 'arriba' ? 'vertical' : 'horizontal'}
      reverse={lado === 'arriba' || lado === 'izquierda'}
      distance={distancia}
      scale={escala}
      duration={0.7}
      ease="power3.out"
      threshold={0.05}
      delay={Math.min(i * ESCALON_S, ESCALON_MAX_S)}
      {...props}
    >
      {children}
    </AnimatedContent>
  )
}
