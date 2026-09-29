import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const clave = import.meta.env.VITE_SUPABASE_ANON_KEY

// Sin variables de entorno la app muestra una pantalla de configuración en vez de romper.
export const configurado = Boolean(url && clave)

export const supabase = configurado ? createClient(url, clave) : null
