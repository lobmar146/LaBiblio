// Lógica pura sobre la lista de comics: filtrar, ordenar, agrupar y contar.
// No toca Supabase ni React, así se testea con `node --test`.

export const FORMATOS = {
  grapa: 'Grapa',
  tomo: 'Tomo',
  tpb: 'TPB',
  hardcover: 'Hardcover',
  manga: 'Manga',
  novela_grafica: 'Novela gráfica',
  otro: 'Otro',
}

export const ESTADOS = {
  tengo: 'Lo tengo',
  quiero: 'Lo quiero',
}

export const ORDENES = {
  recientes: 'Agregados recientemente',
  serie: 'Serie y número',
  titulo: 'Título (A-Z)',
  anio: 'Año de publicación',
}

export const FILTROS_INICIALES = {
  texto: '',
  estado: 'todos',
  leido: 'todos',
  formato: 'todos',
  editorial: 'todas',
  orden: 'recientes',
}

const comparadorNatural = new Intl.Collator('es', { numeric: true, sensitivity: 'base' })

export function normalizar(texto) {
  return (texto ?? '')
    .toString()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}

export function nombreCompleto(comic) {
  if (!comic.serie) return comic.titulo
  const numero = comic.numero ? ` #${comic.numero}` : ''
  return `${comic.serie}${numero}`
}

export function filtrarComics(comics, filtros) {
  // Cada palabra tiene que aparecer en algún campo: "batman 5" encuentra "Batman #5".
  const palabras = normalizar(filtros.texto).split(/\s+/).filter(Boolean)

  return comics.filter((comic) => {
    if (filtros.estado !== 'todos' && comic.estado !== filtros.estado) return false
    if (filtros.leido === 'leidos' && !comic.leido) return false
    if (filtros.leido === 'pendientes' && comic.leido) return false
    if (filtros.formato !== 'todos' && comic.formato !== filtros.formato) return false
    if (filtros.editorial !== 'todas' && comic.editorial !== filtros.editorial) return false
    if (palabras.length === 0) return true

    const pajar = normalizar(
      [comic.titulo, comic.serie, comic.numero && `#${comic.numero}`, comic.editorial, comic.guion, comic.dibujo]
        .filter(Boolean)
        .join(' '),
    )
    return palabras.every((palabra) => pajar.includes(palabra))
  })
}

function compararSerie(a, b) {
  return (
    comparadorNatural.compare(a.serie || a.titulo, b.serie || b.titulo) ||
    comparadorNatural.compare(a.numero ?? '', b.numero ?? '') ||
    comparadorNatural.compare(a.titulo, b.titulo)
  )
}

export function ordenarComics(comics, orden) {
  const copia = [...comics]
  switch (orden) {
    case 'serie':
      return copia.sort(compararSerie)
    case 'titulo':
      return copia.sort((a, b) => comparadorNatural.compare(a.titulo, b.titulo))
    case 'anio':
      // Los que no tienen año van al final.
      return copia.sort((a, b) => (a.anio ?? Infinity) - (b.anio ?? Infinity) || compararSerie(a, b))
    case 'recientes':
    default:
      return copia.sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? ''))
  }
}

// Agrupa por serie para responder rápido "¿qué números de X tengo?".
// Los comics sin serie quedan en un grupo propio al final.
export function agruparPorSerie(comics) {
  const grupos = new Map()
  for (const comic of comics) {
    const clave = comic.serie?.trim() || ''
    if (!grupos.has(clave)) grupos.set(clave, [])
    grupos.get(clave).push(comic)
  }

  return [...grupos.entries()]
    .map(([serie, items]) => ({
      serie: serie || null,
      comics: items.sort(compararSerie),
      tengo: items.filter((c) => c.estado === 'tengo').length,
      quiero: items.filter((c) => c.estado === 'quiero').length,
    }))
    .sort((a, b) => {
      if (!a.serie) return 1
      if (!b.serie) return -1
      return comparadorNatural.compare(a.serie, b.serie)
    })
}

export function estadisticas(comics) {
  const tengo = comics.filter((c) => c.estado === 'tengo')
  const leidos = tengo.filter((c) => c.leido).length
  return {
    tengo: tengo.length,
    quiero: comics.length - tengo.length,
    leidos,
    porcentajeLeido: tengo.length ? Math.round((leidos / tengo.length) * 100) : 0,
    series: new Set(comics.map((c) => c.serie?.trim()).filter(Boolean)).size,
  }
}

export function valoresUnicos(comics, campo) {
  return [...new Set(comics.map((c) => c[campo]?.trim()).filter(Boolean))].sort(comparadorNatural.compare)
}

// Convierte lo que devuelve el formulario en una fila válida para la tabla.
export function limpiarDatosComic(datos) {
  const texto = (valor) => {
    const limpio = (valor ?? '').toString().trim()
    return limpio === '' ? null : limpio
  }
  const anio = Number.parseInt(datos.anio, 10)
  const serie = texto(datos.serie)
  const numero = texto(texto(datos.numero)?.replace(/^#/, ''))
  return {
    // Para una grapa suele alcanzar con serie + número: el título se arma solo.
    titulo: texto(datos.titulo) ?? (serie ? nombreCompleto({ serie, numero }) : null),
    serie,
    numero,
    editorial: texto(datos.editorial),
    guion: texto(datos.guion),
    dibujo: texto(datos.dibujo),
    anio: Number.isFinite(anio) ? anio : null,
    formato: FORMATOS[datos.formato] ? datos.formato : 'grapa',
    estado: ESTADOS[datos.estado] ? datos.estado : 'tengo',
    leido: Boolean(datos.leido),
    notas: texto(datos.notas),
  }
}

export function validarComic(datos) {
  const errores = {}
  if (!datos.titulo) errores.titulo = 'Poné un título o, al menos, la serie.'
  if (datos.anio !== null && (datos.anio < 1900 || datos.anio > 2100)) errores.anio = 'Año entre 1900 y 2100.'
  return errores
}

// Para avisar "ya lo tenés" mientras se carga uno nuevo. Compara serie + número,
// o el título cuando no hay serie. Ignora el propio comic al editar.
export function buscarDuplicado(comics, datos, idIgnorado = null) {
  const serie = normalizar(datos.serie)
  const numero = normalizar(datos.numero).replace(/^#/, '')
  const titulo = normalizar(datos.titulo)
  return (
    comics.find((comic) => {
      if (comic.id === idIgnorado) return false
      if (serie) return normalizar(comic.serie) === serie && normalizar(comic.numero) === numero
      return titulo !== '' && !comic.serie && normalizar(comic.titulo) === titulo
    }) ?? null
  )
}
