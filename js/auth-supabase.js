// Gestión de Autenticación con Supabase
// Configuración de Supabase
const SUPABASE_URL = 'https://ssqtvztfhcpebmgrswpu.supabase.co';
const SUPABASE_KEY = 'sb_publishable_6krvllYTk51Ct1sAYSHkkQ_WSVZ4Nkl';

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.storageKey = 'seguimiento_auth';
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
            const response = await fetch(`${SUPABASE_URL}/rest/v1/users?email=eq.${encodeURIComponent(email)}`, {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`
                }
            });

            const users = await response.json();

            if (!users || users.length === 0) {
                await this.logEvent(email, 'login_failed', { reason: 'Usuario no encontrado' });
                return { success: false, message: 'Usuario no encontrado' };
            }

            const user = users[0];

            if (user.password !== password) {
                await this.logEvent(email, 'login_failed', { reason: 'Contraseña incorrecta' });
                return { success: false, message: 'Contraseña incorrecta' };
            }

            this.currentUser = {
                email: user.email,
                role: user.role,
                name: user.name,
                loginTime: new Date().toISOString()
            };

            localStorage.setItem(this.storageKey, JSON.stringify(this.currentUser));
            await this.logEvent(email, 'login', { name: user.name, role: user.role });

            return { success: true };
        } catch (error) {
            console.error('Error en login:', error);
            return { success: false, message: 'Error de conexión con el servidor' };
        }
    }

    async logout() {
        if (this.currentUser) {
            await this.logEvent(this.currentUser.email, 'logout', {});
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

    async getAllUsers() {
        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/users?select=*&order=created_at.desc`, {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`
                }
            });

            const users = await response.json();
            return users || [];
        } catch (error) {
            console.error('Error obteniendo usuarios:', error);
            return [];
        }
    }

    async createUser(userData) {
        if (!this.isAdmin()) {
            return { success: false, message: 'Solo los administradores pueden crear usuarios' };
        }

        if (!userData.email || !userData.password || !userData.name) {
            return { success: false, message: 'Todos los campos son obligatorios' };
        }

        if (userData.password.length < 6) {
            return { success: false, message: 'La contraseña debe tener al menos 6 caracteres' };
        }

        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify({
                    email: userData.email,
                    password: userData.password,
                    name: userData.name,
                    role: userData.role || 'user'
                })
            });

            if (response.status === 409 || response.status === 400) {
                return { success: false, message: 'El email ya está registrado' };
            }

            if (!response.ok) {
                throw new Error('Error al crear usuario');
            }

            return { success: true, message: 'Usuario creado exitosamente' };
        } catch (error) {
            console.error('Error creando usuario:', error);
            return { success: false, message: 'Error al crear usuario: ' + error.message };
        }
    }

    async updateUser(email, updates) {
        if (!this.isAdmin()) {
            return { success: false, message: 'Solo los administradores pueden actualizar usuarios' };
        }

        if (updates.password && updates.password.length < 6) {
            return { success: false, message: 'La contraseña debe tener al menos 6 caracteres' };
        }

        try {
            const updateData = { updated_at: new Date().toISOString() };
            if (updates.name) updateData.name = updates.name;
            if (updates.password) updateData.password = updates.password;
            if (updates.role) updateData.role = updates.role;

            const response = await fetch(`${SUPABASE_URL}/rest/v1/users?email=eq.${encodeURIComponent(email)}`, {
                method: 'PATCH',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(updateData)
            });

            if (!response.ok) {
                throw new Error('Error al actualizar usuario');
            }

            // Si estamos actualizando el usuario actual, actualizar la sesión
            const currentUser = this.getCurrentUser();
            if (currentUser && currentUser.email.toLowerCase() === email.toLowerCase()) {
                if (updates.name) currentUser.name = updates.name;
                if (updates.role) currentUser.role = updates.role;
                localStorage.setItem(this.storageKey, JSON.stringify(currentUser));
                this.currentUser = currentUser;
            }

            return { success: true, message: 'Usuario actualizado exitosamente' };
        } catch (error) {
            console.error('Error actualizando usuario:', error);
            return { success: false, message: 'Error al actualizar usuario: ' + error.message };
        }
    }

    async deleteUser(email) {
        if (!this.isAdmin()) {
            return { success: false, message: 'Solo los administradores pueden eliminar usuarios' };
        }

        const currentUser = this.getCurrentUser();
        if (currentUser && currentUser.email.toLowerCase() === email.toLowerCase()) {
            return { success: false, message: 'No puedes eliminar tu propio usuario' };
        }

        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/users?email=eq.${encodeURIComponent(email)}`, {
                method: 'DELETE',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`
                }
            });

            if (!response.ok) {
                throw new Error('Error al eliminar usuario');
            }

            return { success: true, message: 'Usuario eliminado exitosamente' };
        } catch (error) {
            console.error('Error eliminando usuario:', error);
            return { success: false, message: 'Error al eliminar usuario: ' + error.message };
        }
    }

    async logEvent(email, eventType, details = {}) {
        try {
            await fetch(`${SUPABASE_URL}/rest/v1/audit_logs`, {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    event_type: eventType,
                    details: details
                })
            });
        } catch (error) {
            console.error('Error registrando evento:', error);
        }
    }

    async getAuditLogs(email = null) {
        try {
            let url = `${SUPABASE_URL}/rest/v1/audit_logs?select=*&order=timestamp.desc&limit=500`;
            if (email) {
                url = `${SUPABASE_URL}/rest/v1/audit_logs?email=eq.${encodeURIComponent(email)}&select=*&order=timestamp.desc`;
            }

            const response = await fetch(url, {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`
                }
            });

            const logs = await response.json();
            return logs || [];
        } catch (error) {
            console.error('Error obteniendo logs:', error);
            return [];
        }
    }

    // Métodos de compatibilidad
    getAuthorizedUsers() {
        return [];
    }

    async addUser(email) {
        return await this.createUser({
            email: email,
            password: 'ChangeMe123!',
            name: email.split('@')[0],
            role: 'user'
        });
    }

    async removeUser(email) {
        return await this.deleteUser(email);
    }

    getMasterPassword() {
        return 'N/A - Cada usuario tiene su propia contraseña';
    }
}

// Crear instancia global
const authManager = new AuthManager();
