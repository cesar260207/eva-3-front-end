import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Alert, Button, Card, Container, Form, Spinner } from "react-bootstrap"
import { loginUser, saveSession, getUser } from "../services/authService"

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  // --- ESTO ES LO QUE AGREGAMOS ---
  useEffect(() => {
    const userSession = getUser();
    if (userSession) {
      if (userSession.role === "admin") navigate("/admin/dashboard", { replace: true });
      else if (userSession.role === "coach") navigate("/coach/dashboard", { replace: true });
      else navigate("/user/dashboard", { replace: true });
    }
  }, [navigate]);
  // --------------------------------

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await loginUser({ email, password })
      saveSession(response.token)

      const userSession = getUser() || response.user;

      if (userSession?.role === "admin") {
        navigate("/admin/dashboard", { replace: true })
      } else if (userSession?.role === "coach") {
        navigate("/coach/dashboard", { replace: true })
      } else {
        navigate("/user/dashboard", { replace: true })
      }
    } catch (error) {
      setError(error.message || "Error al iniciar sesión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Card style={{ width: "24rem" }} className="shadow border-0 p-2">
        <Card.Body>
          <Card.Title className="text-center mb-4 fw-bold text-primary">SportClub Login</Card.Title>
          
          {error && <Alert variant="danger" className="py-2 text-center small">{error}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small text-secondary">Correo</Form.Label>
              <Form.Control
                type="email"
                placeholder="Ingrese su correo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small text-secondary">Contraseña</Form.Label>
              <Form.Control
                type="password"
                placeholder="Ingrese su contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Button type="submit" variant="primary" className="w-100 fw-bold mt-2" disabled={loading}>
              {loading ? (
                <>
                  <Spinner size="sm" animation="border" className="me-2" /> Ingresando...
                </>
              ) : (
                "Ingresar"
              )}
            </Button>

            <div className="text-center mt-3">
              <span className="text-muted small">¿No tienes cuenta? </span>
              <Link to="/register" className="small fw-bold text-decoration-none">Regístrate</Link>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  )
}

export default Login