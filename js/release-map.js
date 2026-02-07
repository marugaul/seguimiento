// Release Map Manager
class ReleaseMapManager {
    constructor() {
        this.projects = [];
        this.selectedProjects = [];
        this.selectedLeaders = [];
        this.selectedTypes = ['Proyecto', 'Requerimiento', 'Soporte']; // Por defecto todos
        this.currentYear = new Date().getFullYear();
        this.months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    }

    loadProjects() {
        this.projects = storageManager.getProjects() || [];
        return this.projects;
    }

    getUniqueLeaders() {
        const leaders = [...new Set(this.projects.map(p => p.nombreLt).filter(Boolean))];
        return leaders.sort();
    }

    getProjectsByType(type) {
        return this.projects.filter(p => {
            const projectType = (p.tipoProyecto || '').toLowerCase();
            const searchType = type.toLowerCase();
            return projectType.includes(searchType);
        });
    }

    filterProjects() {
        let filtered = this.projects;

        // Filtrar por tipo de proyecto
        if (this.selectedTypes.length > 0 && this.selectedTypes.length < 3) {
            filtered = filtered.filter(p => {
                const projectType = (p.tipoProyecto || '').toLowerCase();
                return this.selectedTypes.some(type => projectType.includes(type.toLowerCase()));
            });
        }

        // Filtrar por líder técnico
        if (this.selectedLeaders.length > 0) {
            filtered = filtered.filter(p => this.selectedLeaders.includes(p.nombreLt));
        }

        // Filtrar por proyectos específicos
        if (this.selectedProjects.length > 0) {
            filtered = filtered.filter(p => this.selectedProjects.includes(p.proyectoFs));
        }

        return filtered;
    }

    getMonthlyData() {
        const filtered = this.filterProjects();
        const monthlyData = {};

        // Inicializar datos mensuales
        for (let i = 1; i <= 12; i++) {
            monthlyData[i] = [];
        }

        // Agrupar proyectos por mes
        filtered.forEach(project => {
            for (let i = 1; i <= 12; i++) {
                const monthKey = `mes${String(i).padStart(2, '0')}`;
                const hours = parseFloat(project[monthKey]) || 0;

                if (hours > 0) {
                    monthlyData[i].push({
                        project: project,
                        hours: hours,
                        name: project.nombre,
                        leader: project.nombreLt,
                        code: project.proyectoFs,
                        type: project.tipoProyecto,
                        estado: project.estado,
                        etapa: project.etapa
                    });
                }
            }
        });

        return monthlyData;
    }

    calculateTotals() {
        const filtered = this.filterProjects();
        let totalProjects = filtered.length;
        let totalHours = 0;
        let totalEstimated = 0;

        filtered.forEach(p => {
            for (let i = 1; i <= 12; i++) {
                const monthKey = `mes${String(i).padStart(2, '0')}`;
                totalHours += parseFloat(p[monthKey]) || 0;
            }
            totalEstimated += parseFloat(p.totalEstimacion) || 0;
        });

        return {
            projects: totalProjects,
            hours: totalHours,
            estimated: totalEstimated
        };
    }

    exportToExcel() {
        const monthlyData = this.getMonthlyData();
        const exportData = [];

        // Crear filas para exportar
        for (let month = 1; month <= 12; month++) {
            const projects = monthlyData[month];
            projects.forEach(item => {
                exportData.push({
                    'Mes': this.months[month - 1],
                    'Código': item.code,
                    'Proyecto': item.name,
                    'Tipo': item.type,
                    'Líder Técnico': item.leader,
                    'Estado': item.estado,
                    'Etapa': item.etapa,
                    'Horas': item.hours
                });
            });
        }

        // Crear workbook y worksheet
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Mapa de Liberaciones');

        // Descargar archivo
        const fileName = `mapa_liberaciones_${this.currentYear}.xlsx`;
        XLSX.writeFile(wb, fileName);
    }

    render() {
        this.loadProjects();
        this.renderReleaseMapPage();
    }

