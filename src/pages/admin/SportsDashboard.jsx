import { useState, useEffect } from "react";
import { Table, Button, Spinner, Form, Modal } from "react-bootstrap";
import { Link } from "react-router-dom"; // Añadido para navegación
import { getSports, createSport, updateSport, deleteSport, updateSportStatus } from "../../services/sportService";
import Swal from "sweetalert2";

const SportsDashboard = () => {
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", objective: "", duration: "", status: true });

  const fetchSports = async () => {
    setLoading(true);
    try {
      const response = await getSports();
      
      if (response && Array.isArray(response.data)) {
        setSports(response.data);
      } else if (Array.isArray(response)) {
        setSports(response);
      } else {
        setSports([]); 
        console.warn("La API no devolvió un arreglo válido");
      }
    } catch (error) {
      console.error("Error al cargar:", error);
      setSports([]); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSports(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateSport(formData.id, formData);
        Swal.fire("Éxito", "Deporte actualizado", "success");
      } else {
        await createSport(formData);
        Swal.fire("Éxito", "Deporte creado", "success");
      }
      setShowModal(false);
      fetchSports();
    } catch (error) {
      Swal.fire("Error", "No se pudo guardar", "error");
    }
  };

  const handleEdit = (sport) => {
    setFormData(sport);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "¿Eliminar deporte?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Sí, borrar"
    });

    if (result.isConfirmed) {
      await deleteSport(id);
      fetchSports();
      Swal.fire("Eliminado", "El deporte fue borrado", "success");
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    await updateSportStatus(id, !currentStatus);
    fetchSports();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;

  return (
    <div className="container mt-4">
      {/* NAVEGACIÓN AÑADIDA */}
     
<div className="mb-3">
  <Link to="/admin/dashboard" className="btn btn-sm btn-outline-secondary">
    ← Volver al Dashboard
  </Link>
</div>

      <div className="d-flex justify-content-between mb-3">
        <h2>Gestión de Deportes</h2>
        <div>
          <Button variant="info" className="me-2" onClick={fetchSports}>Refrescar</Button>
          <Button variant="primary" onClick={() => { setIsEditing(false); setFormData({ name: "", objective: "", duration: "", status: true }); setShowModal(true); }}>+ Nuevo</Button>
        </div>
      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Nombre</th><th>Objetivo</th><th>Duración</th><th>Estado</th><th>Creado</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {sports.map((s) => (
            <tr key={s.id}>
              <td>{s.name}</td><td>{s.objective}</td><td>{s.duration} min</td>
              <td>
                <Form.Check type="switch" checked={s.status} onChange={() => handleToggleStatus(s.id, s.status)} />
              </td>
              <td>{formatDate(s.created_at)}</td>
              <td>
                <Button variant="warning" size="sm" className="me-2" onClick={() => handleEdit(s)}>Editar</Button>
                <Button variant="danger" size="sm" onClick={() => handleDelete(s.id)}>Eliminar</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton><Modal.Title>{isEditing ? "Editar Deporte" : "Crear Deporte"}</Modal.Title></Modal.Header>
        <Form onSubmit={handleSave}>
          <Modal.Body>
            <Form.Group className="mb-3"><Form.Label>Nombre</Form.Label><Form.Control value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Objetivo</Form.Label><Form.Control value={formData.objective} onChange={(e) => setFormData({...formData, objective: e.target.value})} required /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Duración</Form.Label><Form.Control type="number" value={formData.duration} onChange={(e) => setFormData({...formData, duration: e.target.value})} required /></Form.Group>
          </Modal.Body>
          <Modal.Footer><Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button><Button type="submit" variant="primary">Guardar</Button></Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default SportsDashboard;