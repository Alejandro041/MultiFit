import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Importaciones de Componentes y Páginas
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Gimnasio from './pages/Gimnasio';
import Miembros from './pages/Miembros';
import Planificaciones from './pages/Planificaciones';
import Pagos from './pages/Pagos';
import Sidebar from './components/Sidebar';

// Layout para páginas protegidas
const ProtectedLayout = ({ children }) => (
  <div className="flex h-screen bg-gray-50">
    <Sidebar />
    <div className="flex-1 flex flex-col overflow-hidden">
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  </div>
);

function AppRoutes() {
  const { isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-xl font-medium text-gray-700">Iniciando aplicación...</div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Ruta Pública: Login */}
      <Route path="/login" element={<Login />} />
      
      {/* Rutas Protegidas con Layout */}
      <Route 
        path="/dashboard" 
        element={
          user ? (
            <ProtectedLayout>
              <Dashboard />
            </ProtectedLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      
      <Route 
        path="/gimnasio" 
        element={
          user ? (
            <ProtectedLayout>
              <Gimnasio />
            </ProtectedLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      
      <Route 
        path="/miembros" 
        element={
          user ? (
            <ProtectedLayout>
              <Miembros />
            </ProtectedLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />

      {/* AÑADE ESTAS RUTAS FALTANTES: */}
      <Route 
        path="/planificaciones" 
        element={
          user ? (
            <ProtectedLayout>
              <Planificaciones />
            </ProtectedLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />

      <Route 
        path="/pagos" 
        element={
          user ? (
            <ProtectedLayout>
              <Pagos />
            </ProtectedLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />

      {/* Redirigir según autenticación */}
      <Route 
        path="*" 
        element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} 
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;