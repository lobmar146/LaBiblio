import sharp from 'sharp'
import { buscarComic, origenDe, urlPortada } from './_datos.js'

// Imagen de vista previa de un comic (1200x630, JPEG): la portada con marco crema y sombra magenta,
// sobre la misma portada agrandada, desenfocada y oscurecida, con la trama de puntos de la app.
// Solo usa formas: en el servidor no hay fuentes, así que el título va en las etiquetas y no en la imagen.
const ANCHO = 1200
const ALTO = 630
const ALTO_PORTADA = 500

const fondoSvg = (x, y, w, h) => Buffer.from(`
<svg width="${ANCHO}" height="${ALTO}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="p" width="14" height="14" patternUnits="userSpaceOnUse">
      <circle cx="7" cy="7" r="2.2" fill="#ff2e93" fill-opacity=".24"/>
    </pattern>
    <pattern id="q" x="7" y="7" width="14" height="14" patternUnits="userSpaceOnUse">
      <circle cx="7" cy="7" r="1.8" fill="#38d0ff" fill-opacity=".14"/>
    </pattern>
  </defs>
  <rect width="${ANCHO}" height="${ALTO}" fill="url(#p)"/>
  <rect width="${ANCHO}" height="${ALTO}" fill="url(#q)"/>
  <rect x="${x + 16}" y="${y + 16}" width="${w}" height="${h}" fill="#ff2e93"/>
  <rect x="${x - 9}" y="${y - 9}" width="${w + 18}" height="${h + 18}" fill="#fff4d6" stroke="#0d0620" stroke-width="4"/>
</svg>`)

export default async function handler(req, res) {
  try {
    const comic = await buscarComic(req.query.id)
    if (!comic?.portada_path) {
      res.redirect(302, `${origenDe(req)}/og-biblio.jpg`)
      return
    }
    const descarga = await fetch(urlPortada(comic.portada_path))
    if (!descarga.ok) throw new Error('portada no disponible')
    const original = Buffer.from(await descarga.arrayBuffer())

    const fondo = await sharp(original).resize(ANCHO, ALTO, { fit: 'cover' }).blur(30).modulate({ brightness: 0.4, saturation: 1.1 }).toBuffer()
    const portada = await sharp(original).resize({ height: ALTO_PORTADA }).png().toBuffer()
    const { width, height } = await sharp(portada).metadata()
    const x = Math.round((ANCHO - width) / 2 - 8)
    const y = Math.round((ALTO - height) / 2 - 8)

    const imagen = await sharp(fondo)
      .composite([{ input: fondoSvg(x, y, width, height) }, { input: portada, left: x, top: y }])
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer()

    res.setHeader('Content-Type', 'image/jpeg')
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800')
    res.status(200).send(imagen)
  } catch {
    res.redirect(302, `${origenDe(req)}/og-biblio.jpg`)
  }
}
