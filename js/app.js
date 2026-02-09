// Aplicación Principal
document.addEventListener('DOMContentLoaded', function () {
    initializeApp();
});

function initializeApp() {
    // Verificar autenticación
    if (authManager.isAuthenticated()) {
        showApp();
        showDashboard();
    } else {
        showLogin();
    }

    // Event Listener para el formulario de login
    document.getElementById('loginForm').addEventListener('submit', function (e) {
        e.preventDefault();
        handleLogin();
    });
}

async function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');

    const result = await authManager.login(email, password);

    if (result.success) {
        errorDiv.classList.add('d-none');
        showApp();
        showDashboard();
    } else {
        errorDiv.textContent = result.message;
        errorDiv.classList.remove('d-none');
    }
}

async function logout() {
    if (confirm('¿Está seguro de cerrar sesión?')) {
        await authManager.logout();
        showLogin();
    }
}

function showLogin() {
    document.getElementById('loginScreen').classList.remove('d-none');
    document.getElementById('appScreen').classList.add('d-none');
}

function showApp() {
    document.getElementById('loginScreen').classList.add('d-none');
    document.getElementById('appScreen').classList.remove('d-none');
    const user = authManager.getCurrentUser();
    document.getElementById('currentUser').textContent = user.name || user.email || user;

    // Ocultar menú "Gestionar Accesos" para usuarios no-admin
    const manageAccessMenuItem = document.getElementById('manageAccessMenuItem');
    if (manageAccessMenuItem) {
        if (authManager.isAdmin()) {
            manageAccessMenuItem.classList.remove('d-none');
        } else {
            manageAccessMenuItem.classList.add('d-none');
        }
    }
}

function showPage(pageName) {
    // Ocultar todas las páginas
    document.querySelectorAll('.page-content').forEach(page => {
        page.classList.add('d-none');
    });

    // Mostrar la página seleccionada
    document.getElementById(pageName + 'Page').classList.remove('d-none');

    // Actualizar navbar
    document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
        link.classList.remove('active');
    });
}

function showDashboard() {
    showPage('dashboard');
    dashboardManager.loadProjects();
    dashboardManager.render();
}

function showUpload() {
    showPage('upload');
    renderUploadPage();
}

function showManageAccess() {
    showPage('manageAccess');
    renderManageAccessPage();
}

function showReleaseMap() {
    showPage('releaseMap');
    releaseMapManager.render();
}

