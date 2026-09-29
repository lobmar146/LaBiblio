import { Box, Button, FormControl, InputAdornment, InputLabel, MenuItem, Select, TextField } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { FILTROS_INICIALES, FORMATOS, ORDENES } from '../lib/coleccion'

function Selector({ etiqueta, valor, onChange, opciones }) {
  const id = `filtro-${etiqueta}`
  return (
    <FormControl size="small" sx={{ minWidth: { xs: 'calc(50% - 6px)', md: 150 }, flex: { xs: 1, md: 'none' } }}>
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

export default function Filtros({ filtros, onChange, editoriales }) {
  const cambiar = (campo) => (valor) => onChange({ ...filtros, [campo]: valor })
  const hayFiltros = Object.keys(FILTROS_INICIALES).some((k) => k !== 'orden' && filtros[k] !== FILTROS_INICIALES[k])

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
      <TextField
        value={filtros.texto}
        onChange={(e) => cambiar('texto')(e.target.value)}
        placeholder="Buscar por título, serie, número, autor…"
        aria-label="Buscar"
        sx={{ flex: '1 1 280px' }}
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
      <Selector etiqueta="Estado" valor={filtros.estado} onChange={cambiar('estado')}
        opciones={{ todos: 'Todos', tengo: 'Los tengo', quiero: 'Los quiero' }} />
      <Selector etiqueta="Lectura" valor={filtros.leido} onChange={cambiar('leido')}
        opciones={{ todos: 'Todos', leidos: 'Leídos', pendientes: 'Sin leer' }} />
      <Selector etiqueta="Formato" valor={filtros.formato} onChange={cambiar('formato')}
        opciones={{ todos: 'Todos', ...FORMATOS }} />
      <Selector etiqueta="Editorial" valor={filtros.editorial} onChange={cambiar('editorial')}
        opciones={{ todas: 'Todas', ...Object.fromEntries(editoriales.map((e) => [e, e])) }} />
      <Selector etiqueta="Orden" valor={filtros.orden} onChange={cambiar('orden')} opciones={ORDENES} />
      {hayFiltros && (
        <Button onClick={() => onChange({ ...FILTROS_INICIALES, orden: filtros.orden })}>Limpiar filtros</Button>
      )}
    </Box>
  )
}
