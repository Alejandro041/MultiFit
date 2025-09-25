import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Alert, Form, Modal } from 'react-bootstrap';

const Gimnasio = () => {
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [equipos, setEquipos] = useState([]);

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setEquipos([
        { id: 1, nombre: 'Cinta de Correr Pro', categoria: 'Cardio', estado: 'Activo', ultimoMantenimiento: '2024-01-15' },
        { id: 2, nombre: 'Prensa de Piernas', categoria: 'Fuerza', estado: 'Mantenimiento', ultimoMantenimiento: '2024-01-10' },
        { id: 3, nombre: 'Elíptica Digital', categoria: 'Cardio', estado: 'Activo', ultimoMantenimiento: '2024-01-20' },
        { id: 4, nombre: 'Banco Ajustable', categoria: 'Fuerza', estado: 'Activo', ultimoMantenimiento: '2024-01-18' },
        { id: 5, nombre: 'Bicicleta Estática', categoria: 'Cardio', estado: 'Fuera de Servicio', ultimoMantenimiento: '2024-01-05' }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getEstadoBadge = (estado) => {
    switch (estado) {
      case 'Activo':
        return <span className="badge bg-success">{estado}</span>;
      case 'Mantenimiento':
        return <span className="badge bg-warning">{estado}</span>;
      case 'Fuera de Servicio':
        return <span className="badge bg-danger">{estado}</span>;
      default:
        return <span className="badge bg-secondary">{estado}</span>;
    }
  };

  if (loading) {
    return (
      <Container className="page-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Cargando información del gimnasio...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="page-container fade-in">
      <Row className="align-items-center mb-4">
        <Col>
          <h1 className="page-title">Gestión de Gimnasio</h1>
        </Col>
        <Col xs="auto">
          <Button variant="primary" onClick={() => setShowModal(true)}>
            Agregar Equipo
          </Button>
        </Col>
      </Row>

      <Row className="g-4 mb-4">
        <Col lg={4}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-success">{equipos.filter(e => e.estado === 'Activo').length}</h3>
              <p className="mb-0 text-muted">Equipos Activos</p>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-warning">{equipos.filter(e => e.estado === 'Mantenimiento').length}</h3>
              <p className="mb-0 text-muted">En Mantenimiento</p>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-danger">{equipos.filter(e => e.estado === 'Fuera de Servicio').length}</h3>
              <p className="mb-0 text-muted">Fuera de Servicio</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card>
        <Card.Header>
          <h5 className="mb-0">Equipamiento del Gimnasio</h5>
        </Card.Header>
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Estado</th>
                <th>Último Mantenimiento</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {equipos.map((equipo) => (
                <tr key={equipo.id}>
                  <td>#{equipo.id}</td>
                  <td>{equipo.nombre}</td>
                  <td>{equipo.categoria}</td>
                  <td>{getEstadoBadge(equipo.estado)}</td>
                  <td>{equipo.ultimoMantenimiento}</td>
                  <td>
                    <Button size="sm" variant="outline-primary" className="me-2">
                      Editar
                    </Button>
                    <Button size="sm" variant="outline-warning">
                      Mantenimiento
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Modal para agregar equipo */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Agregar Nuevo Equipo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nombre del Equipo</Form.Label>
              <Form.Control type="text" placeholder="Ingrese el nombre del equipo" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Categoría</Form.Label>
              <Form.Select>
                <option>Seleccione una categoría</option>
                <option value="Cardio">Cardio</option>
                <option value="Fuerza">Fuerza</option>
                <option value="Funcional">Funcional</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Estado</Form.Label>
              <Form.Select>
                <option value="Activo">Activo</option>
                <option value="Mantenimiento">Mantenimiento</option>
                <option value="Fuera de Servicio">Fuera de Servicio</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary">
            Guardar Equipo
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Gimnasio;