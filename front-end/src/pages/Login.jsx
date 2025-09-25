import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { Eye, EyeOff, Building2, Lock, Mail, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!loginData.email || !loginData.password) {
      setError('Por favor, ingresa tu correo y contraseña.');
      setLoading(false);
      return;
    }

    try {
      console.log('Iniciando proceso de login...');

      const authResponse = await axios.post('/api/login', {
        email: loginData.email,
        password: loginData.password
      });

      console.log('Respuesta del servidor:', authResponse.data);

      const { success, user, organization_id, gyms, access_token } = authResponse.data;

      if (success && user) {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('access_token', access_token);
        
        if (organization_id) {
          localStorage.setItem('organization_id', organization_id);
        }
        
        if (gyms && gyms.length > 0) {
          localStorage.setItem('gyms', JSON.stringify(gyms));
          localStorage.setItem('current_gym_id', gyms[0].id);
          localStorage.setItem('current_gym_name', gyms[0].name);
        } else {
          localStorage.setItem('gyms', JSON.stringify([]));
        }

        console.log('Login exitoso, redirigiendo...');
        navigate('/dashboard');

      } else {
        setError('Respuesta inválida del servidor.');
      }
      
    } catch (err) {
      console.error("Error completo en el inicio de sesión:", err);
      
      if (err.response) {
        const status = err.response.status;
        const errorMessage = err.response.data?.error || err.response.data?.message;
        
        switch (status) {
          case 400:
            setError(errorMessage || 'Datos de entrada inválidos.');
            break;
          case 401:
            setError(errorMessage || 'Credenciales inválidas. Por favor, verifica tu email y contraseña.');
            break;
          case 404:
            setError(errorMessage || 'Usuario no encontrado en el sistema.');
            break;
          case 500:
            setError('Error interno del servidor. Por favor, contacta al administrador.');
            break;
          default:
            setError(errorMessage || `Error del servidor (${status}).`);
        }
      } else if (err.request) {
        setError('No se pudo conectar al servidor. Verifica que el servidor esté ejecutándose.');
        console.error('Detalles de conexión:', err.request);
      } else {
        setError('Error de configuración. Por favor, recarga la página.');
      }
    } finally {
      setLoading(false);
    }
  };

  const testServerConnection = async () => {
    try {
      const response = await axios.get('/api/health');
      console.log('Estado del servidor:', response.data);
      alert(`Servidor: ${response.data.status}\nSupabase: ${response.data.supabase}`);
    } catch (err) {
      console.error('Error al conectar con el servidor:', err);
      alert('No se puede conectar al servidor. Verifica que esté ejecutándose en el puerto 3001.');
    }
  };

  return (
    <div className="login-container">
      <Container fluid className="h-100">
        <Row className="h-100 g-0">
          <Col lg={6} className="login-brand-panel d-none d-lg-flex">
            <div className="brand-content">
              <div className="brand-logo">
                <Building2 size={80} className="mb-4" />
                <h1 className="brand-title">MultiFit</h1>
                <p className="brand-subtitle">Sistema de Gestión de Gimnasios</p>
              </div>
              <div className="brand-features">
                <div className="feature-item">
                  <div className="feature-icon">
                    <Building2 size={24} />
                  </div>
                  <div className="feature-text">
                    <h6>Gestión Multisucursal</h6>
                    <p>Administra múltiples gimnasios desde una sola plataforma</p>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">
                    <Lock size={24} />
                  </div>
                  <div className="feature-text">
                    <h6>Seguridad Avanzada</h6>
                    <p>Protección de datos con los más altos estándares</p>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <Button variant="outline-light" size="sm" onClick={testServerConnection}>
                  <AlertCircle size={16} className="me-2" />
                  Verificar conexión
                </Button>
              </div>
            </div>
          </Col>
          <Col lg={6} className="login-form-panel">
            <div className="login-form-container">
              <div className="text-center mb-5">
                <div className="d-lg-none mb-4">
                  <Building2 size={60} className="text-multifit-primary" />
                </div>
                <h2 className="login-title">Iniciar Sesión</h2>
                <p className="login-subtitle text-muted">
                  Accede a tu panel de administración
                </p>
              </div>
              {error && (
                <Alert variant="danger" className="mb-4 d-flex align-items-center">
                  <AlertCircle size={20} className="me-2" />
                  <span>{error}</span>
                </Alert>
              )}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-4">
                  <Form.Label className="form-label-custom">
                    <Mail size={18} className="me-2" />
                    Correo Electrónico
                  </Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={loginData.email}
                    onChange={handleInputChange}
                    placeholder="ejemplo@multifit.com"
                    className="form-control-custom"
                    disabled={loading}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label className="form-label-custom">
                    <Lock size={18} className="me-2" />
                    Contraseña
                  </Form.Label>
                  <div className="password-input-container">
                    <Form.Control
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={loginData.password}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      className="form-control-custom"
                      disabled={loading}
                      required
                    />
                    <Button
                      variant="link"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                      type="button"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </Button>
                  </div>
                </Form.Group>
                <Button
                  type="submit"
                  className="login-button w-100"
                  disabled={loading}
                  variant="primary"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <div className="spinner-border spinner-border-sm me-2" role="status">
                        <span className="visually-hidden">Cargando...</span>
                      </div>
                      Iniciando sesión...
                    </>
                  ) : (
                    'Iniciar Sesión'
                  )}
                </Button>
              </Form>
              <div className="text-center mt-4">
                <p className="text-muted">
                  ¿Problemas técnicos?{' '}
                  <Button variant="link" className="support-link" onClick={testServerConnection}>
                    Verificar conexión
                  </Button>
                </p>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;