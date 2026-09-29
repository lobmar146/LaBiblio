import { useState } from 'react'
import { Box, Typography } from '@mui/material'
import { urlPortada } from '../lib/comics'
import { nombreCompleto } from '../lib/coleccion'
import { COLORES } from '../theme'

// Portada con proporción de comic (2:3). Sin imagen, o si no carga, dibuja una tapa genérica con el título.
export default function Portada({ comic, src, sx, ...props }) {
  const url = src ?? urlPortada(comic?.portada_path)
  // Se guarda qué URL falló (y no un booleano) para que cambiar de imagen vuelva a intentar.
  const [urlFallida, setUrlFallida] = useState(null)
  const fallo = urlFallida === url

  return (
    <Box sx={{ position: 'relative', aspectRatio: '2 / 3', overflow: 'hidden', bgcolor: COLORES.tinta, ...sx }} {...props}>
      {url && !fallo ? (
        <Box
          component="img"
          src={url}
          alt={comic ? `Portada de ${nombreCompleto(comic)}` : 'Portada'}
          loading="lazy"
          decoding="async"
          onError={() => setUrlFallida(url)}
          sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2,
            textAlign: 'center',
            // Trama de puntos tipo Ben-Day.
            backgroundImage: `radial-gradient(${COLORES.naranja}40 1.5px, transparent 1.5px)`,
            backgroundSize: '10px 10px',
          }}
        >
          <Typography variant="h4" component="span" sx={{ fontSize: 'clamp(18px, 2.2vw, 28px)', color: 'primary.main', lineHeight: 1.05, wordBreak: 'break-word' }}>
            {comic ? nombreCompleto(comic) : 'Sin portada'}
          </Typography>
        </Box>
      )}
    </Box>
  )
}