function renderUploadPage() {
    const uploadHtml = `
        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header bg-primary text-white">
                        <h4 class="mb-0"><i class="bi bi-upload"></i> Cargar Archivo Excel</h4>
                    </div>
                    <div class="card-body">
                        <div class="alert alert-info">
                            <i class="bi bi-info-circle"></i>
                            <strong>Instrucciones:</strong>
                            <ul class="mb-0 mt-2">
                                <li>Seleccione el archivo Excel de seguimiento de proyectos (.xls o .xlsx)</li>
                                <li>El archivo debe tener la estructura estándar de DETPROYECTOS</li>
                                <li>Los datos anteriores serán reemplazados por el nuevo archivo</li>
                                <li>Este proceso puede tomar unos segundos dependiendo del tamaño del archivo</li>
                            </ul>
                        </div>

                        <div class="mb-4">
                            <label for="fileInput" class="form-label">
                                <i class="bi bi-file-earmark-excel"></i> Archivo Excel
                            </label>
                            <input type="file" class="form-control form-control-lg" id="fileInput"
                                   accept=".xls,.xlsx" onchange="handleFileSelect(event)" />
                            <div class="form-text">
                                Formatos soportados: .xls, .xlsx
                            </div>
                        </div>

                        <div id="uploadProgress" class="d-none">
                            <div class="progress mb-3">
                                <div class="progress-bar progress-bar-striped progress-bar-animated"
                                     role="progressbar" style="width: 100%"></div>
                            </div>
                            <p class="text-center">Procesando archivo...</p>
                        </div>

                        <div class="d-grid gap-2">
                            <button class="btn btn-secondary" onclick="showDashboard()">
                                <i class="bi bi-arrow-left"></i> Volver al Dashboard
                            </button>
                        </div>
                    </div>
                </div>

                <div class="card mt-4">
                    <div class="card-header bg-light">
                        <h5 class="mb-0"><i class="bi bi-question-circle"></i> Preguntas Frecuentes</h5>
                    </div>
                    <div class="card-body">
                        <div class="accordion" id="faqAccordion">
                            <div class="accordion-item">
                                <h2 class="accordion-header">
                                    <button class="accordion-button" type="button" data-bs-toggle="collapse"
                                            data-bs-target="#faq1">
                                        ¿Con qué frecuencia debo actualizar el archivo?
                                    </button>
                                </h2>
                                <div id="faq1" class="accordion-collapse collapse show" data-bs-parent="#faqAccordion">
                                    <div class="accordion-body">
                                        Se recomienda actualizar el archivo diariamente para mantener la información
                                        sincronizada con el estado actual de los proyectos.
                                    </div>
                                </div>
                            </div>

                            <div class="accordion-item">
                                <h2 class="accordion-header">
                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                                            data-bs-target="#faq2">
                                        ¿Qué pasa si hay un error en el archivo?
                                    </button>
                                </h2>
                                <div id="faq2" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                                    <div class="accordion-body">
                                        El sistema validará la estructura del archivo y mostrará un mensaje de error
                                        si encuentra problemas. Los datos anteriores se mantendrán hasta que se cargue
                                        un archivo válido.
                                    </div>
                                </div>
                            </div>

                            <div class="accordion-item">
                                <h2 class="accordion-header">
                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                                            data-bs-target="#faq3">
                                        ¿Se respaldan los datos?
                                    </button>
                                </h2>
                                <div id="faq3" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                                    <div class="accordion-body">
                                        Los datos se almacenan localmente en el navegador (localStorage).
                                        Se recomienda mantener copias de seguridad de los archivos Excel originales.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.getElementById('uploadPage').innerHTML = uploadHtml;
}

async function handleFileSelect(event) {
    const file = event.target.files[0];

    if (!file) return;

    if (!file.name.endsWith('.xls') && !file.name.endsWith('.xlsx')) {
        showToast('Error: El archivo debe ser un Excel (.xls o .xlsx)', 'error');
        return;
    }

    try {
        // Mostrar progreso
        document.getElementById('uploadProgress').classList.remove('d-none');

        // Procesar archivo
        const result = await excelProcessor.processFile(file);

        if (result.success) {
            // Guardar proyectos
            storageManager.saveProjects(result.projects);

            // Ocultar progreso
            document.getElementById('uploadProgress').classList.add('d-none');

            // Mostrar mensaje de éxito
            showToast(`Archivo cargado exitosamente. ${result.count} proyectos procesados.`, 'success');

            // Volver al dashboard después de 2 segundos
            setTimeout(() => {
                showDashboard();
            }, 2000);
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        document.getElementById('uploadProgress').classList.add('d-none');
        showToast('Error al procesar el archivo: ' + error.message, 'error');
    }
}

function renderManageAccessPage() {
    // Verificar si el usuario es admin
    if (!authManager.isAdmin()) {
        const noAccessHtml = `
            <div class="alert alert-danger">
                <i class="bi bi-exclamation-triangle"></i>
                <strong>Acceso Denegado:</strong> Solo los administradores pueden gestionar usuarios.
            </div>
        `;
        document.getElementById('manageAccessPage').innerHTML = noAccessHtml;
        return;
    }

    const users = authManager.getAllUsers();
    const currentUser = authManager.getCurrentUser();

    const manageAccessHtml = `
        <div class="row">
            <div class="col-md-12">
                <div class="card">
                    <div class="card-header bg-primary text-white">
                        <h4 class="mb-0"><i class="bi bi-people"></i> Gestión de Usuarios</h4>
                    </div>
                    <div class="card-body">
                        <div class="alert alert-info">
                            <i class="bi bi-info-circle"></i>
                            <strong>Información:</strong> Desde aquí puedes crear usuarios con sus propias contraseñas,
                            editar sus datos y gestionar el acceso al sistema.
                        </div>

                        <!-- Formulario para crear usuario -->
                        <div class="card mb-4">
                            <div class="card-header bg-success text-white">
                                <h5 class="mb-0"><i class="bi bi-person-plus"></i> Crear Nuevo Usuario</h5>
                            </div>
                            <div class="card-body">
                                <form id="createUserForm" onsubmit="handleCreateUser(event)">
                                    <div class="row">
                                        <div class="col-md-6 mb-3">
                                            <label class="form-label">
                                                <i class="bi bi-envelope"></i> Correo Electrónico
                                            </label>
                                            <input type="email" class="form-control" id="newUserEmail"
                                                   placeholder="usuario@ejemplo.com" required />
                                        </div>
                                        <div class="col-md-6 mb-3">
                                            <label class="form-label">
                                                <i class="bi bi-person"></i> Nombre Completo
                                            </label>
                                            <input type="text" class="form-control" id="newUserName"
                                                   placeholder="Nombre del usuario" required />
                                        </div>
                                    </div>
                                    <div class="row">
                                        <div class="col-md-6 mb-3">
                                            <label class="form-label">
                                                <i class="bi bi-key"></i> Contraseña
                                            </label>
                                            <input type="text" class="form-control" id="newUserPassword"
                                                   placeholder="Contraseña del usuario" required
                                                   minlength="6" />
                                            <div class="form-text">Mínimo 6 caracteres</div>
                                        </div>
                                        <div class="col-md-6 mb-3">
                                            <label class="form-label">
                                                <i class="bi bi-shield"></i> Rol
                                            </label>
                                            <select class="form-select" id="newUserRole">
                                                <option value="user">Usuario</option>
                                                <option value="admin">Administrador</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="d-grid">
                                        <button type="submit" class="btn btn-success">
                                            <i class="bi bi-plus-circle"></i> Crear Usuario
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        <!-- Lista de usuarios -->
                        <div class="card">
                            <div class="card-header bg-light">
                                <h5 class="mb-0"><i class="bi bi-list"></i> Usuarios del Sistema (${users.length})</h5>
                            </div>
                            <div class="card-body">
                                <div class="table-responsive">
                                    <table class="table table-hover">
                                        <thead class="table-dark">
                                            <tr>
                                                <th><i class="bi bi-envelope"></i> Email</th>
                                                <th><i class="bi bi-person"></i> Nombre</th>
                                                <th><i class="bi bi-shield"></i> Rol</th>
                                                <th><i class="bi bi-key"></i> Contraseña</th>
                                                <th><i class="bi bi-calendar"></i> Creado</th>
                                                <th class="text-center"><i class="bi bi-gear"></i> Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${users.map(user => `
                                                <tr>
                                                    <td>
                                                        <strong>${user.email}</strong>
                                                        ${user.email === currentUser.email ? '<span class="badge bg-primary ms-2">Tú</span>' : ''}
                                                    </td>
                                                    <td>${user.name}</td>
                                                    <td>
                                                        <span class="badge ${user.role === 'admin' ? 'bg-danger' : 'bg-info'}">
                                                            ${user.role === 'admin' ? 'Admin' : 'Usuario'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <code class="text-muted">${user.password}</code>
                                                        <button class="btn btn-sm btn-outline-secondary ms-2"
                                                                onclick="copyToClipboard('${user.password}')"
                                                                title="Copiar contraseña">
                                                            <i class="bi bi-clipboard"></i>
                                                        </button>
                                                    </td>
                                                    <td>
                                                        <small class="text-muted">
                                                            ${new Date(user.createdAt).toLocaleDateString('es')}
                                                        </small>
                                                    </td>
                                                    <td class="text-center">
                                                        <button class="btn btn-sm btn-info me-1"
                                                                onclick="showAuditLogModal('${user.email}')"
                                                                title="Ver bitácora de acceso">
                                                            <i class="bi bi-clock-history"></i>
                                                        </button>
                                                        <button class="btn btn-sm btn-warning me-1"
                                                                onclick="showEditUserModal('${user.email}')"
                                                                title="Editar usuario">
                                                            <i class="bi bi-pencil"></i>
                                                        </button>
                                                        <button class="btn btn-sm btn-danger"
                                                                onclick="handleDeleteUser('${user.email}')"
                                                                title="Eliminar usuario"
                                                                ${user.email === currentUser.email ? 'disabled' : ''}>
                                                            <i class="bi bi-trash"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            `).join('')}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal para editar usuario -->
        <div class="modal fade" id="editUserModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header bg-warning">
                        <h5 class="modal-title"><i class="bi bi-pencil"></i> Editar Usuario</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="editUserForm">
                            <input type="hidden" id="editUserEmail" />
                            <div class="mb-3">
                                <label class="form-label">
                                    <i class="bi bi-person"></i> Nombre
                                </label>
                                <input type="text" class="form-control" id="editUserName" required />
                            </div>
                            <div class="mb-3">
                                <label class="form-label">
                                    <i class="bi bi-key"></i> Nueva Contraseña (dejar vacío para mantener actual)
                                </label>
                                <input type="text" class="form-control" id="editUserPassword"
                                       placeholder="Nueva contraseña" minlength="6" />
                            </div>
                            <div class="mb-3">
                                <label class="form-label">
                                    <i class="bi bi-shield"></i> Rol
                                </label>
                                <select class="form-select" id="editUserRole">
                                    <option value="user">Usuario</option>
                                    <option value="admin">Administrador</option>
                                </select>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-warning" onclick="handleUpdateUser()">
                            <i class="bi bi-save"></i> Guardar Cambios
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal para bitácora de acceso -->
        <div class="modal fade" id="auditLogModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-info text-white">
                        <h5 class="modal-title"><i class="bi bi-clock-history"></i> Bitácora de Acceso</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div id="auditLogContent">
                            <!-- El contenido se llenará dinámicamente -->
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.getElementById('manageAccessPage').innerHTML = manageAccessHtml;
}

