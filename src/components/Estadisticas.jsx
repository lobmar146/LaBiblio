import { Box, LinearProgress, Paper, Typography } from '@mui/material'

function Dato({ valor, etiqueta, color = 'primary.main' }) {
  return (
    <Paper variant="outlined" sx={{ px: 2, py: 1.5, flex: '1 1 120px' }}>
      <Typography variant="h3" component="p" sx={{ color, fontSize: { xs: 30, sm: 38 }, lineHeight: 1 }}>
        {valor}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {etiqueta}
      </Typography>
    </Paper>
  )
}

// Lo único que queda siempre a la vista: cuánto de la biblioteca ya se leyó.
export function ResumenLeidos({ datos }) {
  return (
    <Paper variant="outlined" sx={{ px: 2, py: 1.25, display: 'flex', alignItems: 'center', gap: 2 }}>
      <Typography variant="h3" component="p" sx={{ fontSize: { xs: 30, sm: 38 }, lineHeight: 1 }}>
        {datos.porcentajeLeido}%
      </Typography>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" color="text.secondary">
          leídos ({datos.leidos} de {datos.tengo})
        </Typography>
        <LinearProgress variant="determinate" value={datos.porcentajeLeido} sx={{ mt: 0.75, height: 6, borderRadius: 3 }} />
      </Box>
    </Paper>
  )
}

// El resto de las estadísticas: viven dentro del panel de filtros.
export default function Estadisticas({ datos }) {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
      <Dato valor={datos.tengo} etiqueta="en la biblioteca" />
      <Dato valor={datos.series} etiqueta="series" color="info.main" />
      <Dato valor={datos.quiero} etiqueta="en la lista de deseos" color="secondary.main" />
    </Box>
  )
}
