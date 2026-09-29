import { useNavigate, useParams } from 'react-router-dom'
import { Alert, Box, CircularProgress, Stack, Typography } from '@mui/material'
import { useComics } from '../context/ComicsContext'
import { actualizarComic } from '../lib/comics'
import { nombreCompleto } from '../lib/coleccion'
import ComicForm from '../components/ComicForm'

export default function EditarComic() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { comics, cargando, guardarLocal } = useComics()
  const comic = comics.find((c) => c.id === id)

  if (!comic) {
    return cargando ? (
      <Box sx={{ display: 'grid', placeItems: 'center', py: 12 }}><CircularProgress /></Box>
    ) : (
      <Alert severity="info">Ese comic no existe (o fue borrado).</Alert>
    )
  }

  const guardar = async (datos, portada) => {
    guardarLocal(await actualizarComic(comic, datos, portada))
    navigate(`/comic/${comic.id}`, { replace: true })
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h2" component="h1" sx={{ fontSize: { xs: 40, sm: 52 } }}>
        Editar {nombreCompleto(comic)}
      </Typography>
      {/* key: si cambia el comic, el formulario arranca de cero con sus datos. */}
      <ComicForm key={comic.id} comic={comic} onGuardar={guardar} />
    </Stack>
  )
}
