import { Outlet } from "react-router-dom";
import { Navbar, Container, Nav, Button } from "react-bootstrap";
import Swal from "sweetalert2";
import { getUser, getHeaders, logout } from "../services/authService";

function UserLayout() {
  const user = getUser() || { name: "Socio", email: "", role: "user" };

  // Función en inglés para cerrar sesión
  const handleLogout = () => {
    Swal.fire({
      title: "¿Cerrar sesión?",
      text: "¿Estás seguro de que deseas salir del portal de socios de SportClub?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0d6efd", // Azul de la identidad de usuario
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sí, salir",
      cancelButtonText: "Cancelar"
    }).then((result) => {
          if (result.isConfirmed) {
        logout();
        window.location.replace("/login");
      }
    });
  };

 const handleShowProfile = () => {
  Swal.fire({
    icon: "info",
    html: `...`, 
    showCancelButton: true,
    confirmButtonText: "✏️ Modificar Datos",
    cancelButtonText: "Cerrar",
    confirmButtonColor: "#0d6efd",
  }).then(async (result) => { 
    if (result.isConfirmed) {
      const editResult = await Swal.fire({
        title: "Actualizar Mis Datos",
        html: `
          <div style="text-align: left; font-family: 'sans-serif';">
            <label>Nombre Completo</label>
            <input id="swal-user-name" class="swal2-input" value="${user.name}">
            <label>Correo Electrónico</label>
            <input id="swal-user-email" type="email" class="swal2-input" value="${user.email}">
            <label>Contraseña Actual</label>
            <input id="swal-user-current-password" type="password" class="swal2-input" placeholder="Introduce tu contraseña actual">
            <label>Nueva Contraseña (Opcional)</label>
            <input id="swal-user-password" type="password" class="swal2-input" placeholder="Deja vacío para no cambiar">
          </div>
        `,
        preConfirm: () => {
          return {
            name: document.getElementById("swal-user-name").value,
            email: document.getElementById("swal-user-email").value,
            current_password: document.getElementById("swal-user-current-password").value,
            password: document.getElementById("swal-user-password").value 
          };
        }
      });

      if (editResult.isConfirmed) {
        const { name, email, password } = editResult.value;

        try {
          
const resProfile = await fetch("http://localhost:3000/api/auth/me", {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ full_name: name, email })
      });

      if (password && password.trim() !== "") {
        if (!editResult.value.current_password) {
          throw new Error('Para cambiar contraseña, ingresa tu contraseña actual.');
        }

        const resPass = await fetch("http://localhost:3000/api/auth/me/password", {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify({ 
            current_password: editResult.value.current_password,
            new_password: password,
            confirm_password: password
          })
        });

        const passUpdate = await resPass.json();
        if (!resPass.ok) {
          throw new Error(passUpdate.message || 'Error al cambiar contraseña');
        }
      }

          Swal.fire("Éxito", "Datos actualizados correctamente", "success").then(() => {
             window.location.reload();
          });

        } catch (error) {
          Swal.fire("Error", "No se pudo actualizar: " + error.message, "error");
        }
      }
    }
  });
};

  return (
    <>
      {/* NAVBAR CON IDENTIDAD AZUL Y ELEMENTOS OBLIGATORIOS EXIGIDOS */}
      <Navbar variant="dark" expand="lg" className="px-4 shadow-sm" style={{ backgroundImage: "linear-gradient(45deg, #0d6efd, #0a4da2)" }}>
        <Container fluid>
          <Navbar.Brand className="fw-bold fs-4 text-white">SportClub 🏋️‍♂️</Navbar.Brand>
          <Navbar.Toggle aria-controls="user-navbar" />
          <Navbar.Collapse id="user-navbar" className="justify-content-between">
            
            {/* Navegación visible coherente con el rol de socio */}
            <Nav className="me-auto ms-3 gap-2">
              <Nav.Link href="#" className="text-white active fw-semibold border-bottom border-2 border-white">Inicio</Nav.Link>
              <Nav.Link href="#" className="text-white-50 fw-medium">Mis Clases</Nav.Link>
              <Nav.Link href="#" className="text-white-50 fw-medium">Horarios</Nav.Link>
            </Nav>

            {/* Opciones de cuenta y salida exigidas por rúbrica */}
            <Nav className="align-items-center gap-3">
              <span className="navbar-text text-light opacity-75 small d-none d-md-inline">
                Socio: <strong className="text-white">{user?.name}</strong>
              </span>
              <Nav.Link 
                onClick={handleShowProfile} 
                className="text-white fw-semibold px-3 py-1.5 rounded-pill text-uppercase small" 
                style={{ backgroundColor: "rgba(255,255,255,0.15)", cursor: "pointer" }}
              >
                Mi Perfil
              </Nav.Link>
              <Button variant="outline-light" size="sm" className="fw-bold px-3 py-1.5 rounded-pill text-uppercase small" onClick={handleLogout}>
                Cerrar Sesión
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <main>
        <Outlet />
      </main>
    </>
  );
}

export default UserLayout;