import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
// Supabase llama "publishable" a la clave pública nueva y "anon" a la clásica: sirven igual.
const clave = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY

// Sin variables de entorno la app muestra una pantalla de configuración en vez de romper.
export const configurado = Boolean(url && clave)

export const supabase = configurado ? createClient(url, clave) : null
