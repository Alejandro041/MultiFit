import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Navbar, Nav, Container, Form } from 'react-bootstrap';

const Header = () => {
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [availableGyms, setAvailableGyms] = useState([]);
  const [userRole, setUserRole] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Configuración de la API - Usando proxy de Vite (ruta relativa)
  const API_BASE_URL = ''; // Ruta relativa a través del proxy

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('🔍 [Header] Cargando datos...');
        
        const userString = localStorage.getItem('user');
        const gymsString = localStorage.getItem('gyms');
        const currentGymId = localStorage.getItem('current_gym_id');

        let role = '';
        let gyms = [];

        // Procesar usuario
        if (userString) {
          const user = JSON.parse(userString);
          role = user.rol || '';
          setUserRole(role);
          console.log('🎭 Rol detectado:', role);
        }

        // Procesar gyms del localStorage
        if (gymsString) {
          gyms = JSON.parse(gymsString);
          console.log('🏢 Gyms del localStorage:', gyms);
        }

        // SI ES SUPERADMIN Y NO HAY GYMS, OBTENER TODOS LOS GYMS DE LA BD
        if (role === 'superadmin' && (!gyms || gyms.length === 0)) {
          console.log('🔄 SuperAdmin sin gyms, obteniendo todos los gyms de la BD...');
          try {
            const allGyms = await fetchAllGyms();
            if (allGyms && allGyms.length > 0) {
              gyms = allGyms;
              setAvailableGyms(allGyms);
              
              // Guardar en localStorage para futuras cargas
              localStorage.setItem('gyms', JSON.stringify(allGyms));
              console.log('✅ Gyms obtenidos de la BD:', allGyms.length);
            } else {
              console.log('⚠️ No se pudieron obtener gyms de la BD');
              setAvailableGyms([]);
            }
          } catch (error) {
            console.error('❌ Error obteniendo gyms de la BD:', error);
            setAvailableGyms([]);
          }
        } else {
          setAvailableGyms(gyms || []);
        }

        // Establecer gym seleccionado
        if (gyms && gyms.length > 0) {
          if (currentGymId && gyms.find(gym => gym.id === currentGymId)) {
            setSelectedBranchId(currentGymId);
          } else {
            setSelectedBranchId(gyms[0].id);
            localStorage.setItem('current_gym_id', gyms[0].id);
            localStorage.setItem('current_gym_name', gyms[0].name);
          }
        } else {
          setSelectedBranchId('');
        }

      } catch (error) {
        console.error('❌ Error cargando datos:', error);
        setAvailableGyms([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Función para obtener todos los gyms de la base de datos
  const fetchAllGyms = async () => {
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        console.error('❌ No hay token disponible');
        return [];
      }

      console.log('🔐 Token usado:', token.substring(0, 20) + '...');
      
      // Usando ruta relativa a través del proxy de Vite
      const response = await fetch(`/api/gyms`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📊 Data recibida:', data);
      
      // Retornar el array de gyms
      return data.gyms || data || [];
    } catch (error) {
      console.error('❌ Error fetching gyms:', error.message);
      return [];
    }
  };

  const handleBranchChange = (e) => {
    const newGymId = e.target.value;
    setSelectedBranchId(newGymId);
    
    const selectedGym = availableGyms.find(gym => gym.id === newGymId);
    if (selectedGym) {
      localStorage.setItem('current_gym_id', selectedGym.id);
      localStorage.setItem('current_gym_name', selectedGym.name);
      
      // Recargar la página para aplicar los cambios
      window.location.reload();
    }
  };

  if (isLoading) {
    return (
      <Navbar bg="white" className="shadow-sm border-bottom" style={{ height: '70px' }}>
        <Container fluid>
          <Navbar.Brand href="/" className="navbar-brand me-4">
            MultiFit
          </Navbar.Brand>
          <Nav className="ms-auto">
            <span className="text-muted">Cargando sucursales...</span>
          </Nav>
        </Container>
      </Navbar>
    );
  }

  const showBranchSelector = userRole === 'superadmin' && availableGyms.length > 0;

  console.log('🎨 Renderizando Header:', {
    userRole,
    availableGymsCount: availableGyms.length,
    showBranchSelector,
    selectedBranchId
  });

  return (
    <Navbar bg="white" className="shadow-sm border-bottom" style={{ height: '70px' }}>
      <Container fluid>
        <Navbar.Brand href="/" className="navbar-brand me-4">
          MultiFit
        </Navbar.Brand>
        
        {showBranchSelector ? (
          <div className="ms-auto">
            <Form.Select
              value={selectedBranchId}
              onChange={handleBranchChange}
              style={{ width: '250px' }}
              className="branch-selector"
            >
              <option value="">Seleccionar Sucursal</option>
              {availableGyms.map((gym) => (
                <option key={gym.id} value={gym.id}>
                  {gym.name} {gym.city ? `- ${gym.city}` : ''}
                </option>
              ))}
            </Form.Select>
          </div>
        ) : (
          <Nav className="ms-auto">
            <Nav.Item className="d-flex align-items-center">
              <span className="text-muted fw-medium">
                {availableGyms.length > 0 && selectedBranchId
                  ? availableGyms.find(gym => gym.id === selectedBranchId)?.name || availableGyms[0]?.name
                  : 'Sin sucursales disponibles'
                }
              </span>
            </Nav.Item>
          </Nav>
        )}
      </Container>
    </Navbar>
  );
};

export default Header;
