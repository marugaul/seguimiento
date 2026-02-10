// Procesamiento de archivos Excel
class ExcelProcessor {
    constructor() {
        this.projects = [];
    }

    async processFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });

                    // Obtener la primera hoja
                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

                    // Convertir a JSON
                    const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

                    // Parsear los datos
                    this.projects = this.parseProjects(jsonData);

                    resolve({
                        success: true,
                        projects: this.projects,
                        count: this.projects.length
                    });
                } catch (error) {
                    console.error('Error procesando archivo:', error);
                    reject({
                        success: false,
                        error: 'Error al procesar el archivo Excel: ' + error.message
                    });
                }
            };

            reader.onerror = () => {
                reject({
                    success: false,
                    error: 'Error al leer el archivo'
                });
            };

            reader.readAsArrayBuffer(file);
        });
    }

    parseProjects(data) {
        const projects = [];

        if (data.length === 0) return projects;

        // PASO 1: Leer encabezados y crear mapa de columnas por NOMBRE
        const headers = data[0];
        const columnMap = {};

        headers.forEach((header, index) => {
            if (!header) return;
            const normalized = String(header).trim().toUpperCase();
            columnMap[normalized] = index;
        });

        // DEBUG: Mostrar columnas encontradas
        console.log('=== COLUMNAS ENCONTRADAS EN EXCEL ===');
        Object.keys(columnMap).sort((a, b) => columnMap[a] - columnMap[b]).forEach(name => {
            const emoji = name.includes('FEC') ? '📅' :
                         name.includes('MES') ? '📆' :
                         name.includes('TOTAL') ? '💰' : '📋';
            console.log(`${emoji} [${columnMap[name]}] ${name}`);
        });
        console.log(`📊 Total: ${headers.length} columnas\n`);

        // PASO 2: Función para buscar índice de columna por nombres posibles
        const getCol = (searchTerms) => {
            for (const term of searchTerms) {
                const idx = columnMap[term.toUpperCase()];
                if (idx !== undefined) return idx;
            }
            return null;
        };

        // PASO 3: Procesar cada fila de datos
        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            if (!row || row.length === 0) continue;

            const project = {
                idLt: this.getCellValue(row[getCol(['ID LT', 'IDLT'])]),
                nombreLt: this.getCellValue(row[getCol(['NOMBRE LT', 'NOMBRET'])]),
                pais: this.getCellValue(row[getCol(['PAÍS', 'PAIS'])]),
                casoFs: this.getCellValue(row[getCol(['CASO FS', 'CASOFS'])]),
                proyectoFs: this.getCellValue(row[getCol(['PROYECTO FS', 'PROYECTOFS'])]),
                tipo: this.getCellValue(row[getCol(['TIPO'])]),
                esPadre: this.getCellValue(row[getCol(['ES PADRE', 'ESPADRE'])]),
                proyPadre: this.getCellValue(row[getCol(['PROY. PADRE', 'PROYPADRE', 'PROY PADRE'])]),
                iniciativa: this.getCellValue(row[getCol(['INICIATIVA'])]),
                nombre: this.getCellValue(row[getCol(['NOMBRE'])]),
                tipoProyecto: this.getCellValue(row[getCol(['TIPO PROYECTO', 'TIPOPROYECTO'])]),
                producto: this.getCellValue(row[getCol(['PRODUCTO'])]),
                area: this.getCellValue(row[getCol(['ÁREA', 'AREA'])]),
                estado: this.getCellValue(row[getCol(['ESTADO'])]),
                etapa: this.getCellValue(row[getCol(['ETAPA'])]),

                // Meses - buscar dinámicamente (pueden no estar todos)
                mes01: this.getNumericValue(row[getCol(['MES 01', 'MES 1', 'MES01'])]),
                mes02: this.getNumericValue(row[getCol(['MES 02', 'MES 2', 'MES02'])]),
                mes03: this.getNumericValue(row[getCol(['MES 03', 'MES 3', 'MES03'])]),
                mes04: this.getNumericValue(row[getCol(['MES 04', 'MES 4', 'MES04'])]),
                mes05: this.getNumericValue(row[getCol(['MES 05', 'MES 5', 'MES05'])]),
                mes06: this.getNumericValue(row[getCol(['MES 06', 'MES 6', 'MES06'])]),
                mes07: this.getNumericValue(row[getCol(['MES 07', 'MES 7', 'MES07'])]),
                mes08: this.getNumericValue(row[getCol(['MES 08', 'MES 8', 'MES08'])]),
                mes09: this.getNumericValue(row[getCol(['MES 09', 'MES 9', 'MES09'])]),
                mes10: this.getNumericValue(row[getCol(['MES 10', 'MES10'])]),
                mes11: this.getNumericValue(row[getCol(['MES 11', 'MES11'])]),
                mes12: this.getNumericValue(row[getCol(['MES 12', 'MES12'])]),

                // Totales
                estimacion: this.getNumericValue(row[getCol(['ESTIMACIÓN', 'ESTIMACION'])]),
                controlCambio: this.getNumericValue(row[getCol(['CONTROL CAMBIO', 'CONTROLCAMBIO', 'CC'])]),
                totalEstimacion: this.getNumericValue(row[getCol(['TOTAL ESTIMACIÓN', 'TOTALESTIMACION', 'TOTAL ESTIMACION'])]),
                totalRegistrado: this.getNumericValue(row[getCol(['TOTAL REGISTRADO', 'TOTALREGISTRADO'])]),
                totalDisponible: this.getNumericValue(row[getCol(['TOTAL DISPONIBLE', 'TOTALDISPONIBLE'])]),

                // Porcentajes
                porcentajeAvanceHoras: this.getCellValue(row[getCol(['% AVANCE HORAS', '%AVANCEHORAS', 'AVANCE HORAS'])]),
                porcentajeAvanceReal: this.getCellValue(row[getCol(['% AVANCE REAL', '%AVANCEREAL', 'AVANCE REAL'])]),
                porcentajeAvanceEsperado: this.getCellValue(row[getCol(['% AVANCE ESPERADO', '%AVANCEESPERADO', 'AVANCE ESPERADO'])]),
                desvHoras: this.getNumericValue(row[getCol(['DESV. HORAS', 'DESVHORAS', 'DESV HORAS'])]),
                porcentajeDesviacion: this.getCellValue(row[getCol(['% DESVIACIÓN', '%DESVIACION', '% DESVIACION'])]),

                // Fechas - usar getRawStringValue para FEC. REGISTRO INICIATIVA
                fecRegistroIniciativa: this.getRawStringValue(row[getCol(['FEC. REGISTRO INICIATIVA', 'FEC REGISTRO INICIATIVA'])]),
                fecIniFs: this.getCellValue(row[getCol(['FEC. INI. FS', 'FEC INI FS', 'FEC. INI FS'])]),
                fecFinFs: this.getCellValue(row[getCol(['FEC. FIN. FS', 'FEC FIN FS', 'FEC. FIN FS'])]),
                fecIniConstruccion: this.getCellValue(row[getCol(['FEC. INI. CONSTRUCCIÓN', 'FEC INI CONSTRUCCION', 'FEC. INI CONSTRUCCIÓN'])]),
                fecFinConstruccion: this.getCellValue(row[getCol(['FEC. FIN. CONSTRUCCIÓN', 'FEC FIN CONSTRUCCION', 'FEC. FIN CONSTRUCCIÓN'])]),
                fecIniQa: this.getCellValue(row[getCol(['FEC. INI. QA', 'FEC INI QA', 'FEC. INI QA'])]),
                fecFinQa: this.getCellValue(row[getCol(['FEC. FIN. QA', 'FEC FIN QA', 'FEC. FIN QA'])]),
                fecIniCertifica: this.getCellValue(row[getCol(['FEC. INI. CERTIFICA', 'FEC INI CERTIFICA', 'FEC. INI CERTIFICA'])]),
                fecFinCertifica: this.getCellValue(row[getCol(['FEC. FIN. CERTIFICA', 'FEC FIN CERTIFICA', 'FEC. FIN CERTIFICA'])]),
                fecPuestaProd: this.getCellValue(row[getCol(['FEC. PUESTA PROD.', 'FEC PUESTA PROD', 'FEC. PUESTA PROD'])]),
                fecFinPostProd: this.getCellValue(row[getCol(['FEC. FIN. POST PROD.', 'FEC FIN POST PROD', 'FEC. FIN POST PROD'])]),
                fecLanzamiento: this.getCellValue(row[getCol(['FEC. LANZAMIENTO', 'FEC LANZAMIENTO'])]),
                fecCierreIniciativa: this.getCellValue(row[getCol(['FEC. CIERRE INICIATIVA', 'FEC CIERRE INICIATIVA'])]),
                comentarios: this.getCellValue(row[getCol(['COMENTARIOS', 'OBSERVACIONES'])])
            };

            projects.push(project);
        }

        console.log(`✅ Procesados ${projects.length} proyectos`);
        return projects;
    }

    getCellValue(cell) {
        if (cell === undefined || cell === null || cell === 'nan') return '';

        // Si es un objeto Date de JavaScript (Excel a veces convierte fechas),
        // convertirlo a formato simple DD/MM/YYYY en lugar del formato largo
        if (cell instanceof Date) {
            const day = String(cell.getDate()).padStart(2, '0');
            const month = String(cell.getMonth() + 1).padStart(2, '0');
            const year = cell.getFullYear();
            return `${day}/${month}/${year}`;
        }

        return String(cell).trim();
    }

    // Obtener valor RAW sin conversión de fechas (para campos que deben quedar como texto)
    getRawStringValue(cell) {
        if (cell === undefined || cell === null || cell === 'nan') return '';

        // Si Excel convirtió a Date, verificar si la fecha es válida
        if (cell instanceof Date) {
            const year = cell.getFullYear();

            // Si el año es muy antiguo (< 1950) o muy futuro (> 2100),
            // probablemente es error de conversión - mostrar vacío
            if (year < 1950 || year > 2100) {
                return '';
            }

            // Si la fecha parece válida, mostrarla en formato DD/MM/YYYY
            const day = String(cell.getDate()).padStart(2, '0');
            const month = String(cell.getMonth() + 1).padStart(2, '0');
            return `${day}/${month}/${year}`;
        }

        // Si es texto o número, retornarlo como string sin modificar
        return String(cell).trim();
    }

    getNumericValue(cell) {
        if (cell === undefined || cell === null || cell === '') return 0;
        const num = parseFloat(cell);
        return isNaN(num) ? 0 : num;
    }

    getProjects() {
        return this.projects;
    }
}

// Crear instancia global
const excelProcessor = new ExcelProcessor();
