// Genera public/og-biblio.jpg (1200x630): el banner que se ve al compartir el enlace del sitio.
// Título de La Biblio y un abanico con las portadas de la colección, sobre tinta con trama de puntos.
//
//   node scripts/generar-og.mjs
//
// Usa la URL y la clave pública de .env (solo lectura: las portadas son públicas). Hay que volver a
// correrlo y commitear el resultado cuando se quiera actualizar el banner; el texto usa las fuentes
// del sistema donde se corre (Impact en Windows), por eso la imagen se genera acá y se commitea.

import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import sharp from 'sharp'

const ANCHO = 1200
const ALTO = 630

const env = Object.fromEntries(
  (await readFile(resolve('.env'), 'utf8'))
    .split(/\r?\n/)
    .map((l) => l.match(/^\s*([^#=\s]+)\s*=\s*(.*)$/))
    .filter(Boolean)
    .map((m) => [m[1], m[2].trim()]),
)
const url = env.VITE_SUPABASE_URL
const clave = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY
if (!url || !clave) throw new Error('Faltan VITE_SUPABASE_URL y la clave pública en .env')

const respuesta = await fetch(`${url}/rest/v1/comics?select=portada_path&portada_path=not.is.null&order=created_at.desc&limit=3`, {
  headers: { apikey: clave, Authorization: `Bearer ${clave}` },
})
if (!respuesta.ok) throw new Error(`Supabase respondió ${respuesta.status}`)
const filas = await respuesta.json()
if (filas.length === 0) throw new Error('No hay portadas cargadas para armar el banner')

// Cada portada con marco crema y una inclinación distinta; con menos de 3, se reparten las que hay.
const poses = [
  { angulo: -9, x: 640, y: 120 },
  { angulo: 0, x: 790, y: 60 },
  { angulo: 8, x: 940, y: 130 },
]
const portadas = []
for (const [i, fila] of filas.slice(0, poses.length).entries()) {
  const descarga = await fetch(`${url}/storage/v1/object/public/portadas/${fila.portada_path}`)
  const original = Buffer.from(await descarga.arrayBuffer())
  const enmarcada = await sharp(original)
    .resize({ height: 400 })
    .extend({ top: 8, bottom: 8, left: 8, right: 8, background: '#fff4d6' })
    .png()
    .toBuffer()
  const inclinada = await sharp(enmarcada).rotate(poses[i].angulo, { background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer()
  // Sombra dura magenta: la misma silueta, teñida y corrida.
  const sombra = await sharp(inclinada).tint('#ff2e93').modulate({ brightness: 1 }).png().toBuffer()
  portadas.push({ input: sombra, left: poses[i].x + 14, top: poses[i].y + 14 }, { input: inclinada, left: poses[i].x, top: poses[i].y })
}

const fondo = Buffer.from(`
<svg width="${ANCHO}" height="${ALTO}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="p" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="7" cy="7" r="2.2" fill="#ff2e93" fill-opacity=".22"/></pattern>
    <pattern id="q" x="7" y="7" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="7" cy="7" r="1.8" fill="#38d0ff" fill-opacity=".14"/></pattern>
    <radialGradient id="v" cx="30%" cy="40%" r="80%"><stop offset="55%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity=".55"/></radialGradient>
  </defs>
  <rect width="${ANCHO}" height="${ALTO}" fill="#150b30"/>
  <rect width="${ANCHO}" height="${ALTO}" fill="url(#p)"/>
  <rect width="${ANCHO}" height="${ALTO}" fill="url(#q)"/>
  <rect width="${ANCHO}" height="${ALTO}" fill="url(#v)"/>
  <rect y="${ALTO - 22}" width="${ANCHO}" height="8" fill="#ff2e93"/>
  <rect y="${ALTO - 14}" width="${ANCHO}" height="14" fill="#38d0ff"/>
</svg>`)

const titulo = Buffer.from(`
<svg width="${ANCHO}" height="${ALTO}" xmlns="http://www.w3.org/2000/svg">
  <g font-family="Impact, 'Arial Black', sans-serif" transform="rotate(-4 300 300)">
    <text x="64" y="292" font-size="150" letter-spacing="4" fill="#ff2e93" stroke="#ff2e93" stroke-width="10" stroke-linejoin="round">LA</text>
    <text x="60" y="288" font-size="150" letter-spacing="4" fill="#ffd83a" stroke="#0d0620" stroke-width="10" stroke-linejoin="round" paint-order="stroke">LA</text>
    <text x="64" y="452" font-size="170" letter-spacing="4" fill="#ff2e93" stroke="#ff2e93" stroke-width="10" stroke-linejoin="round">BIBLIO</text>
    <text x="60" y="448" font-size="170" letter-spacing="4" fill="#ffd83a" stroke="#0d0620" stroke-width="10" stroke-linejoin="round" paint-order="stroke">BIBLIO</text>
  </g>
  <g font-family="'Arial Black', Arial, sans-serif" transform="rotate(-2 300 540)">
    <rect x="60" y="500" width="520" height="60" fill="#ffd83a" stroke="#0d0620" stroke-width="5"/>
    <text x="82" y="541" font-size="30" font-weight="900" fill="#0d0620">MI COLECCIÓN DE COMICS</text>
  </g>
</svg>`)

const imagen = await sharp(fondo)
  .composite([...portadas, { input: titulo }])
  .jpeg({ quality: 84, mozjpeg: true })
  .toBuffer()
await writeFile(resolve('public/og-biblio.jpg'), imagen)
console.log(`public/og-biblio.jpg generado (${Math.round(imagen.length / 1024)} KB, ${filas.length} portada(s))`)
