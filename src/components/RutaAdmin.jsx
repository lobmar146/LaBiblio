import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Alert, Box, CircularProgress } from '@mui/material'
import { useAuth } from '../context/AuthContext'

// Solo protege la interfaz. La protección real está en las políticas RLS de Supabase.
export default function RutaAdmin() {
  const { usuario, esAdmin, cargando } = useAuth()
  const location = useLocation()

  if (cargando) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    )
  }
  if (!usuario) return <Navigate to="/login" replace state={{ desde: location.pathname }} />
  if (!esAdmin) {
    return (
      <Alert severity="warning" sx={{ maxWidth: 560, mx: 'auto' }}>
        Tu usuario no tiene permiso para editar la colección. Agregalo a la tabla <code>admins</code> en Supabase.
      </Alert>
    )
  }
  return <Outlet />
}
