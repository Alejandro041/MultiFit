import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header.jsx';
import Sidebar from './components/Sidebar.jsx';
import Footer from './components/Footer.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Gimnasio from './pages/Gimnasio.jsx';
import Miembros from './pages/Miembros.jsx';
import Pagos from './pages/Pagos.jsx';
import Perfil from './pages/Perfil.jsx';
import Planificaciones from './pages/Planificaciones.jsx';
import NotFound from './pages/NotFound.jsx';
import Login from './pages/Login.jsx';
import ProtectedRoute from './components/Protectedroute.jsx';
import './style/App.css';

function App() {
  return (
    <Routes>
      {/* La ruta de login es pública y no requiere autenticación */}
      <Route path="/login" element={<Login />} />

      {/* Redirecciona la ruta raíz a /dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" />} />

      {/* Todas las rutas que requieren autenticación se envuelven en ProtectedRoute */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <div className="App">
              <Header />
              <div className="app-layout">
                <Sidebar />
                <main className="main-content">
                  <Dashboard />
                </main>
              </div>
              <Footer />
            </div>
          </ProtectedRoute>
        }
      />
      
      {/* Repite este patrón para todas las demás rutas protegidas */}
      <Route
        path="/gimnasio"
        element={
          <ProtectedRoute>
            <div className="App">
              <Header />
              <div className="app-layout">
                <Sidebar />
                <main className="main-content">
                  <Gimnasio />
                </main>
              </div>
              <Footer />
            </div>
          </ProtectedRoute>
        }
      />

      <Route
        path="/miembros"
        element={
          <ProtectedRoute>
            <div className="App">
              <Header />
              <div className="app-layout">
                <Sidebar />
                <main className="main-content">
                  <Miembros />
                </main>
              </div>
              <Footer />
            </div>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/pagos"
        element={
          <ProtectedRoute>
            <div className="App">
              <Header />
              <div className="app-layout">
                <Sidebar />
                <main className="main-content">
                  <Pagos />
                </main>
              </div>
              <Footer />
            </div>
          </ProtectedRoute>
        }
      />

      <Route
        path="/perfil"
        element={
          <ProtectedRoute>
            <div className="App">
              <Header />
              <div className="app-layout">
                <Sidebar />
                <main className="main-content">
                  <Perfil />
                </main>
              </div>
              <Footer />
            </div>
          </ProtectedRoute>
        }
      />

      <Route
        path="/planificaciones"
        element={
          <ProtectedRoute>
            <div className="App">
              <Header />
              <div className="app-layout">
                <Sidebar />
                <main className="main-content">
                  <Planificaciones />
                </main>
              </div>
              <Footer />
            </div>
          </ProtectedRoute>
        }
      />

      {/* Ruta para el "404 Not Found" */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;