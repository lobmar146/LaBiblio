import { memo } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Box, Card, CardActionArea, Chip, Tooltip, Typography } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { FORMATOS, nombreCompleto } from '../lib/coleccion'
import Portada from './Portada'

function ComicCard({ comic }) {
  const quiero = comic.estado === 'quiero'
  const subtitulo = [comic.editorial, comic.anio, FORMATOS[comic.formato]].filter(Boolean).join(' · ')

  return (
    <Card sx={{ height: '100%', bgcolor: 'background.paper', transition: 'transform .15s', '&:hover': { transform: 'translateY(-3px)' } }}>
      <CardActionArea component={RouterLink} to={`/comic/${comic.id}`} sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
        <Box sx={{ position: 'relative' }}>
          <Portada comic={comic} sx={{ opacity: quiero ? 0.55 : 1, filter: quiero ? 'grayscale(0.6)' : 'none' }} />
          {quiero && (
            <Chip label="Lo quiero" color="secondary" size="small" sx={{ position: 'absolute', top: 8, left: 8, fontWeight: 700 }} />
          )}
          {comic.leido && (
            <Tooltip title="Leído">
              <CheckCircleIcon sx={{ position: 'absolute', top: 8, right: 8, color: 'primary.main', bgcolor: 'background.default', borderRadius: '50%' }} />
            </Tooltip>
          )}
        </Box>
        <Box sx={{ p: 1.5, flex: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.25 }} noWrap title={nombreCompleto(comic)}>
            {nombreCompleto(comic)}
          </Typography>
          {comic.serie && comic.titulo !== nombreCompleto(comic) && (
            <Typography variant="body2" color="text.secondary" noWrap title={comic.titulo}>
              {comic.titulo}
            </Typography>
          )}
          {subtitulo && (
            <Typography variant="caption" color="text.secondary" noWrap component="p">
              {subtitulo}
            </Typography>
          )}
        </Box>
      </CardActionArea>
    </Card>
  )
}

export default memo(ComicCard)
