import { Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ComicsProvider } from './context/ComicsContext'
import { OnomatopeyaProvider } from './context/OnomatopeyaContext'
import Layout from './components/Layout'
import RutaAdmin from './components/RutaAdmin'
import Coleccion from './pages/Coleccion'
import ComicDetalle from './pages/ComicDetalle'
import NuevoComic from './pages/NuevoComic'
import EditarComic from './pages/EditarComic'
import Login from './pages/Login'
import NoEncontrado from './pages/NoEncontrado'

export default function App() {
  return (
    <AuthProvider>
      <ComicsProvider>
        <OnomatopeyaProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Coleccion />} />
              <Route path="comic/:id" element={<ComicDetalle />} />
              <Route element={<RutaAdmin />}>
                <Route path="nuevo" element={<NuevoComic />} />
                <Route path="comic/:id/editar" element={<EditarComic />} />
              </Route>
              <Route path="login" element={<Login />} />
              <Route path="*" element={<NoEncontrado />} />
            </Route>
          </Routes>
        </OnomatopeyaProvider>
      </ComicsProvider>
    </AuthProvider>
  )
}
