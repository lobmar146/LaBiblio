import { createTheme } from '@mui/material/styles'

export const COLORES = {
  fondo: '#14121a',
  papel: '#1e1b26',
  amarillo: '#ffd23f',
  rojo: '#ef3e36',
  celeste: '#3fa7ff',
}

const titulos = { fontFamily: '"Bangers", "Impact", sans-serif', letterSpacing: '0.04em', fontWeight: 400 }

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: COLORES.amarillo, contrastText: '#1a1400' },
    secondary: { main: COLORES.rojo },
    info: { main: COLORES.celeste },
    background: { default: COLORES.fondo, paper: COLORES.papel },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: '"Inter", system-ui, sans-serif',
    h1: titulos,
    h2: titulos,
    h3: titulos,
    h4: titulos,
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiTextField: { defaultProps: { size: 'small', fullWidth: true } },
    MuiSelect: { defaultProps: { size: 'small' } },
  },
})
