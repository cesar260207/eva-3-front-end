import { Outlet } from "react-router-dom"
import { Navbar, Container, Nav } from "react-bootstrap"
import { getUser } from "../services/authService"

function AdminLayout() {
  const user = getUser()

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm">
        <Container>
          <Navbar.Brand className="fw-bold">SportClub Admin</Navbar.Brand>
          <Navbar.Toggle aria-controls="admin-navbar" />
          <Navbar.Collapse id="admin-navbar" className="justify-content-end">
            <Nav className="align-items-center bg-transparent">
              <span className="navbar-text me-3 text-light opacity-75 small">
                Conectado: <strong>{user?.name}</strong>
              </span>
              {/* Botón duplicado eliminado para centralizar la acción en la franja roja */}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <main>
        <Outlet />
      </main>
    </>
  )
}

export default AdminLayout