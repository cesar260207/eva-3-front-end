import { Component } from "react"
import { Container, Button, Alert } from "react-bootstrap"
import { logout } from "../services/authService"

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error interceptado por el escudo de protección:", error, errorInfo)
  }

  // Limpia absolutamente todo y fuerza una recarga desde cero al login restableciendo el sistema
  handleHardReset = () => {
    try {
      // Only remove the token from localStorage; other data should remain server-backed
      logout()
      sessionStorage.clear()
    } catch (e) {
      console.error(e)
    }
    window.location.replace("/")
  }

  // Saca al usuario del bloqueo redirigiéndolo nativamente a la raíz de forma inmediata
  handleReturn = () => {
    window.location.replace("/")
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container className="d-flex justify-content-center align-items-center min-vh-100 text-center">
          <div style={{ maxWidth: "500px", width: "100%" }}>
            <Alert variant="danger" className="shadow border-0 p-4">
              <Alert.Heading className="fw-bold mb-3">Módulo en Mantenimiento Temporal</Alert.Heading>
              <p className="small text-secondary mb-4">
                El sistema detectó una acción inusual o un intento de desbordamiento de datos. 
                Para resguardar la integridad del sistema, la sesión se ha congelado de forma segura.
              </p>
              <div className="d-grid gap-2">
                <Button 
                  variant="danger" 
                  className="fw-bold" 
                  onClick={this.handleReturn}
                >
                  Volver a la Zona Segura
                </Button>
                <Button 
                  variant="outline-secondary" 
                  size="sm" 
                  onClick={this.handleHardReset}
                >
                  Restaurar Valores por Defecto (Reset)
                </Button>
              </div>
            </Alert>
          </div>
        </Container>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary