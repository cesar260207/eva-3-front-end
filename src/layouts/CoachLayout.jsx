import { Outlet } from "react-router-dom"
import { Navbar, Container, Nav } from "react-bootstrap"
import { getUser } from "../services/authService"

function CoachLayout() {
  const user = getUser()

  return (
    <>
      <Navbar bg="success" variant="dark" expand="lg" className="shadow-sm">
        <Container>
          <Navbar.Brand className="fw-bold">SportClub Coach</Navbar.Brand>
          <Navbar.Toggle aria-controls="coach-navbar" />
          <Navbar.Collapse id="coach-navbar" className="justify-content-end">
            <Nav className="align-items-center bg-transparent">
              <span className="navbar-text text-light opacity-75 small">
                Instructor: <strong>{user?.name}</strong>
              </span>
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
export default CoachLayout