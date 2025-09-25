import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Comprueba si existe el usuario en el localStorage.
  // Tu login guardará el usuario aquí al autenticarse.
  const isAuthenticated = localStorage.getItem('user');

  if (!isAuthenticated) {
    // Si no está autenticado, lo redirige al login
    return <Navigate to="/login" replace />;
  }

  // Si está autenticado, muestra el contenido de la ruta
  return children;
};

export default ProtectedRoute;