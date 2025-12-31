# Manual de Usuario
## Sistema de Seguimiento de Proyectos

**Versión:** 2.0
**Fecha:** Diciembre 2025
**Audiencia:** Usuarios Finales y Administradores

---

## 📑 Tabla de Contenidos

1. [Acceso al Sistema](#acceso-al-sistema)
2. [Primer Ingreso](#primer-ingreso)
3. [Dashboard Principal](#dashboard-principal)
4. [Cargar Archivo Excel](#cargar-archivo-excel)
5. [Filtros y Búsquedas](#filtros-y-búsquedas)
6. [Gráficos y Reportes](#gráficos-y-reportes)
7. [Gestión de Usuarios (Admin)](#gestión-de-usuarios-admin)
8. [Bitácora de Accesos (Admin)](#bitácora-de-accesos-admin)
9. [Preguntas Frecuentes](#preguntas-frecuentes)
10. [Soporte](#soporte)

---

## 🚀 Acceso al Sistema

### **URL del Sistema**

```
https://marugaul.github.io/seguimiento/index-railway.html
```

### **Requisitos**

✅ Navegador web moderno (Chrome, Firefox, Edge, Safari)
✅ Conexión a internet
✅ Credenciales de acceso (email y contraseña)

### **Navegadores Compatibles**

| Navegador | Versión Mínima | Recomendado |
|-----------|----------------|-------------|
| Chrome    | 90+            | ✅ Última versión |
| Firefox   | 88+            | ✅ Última versión |
| Edge      | 90+            | ✅ Última versión |
| Safari    | 14+            | ✅ Última versión |

---

## 🔐 Primer Ingreso

### **Paso 1: Abrir el Sistema**

1. Abre tu navegador web
2. Ingresa a: `https://marugaul.github.io/seguimiento/index-railway.html`
3. Verás la pantalla de login:

```
┌────────────────────────────────┐
│   🔒 Seguimiento de Proyectos │
│                                │
│   Correo Electrónico           │
│   [________________]           │
│                                │
│   Contraseña                   │
│   [________________]           │
│                                │
│   [  Iniciar Sesión  ]         │
└────────────────────────────────┘
```

### **Paso 2: Ingresar Credenciales**

1. **Email:** El correo que te proporcionó el administrador
2. **Contraseña:** La contraseña que te proporcionó el administrador

**Ejemplo:**
```
Email: usuario@empresa.com
Contraseña: TuPassword123!
```

### **Paso 3: Primer Inicio de Sesión Exitoso**

✅ Verás el dashboard principal
✅ Tu nombre aparecerá en la esquina superior derecha
✅ Tendrás acceso al menú de navegación

### **¿Olvidaste tu Contraseña?**

❌ **Actualmente no hay recuperación automática**
✅ **Solución:** Contacta al administrador para que te restablezca la contraseña

---

## 📊 Dashboard Principal

### **Componentes del Dashboard**

```
┌─────────────────────────────────────────────────────────┐
│ 📈 Seguimiento de Proyectos      | Usuario: Juan Pérez ▼│
├────┬──────────┬────────────┬─────────────┬─────────────┤
│🏠  │ Cargar  │ Gestionar  │    Logout   │             │
│    │ Excel   │ Accesos*   │             │             │
└────┴──────────┴────────────┴─────────────┴─────────────┘

┌─────────────── ESTADÍSTICAS ────────────────────────────┐
│ 📊 Total Proyectos: 45    💰 Presupuesto: $2.5M        │
│ ✅ Completados: 30        📈 Avance Prom: 75%          │
└─────────────────────────────────────────────────────────┘

┌─────────────── FILTROS ──────────────────────────────────┐
│ Buscar: [__________] 🔍                                  │
│ Gerente: [Todos ▼]  Depto: [Todos ▼]  Estado: [Todos ▼]│
└──────────────────────────────────────────────────────────┘

┌─────────────── TABLA DE PROYECTOS ───────────────────────┐
│ Nombre ↕ | Gerente ↕ | % Avance ↕ | Presup. ↕ | Estado │
├──────────┼───────────┼────────────┼───────────┼────────┤
│ PROJ-001 │ J. Pérez  │    75%     │  $50,000  │ 🟢     │
│ PROJ-002 │ M. López  │    90%     │  $75,000  │ 🟢     │
│ ...      │ ...       │    ...     │  ...      │ ...    │
└──────────┴───────────┴────────────┴───────────┴────────┘

┌─────────────── GRÁFICOS ──────────────────────────────────┐
│ 📊 Avance por Gerente    📈 Tendencia Mensual           │
│ [Gráfico de Barras]      [Gráfico de Líneas]            │
└───────────────────────────────────────────────────────────┘

* Solo visible para administradores
```

### **Navegación Principal**

| Menú | Descripción | Acceso |
|------|-------------|--------|
| 🏠 **Dashboard** | Página principal con estadísticas | Todos |
| 📁 **Cargar Excel** | Subir archivo de datos | Todos |
| 👥 **Gestionar Accesos** | Administrar usuarios | Solo Admin |
| 🚪 **Logout** | Cerrar sesión | Todos |

---

## 📁 Cargar Archivo Excel

### **Formato del Archivo Excel**

El sistema acepta archivos Excel (.xlsx) con la siguiente estructura:

**Columnas requeridas:**
1. **NOMBRE PROYECTO/INICIATIVA:** Nombre único del proyecto
2. **GERENTE RESPONSABLE:** Nombre del gerente
3. **HRS ESTIMADAS:** Horas totales estimadas
4. **HRS REGISTRADAS:** Horas trabajadas hasta la fecha
5. **% AVANCE REAL:** Porcentaje de avance del proyecto
6. **FEC. REGISTRO INICIATIVA:** Fecha de registro

**Ejemplo:**

| NOMBRE PROYECTO | GERENTE RESPONSABLE | HRS ESTIMADAS | HRS REGISTRADAS | % AVANCE REAL |
|----------------|---------------------|---------------|-----------------|---------------|
| PROJ-001       | Juan Pérez         | 100           | 75              | 0.75          |
| PROJ-002       | María López        | 200           | 180             | 0.90          |

### **Paso a Paso para Cargar Excel**

#### **Paso 1: Preparar el Archivo**

✅ Asegúrate que el archivo tiene todas las columnas requeridas
✅ Los datos están completos (sin celdas vacías en columnas importantes)
✅ El formato es .xlsx (no .xls o .csv)

#### **Paso 2: Subir el Archivo**

1. Click en **"Cargar Excel"** en el menú superior
2. Verás la pantalla de carga:

```
┌────────────────────────────────────────┐
│  📁 Cargar Archivo Excel               │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │                                  │ │
│  │   📤  Arrastra tu archivo aquí  │ │
│  │      o haz click para buscar    │ │
│  │                                  │ │
│  └──────────────────────────────────┘ │
│                                        │
│  Formatos aceptados: .xlsx             │
│  Tamaño máximo: 10 MB                  │
└────────────────────────────────────────┘
```

3. **Opción A:** Arrastra el archivo a la zona de carga
4. **Opción B:** Click en la zona y selecciona el archivo

#### **Paso 3: Procesamiento**

1. Verás una barra de progreso:
```
Procesando archivo...
████████████████░░░░ 80%
```

2. El sistema:
   - Lee las columnas del Excel
   - Calcula métricas automáticamente
   - Genera los gráficos
   - Actualiza las estadísticas

#### **Paso 4: Verificación**

✅ **Éxito:** Verás el mensaje "Archivo cargado correctamente"
✅ El dashboard se actualiza con los nuevos datos
✅ Los gráficos se regeneran automáticamente

❌ **Error:** Si hay un problema:
- Verás un mensaje de error explicando qué salió mal
- Revisa que el archivo tenga el formato correcto
- Intenta nuevamente

### **Consejos para Cargar Excel**

💡 **Tip 1:** Mantén una copia del archivo original
💡 **Tip 2:** Verifica los datos antes de cargar
💡 **Tip 3:** Si el archivo es muy grande, puede tardar unos segundos

---

## 🔍 Filtros y Búsquedas

### **Barra de Búsqueda**

**Ubicación:** Parte superior de la tabla

```
Buscar: [proyecto 001___] 🔍
```

**Búsqueda en tiempo real:**
- Escribe cualquier texto
- El sistema filtra automáticamente
- Busca en: Nombre de proyecto, Gerente, Departamento

**Ejemplos:**
```
"PROJ"      → Muestra todos los proyectos que contengan "PROJ"
"Juan"      → Muestra todos los proyectos de Juan
"IT"        → Muestra todos los proyectos del departamento IT
```

### **Filtros Avanzados**

#### **Filtro por Gerente**

```
Gerente: [Todos ▼]
         │
         ├─ Todos
         ├─ Juan Pérez
         ├─ María López
         └─ Carlos García
```

- Selecciona un gerente para ver solo sus proyectos
- "Todos" muestra todos los proyectos

#### **Filtro por Estado**

```
Estado: [Todos ▼]
        │
        ├─ Todos
        ├─ En Progreso
        ├─ Completado
        ├─ Retrasado
        └─ Cancelado
```

#### **Filtro por Desviación**

```
% Desviación: [Todos ▼]
              │
              ├─ Todos
              ├─ < 5% (Bueno)
              ├─ 5-10% (Aceptable)
              └─ > 10% (Crítico)
```

### **Combinar Filtros**

Puedes combinar múltiples filtros:

**Ejemplo:**
```
Buscar: "PROJ"
Gerente: "Juan Pérez"
Estado: "En Progreso"

→ Resultado: Proyectos de Juan Pérez que están en progreso
             y contienen "PROJ" en el nombre
```

### **Limpiar Filtros**

Click en **"Limpiar Filtros"** para volver a ver todos los proyectos

---

## 📊 Gráficos y Reportes

### **Tipos de Gráficos Disponibles**

#### **1. Avance por Gerente**

```
Gráfico de Barras Horizontales

Juan Pérez    ████████████░░ 75%
María López   ███████████░░░ 65%
Carlos García ██████████████ 90%
```

**Información mostrada:**
- Promedio de avance por gerente
- Comparación entre gerentes
- Identificación de mejores performers

#### **2. Distribución de Proyectos**

```
Gráfico de Dona/Pie

🟢 Completados: 45%
🟡 En Progreso: 35%
🔴 Retrasados: 20%
```

**Información mostrada:**
- Proporción de proyectos por estado
- Vista rápida del portafolio

#### **3. Tendencia de Avance**

```
Gráfico de Líneas

100% │                    ╱
 80% │              ╱─────
 60% │        ╱─────
 40% │  ╱─────
 20% │╱
     └───────────────────────
      Ene Feb Mar Abr May Jun
```

**Información mostrada:**
- Evolución del avance a lo largo del tiempo
- Tendencias positivas o negativas

### **Columnas de la Tabla**

| Columna | Descripción | Cálculo |
|---------|-------------|---------|
| **Nombre** | Nombre del proyecto | Del Excel |
| **Gerente** | Gerente responsable | Del Excel |
| **Hrs Estimadas** | Total horas estimadas | Del Excel |
| **Hrs Registradas** | Horas trabajadas | Del Excel |
| **% Avance Real** | Avance reportado | Del Excel |
| **% Desv.** | Desviación del plan | Calculado |
| **% Presup. Usado** | Porcentaje del presupuesto usado | (Registradas / Estimadas) × 100 |
| **Dif. Avance vs Presup.** | Diferencia entre avance y presupuesto | % Presup. Usado - % Avance Real |
| **Fecha Registro** | Cuando se registró | Del Excel |

### **Códigos de Color**

🟢 **Verde:** Todo bien (desviación < 5%)
🟡 **Amarillo:** Atención (desviación 5-10%)
🔴 **Rojo:** Crítico (desviación > 10%)

---

## 👥 Gestión de Usuarios (Admin)

**Nota:** Esta sección es solo para administradores

### **Acceder a Gestión de Usuarios**

1. Click en **"Gestionar Accesos"** en el menú
2. Verás la pantalla de gestión:

```
┌────────────────────────────────────────────┐
│  👥 Gestión de Usuarios                    │
├────────────────────────────────────────────┤
│                                            │
│  ➕ Crear Nuevo Usuario                    │
│  ┌──────────────────────────────────────┐ │
│  │ Email: [__________________]          │ │
│  │ Nombre: [__________________]         │ │
│  │ Contraseña: [__________________]     │ │
│  │ Rol: [Usuario ▼]                     │ │
│  │           └─ Usuario                 │ │
│  │           └─ Administrador           │ │
│  │                                      │ │
│  │ [  Crear Usuario  ]                  │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  📋 Usuarios del Sistema (3)               │
│  ┌──────────────────────────────────────┐ │
│  │ Email          │ Nombre   │ Acciones │ │
│  ├────────────────┼──────────┼─────────┤ │
│  │ admin@...      │ Admin    │ 🕐 ✏️ 🗑️ │ │
│  │ juan@...       │ Juan     │ 🕐 ✏️ 🗑️ │ │
│  │ maria@...      │ María    │ 🕐 ✏️ 🗑️ │ │
│  └────────────────┴──────────┴──────────┘ │
└────────────────────────────────────────────┘

🕐 = Ver bitácora
✏️ = Editar
🗑️ = Eliminar
```

### **Crear Nuevo Usuario**

#### **Paso 1: Completar Formulario**

1. **Email:** Dirección de correo del usuario
   - Debe ser único
   - Formato: usuario@dominio.com

2. **Nombre Completo:** Nombre del usuario
   - Ej: "Juan Pérez"

3. **Contraseña:** Contraseña temporal
   - Mínimo 6 caracteres
   - Recomendado: 8+ caracteres con números y símbolos
   - Ej: "Temporal123!"

4. **Rol:** Tipo de usuario
   - **Usuario:** Acceso solo al dashboard
   - **Administrador:** Acceso completo (gestión de usuarios)

#### **Paso 2: Crear Usuario**

1. Click en **"Crear Usuario"**
2. Verás confirmación: ✅ "Usuario creado exitosamente"
3. El usuario aparece en la tabla

#### **Paso 3: Comunicar Credenciales**

📧 **Envía al nuevo usuario:**
```
Asunto: Acceso al Sistema de Seguimiento de Proyectos

Hola [Nombre],

Te han dado acceso al Sistema de Seguimiento de Proyectos.

URL: https://marugaul.github.io/seguimiento/index-railway.html
Usuario: [email del usuario]
Contraseña Temporal: [contraseña]

Por favor cambia tu contraseña en tu primer ingreso.

Saludos,
[Tu nombre]
```

### **Editar Usuario**

1. Click en el botón ✏️ (Editar) del usuario
2. Se abre modal de edición:

```
┌──────────────────────────────────┐
│  ✏️ Editar Usuario                │
├──────────────────────────────────┤
│  Email: usuario@ejemplo.com      │
│  (No se puede cambiar)           │
│                                  │
│  Nombre: [Juan Pérez______]      │
│                                  │
│  Nueva Contraseña (opcional):    │
│  [__________________]            │
│                                  │
│  Rol: [Usuario ▼]                │
│                                  │
│  [Cancelar] [Guardar Cambios]    │
└──────────────────────────────────┘
```

3. Modificar los campos necesarios
4. Click en **"Guardar Cambios"**

**Notas:**
- El email NO se puede cambiar
- Si no ingresas nueva contraseña, se mantiene la actual
- Al cambiar rol a Admin, ten cuidado con los permisos

### **Eliminar Usuario**

⚠️ **PRECAUCIÓN:** Esta acción no se puede deshacer

1. Click en el botón 🗑️ (Eliminar) del usuario
2. Confirmar eliminación:

```
┌──────────────────────────────────┐
│  ⚠️ Confirmar Eliminación         │
├──────────────────────────────────┤
│  ¿Estás seguro de eliminar el    │
│  usuario: usuario@ejemplo.com?   │
│                                  │
│  Esta acción no se puede         │
│  deshacer.                       │
│                                  │
│  [Cancelar] [🗑️ Eliminar]        │
└──────────────────────────────────┘
```

3. Click en **"Eliminar"**

**Restricciones:**
- ❌ No puedes eliminar el último administrador
- ❌ No puedes eliminarte a ti mismo
- ✅ Puedes eliminar usuarios regulares

---

## 🕐 Bitácora de Accesos (Admin)

### **Ver Bitácora de un Usuario**

1. En la tabla de usuarios, click en 🕐 (Ver bitácora)
2. Se abre modal con historial:

```
┌──────────────────────────────────────────────┐
│  🕐 Bitácora de Acceso                       │
│  Usuario: Juan Pérez (juan@ejemplo.com)     │
│  Total de eventos: 15                        │
├──────────────────────────────────────────────┤
│  Fecha y Hora       │ Evento  │ Detalles     │
│  ───────────────────┼─────────┼──────────────│
│  31/12/2025 10:30  │ 🟢 Ingreso│ Rol: Usuario│
│  31/12/2025 12:45  │ 🔘 Salida │              │
│  31/12/2025 09:15  │ 🔴 Fallido│ Password err│
│  ...                │ ...      │ ...          │
└──────────────────────────────────────────────┘
```

### **Tipos de Eventos**

| Icono | Evento | Descripción |
|-------|--------|-------------|
| 🟢 | Ingreso | Login exitoso |
| 🔘 | Salida | Logout |
| 🔴 | Intento Fallido | Login fallido |

### **Información Mostrada**

- **Fecha y Hora:** Timestamp exacto del evento
- **Evento:** Tipo de evento (Ingreso/Salida/Fallido)
- **Detalles:** Información adicional (rol, razón de fallo)

### **Uso de la Bitácora**

**Casos de uso:**

1. **Auditoría de Seguridad**
   - Ver quién accede al sistema
   - Detectar intentos de acceso no autorizados

2. **Troubleshooting**
   - Ayudar a usuarios que no pueden ingresar
   - Ver si hay problemas recurrentes

3. **Compliance**
   - Mantener registro de accesos
   - Cumplir con políticas de seguridad

---

## ❓ Preguntas Frecuentes

### **Login y Acceso**

**P: ¿Qué hago si olvidé mi contraseña?**
R: Contacta al administrador para que te restablezca la contraseña.

**P: ¿Puedo cambiar mi contraseña?**
R: Sí, pide al administrador que te genere una nueva (próximamente autoservicio).

**P: ¿Por qué dice "Usuario no encontrado"?**
R: Tu cuenta no existe o fue eliminada. Contacta al administrador.

### **Carga de Excel**

**P: ¿Qué formato de Excel acepta?**
R: Solo archivos .xlsx (Excel 2007 o superior).

**P: ¿Cuál es el tamaño máximo del archivo?**
R: 10 MB máximo.

**P: ¿Se guardan los datos en el servidor?**
R: No, los datos del Excel solo se procesan en tu navegador. Al recargar la página, debes subir el archivo nuevamente.

**P: ¿Puedo subir múltiples archivos?**
R: Sí, pero solo uno a la vez. El último archivo cargado reemplaza al anterior.

### **Dashboard y Filtros**

**P: ¿Los filtros se guardan?**
R: No, al recargar la página los filtros se resetean.

**P: ¿Puedo exportar los datos?**
R: Actualmente no (función en desarrollo).

**P: ¿Los gráficos se actualizan automáticamente?**
R: Sí, cuando aplicas filtros o cargas un nuevo Excel.

### **Gestión de Usuarios (Admin)**

**P: ¿Cuántos administradores puede haber?**
R: Ilimitados, pero siempre debe haber al menos uno.

**P: ¿Puedo convertir un usuario en admin?**
R: Sí, editando el usuario y cambiando su rol.

**P: ¿Los usuarios pueden ver la bitácora?**
R: No, solo los administradores.

---

## 🆘 Soporte

### **Problemas Técnicos**

**Error en la página:**
1. Recarga la página (F5)
2. Limpia caché (Ctrl + F5)
3. Intenta con otro navegador
4. Contacta soporte IT

**No puedo hacer login:**
1. Verifica tu usuario y contraseña
2. Verifica que estás usando el link correcto
3. Contacta al administrador

**El Excel no carga:**
1. Verifica que el formato es .xlsx
2. Verifica que las columnas estén correctas
3. Intenta con un archivo más pequeño

### **Contacto**

```
📧 Email Soporte: [insertar email]
👤 Administrador: admin@seguimiento.com
📞 Teléfono IT: [insertar teléfono]
```

### **Horario de Soporte**

```
Lunes a Viernes: 8:00 AM - 6:00 PM
Sábados: 9:00 AM - 1:00 PM
Domingos: Cerrado
```

---

## 📚 Recursos Adicionales

### **Video Tutoriales**
- [Insertar link] Cómo usar el dashboard
- [Insertar link] Cómo cargar archivos Excel
- [Insertar link] Gestión de usuarios (admin)

### **Documentos**
- [Manual Técnico](./MANUAL_TECNICO.md) - Para IT
- [Arquitectura](./ARQUITECTURA.md) - Diagramas técnicos

---

**Última actualización:** 31 de Diciembre, 2025
**Versión del documento:** 1.0

**¿Necesitas más ayuda?** Contacta al administrador del sistema.
