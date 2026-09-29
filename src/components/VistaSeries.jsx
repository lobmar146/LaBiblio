import { Link as RouterLink } from 'react-router-dom'
import { Box, Chip, Paper, Stack, Tooltip, Typography } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'

// Una fila por serie con un chip por número: responde "¿qué me falta de esta serie?" de un vistazo.
export default function VistaSeries({ grupos }) {
  return (
    <Stack spacing={1.5}>
      {grupos.map((grupo) => (
        <Paper key={grupo.serie ?? '__sin_serie'} variant="outlined" sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, mb: 1.25, flexWrap: 'wrap' }}>
            <Typography variant="h6" component="h2">
              {grupo.serie ?? 'Sin serie'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {grupo.tengo} en la biblioteca
              {grupo.quiero > 0 && ` · ${grupo.quiero} en deseos`}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {grupo.comics.map((comic) => {
              const etiqueta = grupo.serie ? (comic.numero ? `#${comic.numero}` : comic.titulo) : comic.titulo
              return (
                <Tooltip key={comic.id} title={`${comic.titulo}${comic.estado === 'quiero' ? ' (lo quiero)' : ''}${comic.leido ? ' · leído' : ''}`}>
                  <Chip
                    component={RouterLink}
                    to={`/comic/${comic.id}`}
                    clickable
                    label={etiqueta}
                    icon={comic.leido ? <CheckIcon /> : undefined}
                    color={comic.estado === 'quiero' ? 'secondary' : 'primary'}
                    variant={comic.estado === 'quiero' ? 'outlined' : 'filled'}
                    sx={{ fontWeight: 600 }}
                  />
                </Tooltip>
              )
            })}
          </Box>
        </Paper>
      ))}
    </Stack>
  )
}
