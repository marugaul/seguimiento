// Gestión de Almacenamiento de Datos
class StorageManager {
    constructor() {
        this.projectsKey = 'seguimiento_proyectos';
        this.metadataKey = 'seguimiento_metadata';
    }

    saveProjects(projects) {
        try {
            const data = {
                projects: projects,
                timestamp: new Date().toISOString(),
                count: projects.length
            };

            localStorage.setItem(this.projectsKey, JSON.stringify(data));

            const metadata = {
                lastUpdate: new Date().toISOString(),
                totalProjects: projects.length
            };
            localStorage.setItem(this.metadataKey, JSON.stringify(metadata));

            return { success: true };
        } catch (error) {
            console.error('Error guardando proyectos:', error);
            return { success: false, error: error.message };
        }
    }

    getProjects() {
        try {
            const data = localStorage.getItem(this.projectsKey);
            if (!data) return [];

            const parsed = JSON.parse(data);
            return parsed.projects || [];
        } catch (error) {
            console.error('Error cargando proyectos:', error);
            return [];
        }
    }

    getMetadata() {
        try {
            const data = localStorage.getItem(this.metadataKey);
            if (!data) return null;

            return JSON.parse(data);
        } catch (error) {
            console.error('Error cargando metadata:', error);
            return null;
        }
    }

    clearAllData() {
        localStorage.removeItem(this.projectsKey);
        localStorage.removeItem(this.metadataKey);
    }

    getStorageSize() {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length + key.length;
            }
        }
        return (total / 1024).toFixed(2); // KB
    }
}

// Crear instancia global
const storageManager = new StorageManager();
