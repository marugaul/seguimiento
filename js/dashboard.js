// Gestión del Dashboard
class DashboardManager {
    constructor() {
        this.projects = [];
        this.filteredProjects = [];
        this.charts = {};
        this.filters = {
            lider: '',
            pais: '',
            estado: '',
            etapa: ''
        };
    }

    loadProjects() {
        this.projects = storageManager.getProjects();
        this.applyFilters();
        return this.projects;
    }

    applyFilters() {
        this.filteredProjects = this.projects.filter(project => {
            if (this.filters.lider && project.nombreLt !== this.filters.lider) return false;
            if (this.filters.pais && project.pais !== this.filters.pais) return false;
            if (this.filters.estado && project.estado !== this.filters.estado) return false;
            if (this.filters.etapa && project.etapa !== this.filters.etapa) return false;
            return true;
        });
    }

    setFilter(filterName, value) {
        this.filters[filterName] = value;
        this.applyFilters();
        this.render();
    }

    clearFilters() {
        this.filters = { lider: '', pais: '', estado: '', etapa: '' };
        this.applyFilters();
        this.render();
    }

    getUniqueValues(field) {
        const values = [...new Set(this.projects.map(p => p[field]))];
        return values.filter(v => v).sort();
    }

    getStats() {
        const projects = this.filteredProjects;
        return {
            totalProjects: projects.length,
            totalHorasEstimadas: projects.reduce((sum, p) => sum + p.totalEstimacion, 0),
            totalHorasRegistradas: projects.reduce((sum, p) => sum + p.totalRegistrado, 0),
            totalLideres: new Set(projects.map(p => p.nombreLt)).size
        };
    }

    render() {
        const dashboardHtml = this.generateDashboardHTML();
        document.getElementById('dashboardPage').innerHTML = dashboardHtml;
        this.renderCharts();
    }

