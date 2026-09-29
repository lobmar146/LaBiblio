import { useState } from 'react'
import {
  Badge, Box, Button, Collapse, FormControl, InputAdornment, InputLabel, MenuItem, Select, TextField,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import TuneIcon from '@mui/icons-material/Tune'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { FILTROS_INICIALES, FORMATOS, ORDENES } from '../lib/coleccion'
import Aparecer from './Aparecer'

const CLAVES_DEL_PANEL = ['estado', 'leido', 'formato', 'editorial']

function Selector({ etiqueta, valor, onChange, opciones }) {
  const id = `filtro-${etiqueta}`
  return (
    <FormControl size="small" fullWidth>
      <InputLabel id={id}>{etiqueta}</InputLabel>
      <Select labelId={id} label={etiqueta} value={valor} onChange={(e) => onChange(e.target.value)}>
        {Object.entries(opciones).map(([clave, texto]) => (
          <MenuItem key={clave} value={clave}>
            {texto}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

// El buscador y el botón quedan siempre a la vista; los selectores (y lo que llegue en `resto`)
// se despliegan al tocar "Filtros". El botón marca cuántos filtros hay activos aunque esté cerrado.
export default function Filtros({ filtros, onChange, editoriales, resto }) {
  const [abierto, setAbierto] = useState(false)
  const cambiar = (campo) => (valor) => onChange({ ...filtros, [campo]: valor })
  const activos = CLAVES_DEL_PANEL.filter((k) => filtros[k] !== FILTROS_INICIALES[k]).length

  const selectores = [
    { etiqueta: 'Estado', campo: 'estado', opciones: { todos: 'Todos', tengo: 'Los tengo', quiero: 'Los quiero' } },
    { etiqueta: 'Lectura', campo: 'leido', opciones: { todos: 'Todos', leidos: 'Leídos', pendientes: 'Sin leer' } },
    { etiqueta: 'Formato', campo: 'formato', opciones: { todos: 'Todos', ...FORMATOS } },
    {
      etiqueta: 'Editorial', campo: 'editorial',
      opciones: { todas: 'Todas', ...Object.fromEntries(editoriales.map((e) => [e, e])) },
    },
    { etiqueta: 'Orden', campo: 'orden', opciones: ORDENES },
  ]

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
        <TextField
          value={filtros.texto}
          onChange={(e) => cambiar('texto')(e.target.value)}
          placeholder="Buscar por título, serie, número, autor…"
          aria-label="Buscar"
          sx={{ flex: 1 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            },
          }}
        />
        <Badge badgeContent={activos} color="secondary" invisible={activos === 0}>
          <Button
            variant={abierto ? 'contained' : 'outlined'}
            color={abierto ? 'primary' : 'inherit'}
            onClick={() => setAbierto((v) => !v)}
            aria-expanded={abierto}
            aria-controls="panel-filtros"
            startIcon={<TuneIcon />}
            endIcon={<ExpandMoreIcon sx={{ transform: abierto ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />}
            sx={{ height: 40, whiteSpace: 'nowrap', borderColor: 'divider' }}
          >
            Filtros
          </Button>
        </Badge>
      </Box>

      <Collapse in={abierto} unmountOnExit timeout={250} id="panel-filtros">
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {resto && <Aparecer distancia={20}>{resto}</Aparecer>}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2.5, alignItems: 'center', pt: 2 }}>
            {selectores.map(({ etiqueta, campo, opciones }, i) => (
              <Box key={campo} sx={{ flex: { xs: '1 1 calc(50% - 6px)', md: '0 0 170px' }, minWidth: 0 }}>
                <Aparecer i={i + 1} distancia={20}>
                  <Selector etiqueta={etiqueta} valor={filtros[campo]} onChange={cambiar(campo)} opciones={opciones} />
                </Aparecer>
              </Box>
            ))}
            {activos > 0 && (
              <Button onClick={() => onChange({ ...FILTROS_INICIALES, texto: filtros.texto, orden: filtros.orden })}>
                Limpiar filtros
              </Button>
            )}
          </Box>
        </Box>
      </Collapse>
    </Box>
  )
}
