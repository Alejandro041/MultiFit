import React, { useState } from 'react';
import { useAuth } from '../Context/AuthContext';
import { 
  Calendar, 
  Plus, 
  Clock, 
  Users, 
  Dumbbell, 
  Target,
  X,
  BookOpen,
  Activity
} from 'lucide-react';

const Planificaciones = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('rutinas');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('rutina');
  const [isCreating, setIsCreating] = useState(false);
  const [rutinaForm, setRutinaForm] = useState({
    name: '',
    description: '',
    difficulty: 'beginner',
    duration: '',
    exercises: []
  });
  const [claseForm, setClaseForm] = useState({
    name: '',
    description: '',
    instructor: '',
    date: '',
    time: '',
    duration: '',
    capacity: ''
  });

  const canViewPlanificaciones = user?.permissions?.canViewPlans ?? false;
  const canManagePlanificaciones = user?.permissions?.canManagePlans ?? false;

  if (!canViewPlanificaciones) {
    return (
      <div className="flex-1 p-8 bg-gray-50">
        <div className="max-w-md mx-auto text-center">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Acceso Restringido</h2>
          <p className="text-gray-600">No tienes permisos para gestionar planificaciones.</p>
        </div>
      </div>
    );
  }

  const handleOpenModal = (type) => {
    if (!canManagePlanificaciones) return;
    setModalType(type);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setRutinaForm({
      name: '',
      description: '',
      difficulty: 'beginner',
      duration: '',
      exercises: []
    });
    setClaseForm({
      name: '',
      description: '',
      instructor: '',
      date: '',
      time: '',
      duration: '',
      capacity: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      handleCloseModal();
    } finally {
      setIsCreating(false);
    }
  };

  const mockRutinas = [
    {
      id: 1,
      name: 'Rutina de Fuerza Básica',
      description: 'Rutina enfocada en ejercicios básicos de fuerza',
      difficulty: 'beginner',
      duration: '45 min',
      exercises: 8
    },
    {
      id: 2,
      name: 'HIIT Avanzado',
      description: 'Entrenamiento de alta intensidad',
      difficulty: 'advanced',
      duration: '30 min',
      exercises: 12
    }
  ];

  const mockClases = [
    {
      id: 1,
      name: 'Yoga Matutino',
      instructor: 'María González',
      date: '2024-01-15',
      time: '08:00',
      duration: '60 min',
      capacity: 20,
      enrolled: 15
    },
    {
      id: 2,
      name: 'CrossFit Intensivo',
      instructor: 'Carlos Ruiz',
      date: '2024-01-15',
      time: '18:00',
      duration: '45 min',
      capacity: 15,
      enrolled: 12
    }
  ];

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyText = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'Principiante';
      case 'intermediate': return 'Intermedio';
      case 'advanced': return 'Avanzado';
      default: return 'Sin definir';
    }
  };

  return (
    <div className="flex-1 p-8 bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Planificaciones</h1>
          <p className="text-gray-600">Gestiona rutinas de ejercicios y clases programadas</p>
        </div>
      </div>

      {!canManagePlanificaciones && (
        <div className="mb-8 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
          <p className="font-medium">Estas viendo las rutinas y clases disponibles.</p>
          <p className="text-xs text-blue-700">Contacta a tu entrenador si necesitas realizar ajustes en tu plan.</p>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('rutinas')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'rutinas'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Dumbbell className="w-5 h-5" />
                <span>Rutinas</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('clases')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'clases'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Clases</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'rutinas' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Rutinas de Ejercicios</h3>
                {canManagePlanificaciones && (
                  <button
                    onClick={() => handleOpenModal('rutina')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Nueva Rutina</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockRutinas.map((rutina) => (
                  <div key={rutina.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Dumbbell className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{rutina.name}</h4>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(rutina.difficulty)}`}>
                            {getDifficultyText(rutina.difficulty)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{rutina.description}</p>
                    <div className="flex justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{rutina.duration}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Target className="w-4 h-4" />
                        <span>{rutina.exercises} ejercicios</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'clases' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Clases Programadas</h3>
                {canManagePlanificaciones && (
                  <button
                    onClick={() => handleOpenModal('clase')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Nueva Clase</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {mockClases.map((clase) => (
                  <div key={clase.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{clase.name}</h4>
                          <p className="text-sm text-gray-500">Instructor: {clase.instructor}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(clase.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>{clase.time} - {clase.duration}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4" />
                        <span>{clase.enrolled}/{clase.capacity} inscritos</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(clase.enrolled / clase.capacity) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {canManagePlanificaciones && showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  {modalType === 'rutina' ? 'Nueva Rutina' : 'Nueva Clase'}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {modalType === 'rutina' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre de la Rutina
                    </label>
                    <div className="relative">
                      <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={rutinaForm.name}
                        onChange={(e) => setRutinaForm({ ...rutinaForm, name: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nombre de la rutina"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción
                    </label>
                    <textarea
                      value={rutinaForm.description}
                      onChange={(e) => setRutinaForm({ ...rutinaForm, description: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="3"
                      placeholder="Descripción de la rutina"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dificultad
                    </label>
                    <div className="relative">
                      <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <select
                        value={rutinaForm.difficulty}
                        onChange={(e) => setRutinaForm({ ...rutinaForm, difficulty: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="beginner">Principiante</option>
                        <option value="intermediate">Intermedio</option>
                        <option value="advanced">Avanzado</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duración (minutos)
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        value={rutinaForm.duration}
                        onChange={(e) => setRutinaForm({ ...rutinaForm, duration: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="45"
                        required
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre de la Clase
                    </label>
                    <div className="relative">
                      <Activity className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={claseForm.name}
                        onChange={(e) => setClaseForm({ ...claseForm, name: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nombre de la clase"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Instructor
                    </label>
                    <input
                      type="text"
                      value={claseForm.instructor}
                      onChange={(e) => setClaseForm({ ...claseForm, instructor: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nombre del instructor"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha
                      </label>
                      <input
                        type="date"
                        value={claseForm.date}
                        onChange={(e) => setClaseForm({ ...claseForm, date: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hora
                      </label>
                      <input
                        type="time"
                        value={claseForm.time}
                        onChange={(e) => setClaseForm({ ...claseForm, time: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Duración (min)
                      </label>
                      <input
                        type="number"
                        value={claseForm.duration}
                        onChange={(e) => setClaseForm({ ...claseForm, duration: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="60"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Capacidad
                      </label>
                      <input
                        type="number"
                        value={claseForm.capacity}
                        onChange={(e) => setClaseForm({ ...claseForm, capacity: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="20"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
                >
                  {isCreating ? 'Creando...' : `Crear ${modalType === 'rutina' ? 'Rutina' : 'Clase'}`}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-200"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Planificaciones;
