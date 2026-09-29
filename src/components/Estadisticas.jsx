import { Box, LinearProgress, Typography } from '@mui/material'
import { COLORES } from '../theme'
import { Panel, Recuadro } from './Comic'

function Dato({ valor, etiqueta, color = COLORES.sol, sombra = COLORES.celeste }) {
  return (
    <Panel corte={12} sombra={sombra} sx={{ flex: '1 1 150px' }} contenido={{ px: 2, py: 1.5 }}>
      <Typography variant="h3" component="p" sx={{ fontSize: { xs: 40, sm: 48 }, lineHeight: 1, color }}>
        {valor}
      </Typography>
      <Recuadro color={COLORES.crema} sx={{ mt: 0.75, fontSize: '0.75rem' }}>{etiqueta}</Recuadro>
    </Panel>
  )
}

// Lo único que queda siempre a la vista: cuánto de la biblioteca ya se leyó.
export function ResumenLeidos({ datos }) {
  return (
    <Panel sombra={COLORES.celeste} contenido={{ px: 2, py: 1.25, display: 'flex', alignItems: 'center', gap: 2 }}>
      <Typography variant="h3" component="p" sx={{ fontSize: { xs: 40, sm: 52 }, lineHeight: 1 }}>
        {datos.porcentajeLeido}%
      </Typography>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Recuadro sx={{ fontSize: '0.75rem' }}>
          leídos: {datos.leidos} de {datos.tengo}
        </Recuadro>
        <LinearProgress
          variant="determinate"
          value={datos.porcentajeLeido}
          sx={{ mt: 1, height: 14, borderRadius: 1, '& .MuiLinearProgress-bar': { backgroundColor: COLORES.magenta } }}
        />
      </Box>
    </Panel>
  )
}

// El resto de las estadísticas: viven dentro del panel de filtros.
export default function Estadisticas({ datos }) {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
      <Dato valor={datos.tengo} etiqueta="en la biblioteca" />
      <Dato valor={datos.series} etiqueta="series" color={COLORES.lima} sombra={COLORES.magenta} />
      <Dato valor={datos.quiero} etiqueta="en la lista de deseos" color={COLORES.celeste} sombra={COLORES.magenta} />
    </Box>
  )
}
