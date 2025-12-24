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

function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');

    const result = authManager.login(email, password);

    if (result.success) {
        errorDiv.classList.add('d-none');
        showApp();
        showDashboard();
    } else {
        errorDiv.textContent = result.message;
        errorDiv.classList.remove('d-none');
    }
}

function logout() {
    if (confirm('¿Está seguro de cerrar sesión?')) {
        authManager.logout();
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
    document.getElementById('currentUser').textContent = authManager.getCurrentUser();
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
    const users = authManager.getAuthorizedUsers();
    const masterPassword = authManager.getMasterPassword();

    const manageAccessHtml = `
        <div class="row">
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header bg-primary text-white">
                        <h4 class="mb-0"><i class="bi bi-people"></i> Gestión de Accesos</h4>
                    </div>
                    <div class="card-body">
                        <div class="alert alert-warning">
                            <i class="bi bi-exclamation-triangle"></i>
                            <strong>Importante:</strong> Solo los correos electrónicos autorizados en esta lista
                            podrán acceder al sistema usando la contraseña maestra.
                        </div>

                        <!-- Formulario para agregar email -->
                        <div class="card mb-4">
                            <div class="card-header bg-light">
                                <h6 class="mb-0">Agregar Nuevo Usuario</h6>
                            </div>
                            <div class="card-body">
                                <form id="addUserForm" onsubmit="handleAddUser(event)">
                                    <div class="input-group">
                                        <span class="input-group-text">
                                            <i class="bi bi-envelope"></i>
                                        </span>
                                        <input type="email" class="form-control" id="newUserEmail"
                                               placeholder="usuario@ejemplo.com" required />
                                        <button type="submit" class="btn btn-success">
                                            <i class="bi bi-plus-circle"></i> Agregar
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        <!-- Lista de usuarios autorizados -->
                        <div class="card">
                            <div class="card-header bg-light">
                                <h6 class="mb-0">Usuarios Autorizados (${users.length})</h6>
                            </div>
                            <div class="card-body">
                                ${users.length === 0 ? `
                                    <div class="alert alert-info">
                                        <i class="bi bi-info-circle"></i>
                                        No hay usuarios autorizados actualmente.
                                    </div>
                                ` : `
                                    <div class="list-group">
                                        ${users.map(email => `
                                            <div class="list-group-item d-flex justify-content-between align-items-center">
                                                <div>
                                                    <i class="bi bi-person-check text-success"></i>
                                                    <strong>${email}</strong>
                                                </div>
                                                <button class="btn btn-danger btn-sm" onclick="handleRemoveUser('${email}')">
                                                    <i class="bi bi-trash"></i> Eliminar
                                                </button>
                                            </div>
                                        `).join('')}
                                    </div>
                                `}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-md-4">
                <div class="card">
                    <div class="card-header bg-info text-white">
                        <h5 class="mb-0"><i class="bi bi-info-circle"></i> Información</h5>
                    </div>
                    <div class="card-body">
                        <h6>Credenciales de Acceso</h6>
                        <div class="alert alert-secondary">
                            <p><strong>Contraseña del Sistema:</strong></p>
                            <code>${masterPassword}</code>
                            <p class="mt-2 mb-0">
                                <small class="text-muted">
                                    <i class="bi bi-shield-lock"></i>
                                    Todos los usuarios autorizados usan esta contraseña para ingresar
                                </small>
                            </p>
                        </div>

                        <hr />

                        <h6>Instrucciones</h6>
                        <ol>
                            <li>Agregue el correo electrónico del usuario que desea autorizar</li>
                            <li>Comparta la contraseña maestra con el usuario</li>
                            <li>El usuario podrá iniciar sesión con su correo y la contraseña</li>
                        </ol>

                        <div class="alert alert-danger mt-3">
                            <i class="bi bi-exclamation-octagon"></i>
                            <strong>Seguridad:</strong>
                            <small>
                                Para cambiar la contraseña maestra, edite el archivo
                                <code>js/auth.js</code> y modifique la variable
                                <code>masterPassword</code>
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.getElementById('manageAccessPage').innerHTML = manageAccessHtml;
}

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
