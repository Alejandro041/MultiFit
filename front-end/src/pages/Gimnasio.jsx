import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../Context/AuthContext";
import { Building2, MapPin, Hash, Plus, Edit, Trash2, Users, User, ChevronRight } from "lucide-react";

const Gimnasio = () => {
  const { user, sucursales, miembros, createSucursal, isLoading, tenantOverview } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formData, setFormData] = useState({ name: "", code: "", address: "", phone: "" });

  const membersByGym = useMemo(() => {
    return miembros.reduce((acc, member) => {
      if (!member.sucursalId) return acc;
      acc[member.sucursalId] = (acc[member.sucursalId] ?? 0) + 1;
      return acc;
    }, {});
  }, [miembros]);

  const { gyms, trainers } = useMemo(() => {
    const base = tenantOverview ?? { gyms: [], trainers: [] };
    return {
      gyms: Array.isArray(base.gyms) ? base.gyms : [],
      trainers: Array.isArray(base.trainers) ? base.trainers : []
    };
  }, [tenantOverview]);

  const [activeOverviewTab, setActiveOverviewTab] = useState(() => (gyms.length > 0 ? "gyms" : "trainers"));
  const [selectedGymId, setSelectedGymId] = useState(() => gyms[0]?.id ?? null);
  const [selectedTrainerId, setSelectedTrainerId] = useState(() => trainers[0]?.id ?? null);

  useEffect(() => {
    if (!gyms.length) {
      setSelectedGymId(null);
      return;
    }
    if (!gyms.some((gym) => gym.id === selectedGymId)) {
      setSelectedGymId(gyms[0].id);
    }
  }, [gyms, selectedGymId]);

  useEffect(() => {
    if (!trainers.length) {
      setSelectedTrainerId(null);
      return;
    }
    if (!trainers.some((trainer) => trainer.id === selectedTrainerId)) {
      setSelectedTrainerId(trainers[0].id);
    }
  }, [trainers, selectedTrainerId]);

  useEffect(() => {
    if (activeOverviewTab === "gyms" && gyms.length === 0 && trainers.length > 0) {
      setActiveOverviewTab("trainers");
    } else if (activeOverviewTab === "trainers" && trainers.length === 0 && gyms.length > 0) {
      setActiveOverviewTab("gyms");
    }
  }, [activeOverviewTab, gyms, trainers]);

  const selectedGym = useMemo(
    () => gyms.find((gym) => gym.id === selectedGymId) ?? (gyms[0] ?? null),
    [gyms, selectedGymId]
  );

  const selectedTrainer = useMemo(
    () => trainers.find((trainer) => trainer.id === selectedTrainerId) ?? (trainers[0] ?? null),
    [trainers, selectedTrainerId]
  );

  const visibleGymTrainers = useMemo(
    () => (selectedGym?.trainers ?? []).slice(0, 6),
    [selectedGym]
  );

  const visibleGymMembers = useMemo(
    () => (selectedGym?.members ?? []).slice(0, 8),
    [selectedGym]
  );

  const visibleTrainerMembers = useMemo(
    () => (selectedTrainer?.members ?? []).slice(0, 10),
    [selectedTrainer]
  );

  if (user?.role !== "SuperAdmin") {
    return (
      <div className="flex-1 p-8 bg-gray-50">
        <div className="max-w-md mx-auto text-center">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Acceso restringido</h2>
          <p className="text-gray-600">Solo los usuarios con rol SuperAdmin pueden gestionar sucursales.</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsCreating(true);
    setFormError(null);

    try {
      await createSucursal(formData);
      setFormData({ name: "", code: "", address: "", phone: "" });
      setShowForm(false);
    } catch (err) {
      setFormError(err.message || "No se pudo crear la sucursal");
    } finally {
      setIsCreating(false);
    }
  };

  const handleInputChange = (event) => {
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  return (
    <div className="flex-1 p-8 bg-gray-50">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion de sucursales</h1>
          <p className="text-gray-600">Administra las ubicaciones de tu organizacion</p>
        </div>
        <button
          onClick={() => setShowForm((current) => !current)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Nueva sucursal</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Crear nueva sucursal</h3>
          {formError && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{formError}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de la sucursal</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Sucursal Centro"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Codigo</label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: CTR001"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Direccion</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Direccion completa"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Telefono</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Opcional"
                />
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={isCreating}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
              >
                {isCreating ? "Creando..." : "Crear sucursal"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-200"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Sucursales existentes ({sucursales.length})
          </h3>
        </div>
        <div className="p-6">
          {sucursales.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay sucursales</h3>
              <p className="text-gray-500 mb-6">Crea tu primera sucursal para comenzar</p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
              >
                Crear primera sucursal
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sucursales.map((sucursal) => (
                <div key={sucursal.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{sucursal.name}</h4>
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <Hash className="w-3 h-3" />
                          <span>{sucursal.code}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2 text-gray-300">
                      <button className="p-2 hover:text-blue-600 transition-colors duration-200" title="Editar" type="button">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:text-red-600 transition-colors duration-200" title="Eliminar" type="button">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{sucursal.address}</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Miembros:</span>
                      <span className="font-medium">{membersByGym[sucursal.id] ?? 0}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-500">Telefono:</span>
                      <span className="font-medium">{sucursal.phone || "Sin dato"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="mt-10 bg-white rounded-xl shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-200 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Vision general del tenant</h3>
            <p className="text-sm text-gray-500">Compara miembros y profesores por sucursal.</p>
          </div>
          <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1 text-xs font-medium text-gray-500">
            <button
              type="button"
              onClick={() => setActiveOverviewTab("gyms")}
              className={`rounded-md px-3 py-1 transition ${
                activeOverviewTab === "gyms" ? "bg-blue-600 text-white shadow-sm" : "hover:bg-gray-100"
              }`}
            >
              Sucursales
            </button>
            <button
              type="button"
              onClick={() => setActiveOverviewTab("trainers")}
              className={`rounded-md px-3 py-1 transition ${
                activeOverviewTab === "trainers" ? "bg-blue-600 text-white shadow-sm" : "hover:bg-gray-100"
              }`}
            >
              Profesores
            </button>
          </div>
        </div>
        <div className="p-6">
          {!gyms.length && !trainers.length ? (
            <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-6 text-sm text-gray-500">
              <p className="font-medium text-gray-700">Aun no hay datos dinamicos.</p>
              <p className="mt-1">Crea sucursales y asigna miembros o profesores para ver la informacion aqui.</p>
            </div>
          ) : activeOverviewTab === "gyms" ? (
            <div className="grid gap-6 lg:grid-cols-[280px,1fr]">
              <div className="space-y-2">
                {gyms.map((gym) => (
                  <button
                    key={gym.id}
                    type="button"
                    onClick={() => setSelectedGymId(gym.id)}
                    className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition ${
                      selectedGym?.id === gym.id
                        ? "border-blue-200 bg-blue-50 text-blue-700"
                        : "border-transparent bg-white hover:border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-4 w-4" />
                      <span className="text-sm font-medium leading-5">{gym.name}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-gray-500">
                      <span>{gym.memberCount} miembros</span>
                      <span>{gym.trainerCount} profesores</span>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </button>
                ))}
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                {selectedGym ? (
                  <div className="space-y-5">
                    <div>
                      <h4 className="text-base font-semibold text-gray-900">{selectedGym.name}</h4>
                      <p className="text-sm text-gray-500">Codigo: {selectedGym.code}</p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-lg bg-white p-4 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Resumen</p>
                        <dl className="mt-3 space-y-2 text-sm">
                          <div className="flex justify-between">
                            <dt className="text-gray-500">Miembros</dt>
                            <dd className="font-semibold text-gray-900">{selectedGym.memberCount}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-gray-500">Profesores</dt>
                            <dd className="font-semibold text-gray-900">{selectedGym.trainerCount}</dd>
                          </div>
                        </dl>
                      </div>
                      <div className="rounded-lg bg-white p-4 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Profesores destacados</p>
                        {visibleGymTrainers.length > 0 ? (
                          <ul className="mt-3 space-y-2 text-sm text-gray-700">
                            {visibleGymTrainers.map((trainer) => (
                              <li key={trainer.id} className="flex items-start justify-between">
                                <div>
                                  <p className="font-medium text-gray-900">{trainer.name}</p>
                                  <p className="text-xs text-gray-500">{trainer.email || "Sin email"}</p>
                                </div>
                                <span className="text-xs text-gray-400">{trainer.phone || "Sin telefono"}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="mt-3 text-xs text-gray-500">No hay profesores asignados.</p>
                        )}
                        {selectedGym.trainers && selectedGym.trainers.length > visibleGymTrainers.length && (
                          <p className="mt-2 text-right text-[11px] text-gray-400">
                            +{selectedGym.trainers.length - visibleGymTrainers.length} profesor(es)
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="rounded-lg bg-white p-4 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Miembros de la sucursal</p>
                      {visibleGymMembers.length > 0 ? (
                        <ul className="mt-3 grid gap-2 text-sm text-gray-700 md:grid-cols-2">
                          {visibleGymMembers.map((member) => (
                            <li key={member.id} className="flex items-center space-x-2">
                              <Users className="h-4 w-4 text-gray-400" />
                              <div>
                                <p className="font-medium text-gray-900">{member.name}</p>
                                <p className="text-xs text-gray-500">{member.email || "Sin email"}</p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-3 text-xs text-gray-500">No hay miembros registrados en esta sucursal.</p>
                      )}
                      {selectedGym.members && selectedGym.members.length > visibleGymMembers.length && (
                        <p className="mt-2 text-right text-[11px] text-gray-400">
                          +{selectedGym.members.length - visibleGymMembers.length} miembro(s)
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-sm text-gray-500">Selecciona una sucursal para ver los detalles.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[280px,1fr]">
              <div className="space-y-2">
                {trainers.map((trainer) => (
                  <button
                    key={trainer.id}
                    type="button"
                    onClick={() => setSelectedTrainerId(trainer.id)}
                    className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition ${
                      selectedTrainer?.id === trainer.id
                        ? "border-blue-200 bg-blue-50 text-blue-700"
                        : "border-transparent bg-white hover:border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <User className="h-4 w-4" />
                      <div>
                        <p className="text-sm font-medium leading-5">{trainer.name}</p>
                        <p className="text-xs text-gray-500">{trainer.sucursalName}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-gray-500">
                      <span>{trainer.memberCount} miembros</span>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </button>
                ))}
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                {selectedTrainer ? (
                  <div className="space-y-5">
                    <div>
                      <h4 className="text-base font-semibold text-gray-900">{selectedTrainer.name}</h4>
                      <p className="text-sm text-gray-500">Sucursal: {selectedTrainer.sucursalName}</p>
                    </div>
                    <div className="rounded-lg bg-white p-4 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Contacto</p>
                      <dl className="mt-3 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-gray-500">Email</dt>
                          <dd className="font-semibold text-gray-900">{selectedTrainer.email || "Sin email"}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-500">Telefono</dt>
                          <dd className="font-semibold text-gray-900">{selectedTrainer.phone || "Sin telefono"}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-500">Miembros en sucursal</dt>
                          <dd className="font-semibold text-gray-900">{selectedTrainer.memberCount}</dd>
                        </div>
                      </dl>
                    </div>
                    <div className="rounded-lg bg-white p-4 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Miembros vinculados</p>
                      {visibleTrainerMembers.length > 0 ? (
                        <ul className="mt-3 space-y-2 text-sm text-gray-700">
                          {visibleTrainerMembers.map((member) => (
                            <li key={member.id} className="flex items-start justify-between">
                              <div>
                                <p className="font-medium text-gray-900">{member.name}</p>
                                <p className="text-xs text-gray-500">{member.email || "Sin email"}</p>
                              </div>
                              <span className="text-xs text-gray-400">{member.phone || "Sin telefono"}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-3 text-xs text-gray-500">No hay miembros asociados en su sucursal.</p>
                      )}
                      {selectedTrainer.members && selectedTrainer.members.length > visibleTrainerMembers.length && (
                        <p className="mt-2 text-right text-[11px] text-gray-400">
                          +{selectedTrainer.members.length - visibleTrainerMembers.length} miembro(s)
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-sm text-gray-500">Selecciona un profesor para ver los detalles.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {isLoading && <div className="mt-4 text-sm text-gray-500">Actualizando datos...</div>}
    </div>
  );
};

export default Gimnasio;








