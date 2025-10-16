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

const Pagos = () => {
  const {
    user,
    empresa,
    membershipPlans,
    payments,
    currentMember,
    recordPayment,
    createMembershipPlan,
    sucursales,
    isLoading
  } = useAuth();
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Tarjeta de Credito');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [planName, setPlanName] = useState('');
  const [planPrice, setPlanPrice] = useState('');
  const [planDurationDays, setPlanDurationDays] = useState('');
  const [planDescription, setPlanDescription] = useState('');
  const [planBenefits, setPlanBenefits] = useState('');
  const [planGymId, setPlanGymId] = useState('');
  const [planError, setPlanError] = useState(null);
  const [planSuccess, setPlanSuccess] = useState(null);
  const [isSavingPlan, setIsSavingPlan] = useState(false);

  const isManager = ['SuperAdmin', 'AdminGym', 'Entrenador'].includes(user?.role);
  const isMember = user?.role === 'Miembro';
  const isSuperAdmin = user?.role === 'SuperAdmin';

  const availableGyms = useMemo(
    () => (Array.isArray(sucursales) ? sucursales : []),
    [sucursales]
  ); // FIX: Initialize gym list before any effect uses it.

  useEffect(() => {
    if (membershipPlans.length === 0) {
      setSelectedPlanId(null);
      return;
    }

    setSelectedPlanId((current) => {
      if (current && membershipPlans.some((plan) => plan.id === current)) {
        return current;
      }
      return membershipPlans[0].id;
    });
  }, [membershipPlans]);

  useEffect(() => {
    if (!isSuperAdmin) return;
    if (availableGyms.length === 0) {
      setPlanGymId('');
      return;
    }
    setPlanGymId((current) => {
      if (current && availableGyms.some((gym) => gym.id === current)) {
        return current;
      }
      return availableGyms[0].id;
    });
  }, [availableGyms, isSuperAdmin]);

  const selectedPlan = useMemo(
    () => membershipPlans.find((plan) => plan.id === selectedPlanId) ?? null,
    [membershipPlans, selectedPlanId]
  );

  const sortedPlans = useMemo(() => {
    const list = Array.isArray(membershipPlans) ? [...membershipPlans] : [];
    return list.sort((a, b) => {
      const priceA = Number(a?.price ?? 0);
      const priceB = Number(b?.price ?? 0);
      if (!Number.isFinite(priceA) || !Number.isFinite(priceB)) {
        return 0;
      }
      return priceA - priceB;
    });
  }, [membershipPlans]);

  const extractPlanBenefits = (plan) => {
    if (!plan || !plan.features) return [];
    const { features } = plan;
    if (Array.isArray(features)) {
      return features.filter(Boolean);
    }
    if (Array.isArray(features?.benefits)) {
      return features.benefits.filter(Boolean);
    }
    if (typeof features === 'object' && features !== null) {
      return Object.values(features)
        .flatMap((value) => {
          if (Array.isArray(value)) return value;
          if (typeof value === 'string') return [value];
          return [];
        })
        .filter(Boolean);
    }
    return [];
  };

  const handleCreatePlan = async (event) => {
    event.preventDefault();
    setPlanError(null);
    setPlanSuccess(null);

    const trimmedName = planName.trim();
    if (!trimmedName) {
      setPlanError('Ingresa un nombre para el plan');
      return;
    }

    const priceValue = Number(planPrice);
    if (!Number.isFinite(priceValue) || priceValue <= 0) {
      setPlanError('Ingresa un precio valido (mayor que 0)');
      return;
    }

    const durationValue = Number.parseInt(planDurationDays, 10);
    if (!Number.isFinite(durationValue) || durationValue <= 0) {
      setPlanError('Ingresa una duracion en dias valida (mayor que 0)');
      return;
    }

    if (!planGymId) {
      setPlanError('Selecciona la sucursal a la que pertenece el plan');
      return;
    }

    const descriptionValue = planDescription.trim();
    const benefitsList = planBenefits
      .split(/\r?\n|,/)
      .map((benefit) => benefit.trim())
      .filter(Boolean);

    const formattedPrice = Number(priceValue.toFixed(2));
    const features = benefitsList.length > 0 ? { benefits: benefitsList } : null;

    setIsSavingPlan(true);

    try {
      await createMembershipPlan({
        name: trimmedName,
        description: descriptionValue || null,
        price: formattedPrice,
        duration_days: durationValue,
        features,
        gym_id: planGymId
      });

      setPlanSuccess('Plan creado correctamente.');
      setPlanName('');
      setPlanPrice('');
      setPlanDurationDays('');
      setPlanDescription('');
      setPlanBenefits('');
      if (availableGyms.some((gym) => gym.id === planGymId)) {
        setPlanGymId(planGymId);
      }
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'No se pudo crear el plan. Intenta nuevamente.';
      setPlanError(message);
    } finally {
      setIsSavingPlan(false);
    }
  };

  const nextDueDate = useMemo(() => {
    if (!selectedPlan) return null;
    const duration = Number(selectedPlan.duration_days ?? 0);
    const due = new Date();
    if (Number.isFinite(duration) && duration > 0) {
      due.setDate(due.getDate() + duration);
    }
    return due;
  }, [selectedPlan]);

  const handleRegisterPayment = async () => {
    if (!selectedPlan) {
      setFeedbackMessage({
        type: 'error',
        text: 'Selecciona un plan para registrar el pago.'
      });
      return;
    }

    if (!currentMember) {
      setFeedbackMessage({
        type: 'error',
        text: 'No encontramos tu perfil de miembro. Contacta al administrador.'
      });
      return;
    }

    setIsProcessingPayment(true);
    setFeedbackMessage(null);

    const duration = Number(selectedPlan.duration_days ?? 0);
    const dueDate = new Date();
    if (Number.isFinite(duration) && duration > 0) {
      dueDate.setDate(dueDate.getDate() + duration);
    }

    const planPrice = Number(selectedPlan.price ?? 0);
    const resolvedAmount = Number.isFinite(planPrice) ? planPrice : 0;

    try {
      await recordPayment({
        miembroId: currentMember.id,
        membershipTypeId: selectedPlan.id,
        amount: resolvedAmount,
        paymentMethod,
        dueDate,
        notes: JSON.stringify({
          planName: selectedPlan.name,
          durationDays: selectedPlan.duration_days
        })
      });
      setFeedbackMessage({
        type: 'success',
        text: 'Pago registrado correctamente. Gracias por mantener tu suscripcion al dia.'
      });
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'No se pudo registrar el pago. Intenta nuevamente o consulta con tu gimnasio.';
      setFeedbackMessage({
        type: 'error',
        text: message
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const formatCurrency = (value) => {
    const amount = Number(value);
    if (!Number.isFinite(amount)) {
      return '$0.00';
    }
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatDate = (value) => {
    if (!value) return 'Sin fecha';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return 'Sin fecha';
    }
    return date.toLocaleDateString();
  };

  const paymentsList = useMemo(() => (Array.isArray(payments) ? payments : []), [payments]);

  const paymentSummary = useMemo(
    () =>
      paymentsList.reduce(
        (acc, payment) => {
          const amount = Number(payment.amount ?? 0);
          const normalized = Number.isFinite(amount) ? amount : 0;

          switch (payment.status) {
            case 'completed':
              acc.completedTotal += normalized;
              acc.completedCount += 1;
              break;
            case 'pending':
              acc.pendingTotal += normalized;
              acc.pendingCount += 1;
              break;
            case 'failed':
              acc.failedTotal += normalized;
              acc.failedCount += 1;
              break;
            default:
              acc.otherCount += 1;
              break;
          }

          acc.overallTotal += normalized;
          return acc;
        },
        {
          completedTotal: 0,
          pendingTotal: 0,
          failedTotal: 0,
          overallTotal: 0,
          completedCount: 0,
          pendingCount: 0,
          failedCount: 0,
          otherCount: 0
        }
      ),
    [paymentsList]
  );

  const filteredPayments = useMemo(() => {
    const normalizedStatus = filterStatus.toLowerCase();
    const term = searchTerm.trim().toLowerCase();

    return paymentsList.filter((payment) => {
      if (normalizedStatus !== 'all' && payment.status !== normalizedStatus) {
        return false;
      }

      if (!term) {
        return true;
      }

      const haystack = [
        payment.memberName ?? '',
        payment.type ?? '',
        payment.method ?? '',
        payment.memberEmail ?? ''
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [paymentsList, filterStatus, searchTerm]);

  const isPlansLoading = isMember && isLoading && membershipPlans.length === 0;
  const nextDueDateLabel = nextDueDate ? formatDate(nextDueDate.toISOString()) : 'Sin fecha estimada';

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'refunded':
        return <TrendingDown className="w-5 h-5 text-purple-500" />;
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
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'refunded':
        return 'bg-purple-100 text-purple-800';
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
      case 'processing':
        return 'Procesando';
      case 'refunded':
        return 'Reembolsado';
      default:
        return 'Desconocido';
    }
  };

  const stats = [
    {
      name: 'Ingresos del mes',
      value: formatCurrency(paymentSummary.completedTotal),
      icon: DollarSign,
      trend: `${paymentSummary.completedCount} pago(s) completado(s)`,
      trendColor: 'text-green-600'
    },
    {
      name: 'Pagos pendientes',
      value: formatCurrency(paymentSummary.pendingTotal),
      icon: Clock,
      trend: `${paymentSummary.pendingCount} pendiente(s)`,
      trendColor: 'text-yellow-600'
    },
    {
      name: 'Pagos fallidos',
      value: formatCurrency(paymentSummary.failedTotal),
      icon: TrendingDown,
      trend: `${paymentSummary.failedCount} intento(s) fallido(s)`,
      trendColor: 'text-red-600'
    }
  ];

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

  if (isMember) {
    const memberPayments = paymentsList;

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
                      {formatCurrency(selectedPlan.price)} - {selectedPlan.duration_days} dias
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

          {isPlansLoading ? (
            <div className="mt-4 text-sm text-gray-600">Cargando planes disponibles...</div>
          ) : membershipPlans.length === 0 ? (
            <div className="mt-4 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
              No hay planes activos registrados en este momento. Consulta con tu gimnasio para mas informacion.
            </div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {membershipPlans.map((plan) => {
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
                      <span className="text-sm font-semibold text-blue-600">{formatCurrency(plan.price)}</span>
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
                        Detalles
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {selectedPlan && (
            <div className="mt-8 rounded-xl border border-blue-100 bg-blue-50 p-6">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-blue-900">Registrar pago manual</h3>
                  <p className="text-sm text-blue-700">
                    Confirmaremos el pago del plan {selectedPlan.name}. Proximo vencimiento estimado: {nextDueDateLabel}.
                  </p>
                </div>
              </div>
              {feedbackMessage && (
                <div
                  className={`mt-4 rounded-lg border px-4 py-3 text-sm ${
                    feedbackMessage.type === 'success'
                      ? 'border-green-200 bg-green-100 text-green-800'
                      : 'border-red-200 bg-red-100 text-red-800'
                  }`}
                >
                  {feedbackMessage.text}
                </div>
              )}
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-blue-900 mb-2">Metodo de pago</label>
                  <select
                    value={paymentMethod}
                    onChange={(event) => setPaymentMethod(event.target.value)}
                    className="w-full rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Tarjeta de Credito">Tarjeta de credito</option>
                    <option value="Transferencia">Transferencia</option>
                    <option value="Efectivo">Efectivo</option>
                  </select>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900">Total a pagar</p>
                  <p className="mt-1 text-2xl font-semibold text-blue-900">{formatCurrency(selectedPlan.price)}</p>
                  <p className="text-xs text-blue-700">Duracion del plan: {selectedPlan.duration_days} dias</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRegisterPayment}
                disabled={isProcessingPayment}
                className="mt-6 inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-blue-700 disabled:opacity-50"
              >
                {isProcessingPayment ? 'Registrando pago...' : 'Registrar pago'}
              </button>
              {!currentMember && (
                <p className="mt-3 text-xs text-blue-800">
                  No pudimos asociar tu usuario a un miembro activo. Por favor contacta al administrador.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900">Metodos de pago</h2>
          <p className="mt-2 text-sm text-gray-500">
            Mientras integramos cobros en linea, registra tus pagos manualmente y coordina la confirmacion con tu gimnasio.
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-dashed border-gray-300 p-4">
              <p className="text-sm font-semibold text-gray-900">Tarjeta de credito</p>
              <p className="mt-1 text-xs text-gray-500">
                Puedes registrar el pago y entregar el comprobante a tu entrenador o administrador.
              </p>
            </div>
            <div className="rounded-lg border border-dashed border-gray-300 p-4">
              <p className="text-sm font-semibold text-gray-900">Transferencia o efectivo</p>
              <p className="mt-1 text-xs text-gray-500">
                Selecciona el metodo adecuado y comparte el comprobante para validar tu suscripcion.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Historial de pagos ({memberPayments.length})</h2>
          </div>
          {memberPayments.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-6 text-sm text-gray-500">
              Aun no registras pagos. Cuando confirmes uno, aparecera aqui.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Concepto
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
                  {memberPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(payment.status)}
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                              payment.status
                            )}`}
                          >
                            {getStatusText(payment.status)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.method ?? 'Sin metodo'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(payment.paymentDate ?? payment.dueDate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

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

      {isSuperAdmin && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900">Crear tipo de Membresia</h2>
          <p className="text-sm text-gray-500 mb-4">
            Define nuevos planes para tu organizacion. Los miembros podran seleccionarlos al registrarse o pagar.
          </p>
          {planError && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{planError}</div>
          )}
          {planSuccess && (
            <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">{planSuccess}</div>
          )}
          {availableGyms.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-6 text-sm text-gray-500">
              Primero crea una sucursal para poder asociar el plan de membresia.
            </div>
          ) : (
            <form onSubmit={handleCreatePlan} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del plan</label>
                <input
                  type="text"
                  value={planName}
                  onChange={(event) => setPlanName(event.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Membresia Premium"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Precio (USD)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={planPrice}
                  onChange={(event) => setPlanPrice(event.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="99.90"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duracion (dias)</label>
                <input
                  type="number"
                  min="1"
                  value={planDurationDays}
                  onChange={(event) => setPlanDurationDays(event.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="30"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sucursal asociada</label>
                <select
                  value={planGymId}
                  onChange={(event) => setPlanGymId(event.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {availableGyms.map((gym) => (
                    <option key={gym.id} value={gym.id}>
                      {gym.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descripcion</label>
                <textarea
                  value={planDescription}
                  onChange={(event) => setPlanDescription(event.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-[98px]"
                  placeholder="Detalles principales del plan"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Beneficios (uno por linea)</label>
                <textarea
                  value={planBenefits}
                  onChange={(event) => setPlanBenefits(event.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-28"
                  placeholder={'Acceso ilimitado al gimnasio\nSesiones con entrenador\nClases grupales incluidas'}
                />
                <p className="text-xs text-gray-500 mt-2">Cada linea se guardara como un beneficio independiente.</p>
              </div>
              <div className="md:col-span-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingPlan}
                  className="inline-flex items-center justify-center bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duración-200 disabled:opacity-50"
                >
                  {isSavingPlan ? 'Guardando...' : 'Crear plan'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Planes de Membresia ({sortedPlans.length})</h2>
        </div>
        {sortedPlans.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-6 text-sm text-gray-500">
            Aún no se han registrado planes de Membresia.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sortedPlans.map((plan) => {
              const benefits = extractPlanBenefits(plan);
              return (
                <div key={plan.id} className="border border-gray-200 rounded-xl p-5 shadow-sm bg-white">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">{plan.name}</h3>
                      {plan.description && (
                        <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-blue-600">
                      {formatCurrency(plan.price)}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3 text-xs text-gray-600">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-medium">
                      {plan.duration_days} dias
                    </span>
                  </div>
                  {benefits.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase">Beneficios</p>
                      <ul className="mt-1 space-y-1 text-sm text-gray-600">
                        {benefits.map((benefit, index) => (
                          <li key={`${plan.id}-benefit-${index}`} className="flex items-start gap-2">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
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
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Buscar por miembro, tipo de pago o metodo..."
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(event) => setFilterStatus(event.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los estados</option>
              <option value="completed">Completados</option>
              <option value="pending">Pendientes</option>
              <option value="failed">Fallidos</option>
              <option value="processing">Procesando</option>
              <option value="refunded">Reembolsados</option>
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
              {filteredPayments.map((payment) => {
                const memberName = payment.memberName ?? 'Sin nombre';
                const initials = memberName
                  .split(' ')
                  .filter(Boolean)
                  .map((part) => part[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase();

                return (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-sm">{initials || 'M'}</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{memberName}</div>
                          {payment.memberEmail && (
                            <div className="text-xs text-gray-500">{payment.memberEmail}</div>
                          )}
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
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            payment.status
                          )}`}
                        >
                          {getStatusText(payment.status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.method ?? 'Sin metodo'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(payment.paymentDate ?? payment.dueDate)}
                    </td>
                  </tr>
                );
              })}
              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500">
                    No se encontraron pagos con los filtros seleccionados.
                  </td>
                </tr>
              )}
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




