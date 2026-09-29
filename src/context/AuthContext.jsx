import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(undefined) // undefined = todavía no sabemos
  // Se guarda para qué usuario se verificó, así un cambio de sesión no hereda el permiso anterior.
  const [admin, setAdmin] = useState({ userId: null, esAdmin: false })

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSesion(data.session))
    const { data } = supabase.auth.onAuthStateChange((_evento, nuevaSesion) => setSesion(nuevaSesion))
    return () => data.subscription.unsubscribe()
  }, [])

  const userId = sesion?.user?.id

  // Separado del listener de auth: llamar a Supabase dentro de onAuthStateChange puede trabarse.
  useEffect(() => {
    if (!userId) return
    let vigente = true
    supabase.rpc('is_admin').then(({ data, error }) => {
      if (vigente) setAdmin({ userId, esAdmin: !error && data === true })
    })
    return () => {
      vigente = false
    }
  }, [userId])

  const esAdmin = Boolean(userId) && admin.userId === userId && admin.esAdmin
  const verificandoAdmin = Boolean(userId) && admin.userId !== userId

  const iniciarSesion = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      throw new Error(
        error.message === 'Invalid login credentials' ? 'Email o contraseña incorrectos.' : error.message,
      )
    }
  }, [])

  const cerrarSesion = useCallback(() => supabase.auth.signOut(), [])

  const valor = useMemo(
    () => ({
      sesion,
      usuario: sesion?.user ?? null,
      esAdmin,
      cargando: sesion === undefined || verificandoAdmin,
      iniciarSesion,
      cerrarSesion,
    }),
    [sesion, esAdmin, verificandoAdmin, iniciarSesion, cerrarSesion],
  )

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext)
}
