// Release Map Manager con Drag & Drop
class ReleaseMapManager {
    constructor() {
        this.projects = [];
        this.selectedProjects = [];
        this.selectedLeaders = [];
        this.selectedTypes = ['Proyecto', 'Requerimiento', 'Soporte'];
        this.currentYear = new Date().getFullYear();
        this.months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        this.releaseAssignments = {}; // Almacena asignaciones de proyectos a meses/semanas
        this.loadAssignments();
    }

    loadProjects() {
        this.projects = storageManager.getProjects() || [];
        return this.projects;
    }

    loadAssignments() {
        const saved = localStorage.getItem('seguimiento_release_assignments');
        if (saved) {
            try {
                this.releaseAssignments = JSON.parse(saved);
            } catch (e) {
                this.releaseAssignments = {};
            }
        }
    }

    saveAssignments() {
        localStorage.setItem('seguimiento_release_assignments', JSON.stringify(this.releaseAssignments));
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

        if (this.selectedTypes.length > 0 && this.selectedTypes.length < 3) {
            filtered = filtered.filter(p => {
                const projectType = (p.tipoProyecto || '').toLowerCase();
                return this.selectedTypes.some(type => projectType.includes(type.toLowerCase()));
            });
        }

        if (this.selectedLeaders.length > 0) {
            filtered = filtered.filter(p => this.selectedLeaders.includes(p.nombreLt));
        }

        if (this.selectedProjects.length > 0) {
            filtered = filtered.filter(p => this.selectedProjects.includes(p.proyectoFs));
        }

        return filtered;
    }

    // Sugerencia automática basada en horas
    suggestRelease(project) {
        const monthlyHours = [];
        for (let i = 1; i <= 12; i++) {
            const monthKey = `mes${String(i).padStart(2, '0')}`;
            const hours = parseFloat(project[monthKey]) || 0;
            monthlyHours.push({ month: i, hours: hours });
        }

        // Encontrar el mes con más horas
        const maxHours = Math.max(...monthlyHours.map(m => m.hours));
        const suggestedMonth = monthlyHours.find(m => m.hours === maxHours);

        // Sugerir última semana del mes con más horas
        return {
            month: suggestedMonth.month,
            week: 4,
            reason: `Sugerido: ${maxHours.toFixed(0)} horas planificadas en ${this.months[suggestedMonth.month - 1]}`
        };
    }

    assignProjectToRelease(projectCode, month, week) {
        const key = `${month}-${week}`;
        if (!this.releaseAssignments[key]) {
            this.releaseAssignments[key] = [];
        }

        // Remover de otras asignaciones
        Object.keys(this.releaseAssignments).forEach(k => {
            this.releaseAssignments[k] = this.releaseAssignments[k].filter(p => p !== projectCode);
        });

        // Agregar a la nueva asignación
        if (!this.releaseAssignments[key].includes(projectCode)) {
            this.releaseAssignments[key].push(projectCode);
        }

        this.saveAssignments();
    }

    removeProjectFromRelease(projectCode) {
        Object.keys(this.releaseAssignments).forEach(key => {
            this.releaseAssignments[key] = this.releaseAssignments[key].filter(p => p !== projectCode);
        });
        this.saveAssignments();
    }

    getAssignedProjects(month, week) {
        const key = `${month}-${week}`;
        const projectCodes = this.releaseAssignments[key] || [];
        return projectCodes.map(code => this.projects.find(p => p.proyectoFs === code)).filter(Boolean);
    }

