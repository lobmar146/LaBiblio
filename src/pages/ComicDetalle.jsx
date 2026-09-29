import { useEffect, useState } from 'react'
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom'
import {
  Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText,
  DialogTitle, Grid, Paper, Stack, Typography,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import { useAuth } from '../context/AuthContext'
import { useComics } from '../context/ComicsContext'
import { useOnomatopeya } from '../context/OnomatopeyaContext'
import { actualizarComic, borrarComic, obtenerComic } from '../lib/comics'
import { FORMATOS, nombreCompleto } from '../lib/coleccion'
import Aparecer from '../components/Aparecer'
import Portada from '../components/Portada'

function Dato({ etiqueta, valor }) {
  if (valor === null || valor === undefined || valor === '') return null
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: 2, py: 1, borderBottom: 1, borderColor: 'divider' }}>
      <Typography color="text.secondary">{etiqueta}</Typography>
      <Typography>{valor}</Typography>
    </Box>
  )
}

export default function ComicDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { esAdmin } = useAuth()
  const explotar = useOnomatopeya()
  const { comics, cargando: cargandoLista, guardarLocal, quitarLocal } = useComics()
  const enLista = comics.find((c) => c.id === id)

  // Si se entra directo por URL y la lista todavía no llegó, se pide solo este comic.
  const [suelto, setSuelto] = useState({ id: null, comic: null, error: null })
  const necesitaPedirlo = !enLista && !cargandoLista && suelto.id !== id
  useEffect(() => {
    if (!necesitaPedirlo) return
    let vigente = true
    obtenerComic(id)
      .then((comic) => vigente && setSuelto({ id, comic, error: null }))
      .catch((error) => vigente && setSuelto({ id, comic: null, error: error.message }))
    return () => {
      vigente = false
    }
  }, [id, necesitaPedirlo])

  const comic = enLista ?? (suelto.id === id ? suelto.comic : null)
  const [confirmando, setConfirmando] = useState(false)
  const [ocupado, setOcupado] = useState(false)
  const [errorAccion, setErrorAccion] = useState(null)

  if (!comic) {
    if (suelto.id === id) {
      return (
        <Alert severity={suelto.error ? 'error' : 'info'} action={<Button color="inherit" component={RouterLink} to="/">Volver</Button>}>
          {suelto.error ?? 'Ese comic no existe (o fue borrado).'}
        </Alert>
      )
    }
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', py: 12 }}>
        <CircularProgress />
      </Box>
    )
  }

  const alternarLeido = async (e) => {
    if (!comic.leido) explotar(e, '¡CHAN!')
    setOcupado(true)
    setErrorAccion(null)
    try {
      guardarLocal(await actualizarComic(comic, { leido: !comic.leido }))
    } catch (e) {
      setErrorAccion(e.message)
    } finally {
      setOcupado(false)
    }
  }

  const borrar = async (e) => {
    explotar(e, '¡KABOOM!')
    setOcupado(true)
    try {
      await borrarComic(comic)
      quitarLocal(comic.id)
      navigate('/', { replace: true })
    } catch (e) {
      setErrorAccion(e.message)
      setConfirmando(false)
      setOcupado(false)
    }
  }

  const titulo = nombreCompleto(comic)

  return (
    <Stack spacing={3}>
      <Aparecer distancia={16}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/'))}>
          Volver
        </Button>
      </Aparecer>

      <Grid container spacing={{ xs: 3, md: 5 }}>
        <Grid size={{ xs: 12, sm: 5, md: 4 }}>
          <Aparecer lado="izquierda" distancia={60} escala={0.94}>
            <Paper variant="outlined" sx={{ overflow: 'hidden', maxWidth: 420, mx: 'auto' }}>
              <Portada comic={comic} />
            </Paper>
          </Aparecer>
        </Grid>

        <Grid size={{ xs: 12, sm: 7, md: 8 }}>
          <Aparecer lado="derecha" distancia={60} i={2}>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip label={comic.estado === 'tengo' ? 'Lo tengo' : 'Lo quiero'} color={comic.estado === 'tengo' ? 'primary' : 'secondary'} />
              <Chip label={comic.leido ? 'Leído' : 'Sin leer'} variant="outlined" />
              <Chip label={FORMATOS[comic.formato]} variant="outlined" />
            </Box>

            <Typography variant="h2" component="h1" sx={{ fontSize: { xs: 40, md: 56 }, lineHeight: 1 }}>
              {titulo}
            </Typography>
            {comic.titulo !== titulo && (
              <Typography variant="h6" component="p" color="text.secondary">{comic.titulo}</Typography>
            )}

            <Box>
              <Dato etiqueta="Editorial" valor={comic.editorial} />
              <Dato etiqueta="Año" valor={comic.anio} />
              <Dato etiqueta="Guion" valor={comic.guion} />
              <Dato etiqueta="Dibujo" valor={comic.dibujo} />
            </Box>

            {comic.notas && (
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="overline" color="text.secondary">Notas</Typography>
                <Typography sx={{ whiteSpace: 'pre-wrap' }}>{comic.notas}</Typography>
              </Paper>
            )}

            {errorAccion && <Alert severity="error">{errorAccion}</Alert>}

            {esAdmin && (
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', pt: 1 }}>
                <Button variant="contained" startIcon={<EditIcon />} component={RouterLink} to={`/comic/${comic.id}/editar`}>
                  Editar
                </Button>
                <Button variant="outlined" onClick={alternarLeido} disabled={ocupado}
                  startIcon={comic.leido ? <RadioButtonUncheckedIcon /> : <CheckCircleIcon />}>
                  {comic.leido ? 'Marcar sin leer' : 'Marcar leído'}
                </Button>
                <Button color="error" startIcon={<DeleteIcon />} onClick={() => setConfirmando(true)} disabled={ocupado}>
                  Borrar
                </Button>
              </Box>
            )}
          </Stack>
          </Aparecer>
        </Grid>
      </Grid>

      <Dialog open={confirmando} onClose={() => !ocupado && setConfirmando(false)}>
        <DialogTitle>¿Borrar {titulo}?</DialogTitle>
        <DialogContent>
          <DialogContentText>Se borra el comic y su portada. No se puede deshacer.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmando(false)} disabled={ocupado}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={borrar} loading={ocupado}>Borrar</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
