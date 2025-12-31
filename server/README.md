# Seguimiento - Backend Server

Backend servidor con SQLite para gestión de usuarios y autenticación del sistema de seguimiento de proyectos.

## Características

- ✅ Autenticación con email y contraseña
- ✅ Gestión completa de usuarios (CRUD)
- ✅ Sistema de roles (admin/user)
- ✅ Bitácora de accesos (audit logs)
- ✅ Base de datos SQLite
- ✅ API REST con Express.js
- ✅ Contraseñas encriptadas con bcrypt

## Requisitos

- Node.js 14+
- npm o yarn

## Instalación

1. Navegar al directorio del servidor:
```bash
cd server
```

2. Instalar dependencias:
```bash
npm install
```

3. Crear archivo de configuración:
```bash
cp .env.example .env
```

4. Editar `.env` según sea necesario (opcional):
```
PORT=3000
NODE_ENV=development
```

## Uso en Desarrollo

Iniciar el servidor en modo desarrollo:
```bash
npm run dev
```

O en modo producción:
```bash
npm start
```

El servidor estará disponible en `http://localhost:3000`

## Base de Datos

- La base de datos SQLite se crea automáticamente en `server/seguimiento.db`
- Se crea un usuario administrador por defecto:
  - Email: `admin@seguimiento.com`
  - Password: `Admin2024!`

### Tablas

**users**
- id (INTEGER PRIMARY KEY)
- email (TEXT UNIQUE)
- password (TEXT, bcrypt hash)
- role (TEXT: 'admin' o 'user')
- name (TEXT)
- created_at (DATETIME)
- updated_at (DATETIME)

**audit_logs**
- id (INTEGER PRIMARY KEY)
- email (TEXT)
- event_type (TEXT: 'login', 'logout', 'login_failed')
- details (TEXT, JSON)
- timestamp (DATETIME)

## API Endpoints

### Autenticación

**POST /api/auth/login**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña"
}
```

**POST /api/auth/logout**
```json
{
  "email": "usuario@ejemplo.com"
}
```

### Gestión de Usuarios (Admin only)

**GET /api/auth/users?role=admin**
Obtiene todos los usuarios

**POST /api/auth/users**
```json
{
  "email": "nuevo@ejemplo.com",
  "password": "contraseña",
  "name": "Nombre Usuario",
  "role": "user",
  "adminRole": "admin"
}
```

**PUT /api/auth/users/:email**
```json
{
  "name": "Nuevo Nombre",
  "password": "nueva_contraseña",
  "role": "admin",
  "adminRole": "admin"
}
```

**DELETE /api/auth/users/:email**
```json
{
  "adminRole": "admin"
}
```

### Bitácora de Accesos (Admin only)

**GET /api/auth/audit-logs?adminRole=admin&email=usuario@ejemplo.com**

Parámetros query:
- `adminRole`: debe ser 'admin'
- `email` (opcional): filtrar por usuario específico

## Despliegue en Producción

### Opción 1: Railway

1. Crear cuenta en [Railway](https://railway.app)
2. Instalar Railway CLI:
```bash
npm install -g @railway/cli
```

3. Login y deploy:
```bash
railway login
railway init
railway up
```

4. Configurar variables de entorno en Railway dashboard:
- `PORT`: (Railway lo configura automáticamente)
- `NODE_ENV`: production

### Opción 2: Heroku

1. Crear cuenta en [Heroku](https://heroku.com)
2. Instalar Heroku CLI
3. Deploy:
```bash
heroku create nombre-app
git push heroku main
```

### Opción 3: VPS (DigitalOcean, AWS, etc.)

1. Conectar al servidor via SSH
2. Instalar Node.js
3. Clonar repositorio
4. Instalar dependencias: `npm install --production`
5. Instalar PM2: `npm install -g pm2`
6. Iniciar con PM2: `pm2 start server.js --name seguimiento-api`
7. Configurar nginx como reverse proxy (opcional)

## Configuración del Frontend

Actualizar la URL del API en `/js/auth.js`:

```javascript
// Desarrollo
this.apiBaseUrl = 'http://localhost:3000/api/auth';

// Producción
this.apiBaseUrl = 'https://tu-servidor.com/api/auth';
```

## CORS

El servidor acepta peticiones desde cualquier origen por defecto. Para producción, editar `server.js`:

```javascript
app.use(cors({
  origin: 'https://tu-dominio-frontend.com'
}));
```

## Seguridad

- ✅ Contraseñas hasheadas con bcrypt (10 rounds)
- ✅ Validación de roles en endpoints
- ✅ Prevención de eliminación del último admin
- ⚠️ Implementar HTTPS en producción
- ⚠️ Implementar rate limiting (recomendado)
- ⚠️ Implementar JWT tokens para sesiones más seguras (futuro)

## Troubleshooting

**Error: "Cannot connect to server"**
- Verificar que el servidor esté corriendo
- Verificar la URL del API en `auth.js`
- Verificar que no haya problemas de CORS

**Error: "Usuario no encontrado"**
- Verificar que el usuario exista en la base de datos
- Los usuarios ahora se almacenan en SQLite, no en localStorage
- Todos los usuarios deben crearse desde el panel de administración

**La base de datos no se crea**
- Verificar permisos de escritura en el directorio `server/`
- Revisar logs del servidor para errores

## Migración desde localStorage

Los usuarios existentes en localStorage NO se migrarán automáticamente. El administrador debe:

1. Iniciar sesión con el usuario admin por defecto
2. Crear los usuarios nuevamente desde "Gestionar Accesos"
3. Asignar nuevas contraseñas a cada usuario

## Soporte

Para reportar problemas o solicitar ayuda, contactar al administrador del sistema.