    generateDashboardHTML() {
        const stats = this.getStats();
        const metadata = storageManager.getMetadata();
        const lideres = this.getUniqueValues('nombreLt');
        const paises = this.getUniqueValues('pais');
        const estados = this.getUniqueValues('estado');
        const etapas = this.getUniqueValues('etapa');

        return `
            <div class="row mb-4">
                <div class="col">
                    <h2><i class="bi bi-speedometer2"></i> Dashboard de Proyectos</h2>
                    ${metadata ? `
                        <p class="text-muted">
                            <i class="bi bi-clock"></i> Última actualización: ${new Date(metadata.lastUpdate).toLocaleString('es')}
                        </p>
                    ` : ''}
                </div>
            </div>

            <!-- Tarjetas de resumen -->
            <div class="row mb-4">
                <div class="col-md-3">
                    <div class="card bg-primary text-white">
                        <div class="card-body">
                            <h6><i class="bi bi-folder"></i> Total Proyectos</h6>
                            <h2>${stats.totalProjects}</h2>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-success text-white">
                        <div class="card-body">
                            <h6><i class="bi bi-clock-history"></i> Horas Estimadas</h6>
                            <h2>${stats.totalHorasEstimadas.toLocaleString('es')}</h2>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-info text-white">
                        <div class="card-body">
                            <h6><i class="bi bi-check-circle"></i> Horas Registradas</h6>
                            <h2>${stats.totalHorasRegistradas.toLocaleString('es')}</h2>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-warning text-white">
                        <div class="card-body">
                            <h6><i class="bi bi-people"></i> Líderes Técnicos</h6>
                            <h2>${stats.totalLideres}</h2>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Filtros -->
            <div class="card mb-4">
                <div class="card-header bg-light">
                    <h5 class="mb-0"><i class="bi bi-funnel"></i> Filtros</h5>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-3">
                            <label class="form-label">Líder Técnico</label>
                            <select id="filterLider" class="form-select" onchange="dashboardManager.setFilter('lider', this.value)">
                                <option value="">Todos</option>
                                ${lideres.map(l => `<option value="${l}" ${this.filters.lider === l ? 'selected' : ''}>${l}</option>`).join('')}
                            </select>
                        </div>
                        <div class="col-md-3">
                            <label class="form-label">País</label>
                            <select id="filterPais" class="form-select" onchange="dashboardManager.setFilter('pais', this.value)">
                                <option value="">Todos</option>
                                ${paises.map(p => `<option value="${p}" ${this.filters.pais === p ? 'selected' : ''}>${p}</option>`).join('')}
                            </select>
                        </div>
                        <div class="col-md-3">
                            <label class="form-label">Estado</label>
                            <select id="filterEstado" class="form-select" onchange="dashboardManager.setFilter('estado', this.value)">
                                <option value="">Todos</option>
                                ${estados.map(e => `<option value="${e}" ${this.filters.estado === e ? 'selected' : ''}>${e}</option>`).join('')}
                            </select>
                        </div>
                        <div class="col-md-3">
                            <label class="form-label">Etapa</label>
                            <select id="filterEtapa" class="form-select" onchange="dashboardManager.setFilter('etapa', this.value)">
                                <option value="">Todas</option>
                                ${etapas.map(e => `<option value="${e}" ${this.filters.etapa === e ? 'selected' : ''}>${e}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="row mt-3">
                        <div class="col">
                            <button class="btn btn-secondary" onclick="dashboardManager.clearFilters()">
                                <i class="bi bi-x-circle"></i> Limpiar Filtros
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Gráficos -->
            <div class="row mb-4">
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header bg-light">
                            <h6 class="mb-0">Proyectos por Estado</h6>
                        </div>
                        <div class="card-body">
                            <canvas id="chartEstado" height="250"></canvas>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header bg-light">
                            <h6 class="mb-0">Proyectos por Etapa</h6>
                        </div>
                        <div class="card-body">
                            <canvas id="chartEtapa" height="250"></canvas>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row mb-4">
                <div class="col-md-12">
                    <div class="card">
                        <div class="card-header bg-light">
                            <h6 class="mb-0">Horas por Mes (2025)</h6>
                        </div>
                        <div class="card-body">
                            <canvas id="chartMeses" height="100"></canvas>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row mb-4">
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header bg-light">
                            <h6 class="mb-0">Top 10 Líderes por Proyectos</h6>
                        </div>
                        <div class="card-body">
                            <canvas id="chartLideres" height="250"></canvas>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header bg-light">
                            <h6 class="mb-0">Proyectos por País</h6>
                        </div>
                        <div class="card-body">
                            <canvas id="chartPaises" height="250"></canvas>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tabla de proyectos -->
            <div class="card">
                <div class="card-header bg-light">
                    <h5 class="mb-0"><i class="bi bi-table"></i> Detalle de Proyectos (${this.filteredProjects.length} proyectos)</h5>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-striped table-hover table-sm">
                            <thead class="table-dark">
                                <tr>
                                    <th>Líder Técnico</th>
                                    <th>País</th>
                                    <th>Proyecto FS</th>
                                    <th>Nombre</th>
                                    <th>Estado</th>
                                    <th>Etapa</th>
                                    <th class="text-end">Horas Est.</th>
                                    <th class="text-end">Horas Reg.</th>
                                    <th class="text-end">% Avance</th>
                                    <th>Comentarios</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this.filteredProjects.map(p => this.generateProjectRow(p)).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    generateProjectRow(project) {
        const estadoBadgeClass = project.estado === 'EN PROCESO' ? 'bg-primary' :
            project.estado === 'REACTIVADO CLIENTE' ? 'bg-warning' : 'bg-secondary';

        const comentarios = project.comentarios.length > 50 ?
            project.comentarios.substring(0, 50) + '...' : project.comentarios;

        return `
            <tr>
                <td><strong>${project.nombreLt}</strong></td>
                <td><span class="badge bg-secondary">${project.pais}</span></td>
                <td>${project.proyectoFs}</td>
                <td>${project.nombre}</td>
                <td><span class="badge ${estadoBadgeClass}">${project.estado}</span></td>
                <td><small>${project.etapa}</small></td>
                <td class="text-end">${project.totalEstimacion.toLocaleString('es')}</td>
                <td class="text-end">${project.totalRegistrado.toLocaleString('es')}</td>
                <td class="text-end">${project.porcentajeAvanceHoras}</td>
                <td><small>${comentarios}</small></td>
            </tr>
        `;
    }

    renderCharts() {
        // Destruir gráficos anteriores
        Object.values(this.charts).forEach(chart => chart?.destroy());
        this.charts = {};

        const projects = this.filteredProjects;

        // Proyectos por Estado
        const estadoData = this.groupBy(projects, 'estado');
        this.charts.estado = new Chart(document.getElementById('chartEstado'), {
            type: 'doughnut',
            data: {
                labels: Object.keys(estadoData),
                datasets: [{
                    data: Object.values(estadoData),
                    backgroundColor: ['#0d6efd', '#198754', '#ffc107', '#dc3545', '#6c757d', '#0dcaf0']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'right' } }
            }
        });

        // Proyectos por Etapa
        const etapaData = this.groupBy(projects, 'etapa');
        this.charts.etapa = new Chart(document.getElementById('chartEtapa'), {
            type: 'pie',
            data: {
                labels: Object.keys(etapaData),
                datasets: [{
                    data: Object.values(etapaData),
                    backgroundColor: ['#198754', '#0d6efd', '#ffc107', '#dc3545', '#6c757d', '#0dcaf0']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'right' } }
            }
        });

        // Horas por Mes
        const mesesData = {
            'Ene': projects.reduce((sum, p) => sum + p.mes01, 0),
            'Feb': projects.reduce((sum, p) => sum + p.mes02, 0),
            'Mar': projects.reduce((sum, p) => sum + p.mes03, 0),
            'Abr': projects.reduce((sum, p) => sum + p.mes04, 0),
            'May': projects.reduce((sum, p) => sum + p.mes05, 0),
            'Jun': projects.reduce((sum, p) => sum + p.mes06, 0),
            'Jul': projects.reduce((sum, p) => sum + p.mes07, 0),
            'Ago': projects.reduce((sum, p) => sum + p.mes08, 0),
            'Sep': projects.reduce((sum, p) => sum + p.mes09, 0),
            'Oct': projects.reduce((sum, p) => sum + p.mes10, 0),
            'Nov': projects.reduce((sum, p) => sum + p.mes11, 0),
            'Dic': projects.reduce((sum, p) => sum + p.mes12, 0)
        };

        this.charts.meses = new Chart(document.getElementById('chartMeses'), {
            type: 'bar',
            data: {
                labels: Object.keys(mesesData),
                datasets: [{
                    label: 'Horas',
                    data: Object.values(mesesData),
                    backgroundColor: '#0d6efd'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: { y: { beginAtZero: true } }
            }
        });

        // Top 10 Líderes
        const lideresData = this.groupBy(projects, 'nombreLt');
        const topLideres = Object.entries(lideresData)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);

        this.charts.lideres = new Chart(document.getElementById('chartLideres'), {
            type: 'bar',
            data: {
                labels: topLideres.map(l => l[0]),
                datasets: [{
                    label: 'Proyectos',
                    data: topLideres.map(l => l[1]),
                    backgroundColor: '#198754'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                scales: { x: { beginAtZero: true } }
            }
        });

        // Proyectos por País
        const paisData = this.groupBy(projects, 'pais');
        this.charts.paises = new Chart(document.getElementById('chartPaises'), {
            type: 'doughnut',
            data: {
                labels: Object.keys(paisData),
                datasets: [{
                    data: Object.values(paisData),
                    backgroundColor: ['#ffc107', '#0d6efd', '#198754', '#dc3545', '#6c757d', '#0dcaf0']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'right' } }
            }
        });
    }

    groupBy(array, field) {
        const grouped = {};
        array.forEach(item => {
            const key = item[field] || 'Sin especificar';
            grouped[key] = (grouped[key] || 0) + 1;
        });
        return grouped;
    }
}

// Crear instancia global
const dashboardManager = new DashboardManager();