    renderReleaseMapPage() {
        const leaders = this.getUniqueLeaders();
        const proyectos = this.getProjectsByType('Proyecto');
        const requerimientos = this.getProjectsByType('Requerimiento');
        const soportes = this.getProjectsByType('Soporte');
        const totals = this.calculateTotals();
        const monthlyData = this.getMonthlyData();

        const html = `
            <div class="row mb-4">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header bg-gradient text-white" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                            <div class="d-flex justify-content-between align-items-center">
                                <h4 class="mb-0">
                                    <i class="bi bi-calendar-range"></i> Mapa de Liberaciones Anuales ${this.currentYear}
                                </h4>
                                <button class="btn btn-light btn-sm" onclick="releaseMapManager.exportToExcel()">
                                    <i class="bi bi-download"></i> Exportar Excel
                                </button>
                            </div>
                        </div>
                        <div class="card-body">
                            <p class="text-muted mb-0">
                                <i class="bi bi-info-circle"></i> Herramienta para planificar y visualizar las liberaciones anuales de proyectos, requerimientos y soportes.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Resumen de Totales -->
            <div class="row mb-4">
                <div class="col-md-4">
                    <div class="card stat-card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                        <h6 class="text-white-50">Total Proyectos Seleccionados</h6>
                        <h2 class="mb-0">${totals.projects}</h2>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card stat-card" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
                        <h6 class="text-white-50">Horas Planificadas</h6>
                        <h2 class="mb-0">${totals.hours.toFixed(0)}</h2>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card stat-card" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
                        <h6 class="text-white-50">Horas Estimadas Total</h6>
                        <h2 class="mb-0">${totals.estimated.toFixed(0)}</h2>
                    </div>
                </div>
            </div>

            <!-- Filtros de Selección -->
            <div class="row mb-4">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header bg-primary text-white">
                            <h5 class="mb-0"><i class="bi bi-funnel"></i> Filtros de Selección</h5>
                        </div>
                        <div class="card-body">
                            <!-- Tipos de Proyecto -->
                            <div class="mb-4">
                                <label class="form-label fw-bold">
                                    <i class="bi bi-layers"></i> Tipos de Proyecto
                                </label>
                                <div class="d-flex gap-3 flex-wrap">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="typeProyecto"
                                               value="Proyecto" ${this.selectedTypes.includes('Proyecto') ? 'checked' : ''}
                                               onchange="releaseMapManager.toggleType('Proyecto')">
                                        <label class="form-check-label" for="typeProyecto">
                                            <i class="bi bi-folder"></i> Proyectos (${proyectos.length})
                                        </label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="typeRequerimiento"
                                               value="Requerimiento" ${this.selectedTypes.includes('Requerimiento') ? 'checked' : ''}
                                               onchange="releaseMapManager.toggleType('Requerimiento')">
                                        <label class="form-check-label" for="typeRequerimiento">
                                            <i class="bi bi-file-text"></i> Requerimientos (${requerimientos.length})
                                        </label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="typeSoporte"
                                               value="Soporte" ${this.selectedTypes.includes('Soporte') ? 'checked' : ''}
                                               onchange="releaseMapManager.toggleType('Soporte')">
                                        <label class="form-check-label" for="typeSoporte">
                                            <i class="bi bi-tools"></i> Soportes (${soportes.length})
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <!-- Líderes Técnicos -->
                            <div class="mb-4">
                                <label class="form-label fw-bold">
                                    <i class="bi bi-person-badge"></i> Líderes Técnicos
                                </label>
                                <div class="d-flex gap-2 mb-2">
                                    <button class="btn btn-sm btn-outline-primary" onclick="releaseMapManager.selectAllLeaders()">
                                        <i class="bi bi-check-all"></i> Seleccionar Todos
                                    </button>
                                    <button class="btn btn-sm btn-outline-secondary" onclick="releaseMapManager.clearAllLeaders()">
                                        <i class="bi bi-x-circle"></i> Limpiar Selección
                                    </button>
                                </div>
                                <div class="leader-selection-container">
                                    ${leaders.length === 0 ? `
                                        <div class="alert alert-warning">
                                            <i class="bi bi-exclamation-triangle"></i>
                                            No hay líderes técnicos disponibles. Por favor, cargue datos primero.
                                        </div>
                                    ` : `
                                        <div class="row g-2">
                                            ${leaders.map(leader => `
                                                <div class="col-md-3 col-sm-4 col-6">
                                                    <div class="form-check">
                                                        <input class="form-check-input leader-checkbox" type="checkbox"
                                                               id="leader_${this.sanitizeId(leader)}"
                                                               value="${leader}"
                                                               ${this.selectedLeaders.includes(leader) ? 'checked' : ''}
                                                               onchange="releaseMapManager.toggleLeader('${leader}')">
                                                        <label class="form-check-label" for="leader_${this.sanitizeId(leader)}">
                                                            ${leader}
                                                        </label>
                                                    </div>
                                                </div>
                                            `).join('')}
                                        </div>
                                    `}
                                </div>
                            </div>

                            <!-- Proyectos Específicos -->
                            <div class="mb-3">
                                <label class="form-label fw-bold">
                                    <i class="bi bi-list-check"></i> Proyectos Específicos (Opcional)
                                </label>
                                <div class="d-flex gap-2 mb-2">
                                    <button class="btn btn-sm btn-outline-primary" onclick="releaseMapManager.selectAllProjects()">
                                        <i class="bi bi-check-all"></i> Seleccionar Todos
                                    </button>
                                    <button class="btn btn-sm btn-outline-secondary" onclick="releaseMapManager.clearAllProjects()">
                                        <i class="bi bi-x-circle"></i> Limpiar Selección
                                    </button>
                                </div>
                                <select multiple class="form-select" id="projectSelector" size="6"
                                        style="height: 150px;" onchange="releaseMapManager.handleProjectSelection()">
                                    ${this.filterProjects().map(p => `
                                        <option value="${p.proyectoFs}" ${this.selectedProjects.includes(p.proyectoFs) ? 'selected' : ''}>
                                            ${p.proyectoFs} - ${p.nombre}
                                        </option>
                                    `).join('')}
                                </select>
                                <small class="form-text text-muted">
                                    Mantén presionado Ctrl/Cmd para seleccionar múltiples proyectos
                                </small>
                            </div>

                            <div class="d-flex gap-2">
                                <button class="btn btn-success" onclick="releaseMapManager.applyFilters()">
                                    <i class="bi bi-check-circle"></i> Aplicar Filtros
                                </button>
                                <button class="btn btn-secondary" onclick="releaseMapManager.resetFilters()">
                                    <i class="bi bi-arrow-clockwise"></i> Resetear
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Mapa de Liberaciones Mensual -->
            <div class="row mb-4">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header bg-info text-white">
                            <h5 class="mb-0"><i class="bi bi-calendar3"></i> Mapa de Liberaciones por Mes</h5>
                        </div>
                        <div class="card-body">
                            <div class="release-map-grid">
                                ${this.renderMonthlyGrid(monthlyData)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tabla Detallada -->
            <div class="row">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header bg-secondary text-white">
                            <h5 class="mb-0"><i class="bi bi-table"></i> Detalle de Proyectos Seleccionados</h5>
                        </div>
                        <div class="card-body">
                            ${this.renderDetailedTable()}
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('releaseMapPage').innerHTML = html;
    }

    renderMonthlyGrid(monthlyData) {
        let html = '<div class="row g-3">';

        for (let month = 1; month <= 12; month++) {
            const projects = monthlyData[month];
            const totalHours = projects.reduce((sum, p) => sum + p.hours, 0);
            const monthName = this.months[month - 1];

            html += `
                <div class="col-md-3 col-sm-6">
                    <div class="month-card ${projects.length > 0 ? 'has-projects' : ''}">
                        <div class="month-header">
                            <h6 class="mb-0">${monthName} ${this.currentYear}</h6>
                            <span class="badge bg-primary">${projects.length} items</span>
                        </div>
                        <div class="month-body">
                            <div class="month-stats">
                                <div class="stat-item">
                                    <i class="bi bi-clock"></i>
                                    <span>${totalHours.toFixed(0)} hrs</span>
                                </div>
                            </div>
                            ${projects.length > 0 ? `
                                <div class="month-projects">
                                    ${projects.slice(0, 5).map(p => `
                                        <div class="project-item" title="${p.name}">
                                            <div class="project-type-badge ${this.getTypeBadgeClass(p.type)}">
                                                ${this.getTypeIcon(p.type)}
                                            </div>
                                            <div class="project-info">
                                                <div class="project-code">${p.code}</div>
                                                <div class="project-name">${this.truncate(p.name, 30)}</div>
                                                <div class="project-hours">${p.hours.toFixed(0)} hrs</div>
                                            </div>
                                        </div>
                                    `).join('')}
                                    ${projects.length > 5 ? `
                                        <div class="more-projects">
                                            <small>+ ${projects.length - 5} más</small>
                                        </div>
                                    ` : ''}
                                </div>
                            ` : `
                                <div class="no-projects">
                                    <i class="bi bi-inbox"></i>
                                    <small>Sin proyectos</small>
                                </div>
                            `}
                        </div>
                    </div>
                </div>
            `;
        }

        html += '</div>';
        return html;
    }

    renderDetailedTable() {
        const filtered = this.filterProjects();

        if (filtered.length === 0) {
            return `
                <div class="alert alert-info">
                    <i class="bi bi-info-circle"></i>
                    No hay proyectos seleccionados. Por favor, ajuste los filtros.
                </div>
            `;
        }

        let html = `
            <div class="table-responsive">
                <table class="table table-striped table-hover">
                    <thead class="table-dark">
                        <tr>
                            <th>Código</th>
                            <th>Proyecto</th>
                            <th>Tipo</th>
                            <th>Líder Técnico</th>
                            <th>Estado</th>
                            <th>Etapa</th>
                            <th class="text-end">Horas Total</th>
                            <th class="text-end">% Avance</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        filtered.forEach(project => {
            let totalHours = 0;
            for (let i = 1; i <= 12; i++) {
                const monthKey = `mes${String(i).padStart(2, '0')}`;
                totalHours += parseFloat(project[monthKey]) || 0;
            }

            const progress = parseFloat(project.porcentajeAvanceReal) || 0;

            html += `
                <tr>
                    <td><code>${project.proyectoFs || '-'}</code></td>
                    <td>${project.nombre || '-'}</td>
                    <td>
                        <span class="badge ${this.getTypeBadgeClass(project.tipoProyecto)}">
                            ${project.tipoProyecto || '-'}
                        </span>
                    </td>
                    <td>${project.nombreLt || '-'}</td>
                    <td>
                        <span class="badge ${this.getEstadoBadgeClass(project.estado)}">
                            ${project.estado || '-'}
                        </span>
                    </td>
                    <td>${project.etapa || '-'}</td>
                    <td class="text-end">${totalHours.toFixed(0)}</td>
                    <td class="text-end">
                        <div class="progress" style="height: 20px;">
                            <div class="progress-bar ${this.getProgressBarClass(progress)}"
                                 role="progressbar"
                                 style="width: ${progress}%"
                                 aria-valuenow="${progress}"
                                 aria-valuemin="0"
                                 aria-valuemax="100">
                                ${progress.toFixed(0)}%
                            </div>
                        </div>
                    </td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;

        return html;
    }

    // Métodos de interacción
    toggleType(type) {
        const index = this.selectedTypes.indexOf(type);
        if (index > -1) {
            this.selectedTypes.splice(index, 1);
        } else {
            this.selectedTypes.push(type);
        }
    }

    toggleLeader(leader) {
        const index = this.selectedLeaders.indexOf(leader);
        if (index > -1) {
            this.selectedLeaders.splice(index, 1);
        } else {
            this.selectedLeaders.push(leader);
        }
    }

    selectAllLeaders() {
        this.selectedLeaders = this.getUniqueLeaders();
        this.applyFilters();
    }

    clearAllLeaders() {
        this.selectedLeaders = [];
        this.applyFilters();
    }

    selectAllProjects() {
        const selector = document.getElementById('projectSelector');
        this.selectedProjects = Array.from(selector.options).map(opt => opt.value);
        this.applyFilters();
    }

    clearAllProjects() {
        this.selectedProjects = [];
        this.applyFilters();
    }

    handleProjectSelection() {
        const selector = document.getElementById('projectSelector');
        this.selectedProjects = Array.from(selector.selectedOptions).map(opt => opt.value);
    }

    applyFilters() {
        this.render();
        showToast('Filtros aplicados correctamente', 'success');
    }

    resetFilters() {
        this.selectedProjects = [];
        this.selectedLeaders = [];
        this.selectedTypes = ['Proyecto', 'Requerimiento', 'Soporte'];
        this.render();
        showToast('Filtros reseteados', 'info');
    }

    // Métodos auxiliares
    sanitizeId(str) {
        return str.replace(/[^a-zA-Z0-9]/g, '_');
    }

    truncate(str, length) {
        if (!str) return '-';
        return str.length > length ? str.substring(0, length) + '...' : str;
    }

    getTypeIcon(type) {
        const typeStr = (type || '').toLowerCase();
        if (typeStr.includes('proyecto')) return '<i class="bi bi-folder"></i>';
        if (typeStr.includes('requerimiento')) return '<i class="bi bi-file-text"></i>';
        if (typeStr.includes('soporte')) return '<i class="bi bi-tools"></i>';
        return '<i class="bi bi-question"></i>';
    }

    getTypeBadgeClass(type) {
        const typeStr = (type || '').toLowerCase();
        if (typeStr.includes('proyecto')) return 'bg-primary';
        if (typeStr.includes('requerimiento')) return 'bg-info';
        if (typeStr.includes('soporte')) return 'bg-warning';
        return 'bg-secondary';
    }

    getEstadoBadgeClass(estado) {
        const estadoStr = (estado || '').toLowerCase();
        if (estadoStr.includes('proceso')) return 'bg-warning';
        if (estadoStr.includes('terminado') || estadoStr.includes('cerrado')) return 'bg-success';
        if (estadoStr.includes('pausado') || estadoStr.includes('retenido')) return 'bg-secondary';
        if (estadoStr.includes('cancelado')) return 'bg-danger';
        return 'bg-info';
    }

    getProgressBarClass(progress) {
        if (progress >= 80) return 'bg-success';
        if (progress >= 50) return 'bg-info';
        if (progress >= 25) return 'bg-warning';
        return 'bg-danger';
    }
}

// Instancia global
const releaseMapManager = new ReleaseMapManager();
