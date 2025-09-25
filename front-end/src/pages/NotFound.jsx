import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <Container className="page-container">
      <div className="not-found fade-in">
        <h1>404</h1>
        <h2>Página no encontrada</h2>
        <p className="text-muted mb-4">
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </p>
        <Link to="/dashboard">
          <Button variant="primary" size="lg">
            Volver al Dashboard
          </Button>
        </Link>
      </div>
    </Container>
  );
};

export default NotFound;