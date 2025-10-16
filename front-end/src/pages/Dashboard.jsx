import React, { useMemo, useState } from "react";
import { useAuth } from "../Context/AuthContext";
import {
  Building2,
  Users,
  CreditCard,
  TrendingUp,
  CheckCircle,
  Calendar,
  Activity,
  Dumbbell
} from "lucide-react";

const Dashboard = () => {
  const { user, empresa, sucursales, miembros, payments, createEmpresa, isLoading } = useAuth();
  const [organizationName, setOrganizationName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [formError, setFormError] = useState(null);

  const formatCurrency = (value) => {
    const amount = Number(value);
    if (!Number.isFinite(amount)) {
      return "$0";
    }
    return new Intl.NumberFormat("es-AR", { style: "currency", currency: "USD" }).format(amount);
  };

  const paymentSummary = useMemo(() => {
    const list = Array.isArray(payments) ? payments : [];
    return list.reduce(
      (acc, payment) => {
        const amount = Number(payment.amount ?? 0);
        const normalized = Number.isFinite(amount) ? amount : 0;

        switch (payment.status) {
          case "completed":
            acc.completedTotal += normalized;
            acc.completedCount += 1;
            break;
          case "pending":
            acc.pendingTotal += normalized;
            acc.pendingCount += 1;
            break;
          default:
            break;
        }
        return acc;
      },
      { completedTotal: 0, completedCount: 0, pendingTotal: 0, pendingCount: 0 }
    );
  }, [payments]);

  const stats = useMemo(
    () => [
      {
        label: "Miembros activos",
        value: miembros.length.toString(),
        icon: Users,
        color: "from-blue-600 to-blue-700"
      },
      {
        label: "Sucursales",
        value: sucursales.length.toString(),
        icon: Building2,
        color: "from-purple-600 to-purple-700"
      },
      {
        label: "Pagos procesados",
        value: formatCurrency(paymentSummary.completedTotal),
        icon: CreditCard,
        color: "from-green-600 to-green-700"
      },
      {
        label: "Pagos pendientes",
        value: paymentSummary.pendingCount.toString(),
        icon: Activity,
        color: "from-yellow-500 to-amber-600"
      }
    ],
    [miembros.length, sucursales.length, paymentSummary.completedTotal, paymentSummary.pendingCount]
  );

  const handleCreateOrganization = async (event) => {
    event.preventDefault();
    if (!organizationName.trim()) return;
    setIsCreating(true);
    setFormError(null);

    try {
      await createEmpresa(organizationName.trim());
      setOrganizationName("");
    } catch (err) {
      setFormError(err.message || "No se pudo crear la organizacion");
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Cargando datos...</div>
      </div>
    );
  }

  if (!empresa) {
    return (
      <div className="flex-1 p-8 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center mb-8">
            <Building2 className="w-16 h-16 mx-auto mb-4 opacity-90" />
            <h2 className="text-3xl font-bold mb-4">Bienvenido a GymApp</h2>
            <p className="text-blue-100">
              Como primer usuario debes crear la organizacion para comenzar a operar.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Configura tu organizacion</h3>
            {formError && (
              <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{formError}</div>
            )}
            <form onSubmit={handleCreateOrganization} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Nombre de la organizacion
                </label>
                <input
                  type="text"
                  value={organizationName}
                  onChange={(event) => setOrganizationName(event.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: FitZone, PowerGym"
                  required
                />
                <p className="text-sm text-gray-500 mt-2">
                  Este sera el nombre principal de tu cadena de gimnasios.
                </p>
              </div>

              <button
                type="submit"
                disabled={isCreating}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50"
              >
                {isCreating ? "Creando..." : "Crear organizacion"}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-4">Que podras hacer despues?</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Crear y gestionar multiples sucursales</span>
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

  return (
    <div className="flex-1 p-8 bg-gray-50">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Panel de control</h1>
        <p className="text-gray-600">Bienvenido de vuelta, {user?.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad reciente</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Miembros totales</p>
                <p className="text-xs text-gray-500">{miembros.length} registrados</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Building2 className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Sucursales activas</p>
                <p className="text-xs text-gray-500">{sucursales.length} en total</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Proximos pasos</p>
                <p className="text-xs text-gray-500">Agrega nuevas clases o rutinas</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen general</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Organizacion</span>
              <span className="font-semibold text-gray-900">{empresa.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Roles asignados</span>
              <span className="font-semibold text-gray-900">{user?.role}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Miembros activos</span>
              <span className="font-semibold text-green-600">{miembros.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Sucursales</span>
              <span className="font-semibold text-purple-600">{sucursales.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Ingresos cobrados</span>
              <span className="font-semibold text-green-600">
                {formatCurrency(paymentSummary.completedTotal)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Pagos pendientes</span>
              <span className="font-semibold text-yellow-600">
                {paymentSummary.pendingCount} ({formatCurrency(paymentSummary.pendingTotal)})
              </span>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900">Estado general</span>
                <span className="text-lg font-bold text-green-600">Operativo</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;



