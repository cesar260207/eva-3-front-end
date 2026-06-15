import { useState, useEffect } from "react";
import { Card, Button, Badge, Row, Col, ProgressBar, Form, Table, Modal } from "react-bootstrap";
import Swal from "sweetalert2";
import { getHeaders, getToken } from "../../services/authService";

const API_URL_USERS = "http://localhost:3000/api/users";

function UserDashboard() {
  const [userSession, setUserSession] = useState({ name: "Socio", email: "" });
  const [routine, setRoutine] = useState(null);
  const [metadata, setMetadata] = useState({});
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [personalRecords, setPersonalRecords] = useState([]);
  const [newRecord, setNewRecord] = useState({ exercise: "", weight: "" });
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const initData = async () => {
      const token = getToken();
      if (!token) {
        window.location.replace("/login");
        return;
      }

      try {
        const resUser = await fetch("http://localhost:3000/api/auth/me", {
          headers: getHeaders()
        });

        if (!resUser.ok) {
          window.location.replace("/login");
          return;
        }

        const userData = await resUser.json();
        const realUser = userData.data || userData;
        
        
        setUserSession({ 
            id: realUser.id, 
            name: realUser.full_name, 
            email: realUser.email 
        });

        const responseMetadata = realUser.metadata || {};
        const attendanceData = responseMetadata.attendance || { count: 0, last_checkin: null };
        const today = new Date().toISOString().split("T")[0];

        setMetadata(responseMetadata);
        setAttendanceCount(attendanceData.count || 0);
        setHasCheckedIn(attendanceData.last_checkin === today);
        setPersonalRecords(Array.isArray(responseMetadata.records) ? responseMetadata.records : []);

       
        if (responseMetadata.objective) {
          setRoutine({
            objective: responseMetadata.objective,
            days_per_week: responseMetadata.daysPerWeek || 0,
            difficulty: responseMetadata.difficulty || "Beginner"
          });
        }
      } catch (error) {
        console.error("Error crítico:", error);
      }
    };

    initData();
  }, []);

  const handleCheckIn = async () => {
    Swal.fire({
      title: "¿Registrar asistencia?",
      text: "¿Deseas registrar tu asistencia para hoy?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0d6efd",
      confirmButtonText: "Sí, registrar"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Obtener datos actuales
          const response = await fetch("http://localhost:3000/api/auth/me", { headers: getHeaders() });
          if (!response.ok) throw new Error("No se pudo verificar el usuario.");
          const resultUser = await response.json();
          const currentUser = resultUser.data || resultUser;
          
          const metadataPayload = {
            ...currentUser.metadata,
            attendance: {
              count: (currentUser.metadata?.attendance?.count || 0) + 1,
              last_checkin: new Date().toISOString().split("T")[0]
            }
          };

          // CAMBIO AQUÍ: Usamos /api/users/ID para guardar
          const updateResponse = await fetch(`http://localhost:3000/api/users/${currentUser.id}`, {
            method: "PUT",
            headers: { ...getHeaders(), "Content-Type": "application/json" },
            body: JSON.stringify({ metadata: metadataPayload })
          });

          if (!updateResponse.ok) throw new Error("Error al actualizar asistencia.");

          setMetadata(metadataPayload);
          setAttendanceCount(metadataPayload.attendance.count);
          setHasCheckedIn(true);
          Swal.fire("¡Asistencia Registrada!", "", "success");
        } catch (error) {
          Swal.fire("Error", error.message, "error");
        }
      }
    });
  };

  const handleAddRecord = async (e) => {
    e.preventDefault();
    if (!newRecord.exercise || !newRecord.weight) return;

    try {
      // Obtenemos el usuario para tener su ID y metadata actual
      const res = await fetch("http://localhost:3000/api/auth/me", { headers: getHeaders() });
      const userData = await res.json();
      const currentUser = userData.data || userData;
      
      const newEntry = {
        id: Date.now(),
        exercise: newRecord.exercise,
        weight: `${newRecord.weight} kg`,
        date: new Date().toISOString().split("T")[0]
      };

      const metadataPayload = {
        ...currentUser.metadata,
        records: [...(Array.isArray(currentUser.metadata?.records) ? currentUser.metadata.records : []), newEntry]
      };

      // CAMBIO AQUÍ: Usamos /api/users/ID para guardar
      const updateResponse = await fetch(`http://localhost:3000/api/users/${currentUser.id}`, {
        method: "PUT",
        headers: { ...getHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ metadata: metadataPayload })
      });

      if (!updateResponse.ok) throw new Error("Error al guardar.");

      setMetadata(metadataPayload);
      setPersonalRecords(metadataPayload.records);
      setShowModal(false);
      Swal.fire("¡Récord Guardado!", "", "success");
    } catch (error) { Swal.fire("Error", error.message, "error"); }
  };

  const handleEditRecord = async (record) => {
    const currentWeight = (record.weight || "").toString().replace(/\D/g, "");
    const { value: newWeight } = await Swal.fire({
      title: `Editar peso - ${record.exercise}`,
      input: 'number',
      inputValue: currentWeight,
      showCancelButton: true
    });

    if (!newWeight) return;

    try {
      // 1. DEFINIMOS LA VARIABLE AQUÍ
      const updatedRecords = personalRecords.map(r => 
        r.id === record.id ? { ...r, weight: `${newWeight} kg` } : r
      );
      
      // 2. AHORA SÍ PODEMOS USARLA EN EL FETCH
      const updateResponse = await fetch(`http://localhost:3000/api/users/${userSession.id}`, {
        method: "PUT",
        headers: { ...getHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ metadata: { ...metadata, records: updatedRecords } })
      });

      if (!updateResponse.ok) throw new Error("No se pudo actualizar");

      setMetadata(prev => ({ ...prev, records: updatedRecords }));
      setPersonalRecords(updatedRecords);
      Swal.fire('¡Éxito!', 'Récord actualizado', 'success');
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    }
  };

  const handleDeleteRecord = async (id) => {
    const result = await Swal.fire({ title: '¿Eliminar?', icon: 'warning', showCancelButton: true });
    if (!result.isConfirmed) return;

    try {
      // 1. DEFINIMOS LA VARIABLE AQUÍ
      const updatedRecords = personalRecords.filter(r => r.id !== id);
      
      // 2. AHORA SÍ PODEMOS USARLA EN EL FETCH
      const updateResponse = await fetch(`http://localhost:3000/api/users/${userSession.id}`, {
        method: "PUT",
        headers: { ...getHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ metadata: { ...metadata, records: updatedRecords } })
      });

      if (!updateResponse.ok) throw new Error("No se pudo eliminar");

      setMetadata(prev => ({ ...prev, records: updatedRecords }));
      setPersonalRecords(updatedRecords);
      Swal.fire('Eliminado', 'Récord eliminado', 'success');
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    }
  };

  const handleShowProfile = async () => {
    const { value: formValues } = await Swal.fire({
      title: "Editar Perfil",
      html: `
        <input id="swal-name" class="swal2-input" value="${userSession.name}">
        <input id="swal-email" class="swal2-input" value="${userSession.email}">
        <hr>
        <input type="password" id="swal-new-pass" class="swal2-input" placeholder="Nueva Contraseña (opcional)">
      `,
      showCancelButton: true,
      confirmButtonText: "Guardar",
      preConfirm: () => ({
        full_name: document.getElementById("swal-name").value,
        email: document.getElementById("swal-email").value,
        password: document.getElementById("swal-new-pass").value // Enviamos password directamente
      })
    });

    if (formValues) {
      try {
        // Enviamos TODO en una sola petición a la ruta que SÍ funciona (/api/users/ID)
        const payload = {
          full_name: formValues.full_name,
          email: formValues.email
        };
        
        // Si escribió una contraseña, la incluimos aquí
        if (formValues.password) {
          payload.password = formValues.password;
        }

        const resProfile = await fetch(`http://localhost:3000/api/users/${userSession.id}`, {
          method: "PUT",
          headers: { ...getHeaders(), "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!resProfile.ok) {
           const err = await resProfile.json();
           throw new Error(err.message || "Error al actualizar perfil");
        }

        Swal.fire("¡Éxito!", "Perfil actualizado.", "success");
        setUserSession(prev => ({...prev, name: formValues.full_name, email: formValues.email}));
      } catch (error) {
        Swal.fire("Error", error.message, "error");
      }
    }
  };

  return (
    <div className="container mt-4">
      {/* HEADER */}
      <div className="bg-primary text-white p-4 rounded-4 shadow-sm mb-4 d-flex justify-content-between align-items-center" style={{ backgroundImage: "linear-gradient(45deg, #0d6efd, #0dcaf0)" }}>
        
        <div>
          <h2 className="fw-bold mb-1">¡Hola de nuevo, {userSession.name}! ✨</h2>
          <p className="mb-0 text-white-50">Tu disciplina de hoy construye tu fuerza de mañana.</p>
          
          {/* --- PEGA ESTO AQUÍ ABAJO --- */}
          <Button 
            variant="light" 
            size="sm" 
            className="mt-2" 
            onClick={handleShowProfile}
          >
            Mi Perfil
          </Button>
          {/* ---------------------------- */}
          
        </div>

        <Button 
          variant={hasCheckedIn ? "light" : "warning"} 
          className="fw-bold shadow px-4 py-2.5 rounded-pill text-dark text-uppercase" 
          onClick={handleCheckIn} 
          disabled={hasCheckedIn}
        >
          {hasCheckedIn ? "✓ Asistencia Registrada" : "🎯 Marcar Asistencia"}
        </Button>
      </div>

      <Row className="mb-4 g-3">
        <Col md={4}>
          <Card className="border-0 shadow-sm text-center bg-white p-3 rounded-4">
            <h6 className="text-secondary text-uppercase small fw-bold mb-2">Asistencias este Mes</h6>
            <h2 className="fw-extrabold text-primary display-5 mb-1">{attendanceCount}</h2>
          </Card>
        </Col>
        <Col md={8}>
          <Card className="border-0 shadow-sm bg-white p-4 rounded-4 h-100 justify-content-center">
            <h6 className="text-secondary text-uppercase small fw-bold mb-2">Meta de Entrenamientos Mensual</h6>
            <ProgressBar animated variant="info" now={(attendanceCount / 20) * 100} style={{ height: "15px" }} className="rounded-pill shadow-sm" />
          </Card>
        </Col>
      </Row>

      <Row className="g-4 mb-5">
        {/* COLUMNA RUTINA */}
        <Col lg={6}>
          <Card className="border-0 shadow-sm rounded-4 h-100 bg-white">
            <Card.Header className="bg-light py-3 border-0 rounded-top-4">
              <h5 className="mb-0 fw-bold text-dark text-uppercase small">📋 Mi Plan de Entrenamiento Oficial</h5>
            </Card.Header>
            <Card.Body className="p-4">
              {routine ? (
                <div>
                  <h4 className="fw-bold text-primary">{routine.objective}</h4>
                  <Row className="text-center mt-3">
                    <Col xs={6} className="border-end"><span className="text-muted small">Frecuencia</span><h5 className="fw-bold">{routine.days_per_week} días</h5></Col>
                    <Col xs={6}><span className="text-muted small">Complejidad</span><br/><Badge bg={routine.difficulty === "Advanced" ? "danger" : "info"}>{routine.difficulty === "Advanced" ? "Avanzado" : routine.difficulty === "Intermediate" ? "Intermedio" : "Principiante"}</Badge></Col>
                  </Row>
                </div>
              ) : <p className="text-center py-5 text-muted">No tienes una planificación técnica cargada aún.</p>}
            </Card.Body>
          </Card>
        </Col>

        {/* COLUMNA RÉCORDS */}
        <Col lg={6}>
          <Card className="border-0 shadow-sm rounded-4 h-100 bg-white">
            <Card.Header className="bg-light py-3 border-0 rounded-top-4 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold text-dark text-uppercase small">🔥 Mis Récords</h5>
              <Button size="sm" variant="outline-primary" onClick={() => setShowModal(true)}>+ Agregar</Button>
            </Card.Header>
            <Card.Body className="p-4">
              <Table responsive hover className="small mb-0">
                <thead>
                  <tr>
                    <th>Ejercicio</th>
                    <th>Peso</th>
                    <th>Fecha</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {personalRecords.map(r => (
                    <tr key={r.id}>
                      <td className="fw-bold">{r.exercise}</td>
                      <td><Badge bg="warning" className="text-dark">{r.weight}</Badge></td>
                      <td>{r.date}</td>
                      <td className="text-end">
                        <Button size="sm" variant="outline-primary" className="me-2" onClick={() => handleEditRecord(r)}>Editar</Button>
                        <Button size="sm" variant="outline-danger" onClick={() => handleDeleteRecord(r.id)}>Borrar</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* MODAL */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Registrar Récord</Modal.Title></Modal.Header>
        <Form onSubmit={handleAddRecord}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Ejercicio</Form.Label>
              <Form.Control required value={newRecord.exercise} onChange={(e) => setNewRecord({...newRecord, exercise: e.target.value})} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Peso (kg)</Form.Label>
              <Form.Control type="number" required value={newRecord.weight} onChange={(e) => setNewRecord({...newRecord, weight: e.target.value})} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cerrar</Button>
            <Button type="submit" variant="success">Guardar</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

export default UserDashboard;
