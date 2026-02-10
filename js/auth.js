// Gestión de Autenticación con fallback para Safari
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.storageKey = 'seguimiento_auth';
        this.usersKey = 'seguimiento_users';
        this.auditLogKey = 'seguimiento_audit_log';
        this.initialized = false;

        // Storage en memoria como fallback
        this.memoryStorage = {
            users: null,
            auth: null,
            logs: []
        };

        // Detectar si localStorage está disponible
        this.storageAvailable = this.checkStorageAvailable();

        if (!this.storageAvailable) {
            console.warn('⚠️ localStorage no disponible - usando memoria');
            console.warn('Nota: Los datos se perderán al cerrar la página');
        }

        // Inicializar usuarios de forma síncrona
        this.initializeUsersSync();
        this.checkCurrentUser();
    }

    checkStorageAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    // Abstracción de almacenamiento
    setItem(key, value) {
        if (this.storageAvailable) {
            try {
                localStorage.setItem(key, value);
            } catch (e) {
                console.error('Error guardando en localStorage:', e);
                // Fallback a memoria
                if (key === this.usersKey) this.memoryStorage.users = value;
                else if (key === this.storageKey) this.memoryStorage.auth = value;
            }
        } else {
            // Usar memoria
            if (key === this.usersKey) this.memoryStorage.users = value;
            else if (key === this.storageKey) this.memoryStorage.auth = value;
            else if (key === this.auditLogKey) this.memoryStorage.logs = value;
        }
    }

    getItem(key) {
        if (this.storageAvailable) {
            try {
                return localStorage.getItem(key);
            } catch (e) {
                console.error('Error leyendo de localStorage:', e);
                // Fallback a memoria
                if (key === this.usersKey) return this.memoryStorage.users;
                else if (key === this.storageKey) return this.memoryStorage.auth;
                else if (key === this.auditLogKey) return this.memoryStorage.logs;
                return null;
            }
        } else {
            // Usar memoria
            if (key === this.usersKey) return this.memoryStorage.users;
            else if (key === this.storageKey) return this.memoryStorage.auth;
            else if (key === this.auditLogKey) return this.memoryStorage.logs;
            return null;
        }
    }

    removeItem(key) {
        if (this.storageAvailable) {
            try {
                localStorage.removeItem(key);
            } catch (e) {
                console.error('Error eliminando de localStorage:', e);
            }
        }
        // Siempre limpiar memoria también
        if (key === this.usersKey) this.memoryStorage.users = null;
        else if (key === this.storageKey) this.memoryStorage.auth = null;
        else if (key === this.auditLogKey) this.memoryStorage.logs = [];
    }

    initializeUsersSync() {
        const existingUsers = this.getItem(this.usersKey);

        if (!existingUsers) {
            console.log('No hay usuarios. Creando usuarios por defecto...');

            // Crear usuarios por defecto inmediatamente (no async)
            const defaultUsers = [
                {
                    id: "1",
                    email: "admin@seguimiento.com",
                    password: "Admin2024!",
                    nombre: "Administrador",
                    rol: "admin",
                    activo: true,
                    fechaCreacion: new Date().toISOString()
                },
                {
                    id: "2",
                    email: "delivery@seguimiento.com",
                    password: "Delivery2024!",
                    nombre: "Delivery Manager",
                    rol: "delivery_manager",
                    activo: true,
                    fechaCreacion: new Date().toISOString()
                },
                {
                    id: "3",
                    email: "lider@seguimiento.com",
                    password: "Lider2024!",
                    nombre: "Líder Técnico",
                    rol: "lider_tecnico",
                    activo: true,
                    fechaCreacion: new Date().toISOString()
                },
                {
                    id: "4",
                    email: "viewer@seguimiento.com",
                    password: "Viewer2024!",
                    nombre: "Visualizador",
                    rol: "viewer",
                    activo: true,
                    fechaCreacion: new Date().toISOString()
                }
            ];

            this.setItem(this.usersKey, JSON.stringify(defaultUsers));
            console.log('✅ Usuarios por defecto creados:', defaultUsers.length);
            console.table(defaultUsers.map(u => ({ email: u.email, password: u.password, rol: u.rol })));
        } else {
            const users = JSON.parse(existingUsers);
            console.log('✅ Usuarios cargados:', users.length);
            console.table(users.map(u => ({ email: u.email, rol: u.rol, activo: u.activo })));
        }

        this.initialized = true;
    }

    checkCurrentUser() {
        const authData = this.getItem(this.storageKey);
        if (authData) {
            try {
                this.currentUser = JSON.parse(authData);
                console.log('Usuario en sesión:', this.currentUser.email);
            } catch {
                this.currentUser = null;
            }
        }
    }

    async login(email, password) {
        try {
            console.log('=== Intento de Login ===');
            console.log('Email:', email);
            console.log('Password length:', password.length);
            console.log('Storage disponible:', this.storageAvailable ? 'localStorage' : 'memoria');

            const users = this.getAllUsers();
            console.log('Total usuarios en BD:', users.length);

            const user = users.find(u =>
                u.email.toLowerCase() === email.toLowerCase() &&
                u.activo === true
            );

            if (!user) {
                console.error('❌ Usuario no encontrado o inactivo');
                this.logAudit({
                    tipo: 'login_fallido',
                    email: email,
                    mensaje: 'Usuario no encontrado o inactivo'
                });
                return { success: false, message: 'Usuario no encontrado o inactivo' };
            }

            console.log('Usuario encontrado:', user.email);
            console.log('Password esperado:', user.password);
            console.log('Password recibido:', password);
            console.log('Passwords coinciden:', user.password === password);

            // Verificar password
            if (user.password !== password) {
                console.error('❌ Contraseña incorrecta');
                this.logAudit({
                    tipo: 'login_fallido',
                    email: email,
                    mensaje: 'Contraseña incorrecta'
                });
                return { success: false, message: 'Contraseña incorrecta' };
            }

            // Login exitoso
            const userSession = {
                id: user.id,
                email: user.email,
                nombre: user.nombre,
                role: user.rol,
                rol: user.rol // Mantener compatibilidad
            };

            this.currentUser = userSession;
            this.setItem(this.storageKey, JSON.stringify(userSession));

            this.logAudit({
                tipo: 'login',
                email: user.email,
                mensaje: 'Login exitoso'
            });

            console.log('✅ Login exitoso');
            return { success: true };
        } catch (error) {
            console.error('❌ Error en login:', error);
            return { success: false, message: 'Error al procesar el login' };
        }
    }

    async logout() {
        try {
            const user = this.getCurrentUser();
            if (user && user.email) {
                this.logAudit({
                    tipo: 'logout',
                    email: user.email,
                    mensaje: 'Logout exitoso'
                });
            }
        } catch (error) {
            console.error('Error en logout:', error);
        } finally {
            this.currentUser = null;
            this.removeItem(this.storageKey);
        }
    }

    isAuthenticated() {
        const authData = this.getItem(this.storageKey);
        if (!authData) return false;

        try {
            const data = JSON.parse(authData);
            this.currentUser = data;
            return true;
        } catch {
            return false;
        }
    }

    getCurrentUser() {
        if (!this.currentUser) {
            const authData = this.getItem(this.storageKey);
            if (authData) {
                try {
                    this.currentUser = JSON.parse(authData);
                } catch {
                    this.currentUser = null;
                }
            }
        }
        return this.currentUser;
    }

    isAdmin() {
        const user = this.getCurrentUser();
        return user && (user.role === 'admin' || user.rol === 'admin');
    }

    getAllUsers() {
        try {
            const usersData = this.getItem(this.usersKey);
            if (!usersData) {
                console.warn('⚠️ No hay usuarios. Reinicializando...');
                this.initializeUsersSync();
                const newUsersData = this.getItem(this.usersKey);
                return newUsersData ? JSON.parse(newUsersData) : [];
            }
            return JSON.parse(usersData);
        } catch (error) {
            console.error('Error obteniendo usuarios:', error);
            return [];
        }
    }

    async createUser(userData) {
        if (!this.isAdmin()) {
            return { success: false, message: 'Solo los administradores pueden crear usuarios' };
        }

        try {
            const users = this.getAllUsers();

            // Validar que el email no exista
            const existingUser = users.find(u =>
                u.email.toLowerCase() === userData.email.toLowerCase()
            );

            if (existingUser) {
                return { success: false, message: 'El email ya está registrado' };
            }

            // Validar password (mínimo 8 caracteres)
            if (!userData.password || userData.password.length < 8) {
                return { success: false, message: 'La contraseña debe tener al menos 8 caracteres' };
            }

            // Crear nuevo usuario
            const newUser = {
                id: String(Date.now()),
                email: userData.email,
                password: userData.password,
                nombre: userData.nombre || userData.email,
                rol: userData.rol || 'viewer',
                activo: true,
                fechaCreacion: new Date().toISOString()
            };

            users.push(newUser);
            this.setItem(this.usersKey, JSON.stringify(users));

            this.logAudit({
                tipo: 'crear_usuario',
                email: this.getCurrentUser().email,
                mensaje: `Usuario ${newUser.email} creado con rol ${newUser.rol}`
            });

            return { success: true, message: 'Usuario creado exitosamente' };
        } catch (error) {
            console.error('Error creando usuario:', error);
            return { success: false, message: 'Error al crear usuario' };
        }
    }

    async updateUser(email, updates) {
        if (!this.isAdmin()) {
            return { success: false, message: 'Solo los administradores pueden actualizar usuarios' };
        }

        try {
            const users = this.getAllUsers();
            const userIndex = users.findIndex(u =>
                u.email.toLowerCase() === email.toLowerCase()
            );

            if (userIndex === -1) {
                return { success: false, message: 'Usuario no encontrado' };
            }

            // No permitir desactivar el último admin
            if (updates.activo === false && users[userIndex].rol === 'admin') {
                const activeAdmins = users.filter(u => u.rol === 'admin' && u.activo);
                if (activeAdmins.length <= 1) {
                    return { success: false, message: 'No se puede desactivar el último administrador' };
                }
            }

            // Actualizar usuario
            users[userIndex] = {
                ...users[userIndex],
                ...updates,
                id: users[userIndex].id, // Mantener ID original
                email: users[userIndex].email, // No permitir cambiar email
                fechaCreacion: users[userIndex].fechaCreacion // Mantener fecha creación
            };

            this.setItem(this.usersKey, JSON.stringify(users));

            this.logAudit({
                tipo: 'actualizar_usuario',
                email: this.getCurrentUser().email,
                mensaje: `Usuario ${email} actualizado`
            });

            return { success: true, message: 'Usuario actualizado exitosamente' };
        } catch (error) {
            console.error('Error actualizando usuario:', error);
            return { success: false, message: 'Error al actualizar usuario' };
        }
    }

    async deleteUser(email) {
        if (!this.isAdmin()) {
            return { success: false, message: 'Solo los administradores pueden eliminar usuarios' };
        }

        try {
            const users = this.getAllUsers();
            const userToDelete = users.find(u =>
                u.email.toLowerCase() === email.toLowerCase()
            );

            if (!userToDelete) {
                return { success: false, message: 'Usuario no encontrado' };
            }

            // No permitir eliminar el último admin
            if (userToDelete.rol === 'admin') {
                const activeAdmins = users.filter(u => u.rol === 'admin' && u.activo);
                if (activeAdmins.length <= 1) {
                    return { success: false, message: 'No se puede eliminar el último administrador' };
                }
            }

            // Eliminar usuario
            const filteredUsers = users.filter(u =>
                u.email.toLowerCase() !== email.toLowerCase()
            );

            this.setItem(this.usersKey, JSON.stringify(filteredUsers));

            this.logAudit({
                tipo: 'eliminar_usuario',
                email: this.getCurrentUser().email,
                mensaje: `Usuario ${email} eliminado`
            });

            return { success: true, message: 'Usuario eliminado exitosamente' };
        } catch (error) {
            console.error('Error eliminando usuario:', error);
            return { success: false, message: 'Error al eliminar usuario' };
        }
    }

    logAudit(logData) {
        try {
            const logsStr = this.getItem(this.auditLogKey);
            const logs = logsStr ? JSON.parse(logsStr) : [];
            const newLog = {
                id: String(Date.now()),
                timestamp: new Date().toISOString(),
                ...logData
            };
            logs.unshift(newLog);

            // Mantener solo los últimos 1000 logs
            if (logs.length > 1000) {
                logs.splice(1000);
            }

            this.setItem(this.auditLogKey, JSON.stringify(logs));
        } catch (error) {
            console.error('Error guardando log de auditoría:', error);
        }
    }

    async getAuditLogs(email = null) {
        try {
            const logsData = this.getItem(this.auditLogKey);
            let logs = logsData ? JSON.parse(logsData) : [];

            if (email) {
                logs = logs.filter(log => log.email === email);
            }

            return logs;
        } catch (error) {
            console.error('Error obteniendo logs:', error);
            return [];
        }
    }

    // Método para exportar usuarios a JSON (para backup)
    exportUsers() {
        const users = this.getAllUsers();
        const dataStr = JSON.stringify(users, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `usuarios_backup_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }

    // Método para importar usuarios desde JSON
    async importUsers(file) {
        if (!this.isAdmin()) {
            return { success: false, message: 'Solo los administradores pueden importar usuarios' };
        }

        try {
            const text = await file.text();
            const importedUsers = JSON.parse(text);

            if (!Array.isArray(importedUsers)) {
                return { success: false, message: 'El archivo no contiene un array de usuarios válido' };
            }

            // Validar estructura básica
            const isValid = importedUsers.every(u =>
                u.email && u.password && u.rol
            );

            if (!isValid) {
                return { success: false, message: 'El archivo contiene usuarios con estructura inválida' };
            }

            this.setItem(this.usersKey, JSON.stringify(importedUsers));

            this.logAudit({
                tipo: 'importar_usuarios',
                email: this.getCurrentUser().email,
                mensaje: `${importedUsers.length} usuarios importados`
            });

            return { success: true, message: `${importedUsers.length} usuarios importados exitosamente` };
        } catch (error) {
            console.error('Error importando usuarios:', error);
            return { success: false, message: 'Error al importar usuarios. Verifique el formato del archivo.' };
        }
    }

    // Método para limpiar y reiniciar usuarios (útil para debugging)
    resetUsers() {
        console.log('🔄 Reiniciando usuarios...');
        this.removeItem(this.usersKey);
        this.removeItem(this.storageKey);
        this.removeItem(this.auditLogKey);
        this.initializeUsersSync();
        console.log('✅ Usuarios reiniciados. Recarga la página.');
    }

    // Métodos de compatibilidad con código antiguo
    getAuthorizedUsers() {
        return this.getAllUsers().filter(u => u.activo);
    }

    addUser(email) {
        return this.createUser({
            email,
            password: 'ChangeMe123!',
            nombre: email,
            rol: 'viewer'
        });
    }

    removeUser(email) {
        return this.deleteUser(email);
    }
}

// Crear instancia global
const authManager = new AuthManager();

// Exponer función de reset para debugging
window.resetAuth = () => {
    authManager.resetUsers();
};

// Mostrar aviso si localStorage no está disponible
if (!authManager.storageAvailable) {
    console.warn('%c⚠️ AVISO: localStorage bloqueado por el navegador', 'font-size: 16px; color: orange;');
    console.warn('%cLos datos se almacenarán solo durante esta sesión', 'font-size: 14px; color: orange;');
    console.warn('%cPara Safari: Desactiva "Prevent Cross-Site Tracking" en Preferencias > Privacidad', 'font-size: 14px; color: orange;');
}

console.log('🔐 AuthManager inicializado. Para reiniciar usuarios, ejecuta: resetAuth()');
