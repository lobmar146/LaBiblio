import { alpha, createTheme } from '@mui/material/styles'

// Paleta inspirada en Comix Zone (Sega, 1995): páginas de tinta negra con marcos color papel,
// naranja de "explosión" como color principal y un verde ácido de mutante. El celeste es el
// segundo color de la casa (un guiño a la bandera argentina).
export const COLORES = {
  tinta: '#0b0a0f',
  fondo: '#121016',
  papel: '#1c1a24',
  crema: '#efe1c2',
  naranja: '#ff8a1f',
  celeste: '#75aadb',
  verde: '#7ccf6b',
}

const titulos = {
  fontFamily: '"Bangers", "Impact", sans-serif',
  letterSpacing: '0.04em',
  fontWeight: 400,
  // Sombra dura, como el rotulado de las viñetas.
  textShadow: '2px 2px 0 rgba(0, 0, 0, 0.65)',
}

const marco = alpha(COLORES.crema, 0.3)

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: COLORES.naranja, contrastText: COLORES.tinta },
    secondary: { main: COLORES.celeste, contrastText: COLORES.tinta },
    info: { main: COLORES.verde, contrastText: COLORES.tinta },
    background: { default: COLORES.fondo, paper: COLORES.papel },
    text: { primary: '#f3ead6', secondary: alpha('#f3ead6', 0.7) },
    divider: alpha(COLORES.crema, 0.16),
  },
  shape: { borderRadius: 6 },
  typography: {
    fontFamily: '"Inter", system-ui, sans-serif',
    h1: titulos,
    h2: titulos,
    h3: titulos,
    h4: titulos,
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 700 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          // Trama de puntos (Ben-Day) muy tenue sobre la tinta, y una viñeta oscura en los bordes.
          backgroundImage: `radial-gradient(${alpha(COLORES.crema, 0.055)} 1px, transparent 1.2px), radial-gradient(ellipse at 50% 0%, transparent 55%, rgba(0, 0, 0, 0.45) 130%)`,
          backgroundSize: '7px 7px, 100% 100%',
          backgroundAttachment: 'fixed',
        },
        '::selection': { background: COLORES.naranja, color: COLORES.tinta },
      },
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: 'none' } },
      variants: [
        {
          props: { variant: 'outlined' },
          style: { border: `2px solid ${marco}`, boxShadow: `4px 4px 0 ${COLORES.tinta}` },
        },
      ],
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 4 },
        // Botón de viñeta: borde de tinta, sombra dura y "se hunde" al apretarlo.
        contained: {
          border: `2px solid ${COLORES.tinta}`,
          boxShadow: `3px 3px 0 ${alpha(COLORES.crema, 0.85)}`,
          transition: 'transform .08s, box-shadow .08s',
          '&:hover': { boxShadow: `3px 3px 0 ${alpha(COLORES.crema, 0.85)}` },
          '&:active': { transform: 'translate(2px, 2px)', boxShadow: `1px 1px 0 ${alpha(COLORES.crema, 0.85)}` },
        },
        outlined: { borderWidth: 2, '&:hover': { borderWidth: 2 } },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-notchedOutline': { borderWidth: 2, borderColor: marco },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: alpha(COLORES.crema, 0.6) },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderWidth: 2, borderColor: COLORES.naranja },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: { root: { backgroundColor: alpha(COLORES.crema, 0.14) } },
    },
    MuiChip: { styleOverrides: { root: { borderRadius: 4 } } },
    MuiTextField: { defaultProps: { size: 'small', fullWidth: true } },
    MuiSelect: { defaultProps: { size: 'small' } },
  },
})
