import { Link as RouterLink } from 'react-router-dom'
import { Box, Chip, Stack, Tooltip, Typography } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'
import { COLORES } from '../theme'
import Aparecer from './Aparecer'
import { Panel, Recuadro } from './Comic'
import VisorSerie from './VisorSerie'

// Una viñeta por serie con un chip por número: responde "¿qué me falta de esta serie?" de un vistazo.
export default function VistaSeries({ grupos }) {
  return (
    <Stack spacing={2.5}>
      {grupos.map((grupo, i) => (
        <Aparecer key={grupo.serie ?? '__sin_serie'} i={i}>
          <Panel
            sombra={i % 2 ? COLORES.celeste : COLORES.magenta}
            contenido={{ p: 2, display: 'flex', gap: { xs: 1.5, sm: 2.5 }, alignItems: 'flex-start' }}
          >
            {/* Los comics sueltos no tienen nada en común: el visor es solo para series. */}
            {grupo.serie && <VisorSerie comics={grupo.comics} />}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, flexWrap: 'wrap' }}>
                <Typography variant="h4" component="h2" sx={{ fontSize: { xs: 26, sm: 34 }, lineHeight: 1.05 }}>
                  {grupo.serie ?? 'Sin serie'}
                </Typography>
                <Recuadro color={COLORES.celeste} sx={{ fontSize: '0.75rem' }}>
                  {grupo.tengo} en la biblioteca
                  {grupo.quiero > 0 && ` · ${grupo.quiero} en deseos`}
                </Recuadro>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
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
                        sx={{ boxShadow: '2px 2px 0 rgba(0, 0, 0, 0.6)' }}
                      />
                    </Tooltip>
                  )
                })}
              </Box>
            </Box>
          </Panel>
        </Aparecer>
      ))}
    </Stack>
  )
}
