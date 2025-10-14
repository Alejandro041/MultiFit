import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './Context/AuthContext';

// Importaciones de Componentes y Páginas
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Gimnasio from './pages/Gimnasio';
import Miembros from './pages/Miembros';
import Planificaciones from './pages/Planificaciones';
import Pagos from './pages/Pagos';
import Sidebar from './components/Sidebar';
import { ROUTE_ACCESS, getDefaultRouteForRole } from './constants/accessControl';

const ProtectedLayout = ({ children }) => {
  const { user, empresa, updatePassword } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' });
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handlePasswordFieldChange = (event) => {
    const { name, value } = event.target;
    setPasswordForm((current) => ({ ...current, [name]: value }));
  };

  const handleCloseModal = () => {
    setShowPasswordModal(false);
    setPasswordError(null);
    setPasswordSuccess(false);
    setPasswordForm({ newPassword: '', confirmPassword: '' });
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setPasswordError(null);

    if (!passwordForm.newPassword || passwordForm.newPassword.length < 8) {
      setPasswordError('La nueva contrasena debe tener al menos 8 caracteres');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Las contrasenas no coinciden');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await updatePassword(passwordForm.newPassword);
      setPasswordSuccess(true);
      setTimeout(() => {
        handleCloseModal();
      }, 1500);
    } catch (err) {
      setPasswordError(err.message || 'No se pudo actualizar la contrasena');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b border-gray-200 bg-white px-8 py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Organizacion</p>
              <p className="text-lg font-semibold text-gray-900">{empresa?.name ?? 'Sin organizacion'}</p>
              {user?.gymName && (
                <p className="text-sm text-gray-500">
                  Sucursal asignada: <span className="font-medium text-gray-900">{user.gymName}</span>
                </p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right text-sm text-gray-600">
                <p className="font-semibold text-gray-900">{user?.name}</p>
                <p>{user?.role}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowPasswordModal(true)}
                className="rounded-lg border border-blue-200 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
              >
                Cambiar contrasena
              </button>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>

      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Actualizar contrasena</h3>
                <p className="text-sm text-gray-500">Reemplaza la contrasena temporal por una nueva.</p>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-sm font-medium text-gray-400 hover:text-gray-600"
              >
                Cerrar
              </button>
            </div>
            <form className="mt-4 space-y-4" onSubmit={handlePasswordSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nueva contrasena</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordFieldChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="********"
                  minLength={8}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contrasena</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordFieldChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="********"
                  minLength={8}
                  required
                />
              </div>
              {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
              {passwordSuccess && <p className="text-sm text-green-600">Contrasena actualizada correctamente.</p>}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {isUpdatingPassword ? 'Actualizando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const ProtectedRoute = ({ element, path }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const allowedRoles = ROUTE_ACCESS[path];
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const fallbackRoute = getDefaultRouteForRole(user.role);
    return <Navigate to={fallbackRoute} replace />;
  }

  return <ProtectedLayout>{element}</ProtectedLayout>;
};

function AppRoutes() {
  const { isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-xl font-medium text-gray-700">Iniciando aplicación...</div>
      </div>
    );
  }

  const defaultRoute = user ? getDefaultRouteForRole(user.role) : '/login';

  return (
    <Routes>
      <Route path="/" element={<Navigate to={defaultRoute} replace />} />
      <Route
        path="/login"
        element={user ? <Navigate to={defaultRoute} replace /> : <Login />}
      />
      <Route
        path="/dashboard"
        element={<ProtectedRoute path="/dashboard" element={<Dashboard />} />}
      />
      <Route
        path="/gimnasio"
        element={<ProtectedRoute path="/gimnasio" element={<Gimnasio />} />}
      />
      <Route
        path="/miembros"
        element={<ProtectedRoute path="/miembros" element={<Miembros />} />}
      />
      <Route
        path="/planificaciones"
        element={<ProtectedRoute path="/planificaciones" element={<Planificaciones />} />}
      />
      <Route path="/pagos" element={<ProtectedRoute path="/pagos" element={<Pagos />} />} />
      <Route path="*" element={<Navigate to={defaultRoute} replace />} />
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
