import { useEffect, useMemo, useRef, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import {
  Alert, Autocomplete, Box, Button, FormControlLabel, Grid, MenuItem, Paper, Switch, TextField,
  ToggleButton, ToggleButtonGroup, Typography,
} from '@mui/material'
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined'
import { useComics } from '../context/ComicsContext'
import { useOnomatopeya } from '../context/OnomatopeyaContext'
import { buscarDuplicado, FORMATOS, limpiarDatosComic, nombreCompleto, validarComic, valoresUnicos } from '../lib/coleccion'
import { TIPOS_ACEPTADOS } from '../lib/imagen'
import Aparecer from './Aparecer'
import Portada from './Portada'

const VACIO = {
  titulo: '', serie: '', numero: '', editorial: '', guion: '', dibujo: '',
  anio: '', formato: 'grapa', estado: 'tengo', leido: false, notas: '',
}

function aFormulario(comic) {
  if (!comic) return VACIO
  return Object.fromEntries(Object.keys(VACIO).map((k) => [k, comic[k] ?? VACIO[k]]))
}

function CampoSugerido({ etiqueta, valor, onChange, opciones }) {
  return (
    <Autocomplete
      freeSolo
      options={opciones}
      inputValue={valor}
      onInputChange={(_e, nuevo) => onChange(nuevo)}
      renderInput={(params) => <TextField {...params} label={etiqueta} />}
    />
  )
}

/**
 * Formulario compartido por "Agregar" y "Editar".
 * onGuardar(datosLimpios, portada) recibe portada = undefined (sin cambios), null (quitar) o File.
 */
export default function ComicForm({ comic = null, onGuardar, textoBoton = 'Guardar' }) {
  const { comics } = useComics()
  const explotar = useOnomatopeya()
  const [valores, setValores] = useState(() => aFormulario(comic))
  const [portada, setPortada] = useState(undefined)
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const inputArchivo = useRef(null)

  const series = useMemo(() => valoresUnicos(comics, 'serie'), [comics])
  const editoriales = useMemo(() => valoresUnicos(comics, 'editorial'), [comics])
  const duplicado = useMemo(() => buscarDuplicado(comics, valores, comic?.id), [comics, valores, comic?.id])

  const urlPrevia = useMemo(() => (portada instanceof File ? URL.createObjectURL(portada) : null), [portada])
  useEffect(() => () => urlPrevia && URL.revokeObjectURL(urlPrevia), [urlPrevia])

  const tienePortada = portada instanceof File || (portada === undefined && comic?.portada_path)
  const set = (campo) => (valor) => setValores((v) => ({ ...v, [campo]: valor }))
  const setEvento = (campo) => (e) => set(campo)(e.target.value)

  const elegirArchivo = (e) => {
    const archivo = e.target.files?.[0]
    e.target.value = '' // permite volver a elegir el mismo archivo
    if (!archivo) return
    if (!TIPOS_ACEPTADOS.includes(archivo.type)) {
      setErrorGeneral('La portada tiene que ser JPG, PNG o WebP.')
      return
    }
    setErrorGeneral(null)
    setPortada(archivo)
  }

  const enviar = async (e) => {
    e.preventDefault()
    const datos = limpiarDatosComic(valores)
    const nuevosErrores = validarComic(datos)
    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length > 0) return

    // El punto se toma ahora: después de guardar se navega y el botón ya no existe.
    const boton = e.nativeEvent.submitter?.getBoundingClientRect()
    const origen = boton && { clientX: boton.left + boton.width / 2, clientY: boton.top + boton.height / 2 }

    setGuardando(true)
    setErrorGeneral(null)
    try {
      await onGuardar(datos, portada)
      explotar(origen, '¡BAM!')
    } catch (error) {
      setErrorGeneral(error.message)
      setGuardando(false)
    }
  }

  return (
    <Box component="form" onSubmit={enviar} noValidate>
      <Grid container spacing={{ xs: 2, sm: 3 }}>
        <Grid size={{ xs: 12, sm: 5, md: 4 }}>
          {/* En el celular la portada es una fila compacta (miniatura + botones) para que los campos
              se vean sin scrollear. Desde sm vuelve a ser una columna con la portada grande. */}
          <Aparecer lado="izquierda" distancia={40}>
          <Paper
            variant="outlined"
            sx={{
              overflow: 'hidden', maxWidth: { sm: 360 }, mx: 'auto',
              display: { xs: 'flex', sm: 'block' }, alignItems: 'center', gap: 1.5,
            }}
          >
            <Box sx={{ width: { xs: 72, sm: '100%' }, flexShrink: 0 }}>
              {tienePortada ? (
                <Portada comic={comic} src={urlPrevia ?? undefined} />
              ) : (
                <Box
                  component="button"
                  type="button"
                  aria-label="Subir portada"
                  onClick={() => inputArchivo.current?.click()}
                  sx={{
                    width: '100%', aspectRatio: '2 / 3', border: 0, cursor: 'pointer', color: 'text.secondary',
                    bgcolor: 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', gap: 1, font: 'inherit', '&:hover': { color: 'primary.main' },
                  }}
                >
                  <PhotoCameraIcon sx={{ fontSize: { xs: 28, sm: 48 } }} />
                  <Typography sx={{ display: { xs: 'none', sm: 'block' } }}>Subir portada</Typography>
                  <Typography variant="caption" sx={{ px: 1, display: { xs: 'none', sm: 'block' } }}>
                    JPG, PNG o WebP · se achica sola
                  </Typography>
                </Box>
              )}
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'block', sm: 'none' }, pr: 1 }}>
                {tienePortada ? 'Portada' : 'Sin portada todavía'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5, p: { xs: 0, sm: 0.5 }, pr: { xs: 1 } }}>
                <Button fullWidth size="small" onClick={() => inputArchivo.current?.click()} startIcon={<PhotoCameraIcon />}
                  sx={{ justifyContent: { xs: 'flex-start', sm: 'center' } }}>
                  {tienePortada ? 'Cambiar' : 'Elegir foto'}
                </Button>
                {tienePortada && (
                  <Button size="small" color="error" onClick={() => setPortada(comic?.portada_path ? null : undefined)} startIcon={<DeleteOutlineIcon />}>
                    Quitar
                  </Button>
                )}
              </Box>
            </Box>
            {/* capture no está: en el celular deja elegir entre cámara y galería. */}
            <input ref={inputArchivo} type="file" accept={TIPOS_ACEPTADOS.join(',')} hidden onChange={elegirArchivo} />
          </Paper>
          </Aparecer>
        </Grid>

        <Grid size={{ xs: 12, sm: 7, md: 8 }}>
          <Aparecer i={2} distancia={30}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 8 }}>
              <CampoSugerido etiqueta="Serie" valor={valores.serie} onChange={set('serie')} opciones={series} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField label="Número" value={valores.numero} onChange={setEvento('numero')} placeholder="1, 1/2, Annual 3…" />
            </Grid>
            <Grid size={12}>
              <TextField
                label="Título"
                value={valores.titulo}
                onChange={setEvento('titulo')}
                error={Boolean(errores.titulo)}
                helperText={errores.titulo ?? (valores.serie && !valores.titulo ? `Si lo dejás vacío queda "${nombreCompleto({ serie: valores.serie.trim(), numero: valores.numero.trim().replace(/^#/, '') || null })}"` : ' ')}
              />
            </Grid>

            {duplicado && (
              <Grid size={12}>
                <Alert severity={duplicado.estado === 'tengo' ? 'warning' : 'info'}>
                  {duplicado.estado === 'tengo' ? 'Ya tenés ' : 'Ya está en tu lista de deseos: '}
                  <RouterLink to={`/comic/${duplicado.id}`} style={{ color: 'inherit', fontWeight: 700 }}>
                    {nombreCompleto(duplicado)}
                  </RouterLink>
                  .
                </Alert>
              </Grid>
            )}

            <Grid size={{ xs: 12, md: 6 }}>
              <CampoSugerido etiqueta="Editorial" valor={valores.editorial} onChange={set('editorial')} opciones={editoriales} />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <TextField label="Año" type="number" value={valores.anio} onChange={setEvento('anio')}
                error={Boolean(errores.anio)} helperText={errores.anio} slotProps={{ htmlInput: { min: 1900, max: 2100 } }} />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <TextField select label="Formato" value={valores.formato} onChange={setEvento('formato')}>
                {Object.entries(FORMATOS).map(([clave, texto]) => (
                  <MenuItem key={clave} value={clave}>{texto}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField label="Guion" value={valores.guion} onChange={setEvento('guion')} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField label="Dibujo" value={valores.dibujo} onChange={setEvento('dibujo')} />
            </Grid>

            <Grid size={12} sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
              <ToggleButtonGroup exclusive size="small" value={valores.estado} onChange={(_e, v) => v && set('estado')(v)} aria-label="Estado">
                <ToggleButton value="tengo" sx={{ px: 2 }}>Lo tengo</ToggleButton>
                <ToggleButton value="quiero" sx={{ px: 2 }}>Lo quiero</ToggleButton>
              </ToggleButtonGroup>
              <FormControlLabel
                control={<Switch checked={valores.leido} onChange={(e) => set('leido')(e.target.checked)} />}
                label="Leído"
              />
            </Grid>

            <Grid size={12}>
              <TextField label="Notas" multiline minRows={3} value={valores.notas} onChange={setEvento('notas')}
                placeholder="Variante de tapa, estado de conservación, dónde lo compraste…" />
            </Grid>

            {errorGeneral && (
              <Grid size={12}>
                <Alert severity="error">{errorGeneral}</Alert>
              </Grid>
            )}

            <Grid size={12} sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end' }}>
              <Button component={RouterLink} to={comic ? `/comic/${comic.id}` : '/'} disabled={guardando}>
                Cancelar
              </Button>
              <Button type="submit" variant="contained" loading={guardando}>
                {textoBoton}
              </Button>
            </Grid>
          </Grid>
          </Aparecer>
        </Grid>
      </Grid>
    </Box>
  )
}
