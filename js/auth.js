// Gestión de Autenticación
class AuthManager {
    constructor() {
        this.masterPassword = 'Admin2024!'; // Contraseña maestra
        this.currentUser = null;
        this.storageKey = 'seguimiento_auth';
        this.usersKey = 'seguimiento_users';
        this.initDefaultUsers();
    }

    initDefaultUsers() {
        if (!localStorage.getItem(this.usersKey)) {
            const defaultUsers = ['admin@example.com'];
            localStorage.setItem(this.usersKey, JSON.stringify(defaultUsers));
        }
    }

    login(email, password) {
        const authorizedUsers = this.getAuthorizedUsers();

        if (password !== this.masterPassword) {
            return { success: false, message: 'Contraseña incorrecta' };
        }

        if (!authorizedUsers.includes(email.toLowerCase())) {
            return { success: false, message: 'Usuario no autorizado' };
        }

        this.currentUser = email;
        const authData = {
            email: email,
            loginTime: new Date().toISOString()
        };
        localStorage.setItem(this.storageKey, JSON.stringify(authData));

        return { success: true };
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem(this.storageKey);
    }

    isAuthenticated() {
        const authData = localStorage.getItem(this.storageKey);
        if (!authData) return false;

        try {
            const data = JSON.parse(authData);
            this.currentUser = data.email;
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
                    const data = JSON.parse(authData);
                    this.currentUser = data.email;
                } catch {
                    this.currentUser = null;
                }
            }
        }
        return this.currentUser;
    }

    getAuthorizedUsers() {
        const users = localStorage.getItem(this.usersKey);
        return users ? JSON.parse(users) : [];
    }

    addUser(email) {
        const users = this.getAuthorizedUsers();
        const emailLower = email.toLowerCase();

        if (!users.includes(emailLower)) {
            users.push(emailLower);
            localStorage.setItem(this.usersKey, JSON.stringify(users));
            return { success: true, message: 'Usuario agregado exitosamente' };
        }

        return { success: false, message: 'El usuario ya existe' };
    }

    removeUser(email) {
        const users = this.getAuthorizedUsers();
        const emailLower = email.toLowerCase();
        const filteredUsers = users.filter(u => u !== emailLower);

        localStorage.setItem(this.usersKey, JSON.stringify(filteredUsers));
        return { success: true, message: 'Usuario eliminado exitosamente' };
    }

    getMasterPassword() {
        return this.masterPassword;
    }
}

// Crear instancia global
const authManager = new AuthManager();
