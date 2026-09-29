import { Link as RouterLink, Outlet, useNavigate } from 'react-router-dom'
import { AppBar, Box, Button, Container, IconButton, Toolbar, Tooltip, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import LoginIcon from '@mui/icons-material/Login'
import LogoutIcon from '@mui/icons-material/Logout'
import { useAuth } from '../context/AuthContext'
import Logo from './Logo'

export default function Layout() {
  const { usuario, esAdmin, cerrarSesion } = useAuth()
  const navigate = useNavigate()

  const salir = async () => {
    await cerrarSesion()
    navigate('/')
  }

  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="sticky" color="transparent" elevation={0}
        sx={{ backdropFilter: 'blur(10px)', bgcolor: 'rgba(20,18,26,0.85)', borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar sx={{ gap: 1 }}>
          <Box component={RouterLink} to="/" sx={{ display: 'flex', alignItems: 'center', gap: 1.25, color: 'inherit', textDecoration: 'none', mr: 'auto' }}>
            <Logo size={34} />
            <Typography variant="h4" component="span" sx={{ fontSize: { xs: 28, sm: 32 }, lineHeight: 1 }}>
              La Biblio
            </Typography>
          </Box>

          {esAdmin && (
            <Button component={RouterLink} to="/nuevo" variant="contained" startIcon={<AddIcon />}>
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Agregar comic</Box>
              <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>Agregar</Box>
            </Button>
          )}

          {usuario ? (
            <Tooltip title={`Salir (${usuario.email})`}>
              <IconButton onClick={salir} aria-label="Cerrar sesión">
                <LogoutIcon />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title="Ingresar">
              <IconButton component={RouterLink} to="/login" aria-label="Ingresar">
                <LoginIcon />
              </IconButton>
            </Tooltip>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" component="main" sx={{ flex: 1, py: { xs: 2, sm: 4 } }}>
        <Outlet />
      </Container>

      <Box component="footer" sx={{ py: 3, textAlign: 'center', color: 'text.secondary', fontSize: 14 }}>
        La Biblio · hecho con React y Supabase
      </Box>
    </Box>
  )
}
