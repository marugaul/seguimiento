# Configuración del Backend - Cambios Importantes

## ⚠️ CAMBIO IMPORTANTE: localStorage → SQLite Database

El sistema de autenticación y gestión de usuarios ha sido migrado de **localStorage** (almacenamiento local del navegador) a una **base de datos SQLite** con backend en Node.js.

### ¿Por qué este cambio?

**Problema anterior:**
- localStorage es local a cada navegador
- Los usuarios creados en un navegador no existían en otros navegadores
- No era posible compartir usuarios entre diferentes computadoras
- Error común: "Usuario no encontrado" cuando otros usuarios intentaban acceder

**Solución actual:**
- Base de datos centralizada con SQLite
- Un solo servidor maneja todos los usuarios
- Los usuarios pueden acceder desde cualquier computadora de la red
- Sistema de autenticación real y robusto

## Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (HTML/JS)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │   Dashboard  │  │    Login     │  │  User Manager   │   │
│  └──────────────┘  └──────────────┘  └─────────────────┘   │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            │ HTTP/API Calls
                            │ (fetch requests)
                            │
┌───────────────────────────▼─────────────────────────────────┐
│              Backend Server (Node.js/Express)               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │               API REST Endpoints                     │   │
│  │  • POST /api/auth/login                              │   │
│  │  • POST /api/auth/logout                             │   │
│  │  • GET /api/auth/users                               │   │
│  │  • POST /api/auth/users                              │   │
│  │  • PUT /api/auth/users/:email                        │   │
│  │  • DELETE /api/auth/users/:email                     │   │
│  │  • GET /api/auth/audit-logs                          │   │
│  └──────────────────────────────────────────────────────┘   │
│                            │                                 │
│                            ▼                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │          SQLite Database (seguimiento.db)            │   │
│  │  ┌──────────────┐          ┌─────────────────┐      │   │
│  │  │ users table  │          │ audit_logs table│      │   │
│  │  └──────────────┘          └─────────────────┘      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Pasos para Implementar

### 1. Instalar el Backend

```bash
cd server
npm install
```

### 2. Iniciar el Servidor

**En desarrollo:**
```bash
cd server
npm run dev
```

**En producción (con PM2):**
```bash
npm install -g pm2
cd server
pm2 start server.js --name seguimiento-api
pm2 save
pm2 startup
```

### 3. Configurar el Frontend

Editar `/js/auth.js` línea 6:

**Para desarrollo local:**
```javascript
this.apiBaseUrl = 'http://localhost:3000/api/auth';
```

**Para producción:**
```javascript
this.apiBaseUrl = 'https://tu-servidor.com/api/auth';
```

### 4. Acceso Inicial

El sistema crea automáticamente un usuario administrador:
- Email: `admin@seguimiento.com`
- Contraseña: `Admin2024!`

Usar estas credenciales para el primer acceso y crear los demás usuarios.

## Opciones de Despliegue

### Opción 1: Servidor Local (Red Interna)

**Requisitos:**
- Computadora que esté siempre encendida
- Node.js instalado
- Red local accesible

**Ventajas:**
- ✅ Control total
- ✅ Sin costos externos
- ✅ Datos en tu servidor

**Desventajas:**
- ❌ Requiere mantenimiento
- ❌ Solo accesible en red local
- ❌ Necesita configurar firewall

**Configuración:**
```bash
# En el servidor
cd server
npm install
npm start

# El servidor estará en http://IP-DEL-SERVIDOR:3000
```

Luego actualizar `auth.js`:
```javascript
this.apiBaseUrl = 'http://192.168.1.100:3000/api/auth'; // IP de tu servidor
```

### Opción 2: Railway (Recomendado - Fácil y Gratis)

**Ventajas:**
- ✅ Deploy en 2 minutos
- ✅ HTTPS automático
- ✅ Free tier disponible
- ✅ Accesible desde internet

**Pasos:**
1. Crear cuenta en https://railway.app
2. Click en "New Project" → "Deploy from GitHub"
3. Conectar tu repositorio
4. Seleccionar la carpeta `/server`
5. Railway detectará Node.js automáticamente
6. Click "Deploy"
7. Copiar la URL generada (ej: `https://seguimiento-api.up.railway.app`)
8. Actualizar `auth.js` con esa URL

