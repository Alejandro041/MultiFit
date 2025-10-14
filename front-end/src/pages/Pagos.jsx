import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../Context/AuthContext';
import {
  CreditCard,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Filter,
  Search,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  Building2,
  ShieldCheck
} from 'lucide-react';
import { get } from '../services/apiClient';

const Pagos = () => {
  const { user, empresa } = useAuth();
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [plansError, setPlansError] = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState(null);

  const isManager = ['SuperAdmin', 'AdminGym', 'Entrenador'].includes(user?.role);
  const isMember = user?.role === 'Miembro';

  useEffect(() => {
    if (!isMember) {
      setPlans([]);
      setPlansError(null);
      setPlansLoading(false);
      setSelectedPlanId(null);
      return;
    }

    let isMounted = true;
    setPlansLoading(true);
    setPlansError(null);

    (async () => {
      try {
        const response = await get('/api/tipo-membresia');
        const data = Array.isArray(response.data) ? response.data : [];
        if (!isMounted) return;
        setPlans(data);
        if (data.length > 0) {
          setSelectedPlanId((current) => current ?? data[0].id);
        }
      } catch (err) {
        if (!isMounted) return;
        setPlansError(err.message || 'No se pudieron cargar los planes disponibles');
      } finally {
        if (isMounted) {
          setPlansLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [isMember]);

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.id === selectedPlanId) ?? null,
    [plans, selectedPlanId]
  );

  if (!isManager && !isMember) {
    return (
      <div className="flex-1 p-8 bg-gray-50">
        <div className="max-w-md mx-auto text-center">
          <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Acceso Restringido</h2>
          <p className="text-gray-600">No tienes permisos para ver informacion de pagos.</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (value) => {
    if (typeof value !== 'number') return '$0.00';
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD' }).format(value);
  };

  if (isMember) {
    return (
      <div className="flex-1 p-8 bg-gray-50">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pagos y suscripcion</h1>
          <p className="text-gray-600">
            Consulta tu plan actual y mantente al dia con las opciones de suscripcion disponibles.
          </p>
        </div>

        <div className="mb-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl bg-white shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="rounded-lg bg-blue-100 p-3 text-blue-600">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Organizacion</p>
                <p className="text-lg font-semibold text-gray-900">{empresa?.name ?? 'Sin organizacion definida'}</p>
                {user?.gymName && (
                  <p className="text-sm text-gray-500">
                    Sucursal asignada: <span className="font-medium text-gray-900">{user.gymName}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="rounded-lg bg-green-100 p-3 text-green-600">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Plan seleccionado</p>
                {selectedPlan ? (
                  <>
                    <p className="text-lg font-semibold text-gray-900">{selectedPlan.name}</p>
                    <p className="text-sm text-gray-500">
                      {formatCurrency(Number(selectedPlan.price ?? 0))} · {selectedPlan.duration_days} dias
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">Aun no has seleccionado un plan.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Planes disponibles</h2>
              <p className="text-sm text-gray-500">Selecciona el plan que mejor se adapte a tus objetivos.</p>
            </div>
          </div>

          {plansLoading ? (
            <div className="mt-4 text-sm text-gray-600">Cargando planes...</div>
          ) : plansError ? (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {plansError}
            </div>
          ) : plans.length === 0 ? (
            <div className="mt-4 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
              No hay planes activos registrados en este momento. Consulta con tu gimnasio para mas informacion.
            </div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {plans.map((plan) => {
                const isSelected = plan.id === selectedPlanId;
                return (
                  <div
                    key={plan.id}
                    className={`rounded-xl border p-5 transition-shadow duration-200 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                        : 'border-gray-200 bg-white hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                        <p className="text-sm text-gray-500">{plan.description || 'Plan sin descripcion'}</p>
                      </div>
                      <span className="text-sm font-semibold text-blue-600">
                        {formatCurrency(Number(plan.price ?? 0))}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-600">
                      <span className="rounded-full bg-white px-3 py-1 shadow-inner">
                        Duracion: {plan.duration_days} dias
                      </span>
                      {plan.features && typeof plan.features === 'object' && Object.keys(plan.features).length > 0 && (
                        <span className="rounded-full bg-white px-3 py-1 shadow-inner">
                          {Object.keys(plan.features).length} beneficio(s)
                        </span>
                      )}
                    </div>
                    <div className="mt-4 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedPlanId(plan.id)}
                        className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                          isSelected
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }`}
                      >
                        {isSelected ? 'Plan seleccionado' : 'Seleccionar plan'}
                      </button>
                      <button
                        type="button"
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
                        disabled
                      >
                        Próximamente
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900">Metodos de pago</h2>
          <p className="mt-2 text-sm text-gray-500">
            La integracion con cobros en linea esta en desarrollo. Por ahora, coordina tu pago directamente con el
            gimnasio.
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-dashed border-gray-300 p-4">
              <p className="text-sm font-semibold text-gray-900">Tarjeta de credito</p>
              <p className="mt-1 text-xs text-gray-500">
                Muy pronto podras asociar una tarjeta para renovar tu suscripcion automaticamente.
              </p>
            </div>
            <div className="rounded-lg border border-dashed border-gray-300 p-4">
              <p className="text-sm font-semibold text-gray-900">Transferencia bancaria</p>
              <p className="mt-1 text-xs text-gray-500">
                Solicita los datos de tu gimnasio para realizar el pago y confirmar tu suscripcion.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const mockPayments = [
    {
      id: 1,
      memberName: 'Juan Perez',
      amount: 89.0,
      status: 'completed',
      date: '2024-01-15',
      type: 'Membresia Mensual',
      method: 'Tarjeta de Credito'
    },
    {
      id: 2,
      memberName: 'Maria Gonzalez',
      amount: 150.0,
      status: 'completed',
      date: '2024-01-14',
      type: 'Entrenamiento Personal',
      method: 'Transferencia'
    },
    {
      id: 3,
      memberName: 'Carlos Ruiz',
      amount: 89.0,
      status: 'pending',
      date: '2024-01-13',
      type: 'Membresia Mensual',
      method: 'Efectivo'
    },
    {
      id: 4,
      memberName: 'Ana Lopez',
      amount: 45.0,
      status: 'failed',
      date: '2024-01-12',
      type: 'Clase Grupal',
      method: 'Tarjeta de Debito'
    },
    {
      id: 5,
      memberName: 'Luis Martin',
      amount: 200.0,
      status: 'completed',
      date: '2024-01-11',
      type: 'Plan Anual',
      method: 'Transferencia'
    }
  ];

  const filteredPayments = mockPayments.filter((payment) => {
    const matchesSearch =
      payment.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Completado';
      case 'pending':
        return 'Pendiente';
      case 'failed':
        return 'Fallido';
      default:
        return 'Desconocido';
    }
  };

  const totalRevenue = mockPayments
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingRevenue = mockPayments
    .filter((p) => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  const failedRevenue = mockPayments
    .filter((p) => p.status === 'failed')
    .reduce((sum, p) => sum + p.amount, 0);

  const stats = [
    {
      name: 'Ingresos del mes',
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
      trend: '+12% vs mes anterior',
      trendColor: 'text-green-600'
    },
    {
      name: 'Pagos pendientes',
      value: formatCurrency(pendingRevenue),
      icon: Clock,
      trend: '3 pendientes',
      trendColor: 'text-yellow-600'
    },
    {
      name: 'Pagos fallidos',
      value: formatCurrency(failedRevenue),
      icon: TrendingDown,
      trend: '1 intento fallido',
      trendColor: 'text-red-600'
    }
  ];

  return (
    <div className="flex-1 p-8 bg-gray-50">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion de Pagos</h1>
          <p className="text-gray-600">Monitorea ingresos, pagos pendientes y rendimiento financiero</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Exportar reporte</span>
          </button>
          <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Periodo actual</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
              <div className="rounded-full bg-blue-50 p-3 text-blue-600">
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <p className={`mt-3 text-sm font-medium ${stat.trendColor}`}>{stat.trend}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Buscar por miembro o tipo de pago..."
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los estados</option>
              <option value="completed">Completados</option>
              <option value="pending">Pendientes</option>
              <option value="failed">Fallidos</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Historial de Transacciones ({filteredPayments.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Miembro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Metodo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-sm">
                          {payment.memberName
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{payment.memberName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(payment.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(payment.status)}
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                        {getStatusText(payment.status)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.method}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(payment.date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Ingresos Mensuales</h3>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Grafico de ingresos mensuales</p>
            <p className="text-sm text-gray-400 mt-1">Integracion con biblioteca de graficos pendiente</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pagos;
