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
            etapa: '',
            tipo: '',           // LOCAL o REGIONAL
            categoria: ''       // PROYECTO, SOPORTE, REQUERIMIENTO
        };
    }

    loadProjects() {
        this.projects = storageManager.getProjects();
        this.enrichProjects(); // Agregar campos calculados
        this.applyFilters();
        return this.projects;
    }

    enrichProjects() {
        this.projects.forEach(project => {
            // Determinar categoría basándose en TIPO PROYECTO
            if (project.tipoProyecto.toUpperCase().includes('IMPLEMENTACIÓN') ||
                project.tipoProyecto.toUpperCase().includes('IMPLEMENTACION')) {
                project.categoria = 'PROYECTO';
                project.numero = project.iniciativa;
            } else if (project.tipoProyecto.toUpperCase().includes('SOPORTE')) {
                project.categoria = 'SOPORTE';
                project.numero = project.casoFs;
            } else if (project.tipoProyecto.toUpperCase().includes('REQUERIMIENTO')) {
                project.categoria = 'REQUERIMIENTO';
                project.numero = project.casoFs;
            } else {
                project.categoria = 'OTRO';
                project.numero = project.casoFs || project.iniciativa;
            }

            // Validar presupuesto: (Estimación + Control Cambio) vs (Total Registrado + Total Disponible)
            const presupuestoTotal = project.estimacion + project.controlCambio;
            const consumoTotal = project.totalRegistrado + project.totalDisponible;

            if (presupuestoTotal > consumoTotal) {
                project.alertaPresupuesto = 'CRITICO'; // Rojo
            } else if (presupuestoTotal === consumoTotal) {
                project.alertaPresupuesto = 'OK'; // Verde
            } else {
                project.alertaPresupuesto = 'ADVERTENCIA'; // Amarillo - hay más presupuesto del necesario
            }

            // Calcular desviación absoluta
            project.desviacionAbsoluta = Math.abs(project.desvHoras);

            // Parsear porcentajes para comparación
            project.avanceRealNumerico = this.parsePercentage(project.porcentajeAvanceReal);
            project.avanceEsperadoNumerico = this.parsePercentage(project.porcentajeAvanceEsperado);
            project.avanceHorasNumerico = this.parsePercentage(project.porcentajeAvanceHoras);

            // Determinar si está desviado (más de 10% de diferencia)
            const desviacionAvance = project.avanceEsperadoNumerico - project.avanceRealNumerico;
            project.estadoDesviacion = desviacionAvance > 10 ? 'RETRASADO' :
                                      desviacionAvance < -10 ? 'ADELANTADO' : 'EN_TIEMPO';
        });
    }

    parsePercentage(percentStr) {
        if (!percentStr) return 0;
        const cleaned = String(percentStr).replace('%', '').trim();
        const num = parseFloat(cleaned);
        return isNaN(num) ? 0 : num;
    }

    applyFilters() {
        this.filteredProjects = this.projects.filter(project => {
            if (this.filters.lider && project.nombreLt !== this.filters.lider) return false;
            if (this.filters.pais && project.pais !== this.filters.pais) return false;
            if (this.filters.estado && project.estado !== this.filters.estado) return false;
            if (this.filters.etapa && project.etapa !== this.filters.etapa) return false;
            if (this.filters.tipo && project.tipo !== this.filters.tipo) return false;
            if (this.filters.categoria && project.categoria !== this.filters.categoria) return false;
            return true;
        });
    }

    setFilter(filterName, value) {
        this.filters[filterName] = value;
        this.applyFilters();
        this.render();
    }

    clearFilters() {
        this.filters = { lider: '', pais: '', estado: '', etapa: '', tipo: '', categoria: '' };
        this.applyFilters();
        this.render();
    }

    getUniqueValues(field) {
        const values = [...new Set(this.projects.map(p => p[field]))];
        return values.filter(v => v).sort();
    }

    getStats() {
        const projects = this.filteredProjects;

        // Contar por categoría
        const proyectos = projects.filter(p => p.categoria === 'PROYECTO').length;
        const soportes = projects.filter(p => p.categoria === 'SOPORTE').length;
        const requerimientos = projects.filter(p => p.categoria === 'REQUERIMIENTO').length;

        // Contar alertas de presupuesto
        const alertasCriticas = projects.filter(p => p.alertaPresupuesto === 'CRITICO').length;

        // Contar desviaciones
        const retrasados = projects.filter(p => p.estadoDesviacion === 'RETRASADO').length;
        const adelantados = projects.filter(p => p.estadoDesviacion === 'ADELANTADO').length;

        return {
            totalProjects: projects.length,
            totalProyectos: proyectos,
            totalSoportes: soportes,
            totalRequerimientos: requerimientos,
            totalHorasEstimadas: projects.reduce((sum, p) => sum + p.totalEstimacion, 0),
            totalHorasRegistradas: projects.reduce((sum, p) => sum + p.totalRegistrado, 0),
            totalLideres: new Set(projects.map(p => p.nombreLt)).size,
            alertasCriticas: alertasCriticas,
            retrasados: retrasados,
            adelantados: adelantados,
            promedioAvanceReal: projects.length > 0 ?
                projects.reduce((sum, p) => sum + p.avanceRealNumerico, 0) / projects.length : 0,
            promedioAvanceEsperado: projects.length > 0 ?
                projects.reduce((sum, p) => sum + p.avanceEsperadoNumerico, 0) / projects.length : 0
        };
    }

    getMensualData() {
        const projects = this.filteredProjects;
        return {
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
    }

    getComparativaMensual() {
        const mesesData = this.getMensualData();
        const meses = Object.keys(mesesData);
        const valores = Object.values(mesesData);

        const comparativa = {
            meses: [],
            variacion: [],
            variacionPorcentual: []
        };

        for (let i = 1; i < meses.length; i++) {
            const mesActual = meses[i];
            const mesAnterior = meses[i - 1];
            const valorActual = valores[i];
            const valorAnterior = valores[i - 1];

            const variacion = valorActual - valorAnterior;
            const variacionPct = valorAnterior !== 0 ? ((variacion / valorAnterior) * 100) : 0;

            comparativa.meses.push(`${mesAnterior}-${mesActual}`);
            comparativa.variacion.push(variacion);
            comparativa.variacionPorcentual.push(variacionPct);
        }

        return comparativa;
    }

    getTendenciaPorLider() {
        const projects = this.filteredProjects;
        const lideres = [...new Set(projects.map(p => p.nombreLt))].filter(l => l).slice(0, 5); // Top 5 líderes

        const datasets = lideres.map((lider, index) => {
            const proyectosLider = projects.filter(p => p.nombreLt === lider);
            const colors = ['#0d6efd', '#198754', '#ffc107', '#dc3545', '#6c757d'];

            return {
                label: lider,
                data: [
                    proyectosLider.reduce((sum, p) => sum + p.mes01, 0),
                    proyectosLider.reduce((sum, p) => sum + p.mes02, 0),
                    proyectosLider.reduce((sum, p) => sum + p.mes03, 0),
                    proyectosLider.reduce((sum, p) => sum + p.mes04, 0),
                    proyectosLider.reduce((sum, p) => sum + p.mes05, 0),
                    proyectosLider.reduce((sum, p) => sum + p.mes06, 0),
                    proyectosLider.reduce((sum, p) => sum + p.mes07, 0),
                    proyectosLider.reduce((sum, p) => sum + p.mes08, 0),
                    proyectosLider.reduce((sum, p) => sum + p.mes09, 0),
                    proyectosLider.reduce((sum, p) => sum + p.mes10, 0),
                    proyectosLider.reduce((sum, p) => sum + p.mes11, 0),
                    proyectosLider.reduce((sum, p) => sum + p.mes12, 0)
                ],
                borderColor: colors[index],
                backgroundColor: colors[index] + '33',
                tension: 0.4
            };
        });

        return datasets;
    }

    getProyectosActivosPorMes() {
        const projects = this.filteredProjects;
        const activos = [];

        for (let mes = 1; mes <= 12; mes++) {
            const mesKey = `mes${mes.toString().padStart(2, '0')}`;
            const proyectosActivos = projects.filter(p => p[mesKey] > 0).length;
            activos.push(proyectosActivos);
        }

        return activos;
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
        const tipos = this.getUniqueValues('tipo');

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

            <!-- Tarjetas de resumen principales -->
            <div class="row mb-4">
                <div class="col-md-3">
                    <div class="card bg-primary text-white">
                        <div class="card-body">
                            <h6><i class="bi bi-folder"></i> Total General</h6>
                            <h2>${stats.totalProjects}</h2>
                            <small>Proyectos, Soportes y Requerimientos</small>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-success text-white">
                        <div class="card-body">
                            <h6><i class="bi bi-diagram-3"></i> Proyectos</h6>
                            <h2>${stats.totalProyectos}</h2>
                            <small>Implementaciones</small>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-info text-white">
                        <div class="card-body">
                            <h6><i class="bi bi-tools"></i> Soportes</h6>
                            <h2>${stats.totalSoportes}</h2>
                            <small>Casos de soporte</small>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-warning text-white">
                        <div class="card-body">
                            <h6><i class="bi bi-clipboard-check"></i> Requerimientos</h6>
                            <h2>${stats.totalRequerimientos}</h2>
                            <small>Solicitudes</small>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tarjetas de alertas y métricas -->
            <div class="row mb-4">
                <div class="col-md-3">
                    <div class="card ${stats.alertasCriticas > 0 ? 'bg-danger' : 'bg-success'} text-white">
                        <div class="card-body">
                            <h6><i class="bi bi-exclamation-triangle"></i> Alertas Presupuesto</h6>
                            <h2>${stats.alertasCriticas}</h2>
                            <small>Proyectos con presupuesto excedido</small>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-danger text-white">
                        <div class="card-body">
                            <h6><i class="bi bi-arrow-down-circle"></i> Retrasados</h6>
                            <h2>${stats.retrasados}</h2>
                            <small>Con desviación negativa</small>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-primary text-white">
                        <div class="card-body">
                            <h6><i class="bi bi-percent"></i> Avance Real</h6>
                            <h2>${stats.promedioAvanceReal.toFixed(1)}%</h2>
                            <small>Promedio general</small>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-secondary text-white">
                        <div class="card-body">
                            <h6><i class="bi bi-graph-up"></i> Avance Esperado</h6>
                            <h2>${stats.promedioAvanceEsperado.toFixed(1)}%</h2>
                            <small>Promedio planificado</small>
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
                        <div class="col-md-2">
                            <label class="form-label">Tipo</label>
                            <select id="filterTipo" class="form-select" onchange="dashboardManager.setFilter('tipo', this.value)">
                                <option value="">Todos</option>
                                ${tipos.map(t => `<option value="${t}" ${this.filters.tipo === t ? 'selected' : ''}>${t}</option>`).join('')}
                            </select>
                        </div>
                        <div class="col-md-2">
                            <label class="form-label">Categoría</label>
                            <select id="filterCategoria" class="form-select" onchange="dashboardManager.setFilter('categoria', this.value)">
                                <option value="">Todos</option>
                                <option value="PROYECTO" ${this.filters.categoria === 'PROYECTO' ? 'selected' : ''}>Proyectos</option>
                                <option value="SOPORTE" ${this.filters.categoria === 'SOPORTE' ? 'selected' : ''}>Soportes</option>
                                <option value="REQUERIMIENTO" ${this.filters.categoria === 'REQUERIMIENTO' ? 'selected' : ''}>Requerimientos</option>
                            </select>
                        </div>
                        <div class="col-md-2">
                            <label class="form-label">Líder Técnico</label>
                            <select id="filterLider" class="form-select" onchange="dashboardManager.setFilter('lider', this.value)">
                                <option value="">Todos</option>
                                ${lideres.map(l => `<option value="${l}" ${this.filters.lider === l ? 'selected' : ''}>${l}</option>`).join('')}
                            </select>
                        </div>
                        <div class="col-md-2">
                            <label class="form-label">País</label>
                            <select id="filterPais" class="form-select" onchange="dashboardManager.setFilter('pais', this.value)">
                                <option value="">Todos</option>
                                ${paises.map(p => `<option value="${p}" ${this.filters.pais === p ? 'selected' : ''}>${p}</option>`).join('')}
                            </select>
                        </div>
                        <div class="col-md-2">
                            <label class="form-label">Estado</label>
                            <select id="filterEstado" class="form-select" onchange="dashboardManager.setFilter('estado', this.value)">
                                <option value="">Todos</option>
                                ${estados.map(e => `<option value="${e}" ${this.filters.estado === e ? 'selected' : ''}>${e}</option>`).join('')}
                            </select>
                        </div>
                        <div class="col-md-2">
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

            <!-- Sección de Tendencias y Comparativas -->
            <div class="row mb-4">
                <div class="col">
                    <h4><i class="bi bi-graph-up"></i> Análisis de Tendencias Mensuales</h4>
                    <hr>
                </div>
            </div>

            <!-- Tendencias Mensuales -->
            <div class="row mb-4">
                <div class="col-md-12">
                    <div class="card border-primary">
                        <div class="card-header bg-primary text-white">
                            <h6 class="mb-0"><i class="bi bi-activity"></i> Tendencia de Horas por Mes (Línea de Tiempo)</h6>
                        </div>
                        <div class="card-body">
                            <canvas id="chartTendenciaMensual" height="80"></canvas>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Comparativa Mes a Mes -->
            <div class="row mb-4">
                <div class="col-md-6">
                    <div class="card border-success">
                        <div class="card-header bg-success text-white">
                            <h6 class="mb-0"><i class="bi bi-bar-chart-line"></i> Variación de Horas Mes a Mes</h6>
                        </div>
                        <div class="card-body">
                            <canvas id="chartVariacionMensual" height="250"></canvas>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card border-warning">
                        <div class="card-header bg-warning text-dark">
                            <h6 class="mb-0"><i class="bi bi-percent"></i> Variación Porcentual Mes a Mes</h6>
                        </div>
                        <div class="card-body">
                            <canvas id="chartVariacionPorcentual" height="250"></canvas>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tendencias por Líder -->
            <div class="row mb-4">
                <div class="col-md-8">
                    <div class="card border-info">
                        <div class="card-header bg-info text-white">
                            <h6 class="mb-0"><i class="bi bi-people-fill"></i> Tendencia por Líder Técnico (Top 5)</h6>
                        </div>
                        <div class="card-body">
                            <canvas id="chartTendenciaLider" height="180"></canvas>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card border-secondary">
                        <div class="card-header bg-secondary text-white">
                            <h6 class="mb-0"><i class="bi bi-bookmark-star"></i> Proyectos Activos por Mes</h6>
                        </div>
                        <div class="card-body">
                            <canvas id="chartProyectosActivos" height="280"></canvas>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Gráficos de análisis -->
            <div class="row mb-4">
                <div class="col">
                    <h4><i class="bi bi-pie-chart"></i> Distribución y Análisis</h4>
                    <hr>
                </div>
            </div>

            <div class="row mb-4">
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header bg-light">
                            <h6 class="mb-0">Proyectos por Tipo (Local/Regional)</h6>
                        </div>
                        <div class="card-body">
                            <canvas id="chartTipo" height="250"></canvas>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header bg-light">
                            <h6 class="mb-0">Por Categoría (Proyecto/Soporte/Req.)</h6>
                        </div>
                        <div class="card-body">
                            <canvas id="chartCategoria" height="250"></canvas>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row mb-4">
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header bg-danger text-white">
                            <h6 class="mb-0"><i class="bi bi-exclamation-octagon"></i> Top 10 Proyectos con Mayor Desviación</h6>
                        </div>
                        <div class="card-body">
                            <canvas id="chartDesviacion" height="250"></canvas>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header bg-warning text-dark">
                            <h6 class="mb-0"><i class="bi bi-shield-exclamation"></i> Alertas de Presupuesto</h6>
                        </div>
                        <div class="card-body">
                            <canvas id="chartPresupuesto" height="250"></canvas>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row mb-4">
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header bg-light">
                            <h6 class="mb-0">Avance Real vs Esperado</h6>
                        </div>
                        <div class="card-body">
                            <canvas id="chartAvance" height="250"></canvas>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header bg-light">
                            <h6 class="mb-0">Estado de Desviación</h6>
                        </div>
                        <div class="card-body">
                            <canvas id="chartEstadoDesviacion" height="250"></canvas>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Gráficos originales -->
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
                            <h6 class="mb-0">Horas por Mes (2025)</h6>
                        </div>
                        <div class="card-body">
                            <canvas id="chartMeses" height="250"></canvas>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tabla de proyectos mejorada -->
            <div class="card">
                <div class="card-header bg-light">
                    <h5 class="mb-0"><i class="bi bi-table"></i> Detalle de Proyectos (${this.filteredProjects.length} registros)</h5>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-striped table-hover table-sm">
                            <thead class="table-dark">
                                <tr>
                                    <th>Tipo</th>
                                    <th>Categoría</th>
                                    <th>Número</th>
                                    <th>Líder Técnico</th>
                                    <th>País</th>
                                    <th>Nombre</th>
                                    <th>Estado</th>
                                    <th class="text-end">Hrs Est.</th>
                                    <th class="text-end">Hrs Reg.</th>
                                    <th class="text-end">Desv. Hrs</th>
                                    <th class="text-end">% Desv.</th>
                                    <th class="text-end">% Real</th>
                                    <th class="text-end">% Esperado</th>
                                    <th class="text-center">Alerta</th>
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

        const categoriaBadge = project.categoria === 'PROYECTO' ? 'bg-success' :
                              project.categoria === 'SOPORTE' ? 'bg-info' : 'bg-warning';

        const alertaSemaforo = project.alertaPresupuesto === 'CRITICO' ? '🔴' :
                              project.alertaPresupuesto === 'OK' ? '🟢' : '🟡';

        const desviacionColor = project.desvHoras < 0 ? 'text-success' :
                               project.desvHoras > 0 ? 'text-danger' : '';

        return `
            <tr>
                <td><span class="badge bg-secondary">${project.tipo}</span></td>
                <td><span class="badge ${categoriaBadge}">${project.categoria}</span></td>
                <td><small>${project.numero}</small></td>
                <td><strong>${project.nombreLt}</strong></td>
                <td>${project.pais}</td>
                <td><small>${project.nombre.substring(0, 40)}${project.nombre.length > 40 ? '...' : ''}</small></td>
                <td><span class="badge ${estadoBadgeClass}">${project.estado}</span></td>
                <td class="text-end">${project.totalEstimacion.toLocaleString('es')}</td>
                <td class="text-end">${project.totalRegistrado.toLocaleString('es')}</td>
                <td class="text-end ${desviacionColor}"><strong>${project.desvHoras.toLocaleString('es')}</strong></td>
                <td class="text-end ${desviacionColor}"><strong>${project.porcentajeDesviacion}</strong></td>
                <td class="text-end">${project.porcentajeAvanceReal}</td>
                <td class="text-end">${project.porcentajeAvanceEsperado}</td>
                <td class="text-center" title="${project.alertaPresupuesto}">${alertaSemaforo}</td>
            </tr>
        `;
    }

    renderCharts() {
        // Destruir gráficos anteriores
        Object.values(this.charts).forEach(chart => chart?.destroy());
        this.charts = {};

        const projects = this.filteredProjects;
        const mesesData = this.getMensualData();
        const comparativa = this.getComparativaMensual();

        // === GRÁFICOS DE TENDENCIAS ===

        // 1. Tendencia Mensual (Línea de Tiempo)
        this.charts.tendenciaMensual = new Chart(document.getElementById('chartTendenciaMensual'), {
            type: 'line',
            data: {
                labels: Object.keys(mesesData),
                datasets: [{
                    label: 'Horas Trabajadas',
                    data: Object.values(mesesData),
                    borderColor: '#0d6efd',
                    backgroundColor: 'rgba(13, 110, 253, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true, position: 'top' },
                    title: {
                        display: true,
                        text: 'Evolución de Horas a lo Largo del Año 2025'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Horas' }
                    },
                    x: {
                        title: { display: true, text: 'Meses' }
                    }
                }
            }
        });

        // 2. Variación de Horas Mes a Mes
        this.charts.variacionMensual = new Chart(document.getElementById('chartVariacionMensual'), {
            type: 'bar',
            data: {
                labels: comparativa.meses,
                datasets: [{
                    label: 'Variación (Horas)',
                    data: comparativa.variacion,
                    backgroundColor: comparativa.variacion.map(v => v >= 0 ? '#198754' : '#dc3545'),
                    borderColor: comparativa.variacion.map(v => v >= 0 ? '#146c43' : '#b02a37'),
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true },
                    title: {
                        display: true,
                        text: 'Diferencia de Horas entre Meses Consecutivos'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Variación (Horas)' }
                    }
                }
            }
        });

        // 3. Variación Porcentual Mes a Mes
        this.charts.variacionPorcentual = new Chart(document.getElementById('chartVariacionPorcentual'), {
            type: 'line',
            data: {
                labels: comparativa.meses,
                datasets: [{
                    label: '% de Cambio',
                    data: comparativa.variacionPorcentual,
                    borderColor: '#ffc107',
                    backgroundColor: 'rgba(255, 193, 7, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    segment: {
                        borderColor: ctx => ctx.p0.parsed.y >= 0 ? '#198754' : '#dc3545',
                        backgroundColor: ctx => ctx.p0.parsed.y >= 0 ? 'rgba(25, 135, 84, 0.1)' : 'rgba(220, 53, 69, 0.1)'
                    }
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true },
                    title: {
                        display: true,
                        text: 'Porcentaje de Variación entre Meses'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Variación (%)' }
                    }
                }
            }
        });

        // 4. Tendencia por Líder Técnico (Top 5)
        const tendenciaLider = this.getTendenciaPorLider();
        this.charts.tendenciaLider = new Chart(document.getElementById('chartTendenciaLider'), {
            type: 'line',
            data: {
                labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
                datasets: tendenciaLider
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true, position: 'top' },
                    title: {
                        display: true,
                        text: 'Evolución de Horas por Líder Técnico'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Horas' }
                    }
                }
            }
        });

        // 5. Proyectos Activos por Mes
        const proyectosActivos = this.getProyectosActivosPorMes();
        this.charts.proyectosActivos = new Chart(document.getElementById('chartProyectosActivos'), {
            type: 'bar',
            data: {
                labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
                datasets: [{
                    label: 'Proyectos con Actividad',
                    data: proyectosActivos,
                    backgroundColor: '#6c757d',
                    borderColor: '#495057',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true },
                    title: {
                        display: true,
                        text: 'Proyectos con Horas Registradas'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1 },
                        title: { display: true, text: 'Cantidad' }
                    }
                }
            }
        });

        // === GRÁFICOS DE ANÁLISIS EXISTENTES ===

        // Gráfico por Tipo (Local/Regional)
        const tipoData = this.groupBy(projects, 'tipo');
        this.charts.tipo = new Chart(document.getElementById('chartTipo'), {
            type: 'doughnut',
            data: {
                labels: Object.keys(tipoData),
                datasets: [{
                    data: Object.values(tipoData),
                    backgroundColor: ['#0d6efd', '#198754']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'right' } }
            }
        });

        // Gráfico por Categoría
        const categoriaData = this.groupBy(projects, 'categoria');
        this.charts.categoria = new Chart(document.getElementById('chartCategoria'), {
            type: 'pie',
            data: {
                labels: Object.keys(categoriaData),
                datasets: [{
                    data: Object.values(categoriaData),
                    backgroundColor: ['#198754', '#0dcaf0', '#ffc107', '#6c757d']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'right' } }
            }
        });

        // Top 10 Proyectos con Mayor Desviación
        const topDesviados = projects
            .sort((a, b) => b.desviacionAbsoluta - a.desviacionAbsoluta)
            .slice(0, 10);

        this.charts.desviacion = new Chart(document.getElementById('chartDesviacion'), {
            type: 'bar',
            data: {
                labels: topDesviados.map(p => p.nombre.substring(0, 30)),
                datasets: [{
                    label: 'Desviación (horas)',
                    data: topDesviados.map(p => p.desvHoras),
                    backgroundColor: topDesviados.map(p => p.desvHoras > 0 ? '#dc3545' : '#198754')
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                scales: {
                    x: {
                        beginAtZero: true,
                        title: { display: true, text: 'Horas' }
                    }
                }
            }
        });

        // Alertas de Presupuesto
        const presupuestoData = this.groupBy(projects, 'alertaPresupuesto');
        this.charts.presupuesto = new Chart(document.getElementById('chartPresupuesto'), {
            type: 'doughnut',
            data: {
                labels: Object.keys(presupuestoData),
                datasets: [{
                    data: Object.values(presupuestoData),
                    backgroundColor: {
                        'CRITICO': '#dc3545',
                        'OK': '#198754',
                        'ADVERTENCIA': '#ffc107'
                    }
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'right' } }
            }
        });

        // Avance Real vs Esperado
        const avanceComparacion = {
            real: projects.reduce((sum, p) => sum + p.avanceRealNumerico, 0) / (projects.length || 1),
            esperado: projects.reduce((sum, p) => sum + p.avanceEsperadoNumerico, 0) / (projects.length || 1)
        };

        this.charts.avance = new Chart(document.getElementById('chartAvance'), {
            type: 'bar',
            data: {
                labels: ['Avance Real', 'Avance Esperado'],
                datasets: [{
                    label: 'Porcentaje',
                    data: [avanceComparacion.real, avanceComparacion.esperado],
                    backgroundColor: ['#0d6efd', '#ffc107']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: { display: true, text: '% Avance' }
                    }
                }
            }
        });

        // Estado de Desviación
        const desviacionData = this.groupBy(projects, 'estadoDesviacion');
        this.charts.estadoDesviacion = new Chart(document.getElementById('chartEstadoDesviacion'), {
            type: 'pie',
            data: {
                labels: ['En Tiempo', 'Retrasado', 'Adelantado'],
                datasets: [{
                    data: [
                        desviacionData['EN_TIEMPO'] || 0,
                        desviacionData['RETRASADO'] || 0,
                        desviacionData['ADELANTADO'] || 0
                    ],
                    backgroundColor: ['#198754', '#dc3545', '#0dcaf0']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'right' } }
            }
        });

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

        // Horas por Mes
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
