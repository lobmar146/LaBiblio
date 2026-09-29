import { Link as RouterLink } from 'react-router-dom'
import { Button, Stack, Typography } from '@mui/material'

export default function NoEncontrado() {
  return (
    <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center', py: 10 }}>
      <Typography variant="h1" sx={{ fontSize: { xs: 72, sm: 110 }, color: 'secondary.main' }}>¡Kaboom!</Typography>
      <Typography color="text.secondary">Esta página no existe.</Typography>
      <Button component={RouterLink} to="/" variant="contained">Volver a la biblio</Button>
    </Stack>
  )
}
