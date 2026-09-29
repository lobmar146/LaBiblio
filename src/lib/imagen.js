// Achica la portada en el navegador antes de subirla: una foto de celular pesa 3-5 MB,
// una portada a 900px en WebP ronda los 100 KB. Así el 1 GB gratis de Supabase rinde miles.

const ANCHO_MAXIMO = 900
const CALIDAD = 0.85

export const TIPOS_ACEPTADOS = ['image/jpeg', 'image/png', 'image/webp']

export async function prepararPortada(archivo) {
  if (!TIPOS_ACEPTADOS.includes(archivo.type)) {
    throw new Error('La portada tiene que ser JPG, PNG o WebP.')
  }

  const bitmap = await createImageBitmap(archivo)
  const escala = Math.min(1, ANCHO_MAXIMO / bitmap.width)
  const ancho = Math.round(bitmap.width * escala)
  const alto = Math.round(bitmap.height * escala)

  const canvas = document.createElement('canvas')
  canvas.width = ancho
  canvas.height = alto
  canvas.getContext('2d').drawImage(bitmap, 0, 0, ancho, alto)
  bitmap.close()

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', CALIDAD))
  if (!blob) throw new Error('No se pudo procesar la imagen.')
  return blob
}
