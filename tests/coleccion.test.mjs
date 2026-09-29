import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  agruparPorSerie, buscarDuplicado, estadisticas, FILTROS_INICIALES, filtrarComics, limpiarDatosComic,
  nombreCompleto, ordenarComics, validarComic,
} from '../src/lib/coleccion.js'

const comic = (datos) => ({
  id: crypto.randomUUID(), titulo: 'Sin título', serie: null, numero: null, editorial: null, guion: null,
  dibujo: null, anio: null, formato: 'grapa', estado: 'tengo', leido: false, created_at: '2026-01-01', ...datos,
})

const batman2 = comic({ titulo: 'Batman #2', serie: 'Batman', numero: '2', editorial: 'DC', created_at: '2026-01-02' })
const batman10 = comic({ titulo: 'Batman #10', serie: 'Batman', numero: '10', editorial: 'DC', leido: true, created_at: '2026-01-03' })
const eternauta = comic({ titulo: 'El Eternauta', editorial: 'Doedytores', guion: 'Héctor G. Oesterheld', formato: 'tomo', anio: 1957 })
const akira = comic({ titulo: 'Akira 1', serie: 'Akira', numero: '1', formato: 'manga', estado: 'quiero', anio: 1982 })
const todos = [batman10, eternauta, akira, batman2]

const filtros = (cambios) => ({ ...FILTROS_INICIALES, ...cambios })

test('la búsqueda ignora tildes y mayúsculas y exige todas las palabras', () => {
  assert.deepEqual(filtrarComics(todos, filtros({ texto: 'oesterheld' })), [eternauta])
  assert.deepEqual(filtrarComics(todos, filtros({ texto: 'HECTOR eternauta' })), [eternauta])
  assert.deepEqual(filtrarComics(todos, filtros({ texto: 'batman 10' })), [batman10])
  assert.deepEqual(filtrarComics(todos, filtros({ texto: 'batman #2' })), [batman2])
})

test('filtra por estado, lectura, formato y editorial', () => {
  assert.deepEqual(filtrarComics(todos, filtros({ estado: 'quiero' })), [akira])
  assert.deepEqual(filtrarComics(todos, filtros({ leido: 'leidos' })), [batman10])
  assert.equal(filtrarComics(todos, filtros({ leido: 'pendientes' })).length, 3)
  assert.deepEqual(filtrarComics(todos, filtros({ formato: 'tomo' })), [eternauta])
  assert.deepEqual(filtrarComics(todos, filtros({ editorial: 'DC' })), [batman10, batman2])
})

test('ordena por serie con orden natural de números', () => {
  const orden = ordenarComics(todos, 'serie').map(nombreCompleto)
  assert.deepEqual(orden, ['Akira #1', 'Batman #2', 'Batman #10', 'El Eternauta'])
})

test('ordena por año dejando los sin año al final', () => {
  const orden = ordenarComics(todos, 'anio')
  assert.deepEqual(orden.slice(0, 2), [eternauta, akira])
})

test('ordena por agregados recientemente sin modificar el original', () => {
  const copia = [...todos]
  assert.equal(ordenarComics(todos, 'recientes')[0], batman10)
  assert.deepEqual(todos, copia)
})

test('agrupa por serie y deja los sueltos al final', () => {
  const grupos = agruparPorSerie(todos)
  assert.deepEqual(grupos.map((g) => g.serie), ['Akira', 'Batman', null])
  assert.deepEqual(grupos[1].comics, [batman2, batman10])
  assert.equal(grupos[0].quiero, 1)
})

test('calcula estadísticas sobre lo que se tiene', () => {
  assert.deepEqual(estadisticas(todos), { tengo: 3, quiero: 1, leidos: 1, porcentajeLeido: 33, series: 2 })
  assert.equal(estadisticas([]).porcentajeLeido, 0)
})

test('limpia el formulario: recorta, vacíos a null, # del número y título automático', () => {
  const datos = limpiarDatosComic({ titulo: '  ', serie: ' Sandman ', numero: '#8', anio: '1989', formato: 'raro', estado: 'x', notas: '' })
  assert.equal(datos.titulo, 'Sandman #8')
  assert.equal(datos.serie, 'Sandman')
  assert.equal(datos.numero, '8')
  assert.equal(datos.anio, 1989)
  assert.equal(datos.formato, 'grapa')
  assert.equal(datos.estado, 'tengo')
  assert.equal(datos.notas, null)
  assert.equal(limpiarDatosComic({ numero: '#' }).numero, null)
})

test('valida título y año', () => {
  assert.ok(validarComic(limpiarDatosComic({})).titulo)
  assert.ok(validarComic(limpiarDatosComic({ titulo: 'X', anio: '1800' })).anio)
  assert.deepEqual(validarComic(limpiarDatosComic({ titulo: 'X', anio: '2001' })), {})
})

test('detecta duplicados por serie y número, o por título sin serie', () => {
  assert.equal(buscarDuplicado(todos, { serie: 'batman', numero: '#10' }), batman10)
  assert.equal(buscarDuplicado(todos, { serie: 'Batman', numero: '3' }), null)
  assert.equal(buscarDuplicado(todos, { titulo: 'el eternauta' }), eternauta)
  assert.equal(buscarDuplicado(todos, { serie: 'Batman', numero: '10' }, batman10.id), null)
})
