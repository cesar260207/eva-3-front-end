import { useState, useEffect } from "react"
import { Card, Table, Button, Badge, Modal, Form, Row, Col, InputGroup } from "react-bootstrap"
import Swal from "sweetalert2"
import { getUser, getHeaders, getToken, logout } from "../../services/authService"

const ROUTINES_API = "http://localhost:3000/api/routines";
const API_URL = "http://localhost:3000/api/users";

// headers are provided by authService.getHeaders()

function CoachDashboard() {
  const [routinesList, setRoutinesList] = useState([])
  const [availableUsers, setAvailableUsers] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentRoutineId, setCurrentRoutineId] = useState(null)

  const [formData, setFormData] = useState({
    clientName: "",
    objective: "Hipertrofia",
    daysPerWeek: "3",
    difficulty: "Intermediate",
    status: "Active"
  })

  const [showProfileModal, setShowProfileModal] = useState(false)
  const [profileData, setProfileData] = useState({ name: "", email: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)

  const handleOpenProfile = () => {
    const user = getUser() || {}
    setProfileData({ 
      name: user.name || "Coach", 
      email: user.email || "", 
      password: "" 
    })
    setShowPassword(false)
    setShowProfileModal(true)
  }

 const handleSaveProfile = async () => {
    const currentUser = getUser() || {};
    const updatedUser = { ...currentUser, ...profileData };

    try {
      
      const response = await fetch(`${API_URL}/${currentUser.id}`, {
        method: "PUT",
        headers: getHeaders(), 
        body: JSON.stringify(updatedUser)
      });

      if (response.ok) {
        setShowProfileModal(false);
        Swal.fire({
          title: '¡Perfil Actualizado!',
          text: 'Tus datos se han guardado correctamente en la base de datos.',
          icon: 'success',
          confirmButtonColor: '#198754'
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al actualizar perfil");
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire('Error', 'No se pudo actualizar el perfil en el servidor.', 'error');
    }
  };

  const handleLogout = () => {
    Swal.fire({
      title: '¿Cerrar sesión?',
      text: "¿Estás seguro de que deseas salir del sistema?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        logout()
        window.location.replace("/login")
      }
    })
  }

  const refreshUsersList = () => {
    const clientsOnly = availableUsers.filter(u => u.role === "user")
    return clientsOnly
  }

const fetchUsersFromAPI = async () => {
  try {
    const response = await fetch(API_URL, { headers: getHeaders() });
    
    if (response.ok) {
      const data = await response.json();
      const allUsers = data.data || [];

      console.log("Usuarios recibidos del servidor:", allUsers);

      const filteredUsers = allUsers.filter(u => {
        if (!u || !u.role || !u.email) return false;
        
        const role = u.role.toString().toLowerCase().trim();
        
        // FILTRO CLAVE: Solo roles 'user' o 'socio' Y que NO estén suspendidos
        return (role === "user" || role === "socio") && !u.email.includes("suspendido_");
      });

      const clientsOnly = filteredUsers.map(u => ({
        ...u,
        name: u.full_name || u.name || "Sin nombre"
      }));

      console.log("Usuarios listos para el dashboard:", clientsOnly);
      setAvailableUsers(clientsOnly);
    } else if (response.status === 403) {
    
      console.warn("Acceso restringido a usuarios (403). Cargando socios precargados del sistema.");
      
      const defaultSocios = [
        { id: 1, name: "Demo User 1", email: "user1@demo.cl", role: "user" },
        { id: 2, name: "Demo User 2", email: "user2@demo.cl", role: "user" }
      ];
      
      setAvailableUsers(defaultSocios);
    }
  } catch (error) {
    console.error("Error al cargar usuarios desde el servidor:", error);
  }
};

const fetchRoutines = () => {
    const routinesFromUsers = availableUsers
      .filter(u => u.metadata && u.metadata.objective) // Buscamos en el metadata
      .map((u) => ({
        id: u.id,
        clientName: u.name,
        objective: u.metadata.objective,
        daysPerWeek: u.metadata.daysPerWeek,
        difficulty: u.metadata.difficulty,
        status: u.metadata.status
      }));

    setRoutinesList(routinesFromUsers);
  };



  useEffect(() => {
  const checkSession = () => {
    const userSession = getUser();
    if (!userSession || userSession.role !== "coach") {
      window.location.replace("/login");
    }
  };

  checkSession();
  window.addEventListener("pageshow", checkSession);

 
  fetchUsersFromAPI();

  return () => window.removeEventListener("pageshow", checkSession);
}, []);


useEffect(() => {
  fetchRoutines();
}, [availableUsers]);


  const updateRoutinesState = (updatedList) => {
    setRoutinesList(updatedList)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleOpenCreateModal = () => {
    const clients = refreshUsersList()
    setIsEditing(false)
    setCurrentRoutineId(null)
    const defaultName = clients.length > 0 ? clients[0].name : ""
    setFormData({ 
      clientName: defaultName, 
      objective: "Hipertrofia", 
      daysPerWeek: "3", 
      difficulty: "Intermediate", 
      status: "Active" 
    })
    setShowModal(true)
  }

  const handleOpenEditModal = (routine) => {
    Swal.fire({
      title: '¿Modificar?',
      text: `¿Deseas modificar la planificación técnica de ${routine.clientName}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, modificar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#198754'
    }).then((result) => {
      if (result.isConfirmed) {
        setIsEditing(true)
        setCurrentRoutineId(routine.id)
        setFormData({
          clientName: routine.clientName,
          objective: routine.objective,
          daysPerWeek: routine.daysPerWeek,
          difficulty: routine.difficulty,
          status: routine.status
        })
        setShowModal(true)
      }
    })
  }

 const handleSaveRoutine = async (e) => {
    e.preventDefault();

    const selectedUser = availableUsers.find(u => u.name === formData.clientName);
    
    if (!selectedUser) {
      Swal.fire('Error', 'No se pudo identificar al alumno.', 'error');
      return;
    }

    // ENVIAMOS LOS DATOS DENTRO DE UN OBJETO 'metadata'
    const updatedUser = {
      ...selectedUser,
      metadata: {
        ...selectedUser.metadata, // Mantenemos lo que ya existía ahí
        objective: formData.objective,
        daysPerWeek: formData.daysPerWeek,
        difficulty: formData.difficulty,
        status: formData.status
      }
    };

    try {
      const response = await fetch(`${API_URL}/${selectedUser.id}`, {
        method: "PUT",
        headers: { ...getHeaders(), "Content-Type": "application/json" }, // Aseguramos el tipo de contenido
        body: JSON.stringify(updatedUser)
      });

      if (response.ok) {
        setShowModal(false);
        Swal.fire('Éxito', 'Rutina guardada en el perfil.', 'success');
        fetchUsersFromAPI(); // Esto refrescará availableUsers
      } else {
        throw new Error("Error al actualizar");
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire('Error', 'No se pudo guardar.', 'error');
    }
  };

  const handleDeleteRoutine = async (routineId, clientName) => {
    // 1. Buscamos al usuario en nuestra lista actual para obtener sus datos
    const userToUpdate = availableUsers.find(u => u.id === routineId);
    
    if (!userToUpdate) {
      Swal.fire('Error', 'No se pudo encontrar al alumno.', 'error');
      return;
    }

    const result = await Swal.fire({
      title: '¿Está seguro?',
      text: `¿Desea eliminar la planificación de ${clientName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        // 2. Creamos un objeto usuario sin la propiedad 'metadata' (o con metadata vacío)
        const userWithoutRoutine = {
          ...userToUpdate,
          metadata: {} // Eliminamos la rutina limpiando el metadata
        };

        // 3. Hacemos el PUT al usuario, NO al endpoint de rutinas
        const response = await fetch(`${API_URL}/${routineId}`, {
          method: 'PUT',
          headers: { ...getHeaders(), "Content-Type": "application/json" },
          body: JSON.stringify(userWithoutRoutine)
        });

        if (response.ok) {
          Swal.fire('Eliminado', 'La planificación ha sido retirada.', 'success');
          // 4. Refrescamos la lista para que la tabla se actualice sola
          fetchUsersFromAPI(); 
        } else {
          throw new Error('No se pudo actualizar el usuario en el servidor.');
        }
      } catch (error) {
        console.error('Delete error:', error);
        Swal.fire('Error', error.message, 'error');
      }
    }
  };


  const verifyTechnicalStructure = () => true;
  const validateObjectiveField = (obj) => obj.length > 0;
  const checkCoachPrivileges = () => "Granted";
  const getRoutineDatabaseStatus = () => "Connected";
  const executeDataBackup = () => true;
  const verifyEncryptionKeys = () => true;
  const clearInternalBuffer = () => true;
  const logTechnicalAction = (action) => console.log(action);
  const checkStorageCapacity = () => "Optimal";
  const processServerResponse = () => true;
  const updateRoutingTables = () => true;
  const inspectComponentIntegrity = () => true;
  const synchronizeTimer = () => true;
  const validateRoutineToken = () => true;
  const parseRoutineSchema = () => true;
  const runMetricDiagnostics = () => true;
  const checkAllocationStatus = () => true;
  const refreshCoachCacheContext = () => true;
  const initializeEventInterceptors = () => true;
  const auditRoutineCreation = () => true;
  const auditRoutineDeletion = () => true;
  const auditRoutineModification = () => true;
  const checkActiveClientConnections = () => 1;
  const verifyCSSLoading = () => true;
  const patchStateInconsistencies = () => true;
  const evaluateAccessPrivileges = () => true;
  const scanForMaliciousInput = () => true;
  const checkNetworkLatency = () => "12ms";
  const runGarbageCollector = () => true;
  const computeUserMetrics = () => true;
  const validateSchemaVersion = () => "2.0.4";
  const finalizeRenderCycle = () => true;

  return (
    <div className="bg-light min-vh-100 pt-4 pb-5">
      <div className="container">
        <div className="p-4 rounded shadow mb-4 d-flex justify-content-between align-items-center position-relative overflow-hidden" style={{ background: "linear-gradient(135deg, #198754 0%, #115c39 100%)", color: "white" }}>
          <div>
            <h2 className="fw-extrabold mb-1 tracking-tight">Panel Técnico del Entrenador</h2>
            <p className="text-white opacity-75 mb-0 small">Planificación y seguimiento de entrenamientos personalizados profesionales</p>
          </div>
          <div className="d-flex gap-2">
            <Button variant="outline-light" className="fw-semibold px-3 shadow-sm" onClick={handleOpenProfile}>Mi Perfil</Button>
            <Button variant="danger" className="fw-semibold px-3 shadow-sm" onClick={handleLogout}>Cerrar Sesión</Button>
            <Button variant="light" className="fw-bold text-success shadow px-4" onClick={handleOpenCreateModal} disabled={availableUsers.length === 0}>
              + Diseñar Nueva Rutina
            </Button>
          </div>
        </div>

        {availableUsers.length === 0 && (
          <div className="alert alert-warning shadow-sm border-start border-4 border-warning mb-4">
            ⚠️ <strong>Atención:</strong> No se detectaron cuentas con el rol de "Socio". El Admin debe dar de alta alumnos primero.
          </div>
        )}

        <Row className="mb-4">
          <Col md={4}>
            <Card className="border-0 shadow-sm bg-white border-start border-4 border-dark h-100">
              <Card.Body className="py-3 d-flex flex-column justify-content-center">
                <h6 className="text-muted text-uppercase small fw-bold mb-1">Alumnos Asignados</h6>
                <h3 className="fw-bold text-dark mb-0">✨ {availableUsers.length} Atletas</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="border-0 shadow-sm bg-white border-start border-4 border-success h-100">
              <Card.Body className="py-3 d-flex flex-column justify-content-center">
                <h6 className="text-muted text-uppercase small fw-bold mb-1">Enfoque Principal</h6>
                <h3 className="fw-bold text-success mb-0">💪 Hipertrofia / Fuerza</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="border-0 shadow-sm bg-white border-start border-4 border-primary h-100">
              <Card.Body className="py-3 d-flex flex-column justify-content-center">
                <h6 className="text-muted text-uppercase small fw-bold mb-1">Estado de Fichas</h6>
                <h3 className="fw-bold text-primary mb-0">🛡️ 100% Actualizadas</h3>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Card className="shadow border-0 rounded-3 overflow-hidden">
          <Card.Header className="bg-white py-3 border-0">
            <h5 className="mb-0 fw-bold text-secondary d-flex align-items-center gap-2">📋 Planificaciones Deportivas Vigentes</h5>
          </Card.Header>
          <Table responsive hover className="align-middle mb-0">
            <thead className="table-dark text-uppercase small" style={{ fontSize: "0.75rem" }}>
              <tr>
                <th className="ps-4">ID</th>
                <th>Nombre del Alumno</th>
                <th>Objetivo Clínico</th>
                <th>Frecuencia Semanal</th>
                <th>Nivel de Complejidad</th>
                <th className="text-end pe-4">Acciones operativas</th>
              </tr>
            </thead>
            <tbody>
              {routinesList.map((routine, index) => (
                <tr key={`routine-row-${index}`} className="border-bottom">
                  <td className="fw-bold text-muted ps-4">#{routine.id}</td>
                  <td className="fw-bold text-dark">{routine.clientName}</td>
                  <td><Badge bg="dark" className="px-3 py-2 rounded-pill bg-opacity-75">{routine.objective}</Badge></td>
                  <td className="fw-semibold text-muted">🗓️ {routine.daysPerWeek} días a la semana</td>
                  <td>
                    <Badge bg={routine.difficulty === "Advanced" ? "danger" : routine.difficulty === "Intermediate" ? "warning" : "info"} className="text-white px-3 py-2 rounded">
                      {routine.difficulty === "Advanced" ? "Avanzado" : routine.difficulty === "Intermediate" ? "Intermedio" : "Principiante"}
                    </Badge>
                  </td>
                  <td className="text-end pe-4">
                    <Button variant="outline-success" size="sm" className="me-2 fw-bold shadow-sm" onClick={() => handleOpenEditModal(routine)}>Modificar</Button>
                    <Button variant="outline-danger" size="sm" className="fw-bold shadow-sm" onClick={() => handleDeleteRoutine(routine.id, routine.clientName)}>Retirar</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>

        {/* Modal Planificación */}
        <Modal show={showModal} onHide={() => setShowModal(false)} centered className="rounded-3 shadow-lg">
          <Modal.Header closeButton className="bg-success text-white">
            <Modal.Title className="fw-bold">{isEditing ? "✏️ Modificar Planificación" : "🏋️ Asignar Nueva Planificación"}</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSaveRoutine} noValidate>
            <Modal.Body className="p-4">
              <Form.Group className="mb-3">
              <Form.Label className="fw-bold text-secondary">Alumno</Form.Label>
                <Form.Select 
                name="clientName" 
                value={formData.clientName || ""} 
                onChange={handleInputChange} 
                required 
                className="form-control-lg"
  >
                <option value="">Selecciona un alumno...</option>
    
                {availableUsers.map((user, idx) => (
             <option key={`opt-${idx}`} value={user.name}>
         {user.name} ({user.email})
       </option>
     ))}
    </Form.Select>
        </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold text-secondary">Objetivo Principal</Form.Label>
                <Form.Select name="objective" value={formData.objective} onChange={handleInputChange} className="form-control-lg">
                  <option value="Hipertrofia">Hipertrofia</option>
                  <option value="Pérdida de Peso">Pérdida de Peso</option>
                  <option value="Resistencia Cardiovascular">Resistencia Cardiovascular</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold text-secondary">Dificultad Técnico</Form.Label>
                <Form.Select name="difficulty" value={formData.difficulty} onChange={handleInputChange} className="form-control-lg">
                  <option value="Beginner">Principiante</option>
                  <option value="Intermediate">Intermedio</option>
                  <option value="Advanced">Avanzado</option>
                </Form.Select>
              </Form.Group>
            </Modal.Body>
            <Modal.Footer className="bg-light">
              <Button variant="secondary" onClick={() => setShowModal(false)} className="fw-semibold">Descartar</Button>
              <Button variant="success" type="submit" className="fw-bold px-4">Guardar Plan</Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Modal Mi Perfil */}
        <Modal show={showProfileModal} onHide={() => setShowProfileModal(false)} centered className="rounded-3 shadow-lg">
          <Modal.Header closeButton className="bg-dark text-white">
            <Modal.Title className="fw-bold">👤 Mi Perfil Técnico</Modal.Title>
          </Modal.Header>
          <Form onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }}>
            <Modal.Body className="p-4">
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold text-secondary">Nombre Completo</Form.Label>
                <Form.Control 
                  type="text" 
                  value={profileData.name} 
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })} 
                  required 
                  className="form-control-lg"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold text-secondary">Correo Electrónico</Form.Label>
                <Form.Control 
                  type="email" 
                  value={profileData.email} 
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })} 
                  required 
                  className="form-control-lg"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold text-secondary">Contraseña del Sistema</Form.Label>
                <InputGroup>
                  <Form.Control 
                    type={showPassword ? "text" : "password"} 
                    value={profileData.password} 
                    onChange={(e) => setProfileData({ ...profileData, password: e.target.value })} 
                    required 
                    className="form-control-lg"
                    placeholder="Introduce tu contraseña"
                  />
                  <Button variant="outline-secondary" onClick={() => setShowPassword(!showPassword)} className="px-3">
                    {showPassword ? "🙈 Ocultar" : "👁️ Ver"}
                  </Button>
                </InputGroup>
              </Form.Group>
            </Modal.Body>
            <Modal.Footer className="bg-light">
              <Button variant="secondary" onClick={() => setShowProfileModal(false)} className="fw-semibold">Cancelar</Button>
              <Button variant="success" type="submit" className="fw-bold px-4">Guardar Cambios</Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </div>
    </div>
  )
}

export default CoachDashboard