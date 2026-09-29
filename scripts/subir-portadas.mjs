// Sube portadas en lote desde una carpeta y las asocia a los comics de una serie.
//
//   node scripts/subir-portadas.mjs <carpeta> "<serie>" [--reemplazar]
//   node scripts/subir-portadas.mjs portadas-moztros "Mighty Morphin Power Rangers"
//
// El número de cada comic sale del nombre del archivo: "vol-3.jpg", "3.png", "Volumen 03.webp".
// Pide email y contraseña en la terminal e inicia sesión como admin (las políticas RLS
// deciden qué se puede escribir; no usa la clave secret). Sin --reemplazar, saltea los
// comics que ya tienen portada.

import { readdir, readFile } from 'node:fs/promises'
import { extname, join, resolve } from 'node:path'
import { createInterface } from 'node:readline'
import { createClient } from '@supabase/supabase-js'

const TIPOS = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' }
const MAXIMO_BYTES = 2 * 1024 * 1024 // límite del bucket

const [carpeta, serie] = process.argv.slice(2).filter((a) => !a.startsWith('--'))
const reemplazar = process.argv.includes('--reemplazar')
if (!carpeta || !serie) {
  console.error('Uso: node scripts/subir-portadas.mjs <carpeta> "<serie>" [--reemplazar]')
  process.exit(1)
}

async function leerEnv() {
  const texto = await readFile(resolve('.env'), 'utf8')
  const env = Object.fromEntries(
    texto.split(/\r?\n/).map((l) => l.match(/^\s*([^#=\s]+)\s*=\s*(.*)$/)).filter(Boolean).map((m) => [m[1], m[2].trim()]),
  )
  const url = env.VITE_SUPABASE_URL
  const clave = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY
  if (!url || !clave) throw new Error('Faltan VITE_SUPABASE_URL y la clave pública en .env')
  return { url, clave }
}

function preguntar(texto, oculto = false) {
  return new Promise((ok) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true })
    if (oculto) {
      // No mostrar la contraseña mientras se escribe.
      rl._writeToOutput = (s) => rl.output.write(s.includes(texto) ? s : '')
    }
    rl.question(texto, (respuesta) => {
      rl.close()
      if (oculto) process.stdout.write('\n')
      ok(respuesta.trim())
    })
  })
}

function numeroDelArchivo(nombre) {
  const coincidencia = nombre.replace(extname(nombre), '').match(/(\d+)\s*$/)
  return coincidencia ? String(Number(coincidencia[1])) : null
}

const { url, clave } = await leerEnv()
const supabase = createClient(url, clave, { auth: { persistSession: false } })

const email = await preguntar('Email: ')
const password = await preguntar('Contraseña: ', true)
const { error: errorLogin } = await supabase.auth.signInWithPassword({ email, password })
if (errorLogin) {
  console.error('No se pudo iniciar sesión:', errorLogin.message)
  process.exit(1)
}
const { data: esAdmin } = await supabase.rpc('is_admin')
if (!esAdmin) {
  console.error('Tu usuario no está en la tabla admins.')
  process.exit(1)
}

const { data: comics, error: errorComics } = await supabase.from('comics').select('id, numero, titulo, portada_path').eq('serie', serie)
if (errorComics) throw new Error(errorComics.message)
const porNumero = new Map(comics.map((c) => [String(Number(c.numero)), c]))

const archivos = (await readdir(resolve(carpeta))).filter((n) => TIPOS[extname(n).toLowerCase()])
let subidas = 0

for (const nombre of archivos.sort((a, b) => a.localeCompare(b, 'es', { numeric: true }))) {
  const numero = numeroDelArchivo(nombre)
  const comic = numero && porNumero.get(numero)
  if (!comic) {
    console.log(`- ${nombre}: no hay comic "${serie}" #${numero ?? '?'} cargado, lo salteo`)
    continue
  }
  if (comic.portada_path && !reemplazar) {
    console.log(`- ${nombre}: ${comic.titulo} ya tiene portada (usá --reemplazar para pisarla)`)
    continue
  }

  const contenido = await readFile(join(resolve(carpeta), nombre))
  if (contenido.length > MAXIMO_BYTES) {
    console.log(`✗ ${nombre}: pesa más de 2 MB, achicala o subila desde la app`)
    continue
  }

  const ext = extname(nombre).toLowerCase()
  // Mismo esquema de nombres que la app: <id>/<timestamp>.<ext>
  const path = `${comic.id}/${Date.now()}${ext === '.jpeg' ? '.jpg' : ext}`
  const { error: errorSubida } = await supabase.storage.from('portadas').upload(path, contenido, { contentType: TIPOS[ext] })
  if (errorSubida) {
    console.log(`✗ ${nombre}: ${errorSubida.message}`)
    continue
  }

  const { error: errorUpdate } = await supabase.from('comics').update({ portada_path: path }).eq('id', comic.id)
  if (errorUpdate) {
    await supabase.storage.from('portadas').remove([path])
    console.log(`✗ ${nombre}: ${errorUpdate.message}`)
    continue
  }
  if (comic.portada_path) await supabase.storage.from('portadas').remove([comic.portada_path])

  subidas++
  console.log(`✓ ${nombre} → ${comic.titulo}`)
}

await supabase.auth.signOut()
console.log(`\nListo: ${subidas} portada(s) subida(s).`)
