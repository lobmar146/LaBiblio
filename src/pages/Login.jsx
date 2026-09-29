import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Alert, Box, Button, Stack, TextField, Typography } from '@mui/material'
import { useAuth } from '../context/AuthContext'
import Aparecer from '../components/Aparecer'
import { Globo, Panel } from '../components/Comic'
import Logo from '../components/Logo'
import { COLORES } from '../theme'

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
    <Box sx={{ display: 'grid', justifyContent: 'center', gridTemplateColumns: 'min(100%, 400px)', py: { xs: 4, sm: 8 } }}>
      <Aparecer escala={0.92} distancia={30}>
      <Panel corte={22} sombra={COLORES.celeste} sx={{ width: '100%', maxWidth: 400 }} contenido={{ p: { xs: 3, sm: 4 } }}>
        <Stack component="form" spacing={3} onSubmit={enviar}>
          <Box sx={{ textAlign: 'center' }}>
            <Logo size={52} />
            <Typography variant="h3" component="h1" sx={{ mt: 1, mb: 2 }}>Ingresar</Typography>
            <Globo cola="izquierda" sx={{ textAlign: 'left', fontSize: '0.95rem' }}>
              Solo para editar la colección. ¡Para mirarla no hace falta!
            </Globo>
          </Box>
          <TextField label="Email" type="email" autoComplete="email" required autoFocus
            value={email} onChange={(e) => setEmail(e.target.value)} />
          <TextField label="Contraseña" type="password" autoComplete="current-password" required
            value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <Alert severity="error">{error}</Alert>}
          <Button type="submit" variant="contained" size="large" loading={enviando}>Entrar</Button>
        </Stack>
      </Panel>
      </Aparecer>
    </Box>
  )
}
