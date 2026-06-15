SportClub React
Aplicación full-stack para la gestión de un club deportivo, incluyendo autenticación, control de acceso por roles, dashboards diferenciados y módulo administrativo CRUD.

🛠 Tecnologías utilizadas
Frontend: React, Vite, React Router DOM, React Bootstrap, SweetAlert2.

Backend: Node.js, Express (API REST).

🚀 Instalación y Ejecución
1. Configuración del Frontend
Abre una terminal en: Front end/sportclub react

Instala dependencias: npm install

Ejecuta en modo desarrollo: npm run dev

Accede a la URL indicada (generalmente http://localhost:5173).

2. Configuración del Backend
Abre una terminal en: Back end/FrontEnd-Backend-ClubDeportivo-main

Instala dependencias: npm install

Inicia el servidor: npm run dev

La API estará disponible en http://localhost:3000.

📋 Funcionalidades principales
Autenticación: Sistema de login/registro con JWT y persistencia mediante localStorage.

Control de Acceso: Rutas protegidas basadas en roles (user, coach, admin).

Dashboard de Usuario:

Registro de asistencia diaria.

Gestión de récords personales (CRUD).

Visualización de rutina técnica.

Gestión de perfil y actualización de credenciales.

Administración: Módulo CRUD completo para la gestión de usuarios.

📁 Estructura del proyecto
src/pages/ → páginas principales: Login, Register, AdminDashboard, CoachDashboard, UserDashboard.

src/layouts/ → layouts por rol con header y navegación.

src/routes/ → rutas protegidas y control de roles.

src/services/ → servicios de API y autenticación.

💡 Notas Técnicas
Comunicación: El frontend consume servicios REST alojados en http://localhost:3000/api.

Persistencia: La aplicación gestiona el estado y la sincronización con el servidor tras las actualizaciones de perfil y récords.