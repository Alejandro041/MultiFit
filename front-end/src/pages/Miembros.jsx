import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, InputGroup, Badge, Modal } from 'react-bootstrap';

const Miembros = () => {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [miembros, setMiembros] = useState([]);

  useEffect(() => {
    setTimeout(() => {
      setMiembros([
        {
          id: 1,
          nombre: 'Ana García',
          email: 'ana.garcia@email.com',
          telefono: '+1234567890',
          plan: 'Premium',
          estado: 'Activo',
          fechaInicio: '2024-01-15',
          fechaVencimiento: '2024-04-15'
        },
        {
          id: 2,
          nombre: 'Carlos Rodríguez',
          email: 'carlos.rodriguez@email.com',
          telefono: '+1234567891',
          plan: 'Básico',
          estado: 'Activo',
          fechaInicio: '2024-02-01',
          fechaVencimiento: '2024-05-01'
        },
        {
          id: 3,
          nombre: 'María López',
          email: 'maria.lopez@email.com',
          telefono: '+1234567892',
          plan: 'Premium',
          estado: 'Vencido',
          fechaInicio: '2023-12-01',
          fechaVencimiento: '2024-01-25'
        },
        {
          id: 4,
          nombre: 'Pedro Martín',
          email: 'pedro.martin@email.com',
          telefono: '+1234567893',
          plan: 'VIP',
          estado: 'Activo',
          fechaInicio: '2024-01-20',
          fechaVencimiento: '2024-07-20'
        },
        {
          id: 5,
          nombre: 'Laura Sánchez',
          email: 'laura.sanchez@email.com',
          telefono: '+1234567894',
          plan: 'Básico',
          estado: 'Suspendido',
          fechaInicio: '2024-01-10',
          fechaVencimiento: '2024-04-10'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredMiembros = miembros.filter(miembro =>
    miembro.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    miembro.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEstadoBadge = (estado) => {
    switch (estado) {
      case 'Activo':
        return <Badge bg="success">{estado}</Badge>;
      case 'Vencido':
        return <Badge bg="danger">{estado}</Badge>;
      case 'Suspendido':
        return <Badge bg="warning">{estado}</Badge>;
      default:
        return <Badge bg="secondary">{estado}</Badge>;
    }
  };

  const getPlanBadge = (plan) => {
    switch (plan) {
      case 'VIP':
        return <Badge bg="dark">{plan}</Badge>;
      case 'Premium':
        return <Badge bg="primary">{plan}</Badge>;
      case 'Básico':
        return <Badge bg="info">{plan}</Badge>;
      default:
        return <Badge bg="secondary">{plan}</Badge>;
    }
  };

  if (loading) {
    return (
      <Container className="page-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Cargando miembros...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="page-container fade-in">
      <Row className="align-items-center mb-4">
        <Col>
          <h1 className="page-title">Gestión de Miembros</h1>
        </Col>
        <Col xs="auto">
          <Button variant="primary" onClick={() => setShowModal(true)}>
            Nuevo Miembro
          </Button>
        </Col>
      </Row>

      <Row className="g-4 mb-4">
        <Col lg={3} md={6}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-primary">{miembros.length}</h3>
              <p className="mb-0 text-muted">Total Miembros</p>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-success">{miembros.filter(m => m.estado === 'Activo').length}</h3>
              <p className="mb-0 text-muted">Miembros Activos</p>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-danger">{miembros.filter(m => m.estado === 'Vencido').length}</h3>
              <p className="mb-0 text-muted">Membresías Vencidas</p>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-warning">{miembros.filter(m => m.estado === 'Suspendido').length}</h3>
              <p className="mb-0 text-muted">Suspendidos</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Lista de Miembros</h5>
          <InputGroup style={{ width: '300px' }}>
            <Form.Control
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Card.Header>
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Plan</th>
                <th>Estado</th>
                <th>Vencimiento</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredMiembros.map((miembro) => (
                <tr key={miembro.id}>
                  <td>#{miembro.id}</td>
                  <td>{miembro.nombre}</td>
                  <td>{miembro.email}</td>
                  <td>{miembro.telefono}</td>
                  <td>{getPlanBadge(miembro.plan)}</td>
                  <td>{getEstadoBadge(miembro.estado)}</td>
                  <td>{miembro.fechaVencimiento}</td>
                  <td>
                    <Button size="sm" variant="outline-primary" className="me-1">
                      Ver
                    </Button>
                    <Button size="sm" variant="outline-warning" className="me-1">
                      Editar
                    </Button>
                    <Button size="sm" variant="outline-success">
                      Renovar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Modal para nuevo miembro */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Registrar Nuevo Miembro</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre Completo</Form.Label>
                  <Form.Control type="text" placeholder="Ingrese el nombre completo" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" placeholder="correo@ejemplo.com" />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Teléfono</Form.Label>
                  <Form.Control type="tel" placeholder="+1234567890" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Plan de Membresía</Form.Label>
                  <Form.Select>
                    <option>Seleccione un plan</option>
                    <option value="Básico">Básico</option>
                    <option value="Premium">Premium</option>
                    <option value="VIP">VIP</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Fecha de Inicio</Form.Label>
                  <Form.Control type="date" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Duración (meses)</Form.Label>
                  <Form.Select>
                    <option value="1">1 mes</option>
                    <option value="3">3 meses</option>
                    <option value="6">6 meses</option>
                    <option value="12">12 meses</option>
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
            Registrar Miembro
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Miembros;