import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, 
  Users, 
  CreditCard, 
  TrendingUp, 
  CheckCircle,
  Calendar,
  Activity,
  Dumbbell
} from 'lucide-react';

const Dashboard = () => {
  const { user, empresa, createEmpresa, refreshContext } = useAuth();
  const [organizationName, setOrganizationName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateOrganization = async (e) => {
    e.preventDefault();
    if (!organizationName.trim()) return;

    setIsCreating(true);
    try {
      await createEmpresa(organizationName);
      await refreshContext();
      setOrganizationName('');
    } finally {
      setIsCreating(false);
    }
  };

  if (!empresa) {
    return (
      <div className="flex-1 p-8 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center mb-8">
            <Building2 className="w-16 h-16 mx-auto mb-4 opacity-90" />
            <h2 className="text-3xl font-bold mb-4">¡Bienvenido a GymApp!</h2>
            <p className="text-blue-100">
              Como primer SuperAdmin, necesitas configurar tu organización para comenzar.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Configura tu Organización</h3>
            <form onSubmit={handleCreateOrganization} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Nombre de la Organización
                </label>
                <input
                  type="text"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: FitZone, PowerGym, etc."
                  required
                />
                <p className="text-sm text-gray-500 mt-2">
                  Este será el nombre principal de tu cadena de gimnasios.
                </p>
              </div>

              <button
                type="submit"
                disabled={isCreating}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50"
              >
                {isCreating ? 'Creando...' : 'Crear Organización'}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-4">¿Qué podrás hacer después?</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Crear y gestionar múltiples sucursales</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Administrar miembros y personal</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Controlar pagos y finanzas</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Planificar rutinas y clases</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Miembros Activos', value: '1,247', icon: Users, color: 'from-blue-600 to-blue-700' },
    { label: 'Ingresos Mes', value: '$45,230', icon: CreditCard, color: 'from-green-600 to-green-700' },
    { label: 'Clases Programadas', value: '156', icon: Calendar, color: 'from-purple-600 to-purple-700' },
    { label: 'Equipos Activos', value: '89', icon: Activity, color: 'from-orange-600 to-orange-700' },
  ];

  return (
    <div className="flex-1 p-8 bg-gray-50">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Panel de Control</h1>
        <p className="text-gray-600">Bienvenido de vuelta, {user?.name}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Nuevo miembro registrado</p>
                <p className="text-xs text-gray-500">hace 2 horas</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Pago procesado - $89.00</p>
                <p className="text-xs text-gray-500">hace 4 horas</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Dumbbell className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Nueva rutina creada</p>
                <p className="text-xs text-gray-500">hace 1 día</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen Financiero</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Ingresos Mensuales</span>
              <span className="font-semibold text-green-600">+$45,230</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Gastos Operativos</span>
              <span className="font-semibold text-red-600">-$12,450</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Membresías Pendientes</span>
              <span className="font-semibold text-orange-600">$3,280</span>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900">Balance Neto</span>
                <span className="text-lg font-bold text-green-600">$32,780</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;