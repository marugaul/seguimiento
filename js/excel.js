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

        // DEBUG: Mostrar TODOS los encabezados y sus índices
        if (data.length > 0) {
            console.log('=== TODOS LOS ENCABEZADOS DEL EXCEL ===');
            const headers = data[0];
            headers.forEach((header, index) => {
                const emoji = String(header).toUpperCase().includes('FEC') ? '📅' :
                             String(header).toUpperCase().includes('MES') ? '📆' :
                             String(header).toUpperCase().includes('TOTAL') ? '💰' : '📋';
                console.log(`${emoji} Índice ${index}: "${header}"`);
            });
            console.log(`\n📊 Total columnas: ${headers.length}`);
        }

        // Saltar la primera fila (encabezados)
        for (let i = 1; i < data.length; i++) {
            const row = data[i];

            // Saltar filas vacías
            if (!row || row.length === 0) continue;

            const project = {
                idLt: this.getCellValue(row[0]),
                nombreLt: this.getCellValue(row[1]),
                pais: this.getCellValue(row[2]),
                casoFs: this.getCellValue(row[3]),
                proyectoFs: this.getCellValue(row[4]),
                tipo: this.getCellValue(row[5]),
                esPadre: this.getCellValue(row[6]),
                proyPadre: this.getCellValue(row[7]),
                iniciativa: this.getCellValue(row[8]),
                nombre: this.getCellValue(row[9]),
                tipoProyecto: this.getCellValue(row[10]),
                producto: this.getCellValue(row[11]),
                area: this.getCellValue(row[12]),
                estado: this.getCellValue(row[13]),
                etapa: this.getCellValue(row[14]),
                mes01: this.getNumericValue(row[15]),
                mes02: this.getNumericValue(row[16]),
                mes03: this.getNumericValue(row[17]),
                mes04: this.getNumericValue(row[18]),
                mes05: this.getNumericValue(row[19]),
                mes06: this.getNumericValue(row[20]),
                mes07: this.getNumericValue(row[21]),
                mes08: this.getNumericValue(row[22]),
                mes09: this.getNumericValue(row[23]),
                mes10: this.getNumericValue(row[24]),
                mes11: this.getNumericValue(row[25]),
                mes12: 0, // TODO: Verificar índice correcto
                estimacion: 0, // TODO: Verificar índice correcto
                controlCambio: 0, // TODO: Verificar índice correcto
                totalEstimacion: 0, // TODO: Verificar índice correcto
                totalRegistrado: 0, // TODO: Verificar índice correcto
                totalDisponible: 0, // TODO: Verificar índice correcto
                porcentajeAvanceHoras: '', // TODO: Verificar índice correcto
                porcentajeAvanceReal: '', // TODO: Verificar índice correcto
                porcentajeAvanceEsperado: '', // TODO: Verificar índice correcto
                desvHoras: 0, // TODO: Verificar índice correcto
                porcentajeDesviacion: '', // TODO: Verificar índice correcto
                fecRegistroIniciativa: this.getRawStringValue(row[26]), // Índice 26: FEC. REGISTRO INICIATIVA
                fecIniFs: this.getCellValue(row[27]),                    // Índice 27: FEC. INI. FS
                fecFinFs: this.getCellValue(row[28]),                    // Índice 28: FEC. FIN. FS
                fecIniConstruccion: this.getCellValue(row[29]),          // Índice 29: FEC. INI. CONSTRUCCIÓN
                fecFinConstruccion: this.getCellValue(row[30]),          // Índice 30: FEC. FIN. CONSTRUCCIÓN
                fecIniQa: this.getCellValue(row[31]),                    // Índice 31: FEC. INI. QA
                fecFinQa: this.getCellValue(row[32]),                    // Índice 32: FEC. FIN. QA
                fecIniCertifica: this.getCellValue(row[33]),             // Índice 33: FEC. INI. CERTIFICA
                fecFinCertifica: this.getCellValue(row[34]),             // Índice 34: FEC. FIN. CERTIFICA
                fecPuestaProd: this.getCellValue(row[35]),               // Índice 35: FEC. PUESTA PROD.
                fecFinPostProd: this.getCellValue(row[36]),              // Índice 36: FEC. FIN. POST PROD.
                fecLanzamiento: this.getCellValue(row[37]),              // Índice 37: FEC. LANZAMIENTO
                fecCierreIniciativa: this.getCellValue(row[38]),         // Índice 38: FEC. CIERRE INICIATIVA
                comentarios: this.getCellValue(row[39])                  // Índice 39: COMENTARIOS
            };

            projects.push(project);
        }

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