    getUnassignedProjects() {
        const filtered = this.filterProjects();
        const allAssigned = new Set();
        Object.values(this.releaseAssignments).forEach(arr => {
            arr.forEach(code => allAssigned.add(code));
        });
        return filtered.filter(p => !allAssigned.has(p.proyectoFs));
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

    render() {
        this.loadProjects();
        this.renderReleaseMapPage();
        this.initializeDragAndDrop();
    }

    renderReleaseMapPage() {
        const leaders = this.getUniqueLeaders();
        const proyectos = this.getProjectsByType('Proyecto');
        const requerimientos = this.getProjectsByType('Requerimiento');
        const soportes = this.getProjectsByType('Soporte');
        const totals = this.calculateTotals();
        const unassignedProjects = this.getUnassignedProjects();

        const html = `
            <div class="row mb-4">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header bg-gradient text-white" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                            <div class="d-flex justify-content-between align-items-center">
                                <h4 class="mb-0">
                                    <i class="bi bi-calendar-range"></i> Mapa de Liberaciones ${this.currentYear} - Drag & Drop
                                </h4>
                                <div>
                                    <button class="btn btn-warning btn-sm me-2" onclick="releaseMapManager.autoSuggestAll()">
                                        <i class="bi bi-magic"></i> Auto-Sugerir Todas
                                    </button>
                                    <button class="btn btn-light btn-sm" onclick="releaseMapManager.exportToExcel()">
                                        <i class="bi bi-download"></i> Exportar
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div class="card-body">
                            <p class="text-muted mb-0">
                                <i class="bi bi-info-circle"></i> Arrastra proyectos desde el panel lateral hacia el mes y semana deseados.
                                Las sugerencias están basadas en las horas planificadas.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row">
                <!-- Panel lateral con proyectos disponibles -->
                <div class="col-md-3">
                    <div class="card sticky-top" style="top: 20px;">
                        <div class="card-header bg-primary text-white">
                            <h5 class="mb-0"><i class="bi bi-list-task"></i> Proyectos Disponibles</h5>
                        </div>
                        <div class="card-body">
                            <!-- Filtros -->
                            <div class="mb-3">
                                <label class="form-label fw-bold">Tipo</label>
                                <div>
                                    <div class="form-check form-check-inline">
                                        <input class="form-check-input" type="checkbox" id="filterProyecto"
                                               ${this.selectedTypes.includes('Proyecto') ? 'checked' : ''}
                                               onchange="releaseMapManager.toggleType('Proyecto')">
                                        <label class="form-check-label" for="filterProyecto">
                                            <small>Proyectos</small>
                                        </label>
                                    </div>
                                    <div class="form-check form-check-inline">
                                        <input class="form-check-input" type="checkbox" id="filterReq"
                                               ${this.selectedTypes.includes('Requerimiento') ? 'checked' : ''}
                                               onchange="releaseMapManager.toggleType('Requerimiento')">
                                        <label class="form-check-label" for="filterReq">
                                            <small>Req.</small>
                                        </label>
                                    </div>
                                    <div class="form-check form-check-inline">
                                        <input class="form-check-input" type="checkbox" id="filterSoporte"
                                               ${this.selectedTypes.includes('Soporte') ? 'checked' : ''}
                                               onchange="releaseMapManager.toggleType('Soporte')">
                                        <label class="form-check-label" for="filterSoporte">
                                            <small>Soporte</small>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <!-- Lista de proyectos sin asignar -->
                            <div class="unassigned-projects-container" style="max-height: 600px; overflow-y: auto;">
                                ${unassignedProjects.length === 0 ? `
                                    <div class="alert alert-success">
                                        <i class="bi bi-check-circle"></i>
                                        <small>Todos los proyectos están asignados</small>
                                    </div>
                                ` : unassignedProjects.map(project => {
                                    const suggestion = this.suggestRelease(project);
                                    return `
                                        <div class="project-card draggable" draggable="true"
                                             data-project-code="${project.proyectoFs}"
                                             data-suggested-month="${suggestion.month}"
                                             data-suggested-week="${suggestion.week}">
                                            <div class="d-flex align-items-start">
                                                <div class="project-type-icon ${this.getTypeBadgeClass(project.tipoProyecto)}">
                                                    ${this.getTypeIcon(project.tipoProyecto)}
                                                </div>
                                                <div class="flex-grow-1 ms-2">
                                                    <div class="project-code-sm">${project.proyectoFs}</div>
                                                    <div class="project-name-sm">${this.truncate(project.nombre, 35)}</div>
                                                    <div class="project-leader-sm">
                                                        <i class="bi bi-person"></i> ${project.nombreLt || '-'}
                                                    </div>
                                                    <div class="project-suggestion">
                                                        <i class="bi bi-lightbulb text-warning"></i>
                                                        <small>${suggestion.reason}</small>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Calendario de liberaciones -->
                <div class="col-md-9">
                    <div class="release-calendar">
                        ${this.renderReleaseCalendar()}
                    </div>
                </div>
            </div>
        `;

        document.getElementById('releaseMapPage').innerHTML = html;
    }

    renderReleaseCalendar() {
        let html = '<div class="row g-3">';

        for (let month = 1; month <= 12; month++) {
            html += `
                <div class="col-md-6 col-lg-4">
                    <div class="month-release-card">
                        <div class="month-release-header">
                            <h6 class="mb-0">${this.months[month - 1]} ${this.currentYear}</h6>
                        </div>
                        <div class="month-release-body">
                            ${this.renderWeeks(month)}
                        </div>
                    </div>
                </div>
            `;
        }

        html += '</div>';
        return html;
    }

    renderWeeks(month) {
        let html = '';
        for (let week = 1; week <= 4; week++) {
            const assignedProjects = this.getAssignedProjects(month, week);
            html += `
                <div class="week-drop-zone" data-month="${month}" data-week="${week}">
                    <div class="week-label">Semana ${week}</div>
                    <div class="week-projects-container">
                        ${assignedProjects.length === 0 ? `
                            <div class="empty-week">
                                <i class="bi bi-inbox"></i>
                                <small>Arrastra aquí</small>
                            </div>
                        ` : assignedProjects.map(project => `
                            <div class="assigned-project-card" data-project-code="${project.proyectoFs}">
                                <div class="d-flex justify-content-between align-items-start">
                                    <div>
                                        <div class="assigned-project-code">${project.proyectoFs}</div>
                                        <div class="assigned-project-name">${this.truncate(project.nombre, 25)}</div>
                                    </div>
                                    <button class="btn btn-sm btn-danger p-0" style="width: 20px; height: 20px;"
                                            onclick="releaseMapManager.removeProjectFromRelease('${project.proyectoFs}'); releaseMapManager.render();">
                                        <i class="bi bi-x" style="font-size: 12px;"></i>
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        return html;
    }

    initializeDragAndDrop() {
        // Drag start
        document.querySelectorAll('.draggable').forEach(item => {
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', e.target.dataset.projectCode);
                e.target.classList.add('dragging');
            });

            item.addEventListener('dragend', (e) => {
                e.target.classList.remove('dragging');
            });
        });

        // Drop zones
        document.querySelectorAll('.week-drop-zone').forEach(zone => {
            zone.addEventListener('dragover', (e) => {
                e.preventDefault();
                zone.classList.add('drag-over');
            });

            zone.addEventListener('dragleave', (e) => {
                zone.classList.remove('drag-over');
            });

            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                zone.classList.remove('drag-over');

                const projectCode = e.dataTransfer.getData('text/plain');
                const month = parseInt(zone.dataset.month);
                const week = parseInt(zone.dataset.week);

                this.assignProjectToRelease(projectCode, month, week);
                this.render();
                showToast(`Proyecto asignado a ${this.months[month-1]}, Semana ${week}`, 'success');
            });
        });
    }

    autoSuggestAll() {
        const unassigned = this.getUnassignedProjects();
        unassigned.forEach(project => {
            const suggestion = this.suggestRelease(project);
            this.assignProjectToRelease(project.proyectoFs, suggestion.month, suggestion.week);
        });
        this.render();
        showToast(`${unassigned.length} proyectos asignados automáticamente`, 'success');
    }

    exportToExcel() {
        const exportData = [];

        for (let month = 1; month <= 12; month++) {
            for (let week = 1; week <= 4; week++) {
                const projects = this.getAssignedProjects(month, week);
                projects.forEach(project => {
                    exportData.push({
                        'Mes': this.months[month - 1],
                        'Semana': week,
                        'Código': project.proyectoFs,
                        'Proyecto': project.nombre,
                        'Tipo': project.tipoProyecto,
                        'Líder Técnico': project.nombreLt,
                        'Estado': project.estado,
                        'Horas Estimadas': project.totalEstimacion
                    });
                });
            }
        }

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Liberaciones');

        const fileName = `liberaciones_${this.currentYear}.xlsx`;
        XLSX.writeFile(wb, fileName);
        showToast('Excel exportado correctamente', 'success');
    }

    toggleType(type) {
        const index = this.selectedTypes.indexOf(type);
        if (index > -1) {
            this.selectedTypes.splice(index, 1);
        } else {
            this.selectedTypes.push(type);
        }
        this.render();
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
        if (!type) return '<i class="bi bi-question-circle"></i>';

        const typeStr = type.toString().toLowerCase().trim();

        // Proyecto
        if (typeStr.includes('proyecto') || typeStr.includes('project') ||
            typeStr === 'p' || typeStr === 'proy') {
            return '<i class="bi bi-folder-fill"></i>';
        }

        // Requerimiento
        if (typeStr.includes('requerimiento') || typeStr.includes('requirement') ||
            typeStr.includes('req') || typeStr === 'r') {
            return '<i class="bi bi-file-text-fill"></i>';
        }

        // Soporte
        if (typeStr.includes('soporte') || typeStr.includes('support') ||
            typeStr.includes('sop') || typeStr === 's') {
            return '<i class="bi bi-tools"></i>';
        }

        // Ticket
        if (typeStr.includes('ticket') || typeStr.includes('tck')) {
            return '<i class="bi bi-ticket-detailed-fill"></i>';
        }

        // Default
        return '<i class="bi bi-circle-fill"></i>';
    }

    getTypeBadgeClass(type) {
        if (!type) return 'type-default';

        const typeStr = type.toString().toLowerCase().trim();

        // Proyecto
        if (typeStr.includes('proyecto') || typeStr.includes('project') ||
            typeStr === 'p' || typeStr === 'proy') {
            return 'type-proyecto';
        }

        // Requerimiento
        if (typeStr.includes('requerimiento') || typeStr.includes('requirement') ||
            typeStr.includes('req') || typeStr === 'r') {
            return 'type-requerimiento';
        }

        // Soporte
        if (typeStr.includes('soporte') || typeStr.includes('support') ||
            typeStr.includes('sop') || typeStr === 's') {
            return 'type-soporte';
        }

        // Ticket
        if (typeStr.includes('ticket') || typeStr.includes('tck')) {
            return 'type-ticket';
        }

        return 'type-default';
    }
}

// Instancia global
const releaseMapManager = new ReleaseMapManager();
