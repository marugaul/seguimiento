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
                mes12: this.getNumericValue(row[26]),
                estimacion: this.getNumericValue(row[27]),
                controlCambio: this.getNumericValue(row[28]),
                totalEstimacion: this.getNumericValue(row[29]),
                totalRegistrado: this.getNumericValue(row[30]),
                totalDisponible: this.getNumericValue(row[31]),
                porcentajeAvanceHoras: this.getCellValue(row[32]),
                porcentajeAvanceReal: this.getCellValue(row[33]),
                porcentajeAvanceEsperado: this.getCellValue(row[34]),
                desvHoras: this.getNumericValue(row[35]),
                porcentajeDesviacion: this.getCellValue(row[36]),
                fecRegistroIniciativa: this.getRawStringValue(row[37]), // NO convertir fechas, dejar como texto
                fecIniFs: this.getCellValue(row[38]),
                fecFinFs: this.getCellValue(row[39]),
                fecIniConstruccion: this.getCellValue(row[40]),
                fecFinConstruccion: this.getCellValue(row[41]),
                fecIniQa: this.getCellValue(row[42]),
                fecFinQa: this.getCellValue(row[43]),
                fecIniCertifica: this.getCellValue(row[44]),
                fecFinCertifica: this.getCellValue(row[45]),
                fecPuestaProd: this.getCellValue(row[46]),
                fecFinPostProd: this.getCellValue(row[47]),
                fecLanzamiento: this.getCellValue(row[48]),
                fecCierreIniciativa: this.getCellValue(row[49]),
                comentarios: this.getCellValue(row[50])
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

        // Si Excel convirtió a Date, retornar vacío en lugar de convertirlo
        // Esto evita fechas incorrectas como "18/05/1911"
        if (cell instanceof Date) {
            return '';
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