function handleCreateUser(event) {
    event.preventDefault();

    const userData = {
        email: document.getElementById('newUserEmail').value,
        name: document.getElementById('newUserName').value,
        password: document.getElementById('newUserPassword').value,
        role: document.getElementById('newUserRole').value
    };

    const result = authManager.createUser(userData);

    if (result.success) {
        showToast(result.message, 'success');
        document.getElementById('createUserForm').reset();
        renderManageAccessPage();
    } else {
        showToast(result.message, 'error');
    }
}

function showEditUserModal(email) {
    const users = authManager.getAllUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
        showToast('Usuario no encontrado', 'error');
        return;
    }

    document.getElementById('editUserEmail').value = user.email;
    document.getElementById('editUserName').value = user.name;
    document.getElementById('editUserPassword').value = '';
    document.getElementById('editUserRole').value = user.role;

    const modal = new bootstrap.Modal(document.getElementById('editUserModal'));
    modal.show();
}

function handleUpdateUser() {
    const email = document.getElementById('editUserEmail').value;
    const updates = {
        name: document.getElementById('editUserName').value,
        role: document.getElementById('editUserRole').value
    };

    const newPassword = document.getElementById('editUserPassword').value;
    if (newPassword) {
        updates.password = newPassword;
    }

    const result = authManager.updateUser(email, updates);

    if (result.success) {
        showToast(result.message, 'success');
        const modal = bootstrap.Modal.getInstance(document.getElementById('editUserModal'));
        modal.hide();
        renderManageAccessPage();
    } else {
        showToast(result.message, 'error');
    }
}

