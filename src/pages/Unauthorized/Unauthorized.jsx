import React from "react";
import { Link } from "react-router-dom";
import { Card, Button, Container } from "react-bootstrap";

function Unauthorized() {
  return (
    <Container className="mt-5 d-flex justify-content-center">
      <Card className="border-danger shadow-sm w-100" style={{ maxWidth: "550px" }}>
        <Card.Header className="bg-danger text-white py-3">
          <Card.Title className="fw-bold mb-0 text-uppercase small">
            Acceso no autorizado
          </Card.Title>
        </Card.Header>
        <Card.Body className="p-4 text-center">
          <div className="mb-3 text-danger fs-1">⚠️</div>
          <Card.Text className="text-secondary fs-5 mb-4">
            No tienes permisos para acceder a esta sección académica o administrativa.
          </Card.Text>
          <Link to="/login">
            <Button variant="danger" className="fw-bold px-4 text-white">
              Volver al login
            </Button>
          </Link>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Unauthorized;