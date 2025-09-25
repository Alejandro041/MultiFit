import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Spinner } from 'react-bootstrap';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({});

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setMetrics({
        totalMembers: 1247,
        monthlyRevenue: 28500,
        activeTrainers: 12,
        equipmentCount: 156
      });
      setLoading(false);
    }, 1500);
  }, []);

  if (loading) {
    return (
      <Container className="page-container">
        <div className="loading-container">
          <Spinner animation="border" variant="primary" />
          <p className="loading-text">Cargando dashboard...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="page-container fade-in">
      <h1 className="page-title">Dashboard</h1>
      
      <Alert variant="info" className="mb-4">
        <strong>¡Bienvenido a MultiFit!</strong> Aquí tienes un resumen de tu gimnasio.
      </Alert>

      <Row className="g-4 mb-4">
        <Col lg={3} md={6}>
          <Card className="metric-card">
            <Card.Body>
              <span className="metric-number">{metrics.totalMembers}</span>
              <span className="metric-label">Total Miembros</span>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={3} md={6}>
          <Card className="metric-card success">
            <Card.Body>
              <span className="metric-number">${metrics.monthlyRevenue}</span>
              <span className="metric-label">Ingresos Mensuales</span>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={3} md={6}>
          <Card className="metric-card warning">
            <Card.Body>
              <span className="metric-number">{metrics.activeTrainers}</span>
              <span className="metric-label">Entrenadores Activos</span>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={3} md={6}>
          <Card className="metric-card info">
            <Card.Body>
              <span className="metric-number">{metrics.equipmentCount}</span>
              <span className="metric-label">Equipos Disponibles</span>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        <Col lg={8}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Actividad Reciente</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex align-items-center justify-content-center" style={{height: '200px'}}>
                <p className="text-muted mb-0">Gráfico de actividad próximamente...</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Notificaciones</h5>
            </Card.Header>
            <Card.Body>
              <Alert variant="warning" className="mb-2">
                <small>3 membresías vencen esta semana</small>
              </Alert>
              <Alert variant="success" className="mb-2">
                <small>12 nuevos miembros este mes</small>
              </Alert>
              <Alert variant="info" className="mb-0">
                <small>Mantenimiento programado: Sábado 15:00</small>
              </Alert>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;