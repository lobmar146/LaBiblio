import { Box, Paper, Typography } from '@mui/material'
import Logo from '../components/Logo'

// Se muestra cuando faltan las variables de entorno de Supabase (ver README).
export default function SinConfigurar() {
  return (
    <Box sx={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', p: 2 }}>
      <Paper variant="outlined" sx={{ p: 4, maxWidth: 560 }}>
        <Logo size={48} />
        <Typography variant="h3" component="h1" sx={{ mt: 1 }}>Falta conectar Supabase</Typography>
        <Typography sx={{ mt: 1.5 }}>
          Copiá <code>.env.example</code> a <code>.env</code> y completá <code>VITE_SUPABASE_URL</code> y{' '}
          <code>VITE_SUPABASE_ANON_KEY</code> con los datos de tu proyecto (Project Settings → API).
          Después reiniciá <code>npm run dev</code>.
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1.5 }}>
          En Vercel, cargá las mismas dos variables en Settings → Environment Variables y volvé a desplegar.
        </Typography>
      </Paper>
    </Box>
  )
}
