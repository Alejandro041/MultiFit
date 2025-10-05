import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer mt-auto">
      <Container>
        <Row className="align-items-center">
          <Col md={6}>
            <p className="mb-0">
              &copy; {currentYear} MultiFit. Todos los derechos reservados.
            </p>
          </Col>
          <Col md={6} className="text-md-end">
            <p className="mb-0">
              Sistema de Gestión de Gimnasios
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
