import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Tab, Tabs } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Perfil = () => {
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('personal');
    const [showSuccess, setShowSuccess] = useState(false);
    const [perfil, setPerfil] = useState({});
    
    // 1. Hook para la navegación
    const navigate = useNavigate();

    useEffect(() => {
        setTimeout(() => {
            setPerfil({
                nombre: 'Carlos Administrador',
                email: 'admin@multifit.com',
                telefono: '+1234567890',
                cargo: 'Administrador General',
                gimnasio: 'MultiFit Central',
                fechaIngreso: '2023-06-15',
                direccion: 'Av. Principal 123, Ciudad',
                configuraciones: {
                    notificacionesEmail: true,
                    notificacionesSMS: false,
                    reportesAutomaticos: true,
                    idioma: 'es'
                }
            });
            setLoading(false);
        }, 800);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    // 2. Función para cerrar sesión
    const handleLogout = () => {
        // Elimina todos los elementos de la sesión del localStorage
        localStorage.removeItem('user');
        localStorage.removeItem('access_token');
        localStorage.removeItem('organization_id');
        localStorage.removeItem('gyms');
        localStorage.removeItem('current_gym_id');
        localStorage.removeItem('current_gym_name');

        // Redirige al usuario a la página de login
        navigate('/login');
    };

    if (loading) {
        return (
            <Container className="page-container">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p className="loading-text">Cargando perfil...</p>
                </div>
            </Container>
        );
    }

    return (
        <Container className="page-container fade-in">
            <h1 className="page-title">Mi Perfil</h1>

            {showSuccess && (
                <Alert variant="success" className="mb-4">
                    <strong>¡Perfecto!</strong> Tu perfil ha sido actualizado correctamente.
                </Alert>
            )}

            <Row>
                <Col lg={4} className="mb-4">
                    <Card>
                        <Card.Body className="text-center">
                            <div className="mb-3">
                                <div
                                    style={{
                                        width: '120px',
                                        height: '120px',
                                        borderRadius: '50%',
                                        backgroundColor: 'var(--multifit-primary)',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '3rem',
                                        fontWeight: 'bold',
                                        margin: '0 auto'
                                    }}
                                >
                                    {perfil.nombre?.charAt(0)}
                                </div>
                            </div>
                            <h4>{perfil.nombre}</h4>
                            <p className="text-muted mb-2">{perfil.cargo}</p>
                            <p className="text-muted">{perfil.gimnasio}</p>
                            <Button variant="outline-primary" size="sm">
                                Cambiar Foto
                            </Button>
                        </Card.Body>
                    </Card>

                    <Card className="mt-4">
                        <Card.Header>
                            <h6 className="mb-0">Información Rápida</h6>
                        </Card.Header>
                        <Card.Body>
                            <div className="mb-3">
                                <small className="text-muted">Fecha de Ingreso</small>
                                <p className="mb-0">{perfil.fechaIngreso}</p>
                            </div>
                            <div className="mb-3">
                                <small className="text-muted">Email</small>
                                <p className="mb-0">{perfil.email}</p>
                            </div>
                            <div>
                                <small className="text-muted">Teléfono</small>
                                <p className="mb-0">{perfil.telefono}</p>
                            </div>
                        </Card.Body>
                    </Card>

                    {/* 3. Botón para cerrar sesión */}
                    <div className="d-grid gap-2 mt-4">
                        <Button
                            variant="danger"
                            onClick={handleLogout}
                        >
                            Cerrar Sesión
                        </Button>
                    </div>
                </Col>

                <Col lg={8}>
                    <Card>
                        <Card.Body>
                            <Tabs
                                activeKey={activeTab}
                                onSelect={(k) => setActiveTab(k)}
                                className="mb-4"
                            >
                                <Tab eventKey="personal" title="Información Personal">
                                    <Form onSubmit={handleSubmit}>
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Nombre Completo</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        defaultValue={perfil.nombre}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Email</Form.Label>
                                                    <Form.Control
                                                        type="email"
                                                        defaultValue={perfil.email}
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Teléfono</Form.Label>
                                                    <Form.Control
                                                        type="tel"
                                                        defaultValue={perfil.telefono}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Cargo</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        defaultValue={perfil.cargo}
                                                        disabled
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Form.Group className="mb-3">
                                            <Form.Label>Dirección</Form.Label>
                                            <Form.Control
                                                type="text"
                                                defaultValue={perfil.direccion}
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-4">
                                            <Form.Label>Gimnasio Asignado</Form.Label>
                                            <Form.Control
                                                type="text"
                                                defaultValue={perfil.gimnasio}
                                                disabled
                                            />
                                        </Form.Group>

                                        <Button variant="primary" type="submit">
                                            Actualizar Información
                                        </Button>
                                    </Form>
                                </Tab>

                                <Tab eventKey="seguridad" title="Seguridad">
                                    <Form>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Contraseña Actual</Form.Label>
                                            <Form.Control type="password" />
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label>Nueva Contraseña</Form.Label>
                                            <Form.Control type="password" />
                                        </Form.Group>

                                        <Form.Group className="mb-4">
                                            <Form.Label>Confirmar Nueva Contraseña</Form.Label>
                                            <Form.Control type="password" />
                                        </Form.Group>

                                        <Alert variant="info">
                                            <small>
                                                <strong>Consejo:</strong> Usa una contraseña de al menos 8 caracteres con letras, números y símbolos.
                                            </small>
                                        </Alert>

                                        <Button variant="warning">
                                            Cambiar Contraseña
                                        </Button>
                                    </Form>
                                </Tab>

                                <Tab eventKey="configuraciones" title="Configuraciones">
                                    <Form>
                                        <h6 className="mb-3">Notificaciones</h6>
                                        <Form.Group className="mb-3">
                                            <Form.Check
                                                type="switch"
                                                label="Recibir notificaciones por email"
                                                defaultChecked={perfil.configuraciones?.notificacionesEmail}
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Check
                                                type="switch"
                                                label="Recibir notificaciones por SMS"
                                                defaultChecked={perfil.configuraciones?.notificacionesSMS}
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-4">
                                            <Form.Check
                                                type="switch"
                                                label="Reportes automáticos semanales"
                                                defaultChecked={perfil.configuraciones?.reportesAutomaticos}
                                            />
                                        </Form.Group>

                                        <h6 className="mb-3">Preferencias</h6>
                                        <Form.Group className="mb-4">
                                            <Form.Label>Idioma</Form.Label>
                                            <Form.Select defaultValue={perfil.configuraciones?.idioma}>
                                                <option value="es">Español</option>
                                                <option value="en">English</option>
                                                <option value="pt">Português</option>
                                            </Form.Select>
                                        </Form.Group>

                                        <Button variant="primary">
                                            Guardar Configuraciones
                                        </Button>
                                    </Form>
                                </Tab>
                            </Tabs>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Perfil;
