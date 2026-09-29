import { memo } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Box, ImageListItem, ImageListItemBar } from '@mui/material'
import { useOnomatopeya } from '../context/OnomatopeyaContext'
import { FORMATOS, nombreCompleto } from '../lib/coleccion'
import { COLORES } from '../theme'
import Aparecer from './Aparecer'
import Portada from './Portada'

const TINTA = '#0c0b10'
const PAPEL = '#e9e2cf'
const AL_ABRIR = ['¡ZAS!', '¡POW!', '¡BAM!', '¡ZOOM!']

const bangers = { fontFamily: '"Bangers", Impact, sans-serif', letterSpacing: '0.05em', fontWeight: 400 }

// Una viñeta de la página: portada con borde de tinta, globo si es de la lista de deseos,
// sello si está leído y caja de narración opcional arriba.
// ImageList le pasa por props el tamaño de la grilla (style); hay que reenviarlo a ImageListItem.
function Vineta({ comic, grande, etiqueta, orden = 0, ...propsDeGrilla }) {
  const explotar = useOnomatopeya()
  const quiero = comic.estado === 'quiero'
  const subtitulo = [comic.editorial, comic.anio, FORMATOS[comic.formato]].filter(Boolean).join(' · ')

  return (
    <ImageListItem
      {...propsDeGrilla}
      sx={{
        // Borde "de papel": sobre fondo oscuro la tinta negra no se vería.
        border: `3px solid ${PAPEL}`,
        bgcolor: TINTA,
        overflow: 'hidden',
        transition: 'transform .15s ease, box-shadow .15s ease',
        '&:hover, &:focus-within': {
          transform: 'translate(-3px, -3px) rotate(-0.6deg)',
          boxShadow: `6px 6px 0 ${COLORES.amarillo}`,
        },
      }}
    >
      {/* El marco de la viñeta está desde el principio y la portada lo llena con la animación. */}
      <Aparecer llenar i={orden} distancia={28} escala={0.92}>
      <Box
        component={RouterLink}
        to={`/comic/${comic.id}`}
        onClick={(e) => explotar(e, AL_ABRIR[Math.floor(Math.random() * AL_ABRIR.length)])}
        aria-label={nombreCompleto(comic)}
        sx={{ display: 'block', height: '100%', color: 'inherit', '&:focus-visible': { outline: `3px solid ${COLORES.amarillo}`, outlineOffset: -6 } }}
      >
        <Portada
          comic={comic}
          sx={{
            height: '100%', aspectRatio: 'auto',
            opacity: quiero ? 0.5 : 1, filter: quiero ? 'grayscale(0.7)' : 'none',
          }}
        />

        {etiqueta && (
          <Box sx={{
            position: 'absolute', top: 0, left: 0, px: 1, py: 0.25, bgcolor: COLORES.amarillo, color: TINTA,
            borderRight: `3px solid ${TINTA}`, borderBottom: `3px solid ${TINTA}`, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em',
          }}>
            {etiqueta}
          </Box>
        )}

        {quiero && (
          <Box sx={{
            ...bangers, position: 'absolute', top: 10, right: 10, px: 1.25, py: 0.5,
            bgcolor: '#fff', color: TINTA, border: `2.5px solid ${TINTA}`, borderRadius: '50%',
            fontSize: grande ? 20 : 15, lineHeight: 1.1,
            // Colita del globo de diálogo.
            '&::after': {
              content: '""', position: 'absolute', left: 12, bottom: -10,
              borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: `10px solid ${TINTA}`,
            },
          }}>
            ¡Lo quiero!
          </Box>
        )}

        {comic.leido && (
          <Box sx={{
            ...bangers, position: 'absolute', top: grande ? 16 : 10, right: quiero ? 'auto' : 10, left: quiero ? 10 : 'auto',
            px: 0.75, color: COLORES.rojo, border: `2.5px solid ${COLORES.rojo}`, borderRadius: 1,
            bgcolor: 'rgba(12,11,16,0.7)', fontSize: grande ? 22 : 15, transform: 'rotate(-12deg)',
          }}>
            Leído
          </Box>
        )}

        <ImageListItemBar
          title={nombreCompleto(comic)}
          subtitle={subtitulo || null}
          sx={{
            bgcolor: 'rgba(12,11,16,0.82)',
            borderTop: `3px solid ${PAPEL}`,
            '& .MuiImageListItemBar-title': { ...bangers, fontSize: grande ? 26 : 18, lineHeight: 1.1, color: COLORES.amarillo },
            '& .MuiImageListItemBar-subtitle': { fontSize: 12, color: 'rgba(255,255,255,0.75)' },
            '& .MuiImageListItemBar-titleWrap': { py: grande ? 1.25 : 0.75, px: 1.25 },
          }}
        />
      </Box>
      </Aparecer>
    </ImageListItem>
  )
}

export default memo(Vineta)
