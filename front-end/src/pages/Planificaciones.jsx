import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Modal, Form, Alert, Table } from 'react-bootstrap';

const Planificaciones = () => {
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedView, setSelectedView] = useState('semana');
  const [clases, setClases] = useState([]);
  const [entrenadores, setEntrenadores] = useState([]);

  useEffect(() => {
    setTimeout(() => {
      setEntrenadores([
        { id: 1, nombre: 'Juan Pérez', especialidad: 'CrossFit' },
        { id: 2, nombre: 'Ana Martín', especialidad: 'Yoga' },
        { id: 3, nombre: 'Carlos López', especialidad: 'Cardio' },
        { id: 4, nombre: 'María García', especialidad: 'Funcional' }
      ]);

      setClases([
        {
          id: 1,
          nombre: 'CrossFit Matutino',
          entrenador: 'Juan Pérez',
          hora: '07:00',
          duracion: 60,
          fecha: '2024-01-29',
          capacidad: 15,
          inscritos: 12,
          estado: 'Activa'
        },
        {
          id: 2,
          nombre: 'Yoga Relajante',
          entrenador: 'Ana Martín',
          hora: '09:00',
          duracion: 45,
          fecha: '2024-01-29',
          capacidad: 20,
          inscritos: 18,
          estado: 'Activa'
        },
        {
          id: 3,
          nombre: 'Cardio Intensivo',
          entrenador: 'Carlos López',
          hora: '18:00',
          duracion: 50,
          fecha: '2024-01-29',
          capacidad: 25,
          inscritos: 25,
          estado: 'Completa'
        },
        {
          id: 4,
          nombre: 'Funcional',
          entrenador: 'María García',
          hora: '19:30',
          duracion: 55,
          fecha: '2024-01-29',
          capacidad: 12,
          inscritos: 8,
          estado: 'Activa'
        },
        {
          id: 5,
          nombre: 'CrossFit Vespertino',
          entrenador: 'Juan Pérez',
          hora: '20:00',
          duracion: 60,
          fecha: '2024-01-30',
          capacidad: 15,
          inscritos: 0,
          estado: 'Cancelada'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getEstadoBadge = (estado) => {
    switch (estado) {
      case 'Activa':
        return <Badge bg="success">{estado}</Badge>;
      case 'Completa':
        return <Badge bg="primary">{estado}</Badge>;
      case 'Cancelada':
        return <Badge bg="danger">{estado}</Badge>;
      default:
        return <Badge bg="secondary">{estado}</Badge>;
    }
  };

  const getOcupacionColor = (inscritos, capacidad) => {
    const porcentaje = (inscritos / capacidad) * 100;
    if (porcentaje === 100) return 'danger';
    if (porcentaje >= 80) return 'warning';
    if (porcentaje >= 50) return 'info';
    return 'success';
  };

  if (loading) {
    return (
      <Container className="page-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Cargando planificaciones...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="page-container fade-in">
      <Row className="align-items-center mb-4">
        <Col>
          <h1 className="page-title">Planificación de Clases</h1>
        </Col>
        <Col xs="auto">
          <Button variant="primary" onClick={() => setShowModal(true)}>
            Nueva Clase
          </Button>
        </Col>
      </Row>

      <Row className="g-4 mb-4">
        <Col lg={3} md={6}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-primary">{clases.length}</h3>
              <p className="mb-0 text-muted">Clases Programadas</p>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-success">{clases.filter(c => c.estado === 'Activa').length}</h3>
              <p className="mb-0 text-muted">Clases Activas</p>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-info">{clases.filter(c => c.estado === 'Completa').length}</h3>
              <p className="mb-0 text-muted">Clases Completas</p>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-warning">{entrenadores.length}</h3>
              <p className="mb-0 text-muted">Entrenadores</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Vista de navegación */}
      <Card className="mb-4">
        <Card.Header>
          <Row className="align-items-center">
            <Col>
              <h5 className="mb-0">Vista de Clases</h5>
            </Col>
            <Col xs="auto">
              <div className="btn-group" role="group">
                <Button
                  variant={selectedView === 'semana' ? 'primary' : 'outline-primary'}
                  onClick={() => setSelectedView('semana')}
                  size="sm"
                >
                  Semana
                </Button>
                <Button
                  variant={selectedView === 'dia' ? 'primary' : 'outline-primary'}
                  onClick={() => setSelectedView('dia')}
                  size="sm"
                >
                  Día
                </Button>
                <Button
                  variant={selectedView === 'mes' ? 'primary' : 'outline-primary'}
                  onClick={() => setSelectedView('mes')}
                  size="sm"
                >
                  Mes
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Header>
      </Card>

      {clases.filter(c => c.estado === 'Cancelada').length > 0 && (
        <Alert variant="warning" className="mb-4">
          <strong>Atención:</strong> Hay {clases.filter(c => c.estado === 'Cancelada').length} clase(s) cancelada(s).
        </Alert>
      )}

      <Card>
        <Card.Header>
          <h5 className="mb-0">Lista de Clases</h5>
        </Card.Header>
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th>Clase</th>
                <th>Entrenador</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Duración</th>
                <th>Ocupación</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clases.map((clase) => (
                <tr key={clase.id}>
                  <td><strong>{clase.nombre}</strong></td>
                  <td>{clase.entrenador}</td>
                  <td>{clase.fecha}</td>
                  <td>{clase.hora}</td>
                  <td>{clase.duracion} min</td>
                  <td>
                    <div className="d-flex align-items-center">
                      <span className="me-2">{clase.inscritos}/{clase.capacidad}</span>
                      <Badge bg={getOcupacionColor(clase.inscritos, clase.capacidad)}>
                        {Math.round((clase.inscritos / clase.capacidad) * 100)}%
                      </Badge>
                    </div>
                  </td>
                  <td>{getEstadoBadge(clase.estado)}</td>
                  <td>
                    <Button size="sm" variant="outline-primary" className="me-1">
                      Ver
                    </Button>
                    <Button size="sm" variant="outline-warning" className="me-1">
                      Editar
                    </Button>
                    {clase.estado === 'Activa' && (
                      <Button size="sm" variant="outline-danger">
                        Cancelar
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Modal para nueva clase */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Programar Nueva Clase</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre de la Clase</Form.Label>
                  <Form.Control type="text" placeholder="Ej: CrossFit Matutino" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Entrenador</Form.Label>
                  <Form.Select>
                    <option>Seleccione un entrenador</option>
                    {entrenadores.map((entrenador) => (
                      <option key={entrenador.id} value={entrenador.id}>
                        {entrenador.nombre} - {entrenador.especialidad}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Fecha</Form.Label>
                  <Form.Control type="date" />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Hora</Form.Label>
                  <Form.Control type="time" />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Duración (min)</Form.Label>
                  <Form.Select>
                    <option value="30">30 minutos</option>
                    <option value="45">45 minutos</option>
                    <option value="60">60 minutos</option>
                    <option value="90">90 minutos</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Capacidad Máxima</Form.Label>
                  <Form.Control type="number" min="1" max="50" placeholder="20" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Tipo de Clase</Form.Label>
                  <Form.Select>
                    <option>Seleccione el tipo</option>
                    <option value="crossfit">CrossFit</option>
                    <option value="yoga">Yoga</option>
                    <option value="cardio">Cardio</option>
                    <option value="funcional">Funcional</option>
                    <option value="spinning">Spinning</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary">
            Programar Clase
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Planificaciones;