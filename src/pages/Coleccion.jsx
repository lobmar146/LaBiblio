import { useDeferredValue, useMemo, useState } from 'react'
import { Link as RouterLink, useSearchParams } from 'react-router-dom'
import { Alert, Box, Button, CircularProgress, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import GridViewIcon from '@mui/icons-material/GridView'
import ViewListIcon from '@mui/icons-material/ViewList'
import { useAuth } from '../context/AuthContext'
import { useComics } from '../context/ComicsContext'
import {
  agruparPorSerie, estadisticas, FILTROS_INICIALES, filtrarComics, ordenarComics, valoresUnicos,
} from '../lib/coleccion'
import ComicCard from '../components/ComicCard'
import Estadisticas from '../components/Estadisticas'
import Filtros from '../components/Filtros'
import VistaSeries from '../components/VistaSeries'

const POR_TANDA = 60

// Los filtros se copian a la URL: al volver del detalle quedan como estaban y se pueden compartir.
// La URL solo se lee al entrar; mientras tanto manda el estado local, porque las navegaciones
// del router son asíncronas y un input atado directo a la URL pierde letras al tipear rápido.
function useFiltrosEnUrl() {
  const [params, setParams] = useSearchParams()
  const [estado, setEstado] = useState(() => ({
    filtros: Object.fromEntries(Object.entries(FILTROS_INICIALES).map(([k, def]) => [k, params.get(k) ?? def])),
    vista: params.get('vista') === 'series' ? 'series' : 'grilla',
  }))

  const actualizar = (siguiente) => {
    setEstado(siguiente)
    const url = new URLSearchParams()
    for (const [k, v] of Object.entries(siguiente.filtros)) if (v !== FILTROS_INICIALES[k]) url.set(k, v)
    if (siguiente.vista === 'series') url.set('vista', 'series')
    setParams(url, { replace: true })
  }

  return {
    ...estado,
    setFiltros: (filtros) => actualizar({ ...estado, filtros }),
    setVista: (vista) => actualizar({ ...estado, vista }),
  }
}

export default function Coleccion() {
  const { comics, cargando, error, recargar } = useComics()
  const { esAdmin } = useAuth()
  const { filtros, vista, setFiltros, setVista } = useFiltrosEnUrl()
  const filtrosDiferidos = useDeferredValue(filtros)

  const editoriales = useMemo(() => valoresUnicos(comics, 'editorial'), [comics])
  const stats = useMemo(() => estadisticas(comics), [comics])
  const resultado = useMemo(
    () => ordenarComics(filtrarComics(comics, filtrosDiferidos), filtrosDiferidos.orden),
    [comics, filtrosDiferidos],
  )
  const grupos = useMemo(() => (vista === 'series' ? agruparPorSerie(resultado) : []), [resultado, vista])

  // Se muestran de a tandas; cualquier cambio de filtros vuelve a la primera.
  const claveFiltros = JSON.stringify(filtrosDiferidos)
  const [tanda, setTanda] = useState({ clave: claveFiltros, cantidad: POR_TANDA })
  const cantidad = tanda.clave === claveFiltros ? tanda.cantidad : POR_TANDA

  if (cargando && comics.length === 0) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', py: 12 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error" action={<Button color="inherit" onClick={recargar}>Reintentar</Button>}>
        No se pudo cargar la colección: {error}
      </Alert>
    )
  }

  if (comics.length === 0) {
    return (
      <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center', py: 10 }}>
        <Typography variant="h2" sx={{ fontSize: { xs: 44, sm: 64 } }}>La biblioteca está vacía</Typography>
        <Typography color="text.secondary">Todavía no hay comics cargados.</Typography>
        {esAdmin && (
          <Button component={RouterLink} to="/nuevo" variant="contained" size="large">
            Cargar el primero
          </Button>
        )}
      </Stack>
    )
  }

  return (
    <Stack spacing={3}>
      <Estadisticas datos={stats} />
      <Filtros filtros={filtros} onChange={setFiltros} editoriales={editoriales} />

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        <Typography color="text.secondary" aria-live="polite">
          {resultado.length === comics.length
            ? `${comics.length} comics`
            : `${resultado.length} de ${comics.length} comics`}
        </Typography>
        <ToggleButtonGroup exclusive size="small" value={vista} onChange={(_e, v) => v && setVista(v)} aria-label="Vista">
          <ToggleButton value="grilla" aria-label="Ver portadas"><GridViewIcon fontSize="small" /></ToggleButton>
          <ToggleButton value="series" aria-label="Ver por serie"><ViewListIcon fontSize="small" /></ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {resultado.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h4" component="p">¡No lo tenés!</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>Ningún comic coincide con la búsqueda.</Typography>
        </Box>
      ) : vista === 'series' ? (
        <VistaSeries grupos={grupos} />
      ) : (
        <>
          <Box
            sx={{
              display: 'grid',
              gap: { xs: 1.5, sm: 2.5 },
              gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(auto-fill, minmax(170px, 1fr))' },
            }}
          >
            {resultado.slice(0, cantidad).map((comic) => (
              <ComicCard key={comic.id} comic={comic} />
            ))}
          </Box>
          {cantidad < resultado.length && (
            <Box sx={{ textAlign: 'center' }}>
              <Button variant="outlined" onClick={() => setTanda({ clave: claveFiltros, cantidad: cantidad + POR_TANDA })}>
                Mostrar más ({resultado.length - cantidad} restantes)
              </Button>
            </Box>
          )}
        </>
      )}
    </Stack>
  )
}
