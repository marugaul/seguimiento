// Gestión de Autenticación - Versión Local (sin backend)
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.storageKey = 'seguimiento_auth';
        this.usersKey = 'seguimiento_users_v2';
        this.auditLogKey = 'seguimiento_audit_log';
        this.initDefaultUsers();
        this.checkCurrentUser();
    }

    initDefaultUsers() {
        const existingUsers = localStorage.getItem(this.usersKey);
        if (!existingUsers) {
            // Crear usuario administrador por defecto
            const defaultUsers = [
                {
                    email: 'admin@seguimiento.com',
                    password: 'Admin2024!',
                    role: 'admin',
                    name: 'Administrador',
                    createdAt: new Date().toISOString()
                }
            ];
            localStorage.setItem(this.usersKey, JSON.stringify(defaultUsers));
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

    logEvent(email, eventType, details = {}) {
        const logs = this.getAuditLogs();
        const logEntry = {
            email: email,
            eventType: eventType, // 'login', 'logout', 'login_failed'
            timestamp: new Date().toISOString(),
            details: details
        };
        logs.push(logEntry);

        // Mantener solo los últimos 500 registros
        if (logs.length > 500) {
            logs.shift();
        }

        localStorage.setItem(this.auditLogKey, JSON.stringify(logs));
    }

    login(email, password) {
        const users = this.getAllUsers();
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

        if (!user) {
            this.logEvent(email, 'login_failed', { reason: 'Usuario no encontrado' });
            return { success: false, message: 'Usuario no encontrado' };
        }

        if (user.password !== password) {
            this.logEvent(email, 'login_failed', { reason: 'Contraseña incorrecta' });
            return { success: false, message: 'Contraseña incorrecta' };
        }

        this.currentUser = user;
        const authData = {
            email: user.email,
            role: user.role,
            name: user.name,
            loginTime: new Date().toISOString()
        };
        localStorage.setItem(this.storageKey, JSON.stringify(authData));

        // Registrar login exitoso
        this.logEvent(email, 'login', { name: user.name, role: user.role });

        return { success: true };
    }

    logout() {
        if (this.currentUser) {
            this.logEvent(this.currentUser.email || this.currentUser, 'logout', {});
        }
        this.currentUser = null;
        localStorage.removeItem(this.storageKey);
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
        return user && user.role === 'admin';
    }

    getAllUsers() {
        const usersStr = localStorage.getItem(this.usersKey);
        return usersStr ? JSON.parse(usersStr) : [];
    }

    createUser(userData) {
        if (!this.isAdmin()) {
            return { success: false, message: 'Solo los administradores pueden crear usuarios' };
        }

        const users = this.getAllUsers();

        // Verificar si el email ya existe
        if (users.find(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
            return { success: false, message: 'El email ya está registrado' };
        }

        // Validar datos
        if (!userData.email || !userData.password || !userData.name) {
            return { success: false, message: 'Todos los campos son obligatorios' };
        }

        if (userData.password.length < 6) {
            return { success: false, message: 'La contraseña debe tener al menos 6 caracteres' };
        }

        // Crear nuevo usuario
        const newUser = {
            email: userData.email,
            password: userData.password,
            name: userData.name,
            role: userData.role || 'user',
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem(this.usersKey, JSON.stringify(users));

        return { success: true, message: 'Usuario creado exitosamente' };
    }

    updateUser(email, updates) {
        if (!this.isAdmin()) {
            return { success: false, message: 'Solo los administradores pueden actualizar usuarios' };
        }

        const users = this.getAllUsers();
        const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());

        if (userIndex === -1) {
            return { success: false, message: 'Usuario no encontrado' };
        }

        // Actualizar datos
        if (updates.name) users[userIndex].name = updates.name;
        if (updates.password) {
            if (updates.password.length < 6) {
                return { success: false, message: 'La contraseña debe tener al menos 6 caracteres' };
            }
            users[userIndex].password = updates.password;
        }
        if (updates.role) users[userIndex].role = updates.role;

        users[userIndex].updatedAt = new Date().toISOString();

        localStorage.setItem(this.usersKey, JSON.stringify(users));

        // Si estamos actualizando el usuario actual, actualizar la sesión
        const currentUser = this.getCurrentUser();
        if (currentUser && currentUser.email.toLowerCase() === email.toLowerCase()) {
            const authData = {
                email: users[userIndex].email,
                role: users[userIndex].role,
                name: users[userIndex].name,
                loginTime: currentUser.loginTime
            };
            localStorage.setItem(this.storageKey, JSON.stringify(authData));
            this.currentUser = authData;
        }

        return { success: true, message: 'Usuario actualizado exitosamente' };
    }

    deleteUser(email) {
        if (!this.isAdmin()) {
            return { success: false, message: 'Solo los administradores pueden eliminar usuarios' };
        }

        const currentUser = this.getCurrentUser();
        if (currentUser && currentUser.email.toLowerCase() === email.toLowerCase()) {
            return { success: false, message: 'No puedes eliminar tu propio usuario' };
        }

        const users = this.getAllUsers();
        const filteredUsers = users.filter(u => u.email.toLowerCase() !== email.toLowerCase());

        if (users.length === filteredUsers.length) {
            return { success: false, message: 'Usuario no encontrado' };
        }

        localStorage.setItem(this.usersKey, JSON.stringify(filteredUsers));

        return { success: true, message: 'Usuario eliminado exitosamente' };
    }

    getAuditLogs(email = null) {
        const logsStr = localStorage.getItem(this.auditLogKey);
        const logs = logsStr ? JSON.parse(logsStr) : [];

        if (email) {
            return logs.filter(log => log.email.toLowerCase() === email.toLowerCase());
        }

        return logs;
    }

    // Métodos de compatibilidad con código antiguo
    getAuthorizedUsers() {
        return this.getAllUsers().map(u => u.email);
    }

    addUser(email) {
        return this.createUser({
            email: email,
            password: 'ChangeMe123!',
            name: email.split('@')[0],
            role: 'user'
        });
    }

    removeUser(email) {
        return this.deleteUser(email);
    }

    getMasterPassword() {
        // Método de compatibilidad - ya no se usa contraseña maestra
        return 'N/A - Cada usuario tiene su propia contraseña';
    }
}

// Crear instancia global
const authManager = new AuthManager();
