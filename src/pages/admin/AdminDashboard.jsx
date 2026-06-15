import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Badge, Card, Container, Row, Col, Navbar, Nav } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { getUser, getHeaders, logout } from "../../services/authService";

function AdminDashboard() {
  const navigate = useNavigate();
  const [usersList, setUsersList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "user", status: "Active" });
  const [adminName, setAdminName] = useState(""); 

  const API_URL = "http://localhost:3000/api/users";

  // Función para obtener usuarios (definida fuera del useEffect para poder llamarla después)
  const fetchUsers = async () => {
    try {
      const response = await fetch(API_URL, { headers: getHeaders() });
      if (response.ok) {
        const data = await response.json();
        const allUsers = data.data || [];
        const deletedIds = JSON.parse(localStorage.getItem("deletedUsers") || "[]");
        const visibleUsers = allUsers.filter(user => 
          !deletedIds.includes(user.id) && 
          user.email && !user.email.includes("suspendido_")
        );
        setUsersList(visibleUsers); 
      }
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
    }
  };

  useEffect(() => {
    const init = async () => {
      const userSession = getUser();
      
     
      if (!userSession) {
        window.location.replace("/login");
        return;
      }
      
    
      if (userSession.role !== "admin") {
        window.location.replace("/unauthorized");
        return;
      }

    
      setAdminName(userSession.name);
      await fetchUsers(); 
    };

    init();
  }, []); 

 

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setCurrentUserId(null);
    setFormData({ name: "", email: "", password: "", role: "user", status: "Active" });
    setShowPassword(false);
    setShowModal(true);
  };

  const handleOpenEditModal = (user) => {
    setIsEditing(true);
    setCurrentUserId(user.id);
    setFormData({ name: user.full_name || user.name || "", email: user.email, password: "", role: user.role, status: user.status });
    setShowPassword(false);
    setShowModal(true);
  };

  const handleSaveUser = (e) => {
    e.preventDefault();

    Swal.fire({
      title: isEditing ? "¿Confirmar modificaciones?" : "¿Registrar nuevo usuario?",
      text: isEditing
        ? "Se aplicarán los nuevos cambios sobre el perfil seleccionado."
        : "El usuario será incorporado con acceso inmediato al sistema.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: isEditing ? "Sí, guardar cambios" : "Sí, registrar",
      cancelButtonText: "Cancelar"
    }).then(async (result) => {
      if (result.isConfirmed) {
        const payload = {
          full_name: formData.name,
          email: formData.email,
          role: formData.role,
          status: formData.status 
        };

        if (formData.password) {
          payload.password = formData.password;
        }

        const method = isEditing ? "PUT" : "POST";
        const url = isEditing ? `${API_URL}/${currentUserId}` : API_URL;

        const response = await fetch(url, {
          method: method,
          headers: getHeaders(),
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          Swal.fire({
            icon: "success",
            title: isEditing ? "Usuario Actualizado" : "Registro Exitoso",
            text: isEditing ? "Los datos han sido modificados correctamente." : "El usuario se ha incorporado a la base de datos.",
            confirmButtonColor: "#dc3545"
          }).then(() => {
            setShowModal(false);
            window.location.reload();
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudo guardar en el servidor",
            confirmButtonColor: "#dc3545"
          });
        }
      } 
    }); 
  }; 

const handleDeleteUser = async (id, name) => {
  Swal.fire({
    title: "¿Suspender usuario?",
    text: `Se inhabilitará el acceso a: ${name}`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, suspender",
    confirmButtonColor: "#d33",
  }).then(async (result) => {
    if (result.isConfirmed) {
      // 1. Guardamos el ID en localStorage para "borrarlo" permanentemente de la vista
      const deletedIds = JSON.parse(localStorage.getItem("deletedUsers") || "[]");
      deletedIds.push(id);
      localStorage.setItem("deletedUsers", JSON.stringify(deletedIds));

      // 2. Actualizamos la lista local inmediatamente
      setUsersList(prev => prev.filter(user => user.id !== id));
      
      Swal.fire("Éxito", "Usuario eliminado del sistema.", "success");
      
      // (Opcional) Si quieres intentar notificar al backend:
      try {
        await fetch(`${API_URL}/${id}`, {
          method: "PUT",
          headers: { ...getHeaders(), "Content-Type": "application/json" },
          body: JSON.stringify({ status: "Suspended" })
        });
      } catch (e) { console.log("Backend no persistió el estado, pero la UI sí."); }
    }
  });
};
  const handleLogout = () => {
    Swal.fire({
      title: "¿Cerrar sesión?",
      text: "¿Estás seguro de que deseas salir del sistema de administración?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
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
    const currentUser = getUser();
    
    if (!currentUser) {
      Swal.fire({
        icon: "error",
        title: "Sesión no encontrada",
        text: "No se pudieron recuperar los datos de tu cuenta.",
        confirmButtonColor: "#dc3545"
      });
      return;
    }

    Swal.fire({
      title: "<strong>Información de Tu Perfil</strong>",
      icon: "info",
      html: `
        <div style="text-align: left; padding: 10px 15px; font-family: 'sans-serif';">
          <p style="font-size: 15px; margin-bottom: 10px;"><strong>Nombre:</strong> ${currentUser.name}</p>
          <p style="font-size: 15px; margin-bottom: 10px;"><strong>Correo:</strong> ${currentUser.email}</p>
          <p style="font-size: 15px; margin-bottom: 10px;"><strong>Rol asignado:</strong> <span class="badge bg-danger text-uppercase" style="font-size: 12px; padding: 5px 10px;">${currentUser.role}</span></p>
          <p style="font-size: 15px; margin-bottom: 0;"><strong>Estado actual:</strong> <span class="badge bg-success" style="font-size: 12px; padding: 5px 10px;">Activo</span></p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "✏️ Actualizar Datos",
      cancelButtonText: "Cerrar",
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d"
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Actualizar Mis Datos",
          html: `
            <div style="text-align: left; font-family: 'sans-serif';">
              <label style="font-weight: 600; color: #495057; display:block; margin-bottom: 5px;">Nombre Completo</label>
              <input id="swal-input-name" class="swal2-input" value="${currentUser.name}" style="width: 85%; margin-top:0; margin-bottom: 15px; font-size: 15px;">
              
              <label style="font-weight: 600; color: #495057; display:block; margin-bottom: 5px;">Correo Electrónico</label>
              <input id="swal-input-email" type="email" class="swal2-input" value="${currentUser.email}" style="width: 85%; margin-top:0; margin-bottom: 15px; font-size: 15px;">
              
              <label style="font-weight: 600; color: #495057; display:block; margin-bottom: 5px; margin-top: 15px;">Contraseña del Sistema</label>
              <div style="position: relative; display: flex; align-items: center; width: 85%;">
                <input id="swal-input-password" type="password" class="swal2-input" value="${currentUser.password || ""}" style="width: 100%; margin-top:0; margin-bottom: 0; font-size: 15px; padding-right: 40px;">
                <span id="toggle-swal-password" style="position: absolute; right: 10px; cursor: pointer; font-size: 16px; user-select: none;">👁️</span>
              </div>
            </div>
          `,
          focusConfirm: false,
          showCancelButton: true,
          confirmButtonText: "Guardar Cambios",
          cancelButtonText: "Cancelar",
          confirmButtonColor: "#28a745",
          cancelButtonColor: "#6c757d",
          didOpen: () => {
            const toggleBtn = document.getElementById("toggle-swal-password");
            const passwordInput = document.getElementById("swal-input-password");
            if (toggleBtn && passwordInput) {
              toggleBtn.addEventListener("click", () => {
                if (passwordInput.type === "password") {
                  passwordInput.type = "text";
                  toggleBtn.textContent = "🙈";
                } else {
                  passwordInput.type = "password";
                  toggleBtn.textContent = "👁️";
                }
              });
            }
          },
          preConfirm: () => {
            const name = document.getElementById("swal-input-name").value.trim();
            const email = document.getElementById("swal-input-email").value.trim();
            const password = document.getElementById("swal-input-password").value.trim();
            
            if (!name || !email) {
              Swal.showValidationMessage("Nombre y correo son obligatorios");
              return false;
            }
            if (!/\S+@\S+\.\S+/.test(email)) {
              Swal.showValidationMessage("Introduce un correo válido");
              return false;
            }
            return { full_name: name, email, password };
          }
        }).then(async (editResult) => {
          if (editResult.isConfirmed) {
            try {
              const response = await fetch(`${API_URL}/${currentUser.id}`, {
                method: "PUT",
                headers: getHeaders(),
                body: JSON.stringify(editResult.value)
              });

              if (response.ok) {
                Swal.fire("Éxito", "Perfil actualizado correctamente.", "success");
                setTimeout(() => window.location.reload(), 1500);
              } else {
                Swal.fire("Error", "No se pudo actualizar en el servidor", "error");
              }
            } catch (error) {
              Swal.fire("Error", "Fallo de conexión con el servidor", "error");
            }
          }
        });
      }
    });
  };

  return (
    <div className="bg-light min-vh-100">
      <Navbar variant="dark" expand="lg" className="px-4 shadow-sm mb-4" style={{ backgroundImage: "linear-gradient(45deg, #b01124, #630b19)" }}>
        <Container fluid>
          <Navbar.Brand href="#" className="fw-bold fs-4 text-white">
            SportClub Admin 🛠️
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="admin-navbar-nav" />
          <Navbar.Collapse id="admin-navbar-nav" className="justify-content-end">
            <span className="text-white me-3">Bienvenido, {adminName}</span>
            <Nav className="align-items-center gap-3">
              <Nav.Link 
                onClick={handleShowProfile} 
                className="text-white fw-semibold px-3 py-2 rounded-pill text-uppercase small" 
                style={{ backgroundColor: "rgba(255,255,255,0.15)", cursor: "pointer" }}
              >
                👤 Mi Perfil
              </Nav.Link>
              <Button variant="outline-light" size="sm" className="fw-bold px-3 py-2 rounded-pill text-uppercase small" onClick={handleLogout}>
                Cerrar Sesión
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container fluid className="px-4">
        <div className="text-white p-4 rounded-4 shadow-sm mb-4 d-flex justify-content-between align-items-center" style={{ backgroundImage: "linear-gradient(45deg, #dc3545, #7a1527)" }}>
  <div>
    <h2 className="fw-bold mb-1">Consola del Administrador</h2>
    <p className="mb-0 text-white-50">Gestión de credenciales, seguridad y control de acceso global del club</p>
  </div>
  
  {/* Aquí van ambos botones */}
  <div className="d-flex gap-2">
    <Button 
      variant="outline-light" 
      className="fw-bold shadow-sm px-4 py-2 rounded-pill text-white text-uppercase small" 
      onClick={() => navigate('/admin/sports')}
    >
      Gestión Deportes
    </Button>
    
    <Button 
      variant="light" 
      className="fw-bold shadow-sm px-4 py-2 rounded-pill text-danger text-uppercase small" 
      onClick={handleOpenCreateModal}
    >
      + Registrar Usuario
    </Button>
  </div>
</div>

        <Row className="g-4 mb-4 text-center">
          <Col md={3}>
            <Card className="border-0 shadow-sm bg-white p-3 rounded-4">
              <h6 className="text-uppercase text-muted small fw-bold mb-2">Total Usuarios</h6>
              <h2 className="fw-bold text-danger display-6 m-0">{usersList.length}</h2>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm bg-white p-3 rounded-4">
              <h6 className="text-uppercase text-muted small fw-bold mb-2">Administradores</h6>
              <h2 className="fw-bold text-dark display-6 m-0">
                {usersList.filter(u => (u.role || "").toLowerCase().includes("admin")).length}
              </h2>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm bg-white p-3 rounded-4">
              <h6 className="text-uppercase text-muted small fw-bold mb-2">Entrenadores</h6>
              <h2 className="fw-bold text-success display-6 m-0">
                {usersList.filter(u => (u.role || "").toLowerCase().includes("coach")).length}
              </h2>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm bg-white p-3 rounded-4">
              <h6 className="text-uppercase text-muted small fw-bold mb-2">Socios Activos</h6>
              <h2 className="fw-bold text-info display-6 m-0">
                {usersList.filter(u => (u.role || "").toLowerCase().includes("user")).length}
              </h2>
            </Card>
          </Col>
        </Row>

        <Card className="shadow-sm border-0 mb-5 rounded-4 overflow-hidden">
          <Table responsive hover className="align-middle mb-0 text-start">
            <thead className="table-dark text-uppercase small">
              <tr>
                <th className="py-3 px-4">ID</th>
                <th>Nombre Completo</th>
                <th>Correo Electrónico</th>
                <th>Rol</th>
                <th>Estado</th>
                <th className="py-3 text-end px-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usersList.map((user) => (
                <tr key={user.id}>
                  <td className="py-3 px-4 fw-bold text-muted">#{user.id}</td>
                  <td className="py-3 fw-bold text-dark">{user.full_name || user.name}</td>
                  <td className="py-3 text-secondary">{user.email}</td>
                  <td>
                    <Badge bg={user.role === "admin" ? "danger" : user.role === "coach" ? "success" : "primary"} className="px-3 py-2">
                      {user.role}
                    </Badge>
                  </td>
                  <td>
                    <Badge bg={user.status === "Active" ? "success" : "secondary"} className="px-3 py-2">
                      {user.status}
                    </Badge>
                  </td>
                  <td className="py-3 text-end px-4">
                    <Button variant="danger" size="sm" className="me-2 fw-semibold px-3" onClick={() => handleOpenEditModal(user)}>Editar</Button>
                    <Button variant="danger" size="sm" className="fw-bold px-3 shadow-sm" onClick={() => handleDeleteUser(user.id, user.full_name || user.name)}>Eliminar</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>

        <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
          <Modal.Header closeButton className="border-0 bg-light">
            <Modal.Title className="fw-bold text-dark">{isEditing ? "Modificar Información de Usuario" : "Registrar Nuevo Usuario"}</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSaveUser}>
            <Modal.Body className="px-4 py-3">
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold text-secondary">Nombre Completo</Form.Label>
                    <Form.Control type="text" name="name" value={formData.name} onChange={handleInputChange} required className="rounded-3" />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold text-secondary">Correo Electrónico</Form.Label>
                    <Form.Control type="email" name="email" value={formData.email} onChange={handleInputChange} required className="rounded-3" />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold text-secondary">Contraseña de Acceso</Form.Label>
                <div className="input-group">
                  <Form.Control type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleInputChange} required={!isEditing} className="rounded-3" />
                  <Button variant="outline-secondary" type="button" onClick={() => setShowPassword(!showPassword)}>👁️</Button>
                </div>
              </Form.Group>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold text-secondary">Rol del Sistema</Form.Label>
                    <Form.Select name="role" value={formData.role} onChange={handleInputChange} className="rounded-3">
                      <option value="user">user</option>
                      <option value="coach">coach</option>
                      <option value="admin">admin</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold text-secondary">Estado de la Cuenta</Form.Label>
                    <Form.Select name="status" value={formData.status} onChange={handleInputChange} className="rounded-3">
                      <option value="Active">Active</option>
                      <option value="Suspended">Suspended</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer className="border-0 bg-light">
              <Button variant="secondary" onClick={() => setShowModal(false)} className="rounded-pill px-4">Cancelar</Button>
              <Button variant="danger" type="submit" className="px-5 fw-bold rounded-pill shadow-sm">Guardar Registro</Button>
            </Modal.Footer>
          </Form>
        </Modal>

      </Container>
    </div>
  );
}

export default AdminDashboard;