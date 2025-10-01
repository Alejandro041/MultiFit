import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
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
  XCircle
} from 'lucide-react';

const Pagos = () => {
  const { user } = useAuth();
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  if (!['SuperAdmin', 'AdminGym'].includes(user?.role)) {
    return (
      <div className="flex-1 p-8 bg-gray-50">
        <div className="max-w-md mx-auto text-center">
          <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Acceso Restringido</h2>
          <p className="text-gray-600">Solo los administradores pueden ver información de pagos.</p>
        </div>
      </div>
    );
  }

  const mockPayments = [
    {
      id: 1,
      memberName: 'Juan Pérez',
      amount: 89.00,
      status: 'completed',
      date: '2024-01-15',
      type: 'Membresía Mensual',
      method: 'Tarjeta de Crédito'
    },
    {
      id: 2,
      memberName: 'María González',
      amount: 150.00,
      status: 'completed',
      date: '2024-01-14',
      type: 'Entrenamiento Personal',
      method: 'Transferencia'
    },
    {
      id: 3,
      memberName: 'Carlos Ruiz',
      amount: 89.00,
      status: 'pending',
      date: '2024-01-13',
      type: 'Membresía Mensual',
      method: 'Efectivo'
    },
    {
      id: 4,
      memberName: 'Ana López',
      amount: 45.00,
      status: 'failed',
      date: '2024-01-12',
      type: 'Clase Grupal',
      method: 'Tarjeta de Débito'
    },
    {
      id: 5,
      memberName: 'Luis Martín',
      amount: 200.00,
      status: 'completed',
      date: '2024-01-11',
      type: 'Plan Anual',
      method: 'Transferencia'
    }
  ];

  const filteredPayments = mockPayments.filter(payment => {
    const matchesSearch = payment.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'failed': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Completado';
      case 'pending': return 'Pendiente';
      case 'failed': return 'Fallido';
      default: return 'Desconocido';
    }
  };

  const totalRevenue = mockPayments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingRevenue = mockPayments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  const failedRevenue = mockPayments
    .filter(p => p.status === 'failed')
    .reduce((sum, p) => sum + p.amount, 0);

  const stats = [
    {
      label: 'Ingresos Totales',
      value: `$${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'from-green-600 to-green-700',
      trend: '+12.5%'
    },
    {
      label: 'Pagos Pendientes',
      value: `$${pendingRevenue.toFixed(2)}`,
      icon: Clock,
      color: 'from-yellow-600 to-yellow-700',
      trend: '+3.2%'
    },
    {
      label: 'Pagos Fallidos',
      value: `$${failedRevenue.toFixed(2)}`,
      icon: XCircle,
      color: 'from-red-600 to-red-700',
      trend: '-2.1%'
    },
    {
      label: 'Transacciones',
      value: mockPayments.length.toString(),
      icon: CreditCard,
      color: 'from-blue-600 to-blue-700',
      trend: '+8.7%'
    }
  ];

  return (
    <div className="flex-1 p-8 bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Panel de Pagos</h1>
          <p className="text-gray-600">Gestiona y monitorea todas las transacciones financieras</p>
        </div>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2">
          <Download className="w-5 h-5" />
          <span>Exportar Reporte</span>
        </button>
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
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">{stat.trend}</span>
                  </div>
                </div>
                <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters and Search */}
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

      {/* Payments Table */}
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
                  Método
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
                          {payment.memberName.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{payment.memberName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payment.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${payment.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(payment.status)}
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                        {getStatusText(payment.status)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {payment.method}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(payment.date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monthly Revenue Chart Placeholder */}
      <div className="bg-white rounded-xl shadow-sm p-6 mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Ingresos Mensuales</h3>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Gráfico de ingresos mensuales</p>
            <p className="text-sm text-gray-400 mt-1">Integración con biblioteca de gráficos pendiente</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pagos;