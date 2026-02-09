# Gestión de Usuarios - Sistema de Seguimiento

## Usuarios Iniciales

El sistema viene con 4 usuarios predefinidos en `data/users.json`:

### 1. Administrador
- **Email:** admin@seguimiento.com
- **Password:** Admin2024!
- **Rol:** admin
- **Permisos:** Acceso completo + gestión de usuarios

### 2. Delivery Manager
- **Email:** delivery@seguimiento.com
- **Password:** Delivery2024!
- **Rol:** delivery_manager
- **Permisos:** Gestión de proyectos y mapa de liberaciones

### 3. Líder Técnico
- **Email:** lider@seguimiento.com
- **Password:** Lider2024!
- **Rol:** lider_tecnico
- **Permisos:** Visualización y edición de proyectos asignados

### 4. Visualizador
- **Email:** viewer@seguimiento.com
- **Password:** Viewer2024!
- **Rol:** viewer
- **Permisos:** Solo lectura

## Cómo Funciona el Sistema de Autenticación

### Almacenamiento Frontend (localStorage)

1. **Primera carga:** Los usuarios se cargan automáticamente desde `data/users.json` a localStorage
2. **Uso continuo:** Todos los usuarios se gestionan en localStorage del navegador
3. **No requiere backend:** Funciona completamente en el cliente

### Gestión de Usuarios (Solo Administradores)

Los administradores pueden:
- ✅ Crear nuevos usuarios
- ✅ Editar usuarios existentes
- ✅ Desactivar/activar usuarios
- ✅ Eliminar usuarios (excepto el último admin)
- ✅ Exportar usuarios a JSON (backup)
- ✅ Importar usuarios desde JSON

### Logs de Auditoría

El sistema registra automáticamente:
- Intentos de login (exitosos y fallidos)
- Creación de usuarios
- Modificación de usuarios
- Eliminación de usuarios
- Logout de usuarios

## Agregar Nuevos Usuarios

### Opción 1: Desde la Interfaz (Recomendado)

1. Iniciar sesión como administrador
2. Ir a la sección de "Usuarios" en el menú
3. Hacer clic en "Crear Nuevo Usuario"
4. Llenar el formulario:
   - Email (único)
   - Contraseña (mínimo 8 caracteres)
   - Nombre
   - Rol (admin, delivery_manager, lider_tecnico, viewer)
5. Guardar

### Opción 2: Editar el Archivo JSON Directamente

1. Abrir `data/users.json`
2. Agregar un nuevo objeto con la estructura:

```json
{
  "id": "5",
  "email": "nuevo@seguimiento.com",
  "password": "Contraseña123!",
  "nombre": "Nombre Completo",
  "rol": "viewer",
  "activo": true,
  "fechaCreacion": "2024-02-09T00:00:00.000Z"
}
```

3. **IMPORTANTE:** Después de editar el archivo, limpiar localStorage:
   - Abrir consola del navegador (F12)
   - Ejecutar: `localStorage.removeItem('seguimiento_users')`
   - Recargar la página (F5)

### Opción 3: Importar desde Archivo JSON

1. Iniciar sesión como administrador
2. Exportar usuarios actuales (backup)
3. Editar el archivo JSON descargado
4. Importar el archivo modificado desde la interfaz

## Backup y Restauración

### Hacer Backup

1. Login como admin
2. Ir a "Usuarios"
3. Clic en "Exportar Usuarios"
4. Se descarga `usuarios_backup_YYYY-MM-DD.json`

### Restaurar desde Backup

1. Login como admin
2. Ir a "Usuarios"
3. Clic en "Importar Usuarios"
4. Seleccionar el archivo JSON de backup
5. Confirmar importación

## Roles y Permisos

| Función | Admin | Delivery Manager | Líder Técnico | Viewer |
|---------|-------|------------------|---------------|--------|
| Ver Dashboard | ✅ | ✅ | ✅ | ✅ |
| Crear Proyectos | ✅ | ✅ | ✅ | ❌ |
| Editar Proyectos | ✅ | ✅ | ✅ (propios) | ❌ |
| Eliminar Proyectos | ✅ | ✅ | ❌ | ❌ |
| Mapa de Liberaciones | ✅ | ✅ | ✅ | ✅ |
| Gestionar Usuarios | ✅ | ❌ | ❌ | ❌ |
| Ver Logs de Auditoría | ✅ | ❌ | ❌ | ❌ |

## Seguridad

⚠️ **IMPORTANTE:**
- Las contraseñas se almacenan en **texto plano** en localStorage
- Esto es adecuado para uso interno/demo, NO para producción
- Para producción, implementar:
  - Backend con hash de contraseñas (bcrypt)
  - Tokens JWT
  - HTTPS
  - Políticas de contraseñas fuertes

## Resetear Todo

Si necesitas volver al estado inicial:

```javascript
// En la consola del navegador (F12)
localStorage.clear();
location.reload();
```

Esto eliminará todos los datos (usuarios, proyectos, sesiones) y recargará los usuarios iniciales de `data/users.json`.

## Soporte

Para modificar la estructura de usuarios o agregar campos personalizados, edita:
- `data/users.json` - Usuarios iniciales
- `js/auth.js` - Lógica de autenticación
- `js/app.js` - Interfaz de gestión de usuarios
