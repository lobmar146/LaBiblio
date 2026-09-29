import { useNavigate } from 'react-router-dom'
import { Stack, Typography } from '@mui/material'
import { useComics } from '../context/ComicsContext'
import { crearComic } from '../lib/comics'
import ComicForm from '../components/ComicForm'

export default function NuevoComic() {
  const navigate = useNavigate()
  const { guardarLocal } = useComics()

  const guardar = async (datos, portada) => {
    const comic = await crearComic(datos, portada ?? null)
    guardarLocal(comic)
    navigate(`/comic/${comic.id}`, { replace: true })
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h2" component="h1" sx={{ fontSize: { xs: 40, sm: 52 } }}>Agregar comic</Typography>
      <ComicForm onGuardar={guardar} textoBoton="Agregar a la biblio" />
    </Stack>
  )
}
