import { Link } from "react-router-dom"

function Home() {
  return (
    <div className="container d-flex align-items-center justify-content-center" style={{ minHeight: "80vh" }}>
      {/* Tarjeta principal estilizada con sombras y bordes redondeados profundos */}
      <div className="card shadow border-0 p-5 text-center bg-white" style={{ width: "100%", maxWidth: "600px", borderRadius: "20px" }}>
        
        {/* Icono deportivo superior para darle identidad visual */}
        <div className="mb-4 text-primary" style={{ fontSize: "3.5rem" }}>
          <i className="fas fa-dumbbell"></i>
        </div>
        
        {/* Título de la app con los estilos oscuros y azules coherentes con tu Login */}
        <h1 className="display-4 fw-bold mb-2" style={{ color: "#1a233a", letterSpacing: "-1.5px" }}>
          Sport<span style={{ color: "#3b82f6" }}>Club</span>
        </h1>
        
        {/* Descripción de la plataforma */}
        <p className="fs-5 text-muted mb-4 px-3">
          Plataforma de gestión deportiva profesional. Organiza tus entrenamientos, perfiles y rutinas en un solo lugar.
        </p>
        
        {/* Botones de acción estirados a lo ancho (w-100) para un look más moderno de aplicación móvil/web */}
        <div className="d-flex flex-column gap-3 px-4">
          {/* Cambiado a <Link> para evitar que la página parpadee o se recargue por completo */}
          <Link 
            to="/login" 
            className="btn btn-primary btn-lg fw-bold p-3 shadow-sm" 
            style={{ borderRadius: "12px", backgroundColor: "#3b82f6", border: "none" }}
          >
            <i className="fas fa-sign-in-alt me-2"></i> Iniciar Sesión
          </Link>
          
          <Link 
            to="/register" 
            className="btn btn-outline-secondary btn-lg fw-bold p-3" 
            style={{ borderRadius: "12px" }}
          >
            <i className="fas fa-user-plus me-2"></i> Registrarse
          </Link>
        </div>

      </div>
    </div>
  )
}

export default Home