import { Box, Paper, Typography } from '@mui/material'

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

export default function Estadisticas({ datos }) {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
      <Dato valor={datos.tengo} etiqueta="en la biblioteca" />
      <Dato valor={datos.series} etiqueta="series" color="info.main" />
      <Dato valor={`${datos.porcentajeLeido}%`} etiqueta={`leídos (${datos.leidos})`} color="text.primary" />
      <Dato valor={datos.quiero} etiqueta="en la lista de deseos" color="secondary.main" />
    </Box>
  )
}
