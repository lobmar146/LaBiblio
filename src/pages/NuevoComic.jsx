import { useNavigate } from 'react-router-dom'
import { Stack, Typography } from '@mui/material'
import { useComics } from '../context/ComicsContext'
import { crearComic } from '../lib/comics'
import Aparecer from '../components/Aparecer'
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
    <Stack spacing={{ xs: 2, sm: 3 }}>
      <Aparecer lado="izquierda" distancia={40}>
        <Typography variant="h2" component="h1" sx={{ fontSize: { xs: 32, sm: 52 } }}>Agregar comic</Typography>
      </Aparecer>
      <ComicForm onGuardar={guardar} textoBoton="Agregar a la biblio" />
    </Stack>
  )
}
