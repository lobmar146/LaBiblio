import { alpha, createTheme } from '@mui/material/styles'

// Cómic de los 90 (Image, X-Men, Spawn): tinta violeta casi negra, colores saturados de imprenta
// con trama de puntos, rótulos amarillo sol y globos color papel. Sin rojo: el celeste es un
// guiño a la bandera argentina.
export const COLORES = {
  tinta: '#0d0620',
  fondo: '#150b30',
  papel: '#24144d',
  crema: '#fff4d6',
  magenta: '#ff2e93',
  celeste: '#38d0ff',
  sol: '#ffd83a',
  lima: '#b6ff3b',
}

// Letras de rotulista: Bangers para títulos y efectos, Comic Neue en negrita para todo lo demás.
export const LETRAS = '"Comic Neue", "Comic Sans MS", system-ui, sans-serif'
export const LETRAS_TITULO = '"Bangers", "Impact", sans-serif'

const { tinta, fondo, papel, crema, magenta, celeste, sol, lima } = COLORES
const sombraDura = (color = 'rgba(0, 0, 0, 0.6)', d = 4) => `${d}px ${d}px 0 ${color}`

// Título de portada de cómic: relleno amarillo, contorno de tinta y sombra desplazada.
const titulos = {
  fontFamily: LETRAS_TITULO,
  fontWeight: 400,
  letterSpacing: '0.05em',
  color: sol,
  WebkitTextStroke: `2px ${tinta}`,
  paintOrder: 'stroke fill',
  textShadow: `3px 3px 0 ${magenta}`,
}

const globo = {
  backgroundColor: crema,
  color: tinta,
  border: `3px solid ${tinta}`,
  boxShadow: sombraDura(),
}

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: magenta, contrastText: tinta },
    secondary: { main: celeste, contrastText: tinta },
    info: { main: lima, contrastText: tinta },
    warning: { main: sol, contrastText: tinta },
    background: { default: fondo, paper: papel },
    text: { primary: crema, secondary: alpha(crema, 0.78) },
    divider: alpha(crema, 0.22),
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: LETRAS,
    fontWeightRegular: 700,
    fontWeightMedium: 700,
    h1: titulos,
    h2: titulos,
    h3: titulos,
    h4: titulos,
    h5: { fontFamily: LETRAS_TITULO, fontWeight: 400, letterSpacing: '0.05em' },
    h6: { fontFamily: LETRAS_TITULO, fontWeight: 400, letterSpacing: '0.05em' },
    button: { fontFamily: LETRAS_TITULO, fontWeight: 400, letterSpacing: '0.07em', textTransform: 'uppercase', fontSize: '1.05rem' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          // Tres capas: puntos magenta, puntos celestes corridos (trama de imprenta) y rayos de velocidad.
          backgroundImage: [
            `radial-gradient(${alpha(magenta, 0.17)} 1.7px, transparent 2px)`,
            `radial-gradient(${alpha(celeste, 0.12)} 1.4px, transparent 1.7px)`,
            `repeating-conic-gradient(from 0deg at 50% -8%, ${alpha('#ffffff', 0.04)} 0deg 1.6deg, transparent 1.6deg 7deg)`,
          ].join(', '),
          backgroundSize: '12px 12px, 12px 12px, 100% 100%',
          backgroundPosition: '0 0, 6px 6px, 0 0',
          backgroundAttachment: 'fixed',
        },
        '::selection': { background: sol, color: tinta },
      },
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: 'none' } },
      variants: [
        { props: { variant: 'outlined' }, style: { border: `3px solid ${crema}`, boxShadow: sombraDura(magenta, 5) } },
      ],
    },
    // Botones de viñeta: letras de efecto, borde de tinta, sombra dura de color y se hunden al apretar.
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 6, lineHeight: 1.2 },
        contained: {
          border: `3px solid ${tinta}`,
          boxShadow: sombraDura(sol, 4),
          transition: 'transform .08s, box-shadow .08s',
          '&:hover': { boxShadow: sombraDura(sol, 4), transform: 'translate(-1px, -1px)' },
          '&:active': { transform: 'translate(3px, 3px)', boxShadow: sombraDura(sol, 1) },
        },
        outlined: { borderWidth: 3, borderColor: crema, color: crema, '&:hover': { borderWidth: 3, backgroundColor: alpha(crema, 0.12) } },
      },
    },
    // Los campos son globos de diálogo: papel, contorno grueso y sombra dura.
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          ...globo,
          borderRadius: 22,
          fontWeight: 700,
          boxShadow: sombraDura(celeste, 4),
          transition: 'box-shadow .12s, transform .12s',
          '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
          '&.Mui-focused': { boxShadow: sombraDura(magenta, 5), transform: 'translate(-1px, -1px)' },
          '& input::placeholder, & textarea::placeholder': { color: alpha(tinta, 0.55), opacity: 1 },
          '& .MuiSelect-icon, & .MuiAutocomplete-popupIndicator, & .MuiSvgIcon-root': { color: tinta },
          '& .MuiInputAdornment-root .MuiSvgIcon-root': { color: alpha(tinta, 0.7) },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontFamily: LETRAS_TITULO, letterSpacing: '0.06em', fontSize: '1.05rem', color: alpha(tinta, 0.7),
          '&.Mui-focused': { color: tinta },
        },
        shrink: { color: tinta },
      },
    },
    MuiFormHelperText: { styleOverrides: { root: { color: alpha(crema, 0.85), fontWeight: 700 } } },
    MuiMenu: { styleOverrides: { paper: { ...globo, borderRadius: 14, boxShadow: sombraDura(magenta, 4) } } },
    MuiAutocomplete: { styleOverrides: { paper: { ...globo, borderRadius: 14, boxShadow: sombraDura(magenta, 4) } } },
    MuiMenuItem: {
      styleOverrides: { root: { fontWeight: 700, '&.Mui-selected, &.Mui-selected:hover': { backgroundColor: sol }, '&:hover': { backgroundColor: alpha(magenta, 0.2) } } },
    },
    MuiDialog: { styleOverrides: { paper: { ...globo, borderRadius: 16, boxShadow: sombraDura(magenta, 6) } } },
    MuiDialogContentText: { styleOverrides: { root: { color: tinta } } },
    MuiAlert: {
      styleOverrides: {
        root: { ...globo, borderRadius: 20, fontWeight: 700, alignItems: 'center' },
        icon: { color: tinta },
      },
    },
    MuiTooltip: { styleOverrides: { tooltip: { ...globo, boxShadow: sombraDura(), fontFamily: LETRAS, fontWeight: 700, fontSize: '0.8rem' }, arrow: { color: tinta } } },
    MuiChip: {
      styleOverrides: { root: { borderRadius: 4, border: `2px solid ${tinta}`, fontFamily: LETRAS_TITULO, fontWeight: 400, letterSpacing: '0.05em', fontSize: '0.95rem' } },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: { border: `3px solid ${crema}`, color: crema, '&.Mui-selected, &.Mui-selected:hover': { backgroundColor: sol, color: tinta } },
      },
    },
    MuiLinearProgress: {
      styleOverrides: { root: { backgroundColor: alpha(crema, 0.2), border: `2px solid ${tinta}` } },
    },
    MuiTextField: { defaultProps: { size: 'small', fullWidth: true } },
    MuiSelect: { defaultProps: { size: 'small' } },
  },
})