function handleDeleteUser(email) {
    if (confirm(`¿Está seguro de eliminar el usuario ${email}?\n\nEsta acción no se puede deshacer.`)) {
        const result = authManager.deleteUser(email);

        if (result.success) {
            showToast(result.message, 'success');
            renderManageAccessPage();
        } else {
            showToast(result.message, 'error');
        }
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Contraseña copiada al portapapeles', 'success');
    }).catch(() => {
        showToast('Error al copiar la contraseña', 'error');
    });
}

function showAuditLogModal(email) {
    if (!authManager.isAdmin()) {
        showToast('Solo los administradores pueden ver la bitácora', 'error');
        return;
    }

    const users = authManager.getAllUsers();
    const user = users.find(u => u.email === email);
    const logs = authManager.getAuditLogs(email);

    const eventTypeLabels = {
        'login': '<span class="badge bg-success">Ingreso</span>',
        'logout': '<span class="badge bg-secondary">Salida</span>',
        'login_failed': '<span class="badge bg-danger">Intento Fallido</span>'
    };

    const auditLogHtml = `
        <div class="mb-3">
            <h6>Usuario: <strong>${user ? user.name : email}</strong> (${email})</h6>
            <p class="text-muted">Total de eventos: ${logs.length}</p>
        </div>

        ${logs.length === 0 ? `
            <div class="alert alert-info">
                <i class="bi bi-info-circle"></i>
                No hay registros de acceso para este usuario.
            </div>
        ` : `
            <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
                <table class="table table-sm table-hover">
                    <thead class="table-dark sticky-top">
                        <tr>
                            <th>Fecha y Hora</th>
                            <th>Evento</th>
                            <th>Detalles</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${logs.slice().reverse().map(log => `
                            <tr>
                                <td>
                                    <small>
                                        ${new Date(log.timestamp).toLocaleString('es-ES', {
                                            year: 'numeric',
                                            month: '2-digit',
                                            day: '2-digit',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            second: '2-digit'
                                        })}
                                    </small>
                                </td>
                                <td>${eventTypeLabels[log.eventType] || log.eventType}</td>
                                <td>
                                    <small class="text-muted">
                                        ${log.details.reason ? log.details.reason :
                                          log.details.role ? `Rol: ${log.details.role}` : '-'}
                                    </small>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `}
    `;

    document.getElementById('auditLogContent').innerHTML = auditLogHtml;

    const modal = new bootstrap.Modal(document.getElementById('auditLogModal'));
    modal.show();
}

// Funciones de compatibilidad (por si acaso)
function handleAddUser(event) {
    event.preventDefault();
    const email = document.getElementById('newUserEmail').value;
    const result = authManager.addUser(email);
    if (result.success) {
        showToast(result.message, 'success');
        document.getElementById('newUserEmail').value = '';
        renderManageAccessPage();
    } else {
        showToast(result.message, 'error');
    }
}

function handleRemoveUser(email) {
    if (confirm(`¿Está seguro de eliminar el usuario ${email}?`)) {
        const result = authManager.removeUser(email);
        showToast(result.message, 'success');
        renderManageAccessPage();
    }
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('mainToast');
    const toastBody = toast.querySelector('.toast-body');

    toastBody.textContent = message;

    // Cambiar color según tipo
    toast.classList.remove('bg-success', 'bg-danger', 'bg-info');
    if (type === 'success') {
        toast.classList.add('bg-success', 'text-white');
    } else if (type === 'error') {
        toast.classList.add('bg-danger', 'text-white');
    } else {
        toast.classList.add('bg-info', 'text-white');
    }

    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
}
