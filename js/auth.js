// Gestión de Autenticación
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.storageKey = 'seguimiento_auth';
        this.usersKey = 'seguimiento_users_v2'; // Nueva versión para usuarios con contraseñas
        this.auditLogKey = 'seguimiento_audit_log'; // Bitácora de accesos
        this.initDefaultUsers();
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

    logEvent(email, eventType, details = {}) {
        const logs = this.getAuditLogs();
        const logEntry = {
            email: email,
            eventType: eventType, // 'login' o 'logout'
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

    getAuditLogs(email = null) {
        const logsStr = localStorage.getItem(this.auditLogKey);
        const logs = logsStr ? JSON.parse(logsStr) : [];

        if (email) {
            return logs.filter(log => log.email.toLowerCase() === email.toLowerCase());
        }

        return logs;
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
        const users = localStorage.getItem(this.usersKey);
        return users ? JSON.parse(users) : [];
    }

    createUser(userData) {
        if (!this.isAdmin()) {
            return { success: false, message: 'Solo los administradores pueden crear usuarios' };
        }

        const users = this.getAllUsers();
        const emailLower = userData.email.toLowerCase();

        if (users.find(u => u.email.toLowerCase() === emailLower)) {
            return { success: false, message: 'El usuario ya existe' };
        }

        const newUser = {
            email: emailLower,
            password: userData.password,
            role: userData.role || 'user',
            name: userData.name || emailLower,
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

        // Actualizar campos permitidos
        if (updates.password) users[userIndex].password = updates.password;
        if (updates.name) users[userIndex].name = updates.name;
        if (updates.role) users[userIndex].role = updates.role;
        users[userIndex].updatedAt = new Date().toISOString();

        localStorage.setItem(this.usersKey, JSON.stringify(users));
        return { success: true, message: 'Usuario actualizado exitosamente' };
    }

    deleteUser(email) {
        if (!this.isAdmin()) {
            return { success: false, message: 'Solo los administradores pueden eliminar usuarios' };
        }

        const users = this.getAllUsers();
        const emailLower = email.toLowerCase();

        // No permitir eliminar el último admin
        const adminUsers = users.filter(u => u.role === 'admin');
        const userToDelete = users.find(u => u.email.toLowerCase() === emailLower);

        if (userToDelete && userToDelete.role === 'admin' && adminUsers.length === 1) {
            return { success: false, message: 'No se puede eliminar el último administrador' };
        }

        const filteredUsers = users.filter(u => u.email.toLowerCase() !== emailLower);
        localStorage.setItem(this.usersKey, JSON.stringify(filteredUsers));
        return { success: true, message: 'Usuario eliminado exitosamente' };
    }

    // Compatibilidad con código antiguo
    getAuthorizedUsers() {
        return this.getAllUsers().map(u => u.email);
    }

    addUser(email) {
        return this.createUser({ email, password: 'ChangeMe123!', name: email });
    }

    removeUser(email) {
        return this.deleteUser(email);
    }
}

// Crear instancia global
const authManager = new AuthManager();
