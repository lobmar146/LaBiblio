// Utilidades compartidas por las funciones de api/ (el guion bajo evita que Vercel las exponga
// como rutas). Leen la misma configuración pública de Supabase que el frontend: las variables
// VITE_* que ya están cargadas en Vercel también llegan a las funciones.
export const URL_SUPABASE = process.env.VITE_SUPABASE_URL
const CLAVE = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export const esUuid = (valor) => UUID.test(String(valor ?? ''))

// Un comic por id, con la clave pública: las políticas RLS ya dejan leer la colección a cualquiera.
export async function buscarComic(id) {
  if (!URL_SUPABASE || !CLAVE || !esUuid(id)) return null
  const respuesta = await fetch(`${URL_SUPABASE}/rest/v1/comics?id=eq.${encodeURIComponent(id)}&select=*&limit=1`, {
    headers: { apikey: CLAVE, Authorization: `Bearer ${CLAVE}` },
  })
  if (!respuesta.ok) return null
  const [comic] = await respuesta.json()
  return comic ?? null
}

export const urlPortada = (ruta) => `${URL_SUPABASE}/storage/v1/object/public/portadas/${ruta}`

// "Serie #N" si tiene serie; si no, el título (misma regla que el frontend).
export const nombreCompleto = (comic) => (comic.serie ? `${comic.serie}${comic.numero ? ` #${comic.numero}` : ''}` : comic.titulo)

export const escaparHtml = (texto) =>
  String(texto).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// Origen público de la petición (dominio de producción, de preview o local).
export function origenDe(req) {
  const host = req.headers['x-forwarded-host'] ?? req.headers.host
  const protocolo = req.headers['x-forwarded-proto'] ?? 'https'
  return `${protocolo}://${host}`
}
