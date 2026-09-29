import { Link as RouterLink } from 'react-router-dom'
import { Box, Chip, Paper, Stack, Tooltip, Typography } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'
import Aparecer from './Aparecer'
import VisorSerie from './VisorSerie'

// Una fila por serie con un chip por número: responde "¿qué me falta de esta serie?" de un vistazo.
export default function VistaSeries({ grupos }) {
  return (
    <Stack spacing={1.5}>
      {grupos.map((grupo, i) => (
        <Aparecer key={grupo.serie ?? '__sin_serie'} i={i}>
        <Paper variant="outlined" sx={{ p: 2, display: 'flex', gap: { xs: 1.5, sm: 2.5 }, alignItems: 'flex-start' }}>
          {/* Los comics sueltos no tienen nada en común: el visor es solo para series. */}
          {grupo.serie && <VisorSerie comics={grupo.comics} />}
          <Box sx={{ flex: 1, minWidth: 0 }}>
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
          </Box>
        </Paper>
        </Aparecer>
      ))}
    </Stack>
  )
}
