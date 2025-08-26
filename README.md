# Sistema de Gestión de Vacaciones y Permisos

Una aplicación web completa para la gestión de vacaciones y permisos de empleados, construida con Next.js, Prisma y PostgreSQL.

## Características

- 🔐 Sistema de autenticación con roles (Empleado, Manager, HR, Admin, Super Admin)
- 📝 Solicitud y aprobación de vacaciones y permisos
- 📅 Calendario de equipo integrado
- 📊 Dashboard personalizado por rol
- 🔄 Sincronización con Google Sheets
- 📧 Notificaciones por email
- 📱 Diseño responsivo
- ⏰ Sistema de check-in/check-out

## Requisitos Previos

- Node.js 18+ 
- PostgreSQL (o SQLite para desarrollo)
- Cuenta de Google Cloud (para integración con Sheets)
- Servidor SMTP (para notificaciones por email)

## Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd vacation-management
