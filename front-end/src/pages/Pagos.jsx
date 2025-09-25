import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, InputGroup, Badge, Alert } from 'react-bootstrap';

const Pagos = () => {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [pagos, setPagos] = useState([]);

  useEffect(() => {
    setTimeout(() => {
      setPagos([
        {
          id: 1,
          miembro: 'Ana García',
          plan: 'Premium',
          monto: 89.99,
          metodoPago: 'Tarjeta de Crédito',
          estado: 'Completado',
          fechaPago: '2024-01-25',
          fechaVencimiento: '2024-04-15',
          referencia: 'PAY-001'
        },
        {
          id: 2,
          miembro: 'Carlos Rodríguez',
          plan: 'Básico',
          monto: 49.99,
          metodoPago: 'Efectivo',
          estado: 'Completado',
          fechaPago: '2024-01-24',
          fechaVencimiento: '2024-05-01',
          referencia: 'PAY-002'
        },
        {
          id: 3,
          miembro: 'María López',
          plan: 'Premium',
          monto: 89.99,
          metodoPago: 'Transferencia',
          estado: 'Pendiente',
          fechaPago: null,
          fechaVencimiento: '2024-01-25',
          referencia: 'PAY-003'
        },
        {
          id: 4,
          miembro: 'Pedro Martín',
          plan: 'VIP',
          monto: 149.99,
          metodoPago: 'Tarjeta de Débito',
          estado: 'Completado',
          fechaPago: '2024-01-23',
          fechaVencimiento: '2024-07-20',
          referencia: 'PAY-004'
        },
        {
          id: 5,
          miembro: 'Laura Sánchez',
          plan: 'Básico',
          monto: 49.99,
          metodoPago: 'Efectivo',
          estado: 'Vencido',
          fechaPago: null,
          fechaVencimiento: '2024-01-10',
          referencia: 'PAY-005'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredPagos = pagos.filter(pago => {
    const matchesSearch = pago.miembro.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pago.referencia.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'todos' || pago.estado.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const getEstadoBadge = (estado) => {
    switch (estado) {
      case 'Completado':
        return <Badge bg="success">{estado}</Badge>;
      case 'Pendiente':
        return <Badge bg="warning">{estado}</Badge>;
      case 'Vencido':
        return <Badge bg="danger">{estado}</Badge>;
      case 'Cancelado':
        return <Badge bg="secondary">{estado}</Badge>;
      default:
        return <Badge bg="secondary">{estado}</Badge>;
    }
  };

  const totalIngresos = pagos.filter(p => p.estado === 'Completado').reduce((sum, p) => sum + p.monto, 0);
  const pagosPendientes = pagos.filter(p => p.estado === 'Pendiente').length;
  const pagosVencidos = pagos.filter(p => p.estado === 'Vencido').length;

  if (loading) {
    return (
      <Container className="page-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Cargando información de pagos...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="page-container fade-in">
      <h1 className="page-title">Gestión de Pagos</h1>

      <Row className="g-4 mb-4">
        <Col lg={3} md={6}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-success">${totalIngresos.toFixed(2)}</h3>
              <p className="mb-0 text-muted">Ingresos Totales</p>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-primary">{pagos.filter(p => p.estado === 'Completado').length}</h3>
              <p className="mb-0 text-muted">Pagos Completados</p>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-warning">{pagosPendientes}</h3>
              <p className="mb-0 text-muted">Pagos Pendientes</p>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-danger">{pagosVencidos}</h3>
              <p className="mb-0 text-muted">Pagos Vencidos</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {pagosVencidos > 0 && (
        <Alert variant="warning" className="mb-4">
          <strong>Atención:</strong> Hay {pagosVencidos} pago(s) vencido(s) que requieren seguimiento.
        </Alert>
      )}

      <Card>
        <Card.Header>
          <Row className="align-items-center">
            <Col>
              <h5 className="mb-0">Historial de Pagos</h5>
            </Col>
            <Col xs="auto">
              <Row className="g-2">
                <Col>
                  <Form.Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    style={{ width: '150px' }}
                  >
                    <option value="todos">Todos</option>
                    <option value="completado">Completados</option>
                    <option value="pendiente">Pendientes</option>
                    <option value="vencido">Vencidos</option>
                  </Form.Select>
                </Col>
                <Col>
                  <InputGroup style={{ width: '250px' }}>
                    <Form.Control
                      placeholder="Buscar por miembro o referencia..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                </Col>
              </Row>
            </Col>
          </Row>
        </Card.Header>
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th>Referencia</th>
                <th>Miembro</th>
                <th>Plan</th>
                <th>Monto</th>
                <th>Método de Pago</th>
                <th>Estado</th>
                <th>Fecha de Pago</th>
                <th>Vencimiento</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredPagos.map((pago) => (
                <tr key={pago.id}>
                  <td><strong>{pago.referencia}</strong></td>
                  <td>{pago.miembro}</td>
                  <td>{pago.plan}</td>
                  <td><strong>${pago.monto}</strong></td>
                  <td>{pago.metodoPago}</td>
                  <td>{getEstadoBadge(pago.estado)}</td>
                  <td>{pago.fechaPago || '-'}</td>
                  <td>{pago.fechaVencimiento}</td>
                  <td>
                    <Button size="sm" variant="outline-primary" className="me-1">
                      Ver
                    </Button>
                    {pago.estado === 'Pendiente' && (
                      <Button size="sm" variant="outline-success" className="me-1">
                        Marcar Pagado
                      </Button>
                    )}
                    <Button size="sm" variant="outline-info">
                      Recibo
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Pagos;