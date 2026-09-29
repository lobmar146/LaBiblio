import { buscarComic, escaparHtml, nombreCompleto, origenDe } from './_datos.js'

// WhatsApp, Telegram, Facebook, X, etc. arman la miniatura leyendo las etiquetas Open Graph del HTML
// y no ejecutan JavaScript, así que una SPA siempre les muestra lo mismo. Esta función responde el
// index.html de la app con las etiquetas cambiadas: en /comic/:id, las de ese comic (título, datos
// y la portada); en la portada del sitio, el banner de La Biblio. Las personas reciben el mismo HTML
// de siempre y React se encarga del resto.
//   vercel.json:  /comic/:id  ->  /api/meta?id=:id     y     /  ->  /api/meta

function poner(html, clave, valor) {
  const etiqueta = new RegExp(`(<meta\\s+(?:property|name)="${clave}"\\s+content=")[^"]*(")`, 'i')
  return html.replace(etiqueta, (_, antes, despues) => `${antes}${escaparHtml(valor)}${despues}`)
}

function descripcionDe(comic) {
  const datos = [
    comic.editorial,
    comic.anio,
    comic.guion && `Guion: ${comic.guion}`,
    comic.dibujo && `Dibujo: ${comic.dibujo}`,
  ].filter(Boolean)
  const estado = comic.estado === 'quiero' ? 'Está en mi lista de deseos.' : comic.leido ? 'Lo tengo y ya lo leí.' : 'Lo tengo en la biblioteca.'
  return `${datos.join(' · ')}${datos.length ? '. ' : ''}${estado}`
}

export default async function handler(req, res) {
  const origen = origenDe(req)
  try {
    const base = await fetch(`${origen}/index.html`)
    let html = await base.text()

    const id = req.query.id
    const comic = id ? await buscarComic(id) : null

    const titulo = comic ? `${nombreCompleto(comic)} · La Biblio` : 'La Biblio'
    const descripcion = comic ? descripcionDe(comic) : 'Mi colección de comics: qué tengo, qué me falta y qué quiero comprar.'
    // Con portada: la imagen armada por /api/og (portada con marco sobre fondo desenfocado). Sin ella,
    // o en la portada del sitio, el banner fijo. `v` cambia cuando se edita el comic y renueva la caché.
    const imagen = comic?.portada_path
      ? `${origen}/api/og?id=${encodeURIComponent(comic.id)}&v=${encodeURIComponent(comic.updated_at ?? '')}`
      : `${origen}/og-biblio.jpg`
    const url = comic ? `${origen}/comic/${comic.id}` : `${origen}/`

    html = html.replace(/<title>[^<]*<\/title>/i, `<title>${escaparHtml(titulo)}</title>`)
    for (const [clave, valor] of [
      ['description', descripcion],
      ['og:title', titulo],
      ['og:description', descripcion],
      ['og:url', url],
      ['og:image', imagen],
      ['twitter:title', titulo],
      ['twitter:description', descripcion],
      ['twitter:image', imagen],
    ]) {
      html = poner(html, clave, valor)
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    // Que los rastreadores y el CDN reutilicen la respuesta un rato; se renueva sola en segundo plano.
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=86400')
    res.status(200).send(html)
  } catch {
    // Ante cualquier problema, la app tiene que abrir igual: se redirige al HTML de siempre.
    res.redirect(302, '/index.html')
  }
}