### Opción 3: Heroku

```bash
# Instalar Heroku CLI
# Crear Procfile en /server:
echo "web: node server.js" > server/Procfile

# Deploy
heroku login
heroku create nombre-app
git subtree push --prefix server heroku main
```

### Opción 4: VPS (DigitalOcean, Linode, AWS EC2)

**Ventajas:**
- ✅ Control total
- ✅ Escalable
- ✅ Profesional

**Desventajas:**
- ❌ Requiere conocimientos técnicos
- ❌ Configuración más compleja

Ver documentación en `/server/README.md` para detalles.

## Migración de Usuarios Existentes

⚠️ **IMPORTANTE:** Los usuarios en localStorage NO se migrarán automáticamente.

### Proceso de Migración:

1. **Hacer backup de usuarios actuales:**
   - Abrir consola del navegador (F12)
   - Ejecutar: `console.log(localStorage.getItem('seguimiento_users_v2'))`
   - Copiar y guardar la salida

2. **Iniciar sesión como admin:**
   - Email: `admin@seguimiento.com`
   - Password: `Admin2024!`

3. **Recrear usuarios:**
   - Ir a "Gestionar Accesos"
   - Crear cada usuario con sus datos
   - Asignar nuevas contraseñas temporales
   - Comunicar las credenciales a cada usuario

4. **Los usuarios deben:**
   - Iniciar sesión con la nueva contraseña
   - (Opcional) Solicitar cambio de contraseña al admin

## Verificación del Sistema

### 1. Backend funcionando
```bash
curl http://localhost:3000/api/health
# Debe responder: {"status":"OK","message":"Server is running"}
```

### 2. Base de datos creada
```bash
ls server/seguimiento.db
# Debe existir el archivo
```

### 3. Login funcionando
- Abrir la aplicación
- Intentar login con admin@seguimiento.com / Admin2024!
- Debe acceder correctamente

### 4. Crear usuario de prueba
- Ir a "Gestionar Accesos"
- Crear un usuario nuevo
- Intentar login desde otro navegador o computadora
- ✅ Debe funcionar (esto antes NO funcionaba)

## Troubleshooting

### Error: "Error de conexión con el servidor"

**Causa:** Frontend no puede conectar con el backend

**Solución:**
1. Verificar que el servidor esté corriendo: `curl http://localhost:3000/api/health`
2. Verificar la URL en `auth.js` línea 6
3. Revisar la consola del navegador (F12) para ver el error exacto
4. Si usas HTTPS en el frontend, el backend también debe usar HTTPS

### Error: "CORS policy"

**Causa:** Política de seguridad del navegador

**Solución en server/server.js:**
```javascript
app.use(cors({
  origin: ['http://localhost:8080', 'https://tu-dominio.com'],
  credentials: true
}));
```

### Error: "Usuario no encontrado" (después de migración)

**Causa:** El usuario aún está en localStorage, no en la base de datos

**Solución:**
- El admin debe crear el usuario en "Gestionar Accesos"
- Los usuarios antiguos de localStorage ya no funcionan

### Backend se cierra al cerrar la terminal

**Solución:** Usar PM2 o nohup
```bash
# Opción 1: PM2 (recomendado)
npm install -g pm2
pm2 start server/server.js --name seguimiento-api
pm2 save

# Opción 2: nohup
nohup node server/server.js > server.log 2>&1 &
```

## Próximos Pasos (Mejoras Futuras)

- [ ] Implementar JWT tokens para sesiones
- [ ] Sistema de recuperación de contraseña
- [ ] Rate limiting para prevenir ataques
- [ ] Logs de servidor con rotación
- [ ] Backup automático de la base de datos
- [ ] Panel de administración mejorado
- [ ] Autenticación de dos factores (2FA)

## Contacto y Soporte

Para preguntas o problemas, contactar al administrador del sistema.

---

**Documentación completa del backend:** Ver `/server/README.md`
