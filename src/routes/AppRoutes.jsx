import { Routes, Route } from "react-router-dom"
import { useEffect } from "react"
import Home from "../pages/Home"
import Login from "../pages/Login"
import Register from "../pages/Register"
import Unauthorized from "../pages/Unauthorized/Unauthorized"

import UserDashboard from "../pages/user/UserDashboard"
import CoachDashboard from "../pages/coach/CoachDashboard"
import AdminDashboard from "../pages/admin/AdminDashboard"

import UserLayout from "../layouts/UserLayout"
import CoachLayout from "../layouts/CoachLayout"
import AdminLayout from "../layouts/AdminLayout"

import ProtectedRoute from "./ProtectedRoute"
import RoleRoute from "./RoleRoute"

// Componente Escudo: Saca al usuario de URLs falsas de manera nativa y limpia
const RedirectToHome = () => {
  useEffect(() => {
    window.location.replace("/")
  }, [])
  return null
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route path="/user" element={<RoleRoute allowedRoles={["user"]}><UserLayout /></RoleRoute>}>
        <Route path="dashboard" element={<UserDashboard />} />
      </Route>

      <Route path="/coach" element={<RoleRoute allowedRoles={["coach"]}><CoachLayout /></RoleRoute>}>
        <Route path="dashboard" element={<CoachDashboard />} />
      </Route>

      <Route path="/admin" element={<RoleRoute allowedRoles={["admin"]}><AdminLayout /></RoleRoute>}>
        <Route path="dashboard" element={<AdminDashboard />} />
      </Route>

      <Route path="/perfil" element={<ProtectedRoute><div className="container mt-4"><h1>Perfil del usuario autenticado</h1></div></ProtectedRoute>} />

      {}
      <Route path="*" element={<RedirectToHome />} />
    </Routes>
  )
}

export default AppRoutes