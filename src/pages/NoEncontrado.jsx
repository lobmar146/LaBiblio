import { Link as RouterLink } from 'react-router-dom'
import { Button, Stack, Typography } from '@mui/material'
import Aparecer from '../components/Aparecer'

export default function NoEncontrado() {
  return (
    <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center', py: 10 }}>
      <Aparecer escala={0.6} distancia={0}>
        <Typography variant="h1" sx={{ fontSize: { xs: 72, sm: 110 }, color: 'secondary.main' }}>¡Kaboom!</Typography>
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
