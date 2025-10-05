import React from 'react';
import { Navigate, Outlet } from 'react-router-dom'; // Se necesita Outlet
import { useAuth } from '../Context/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    // Muestra una pantalla de carga mientras AuthContext se inicializa
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Cargando contexto del usuario...</p>
          <p className="text-sm text-gray-500 mt-2">Verificando permisos y configuración</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirige si no está autenticado
    return <Navigate to="/login" replace />;
  }

  // Si está autenticado, renderiza el Layout y el contenido anidado
  return (
    // Aquí es donde iría tu Layout principal (Sidebar, Header, etc.)
    // Por ahora, solo usamos un contenedor simple para que se muestre el contenido
    <div className="flex min-h-screen"> 
      {/* Si tienes un Sidebar, se renderizaría aquí */}
      <main className="flex-1">
        {/* <Outlet /> inyecta la ruta hija activa (Dashboard, Miembros, etc.) */}
        <Outlet /> 
      </main>
    </div>
  );
};

export default ProtectedRoute;
