import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { registerUser } from "../services/authService"

function Register() {
  const navigate = useNavigate()

  // Estados de los campos
  const [nombre, setNombre] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Estados de visibilidad de contraseña
  const [showPass, setShowPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)

  // Estados de validación visual
  const [nombreInvalid, setNombreInvalid] = useState(false)
  const [emailInvalid, setEmailInvalid] = useState(false)
  const [passwordInvalid, setPasswordInvalid] = useState(false)
  const [confirmInvalid, setConfirmInvalid] = useState(false)
  
  // Estados de mensajes
  const [successMsg, setSuccessMsg] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // 1. Resetear estados previos
    setNombreInvalid(false)
    setEmailInvalid(false)
    setPasswordInvalid(false)
    setConfirmInvalid(false)
    setSuccessMsg("")
    setErrorMsg("")

    // 2. Validación local
    let esValido = true

    if (nombre.trim() === "") {
      setNombreInvalid(true)
      esValido = false
    }
    if (email.trim() === "") {
      setEmailInvalid(true)
      esValido = false
    }
    if (password.length < 8) {
      setPasswordInvalid(true)
      esValido = false
    }
    if (password !== confirmPassword) {
      setConfirmInvalid(true)
      esValido = false
    }

    if (!esValido) {
      setErrorMsg("Por favor, corrige los campos marcados en rojo.")
      return
    }

    // 3. Intento de registro
    try {
      console.log("Enviando datos a registerUser...", { nombre, email, password })
      
      await registerUser({ 
        full_name: nombre, 
        email: email, 
        password: password, 
        role: "user" 
      })

      setSuccessMsg("¡Registro completado con éxito! Redirigiendo...")
      
      setTimeout(() => {
        navigate("/login")
      }, 2000)

    } catch (error) {
      console.error("Error capturado:", error)
      setErrorMsg(error.message || "Error al conectar con el servidor.")
    }
  }

  return (
    <div className="container mt-4 d-flex align-items-center justify-content-center" style={{ minHeight: "85vh" }}>
      <div className="card shadow p-4" style={{ width: "100%", maxWidth: "520px", borderRadius: "20px", border: "none" }}>
        
        <div className="text-center mb-4">
          <div style={{ fontSize: "3.2rem", color: "#3b82f6", marginBottom: "8px" }}>
            <i className="fas fa-user-plus"></i>
          </div>
          <h1 className="fw-bold" style={{ color: "#1a233a", letterSpacing: "-1.5px", fontSize: "2.6rem" }}>
            Sport<span style={{ color: "#3b82f6" }}>Club</span>
          </h1>
          <p className="text-muted mt-2">Regístrate en el sistema para comenzar tu entrenamiento</p>
        </div>

        {/* Mensajes de feedback */}
        {successMsg && <div className="alert alert-success text-center p-2 small mb-3">{successMsg}</div>}
        {errorMsg && <div className="alert alert-danger text-center p-2 small mb-3">{errorMsg}</div>}

        <form onSubmit={handleSubmit} noValidate>
          
          <div className="mb-3">
            <label className="form-label fw-semibold small">Nombre Completo <span className="text-danger">*</span></label>
            <div className={`input-group ${nombreInvalid ? "is-invalid" : ""}`} style={{ borderRadius: "10px", overflow: "hidden", border: "1px solid #cbd5e1" }}>
              <span className="input-group-text bg-light border-0 text-muted"><i className="fas fa-user"></i></span>
              <input type="text" className="form-control border-0" placeholder="Juan Pérez" value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold small">Correo Electrónico <span className="text-danger">*</span></label>
            <div className={`input-group ${emailInvalid ? "is-invalid" : ""}`} style={{ borderRadius: "10px", overflow: "hidden", border: "1px solid #cbd5e1" }}>
              <span className="input-group-text bg-light border-0 text-muted"><i className="fas fa-envelope"></i></span>
              <input type="email" className="form-control border-0" placeholder="juan.perez@demo.cl" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold small">Contraseña <span className="text-danger">*</span></label>
            <div className={`input-group ${passwordInvalid ? "is-invalid" : ""}`} style={{ borderRadius: "10px", overflow: "hidden", border: "1px solid #cbd5e1" }}>
              <span className="input-group-text bg-light border-0 text-muted"><i className="fas fa-lock"></i></span>
              <input type={showPass ? "text" : "password"} className="form-control border-0" placeholder="Mínimo 8 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} />
              <span className="input-group-text bg-light border-0 text-muted" style={{ cursor: "pointer" }} onClick={() => setShowPass(!showPass)}>
                <i className={showPass ? "far fa-eye-slash" : "far fa-eye"}></i>
              </span>
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold small">Confirmar Contraseña <span className="text-danger">*</span></label>
            <div className={`input-group ${confirmInvalid ? "is-invalid" : ""}`} style={{ borderRadius: "10px", overflow: "hidden", border: "1px solid #cbd5e1" }}>
              <span className="input-group-text bg-light border-0 text-muted"><i className="fas fa-shield-alt"></i></span>
              <input type={showConfirmPass ? "text" : "password"} className="form-control border-0" placeholder="Repite tu contraseña" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              <span className="input-group-text bg-light border-0 text-muted" style={{ cursor: "pointer" }} onClick={() => setShowConfirmPass(!showConfirmPass)}>
                <i className={showConfirmPass ? "far fa-eye-slash" : "far fa-eye"}></i>
              </span>
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-100 fw-bold p-2" style={{ backgroundColor: "#3b82f6", border: "none", borderRadius: "10px" }}>
            <i className="fas fa-user-check me-2"></i> Crear Cuenta
          </button>

          <div className="text-center mt-4">
            <span className="text-muted small">¿Ya tienes cuenta? </span>
            <Link to="/login" className="small fw-bold text-decoration-none" style={{ color: "#3b82f6" }}>Inicia sesión</Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register