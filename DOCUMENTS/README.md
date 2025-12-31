# Sistema de Seguimiento de Proyectos
## Documentación Completa del Sistema

**Versión:** 2.0
**Fecha:** Diciembre 2025
**Desarrollado con:** Claude AI

---

## 📚 Índice de Documentación

Este directorio contiene toda la documentación del Sistema de Seguimiento de Proyectos:

### **1. [Manual Técnico](./MANUAL_TECNICO.md)**
Documentación completa para desarrolladores y personal de IT:
- Arquitectura del sistema
- Stack tecnológico
- Estructura de código
- API endpoints
- Base de datos
- Deployment y configuración
- Troubleshooting técnico

### **2. [Manual de Usuario](./MANUAL_USUARIO.md)**
Guía paso a paso para usuarios finales:
- Cómo acceder al sistema
- Crear y gestionar usuarios
- Cargar archivos Excel
- Usar el dashboard
- Filtros y búsquedas
- Reportes y gráficos

### **3. [Arquitectura del Sistema](./ARQUITECTURA.md)**
Diagramas y explicación detallada:
- Diagrama de arquitectura
- Flujo de datos
- Componentes del sistema
- Integraciones

### **4. [Migración a Azure](./MIGRACION_AZURE.md)**
Guía paso a paso para migrar a Azure:
- Requisitos previos
- Configuración de Azure App Service
- Configuración de Azure SQL Database
- Migración de datos
- Testing y validación

### **5. [Mantenimiento en Railway](./MANTENIMIENTO_RAILWAY.md)**
Operación y mantenimiento en Railway:
- Monitoreo del sistema
- Gestión de logs
- Backups de base de datos
- Actualizaciones
- Troubleshooting

---

## 🎯 Resumen del Sistema

### **Propósito**
Sistema web para seguimiento y análisis de proyectos, con carga de datos desde Excel, visualización en dashboard interactivo, y gestión de usuarios con autenticación centralizada.

### **Características Principales**
- ✅ Autenticación con usuarios y contraseñas individuales
- ✅ Gestión de usuarios (admin)
- ✅ Carga de archivos Excel
- ✅ Dashboard interactivo con gráficos
- ✅ Filtros avanzados
- ✅ Análisis de presupuesto
- ✅ Bitácora de accesos
- ✅ Base de datos centralizada (SQLite/Azure SQL)

### **Usuarios del Sistema**
- **Administradores:** Gestión completa de usuarios y datos
- **Usuarios regulares:** Acceso a dashboard y análisis

---

## 🚀 Acceso Rápido

### **Producción Actual**
```
URL: https://marugaul.github.io/seguimiento/index-railway.html
Backend: https://seguimiento-production-fa3a.up.railway.app
Admin: admin@seguimiento.com / Admin2024!
```

### **Repositorio**
```
GitHub: https://github.com/marugaul/seguimiento
Branch Principal: claude/gh-pages-l9p9C
```

### **Infraestructura**
```
Frontend: GitHub Pages (gratis)
Backend: Railway (gratis hasta $5/mes)
Base de Datos: SQLite en Railway
```

---

## 📋 Requisitos del Sistema

### **Para Usuarios Finales**
- Navegador web moderno (Chrome, Firefox, Edge, Safari)
- Conexión a internet
- Credenciales de acceso

### **Para Administradores/IT**
- Cuenta de GitHub (para código)
- Cuenta de Railway (para backend)
- Opcional: Cuenta de Azure (para migración)

---

## 🔒 Seguridad

### **Implementado**
- ✅ Contraseñas encriptadas con bcrypt
- ✅ Autenticación por sesión
- ✅ Validación de roles (admin/user)
- ✅ HTTPS en todas las comunicaciones
- ✅ Bitácora de accesos
- ✅ Protección contra eliminación del último admin

### **Recomendaciones**
- Cambiar contraseña de admin por defecto
- Usar contraseñas fuertes (mínimo 8 caracteres)
- Revisar bitácora regularmente
- Hacer backups periódicos de la base de datos

---

## 📞 Soporte

### **Documentación**
1. Leer el manual correspondiente a tu rol
2. Revisar la sección de troubleshooting
3. Verificar logs en Railway

### **Escalamiento**
1. Usuario final → Administrador del sistema
2. Administrador → Personal de IT
3. Personal de IT → Documentación técnica

---

## 📈 Roadmap Futuro

### **Corto Plazo (1-3 meses)**
- [ ] Migrar a Azure empresarial
- [ ] Implementar Azure SQL Database
- [ ] Integrar con Active Directory (SSO)

### **Mediano Plazo (3-6 meses)**
- [ ] Implementar JWT tokens
- [ ] Sistema de recuperación de contraseña
- [ ] Exportación de reportes (PDF/Excel)
- [ ] Notificaciones por email

### **Largo Plazo (6-12 meses)**
- [ ] Autenticación de dos factores (2FA)
- [ ] API REST pública
- [ ] Integración con MS Teams
- [ ] Dashboard personalizable

---

## 📝 Historial de Versiones

### **Versión 2.0** (Diciembre 2025)
- ✅ Backend SQLite con Railway
- ✅ Autenticación centralizada
- ✅ Gestión de usuarios con contraseñas individuales
- ✅ Bitácora de accesos
- ✅ Columnas de análisis de presupuesto

### **Versión 1.0** (Noviembre 2025)
- ✅ Dashboard básico
- ✅ Carga de Excel
- ✅ Autenticación con localStorage
- ✅ Gráficos y filtros

---

## 🏢 Información del Proyecto

**Desarrollado para:** Grupo Promérica
**Contacto IT:** [Insertar contacto]
**Última actualización:** 31 de Diciembre, 2025

---

## 📄 Licencia y Uso

Este sistema es de uso interno exclusivo de la organización. Está prohibida su distribución, modificación o uso fuera del ámbito autorizado sin permiso explícito.

---

**Para comenzar, selecciona el manual apropiado según tu rol:**
- 👨‍💻 Personal de IT → [Manual Técnico](./MANUAL_TECNICO.md)
- 👤 Usuarios finales → [Manual de Usuario](./MANUAL_USUARIO.md)
- 🔄 Migración → [Guía de Migración a Azure](./MIGRACION_AZURE.md)
