// Gestión de Autenticación con API Backend
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.storageKey = 'seguimiento_auth';
        this.apiBaseUrl = 'http://localhost:3000/api/auth'; // Cambiar en producción
        this.checkCurrentUser();
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
            const response = await fetch(`${this.apiBaseUrl}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();

            if (result.success) {
                this.currentUser = result.user;
                localStorage.setItem(this.storageKey, JSON.stringify(result.user));
                return { success: true };
            } else {
                return { success: false, message: result.message };
            }
        } catch (error) {
            console.error('Error en login:', error);
            return { success: false, message: 'Error de conexión con el servidor' };
        }
    }

    async logout() {
        try {
            const user = this.getCurrentUser();
            if (user && user.email) {
                await fetch(`${this.apiBaseUrl}/logout`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email: user.email })
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
        return user && user.role === 'admin';
    }

    async getAllUsers() {
        try {
            const user = this.getCurrentUser();
            const response = await fetch(`${this.apiBaseUrl}/users?role=${user?.role || ''}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();
            return result.success ? result.users : [];
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
            const user = this.getCurrentUser();
            const response = await fetch(`${this.apiBaseUrl}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...userData,
                    adminRole: user.role
                })
            });

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error creando usuario:', error);
            return { success: false, message: 'Error de conexión con el servidor' };
        }
    }

    async updateUser(email, updates) {
        if (!this.isAdmin()) {
            return { success: false, message: 'Solo los administradores pueden actualizar usuarios' };
        }

        try {
            const user = this.getCurrentUser();
            const response = await fetch(`${this.apiBaseUrl}/users/${encodeURIComponent(email)}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...updates,
                    adminRole: user.role
                })
            });

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error actualizando usuario:', error);
            return { success: false, message: 'Error de conexión con el servidor' };
        }
    }

    async deleteUser(email) {
        if (!this.isAdmin()) {
            return { success: false, message: 'Solo los administradores pueden eliminar usuarios' };
        }

        try {
            const user = this.getCurrentUser();
            const response = await fetch(`${this.apiBaseUrl}/users/${encodeURIComponent(email)}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    adminRole: user.role
                })
            });

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error eliminando usuario:', error);
            return { success: false, message: 'Error de conexión con el servidor' };
        }
    }

    async getAuditLogs(email = null) {
        try {
            const user = this.getCurrentUser();
            let url = `${this.apiBaseUrl}/audit-logs?adminRole=${user?.role || ''}`;
            if (email) {
                url += `&email=${encodeURIComponent(email)}`;
            }

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();
            return result.success ? result.logs : [];
        } catch (error) {
            console.error('Error obteniendo logs:', error);
            return [];
        }
    }

    // Métodos de compatibilidad con código antiguo
    getAuthorizedUsers() {
        // Este método ahora es asíncrono en realidad, pero se mantiene por compatibilidad
        return [];
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
