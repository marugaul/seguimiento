// Gestión de Autenticación con localStorage y archivo JSON inicial
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.storageKey = 'seguimiento_auth';
        this.usersKey = 'seguimiento_users';
        this.auditLogKey = 'seguimiento_audit_log';
        this.initializeUsers();
        this.checkCurrentUser();
    }

    async initializeUsers() {
        // Si no hay usuarios en localStorage, cargar desde el archivo JSON
        const existingUsers = localStorage.getItem(this.usersKey);
        if (!existingUsers) {
            try {
                const response = await fetch('data/users.json');
                const initialUsers = await response.json();
                localStorage.setItem(this.usersKey, JSON.stringify(initialUsers));
                console.log('Usuarios iniciales cargados desde data/users.json');
            } catch (error) {
                console.error('Error cargando usuarios iniciales:', error);
                // Si falla, crear usuario admin por defecto
                const defaultUsers = [{
                    id: "1",
                    email: "admin@seguimiento.com",
                    password: "Admin2024!",
                    nombre: "Administrador",
                    rol: "admin",
                    activo: true,
                    fechaCreacion: new Date().toISOString()
                }];
                localStorage.setItem(this.usersKey, JSON.stringify(defaultUsers));
            }
        }
    }

    checkCurrentUser() {
        const authData = localStorage.getItem(this.storageKey);
        if (authData) {
            try {
                this.currentUser = JSON.parse(authData);
            } catch {
                this.currentUser = null;
            }
        }
    }

    async login(email, password) {
        try {
            const users = this.getAllUsers();
            const user = users.find(u =>
                u.email.toLowerCase() === email.toLowerCase() &&
                u.activo === true
            );

            if (!user) {
                this.logAudit({
                    tipo: 'login_fallido',
                    email: email,
                    mensaje: 'Usuario no encontrado o inactivo'
                });
                return { success: false, message: 'Usuario no encontrado o inactivo' };
            }

            // Verificar password (en producción debería usar hash)
            if (user.password !== password) {
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
            localStorage.setItem(this.storageKey, JSON.stringify(userSession));

            this.logAudit({
                tipo: 'login',
                email: user.email,
                mensaje: 'Login exitoso'
            });

            return { success: true };
        } catch (error) {
            console.error('Error en login:', error);
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
            localStorage.removeItem(this.storageKey);
        }
    }

    isAuthenticated() {
        const authData = localStorage.getItem(this.storageKey);
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
            const authData = localStorage.getItem(this.storageKey);
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
            const usersData = localStorage.getItem(this.usersKey);
            return usersData ? JSON.parse(usersData) : [];
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
            localStorage.setItem(this.usersKey, JSON.stringify(users));

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

            localStorage.setItem(this.usersKey, JSON.stringify(users));

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

            localStorage.setItem(this.usersKey, JSON.stringify(filteredUsers));

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
            const logs = this.getAuditLogs();
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

            localStorage.setItem(this.auditLogKey, JSON.stringify(logs));
        } catch (error) {
            console.error('Error guardando log de auditoría:', error);
        }
    }

    async getAuditLogs(email = null) {
        try {
            const logsData = localStorage.getItem(this.auditLogKey);
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

            localStorage.setItem(this.usersKey, JSON.stringify(importedUsers));

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
