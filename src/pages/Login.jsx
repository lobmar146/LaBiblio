import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material'
import { useAuth } from '../context/AuthContext'
import Logo from '../components/Logo'

export default function Login() {
  const { usuario, iniciarSesion } = useAuth()
  const navigate = useNavigate()
  const destino = useLocation().state?.desde ?? '/'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [enviando, setEnviando] = useState(false)

  if (usuario) return <Navigate to={destino} replace />

  const enviar = async (e) => {
    e.preventDefault()
    setEnviando(true)
    setError(null)
    try {
      await iniciarSesion(email.trim(), password)
      navigate(destino, { replace: true })
    } catch (err) {
      setError(err.message)
      setEnviando(false)
    }
  }

  return (
    <Box sx={{ display: 'grid', placeItems: 'center', py: { xs: 4, sm: 8 } }}>
      <Paper variant="outlined" sx={{ p: { xs: 3, sm: 4 }, width: '100%', maxWidth: 400 }}>
        <Stack component="form" spacing={2.5} onSubmit={enviar}>
          <Box sx={{ textAlign: 'center' }}>
            <Logo size={52} />
            <Typography variant="h3" component="h1" sx={{ mt: 1 }}>Ingresar</Typography>
            <Typography variant="body2" color="text.secondary">Solo para editar la colección. Para mirarla no hace falta.</Typography>
          </Box>
          <TextField label="Email" type="email" autoComplete="email" required autoFocus
            value={email} onChange={(e) => setEmail(e.target.value)} />
          <TextField label="Contraseña" type="password" autoComplete="current-password" required
            value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <Alert severity="error">{error}</Alert>}
          <Button type="submit" variant="contained" size="large" loading={enviando}>Entrar</Button>
        </Stack>
      </Paper>
    </Box>
  )
}
