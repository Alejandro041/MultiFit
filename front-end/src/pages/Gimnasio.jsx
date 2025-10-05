import React, { useMemo, useState } from "react";
import { useAuth } from "../Context/AuthContext";
import { Building2, MapPin, Hash, Plus, Edit, Trash2 } from "lucide-react";

const Gimnasio = () => {
  const { user, sucursales, miembros, createSucursal, isLoading } = useAuth();
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
      {isLoading && <div className="mt-4 text-sm text-gray-500">Actualizando datos...</div>}
    </div>
  );
};

export default Gimnasio;
