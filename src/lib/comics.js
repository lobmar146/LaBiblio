import { supabase } from './supabase'
import { prepararPortada } from './imagen'

const BUCKET = 'portadas'
const TAMANIO_PAGINA = 1000 // máximo que devuelve Supabase por request

export function urlPortada(path) {
  if (!path) return null
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
}

function lanzarSiError({ data, error }) {
  if (error) throw new Error(error.message)
  return data
}

export async function listarComics() {
  const todos = []
  for (let desde = 0; ; desde += TAMANIO_PAGINA) {
    const pagina = lanzarSiError(
      await supabase
        .from('comics')
        .select('*')
        .order('created_at', { ascending: false })
        .range(desde, desde + TAMANIO_PAGINA - 1),
    )
    todos.push(...pagina)
    if (pagina.length < TAMANIO_PAGINA) return todos
  }
}

export async function obtenerComic(id) {
  return lanzarSiError(await supabase.from('comics').select('*').eq('id', id).maybeSingle())
}

async function subirPortada(comicId, archivo) {
  const blob = await prepararPortada(archivo)
  // Nombre nuevo en cada subida: evita que el CDN sirva la portada vieja desde caché.
  const path = `${comicId}/${Date.now()}.webp`
  lanzarSiError(await supabase.storage.from(BUCKET).upload(path, blob, { contentType: 'image/webp' }))
  return path
}

async function borrarPortada(path) {
  if (!path) return
  // Si falla solo queda un archivo huérfano; no vale la pena cortar la operación por eso.
  const { error } = await supabase.storage.from(BUCKET).remove([path])
  if (error) console.warn('No se pudo borrar la portada', path, error.message)
}

export async function crearComic(datos, archivo) {
  const id = crypto.randomUUID()
  const portada_path = archivo ? await subirPortada(id, archivo) : null
  try {
    return lanzarSiError(await supabase.from('comics').insert({ ...datos, id, portada_path }).select().single())
  } catch (error) {
    await borrarPortada(portada_path)
    throw error
  }
}

// `portada`: undefined = no tocarla, null = quitarla, File = reemplazarla.
export async function actualizarComic(comicActual, datos, portada) {
  let portada_path = comicActual.portada_path
  if (portada instanceof File) portada_path = await subirPortada(comicActual.id, portada)
  else if (portada === null) portada_path = null

  let actualizado
  try {
    actualizado = lanzarSiError(
      await supabase.from('comics').update({ ...datos, portada_path }).eq('id', comicActual.id).select().single(),
    )
  } catch (error) {
    if (portada instanceof File) await borrarPortada(portada_path)
    throw error
  }

  if (portada_path !== comicActual.portada_path) await borrarPortada(comicActual.portada_path)
  return actualizado
}

export async function borrarComic(comic) {
  lanzarSiError(await supabase.from('comics').delete().eq('id', comic.id))
  await borrarPortada(comic.portada_path)
}
