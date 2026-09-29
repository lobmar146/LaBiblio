import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { theme } from './theme'
import { configurado } from './lib/supabase'
import App from './App'
import SinConfigurar from './pages/SinConfigurar'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {configurado ? (
        <BrowserRouter>
          <App />
        </BrowserRouter>
      ) : (
        <SinConfigurar />
      )}
    </ThemeProvider>
  </StrictMode>,
)
