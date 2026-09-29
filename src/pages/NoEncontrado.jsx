import { Link as RouterLink } from 'react-router-dom'
import { Button, Stack, Typography } from '@mui/material'
import Aparecer from '../components/Aparecer'
import { Grito } from '../components/Comic'

export default function NoEncontrado() {
  return (
    <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center', py: 10 }}>
      <Aparecer escala={0.6} distancia={0}>
        <Grito>
          <Typography variant="h1" component="p" sx={{ fontSize: { xs: 56, sm: 90 }, color: 'inherit', WebkitTextStroke: 0, textShadow: 'none' }}>¡Kaboom!</Typography>
        </Grito>
      </Aparecer>
      <Aparecer i={2}>
        <Typography color="text.secondary">Esta página no existe.</Typography>
      </Aparecer>
      <Aparecer i={3}>
        <Button component={RouterLink} to="/" variant="contained">Volver a la biblio</Button>
      </Aparecer>
    </Stack>
  )
}
