// Servicio para conectar directamente con Google Sheets desde el cliente
export class GoogleSheetsClientService {
  private spreadsheetId: string
  private baseUrl: string

  constructor() {
    this.spreadsheetId = "1oHFohkYkMQBkDQ7hfBpGj0euUvP11fq7I8oBPc4bZQ8"
    // Usar la URL pública de Google Sheets en formato CSV
    this.baseUrl = `https://docs.google.com/spreadsheets/d/${this.spreadsheetId}/gviz/tq?tqx=out:csv&sheet=`
  }

  async getSheetDataAsCSV(sheetName: string) {
    try {
      const url = `${this.baseUrl}${encodeURIComponent(sheetName)}`
      console.log(`GoogleSheetsClient: Fetching data from: ${url}`)

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "text/csv",
        },
        // Agregar modo CORS para evitar problemas
        mode: "cors",
      })

      if (!response.ok) {
        console.error(`GoogleSheetsClient: HTTP error for ${sheetName}:`, response.status, response.statusText)
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`)
      }

      const csvText = await response.text()
      console.log(`GoogleSheetsClient: Raw CSV for ${sheetName}:`, csvText.substring(0, 300) + "...")

      if (!csvText || csvText.trim().length === 0) {
        console.warn(`GoogleSheetsClient: Empty CSV response for ${sheetName}`)
        return []
      }

      // Parsear CSV manualmente
      const lines = csvText.split("\n").filter((line) => line.trim())
      console.log(`GoogleSheetsClient: Found ${lines.length} lines for ${sheetName}`)

      const data = lines.map((line, index) => {
        // Parsear CSV considerando comillas
        const result = []
        let current = ""
        let inQuotes = false

        for (let i = 0; i < line.length; i++) {
          const char = line[i]

          if (char === '"') {
            inQuotes = !inQuotes
          } else if (char === "," && !inQuotes) {
            result.push(current.trim().replace(/^"|"$/g, ""))
            current = ""
          } else {
            current += char
          }
        }

        result.push(current.trim().replace(/^"|"$/g, ""))

        if (index < 3) {
          console.log(`GoogleSheetsClient: Line ${index} for ${sheetName}:`, result)
        }

        return result
      })

      console.log(`GoogleSheetsClient: Parsed ${data.length} rows for ${sheetName}`)
      return data
    } catch (error) {
      console.error(`GoogleSheetsClient: Error fetching ${sheetName}:`, error)
      return []
    }
  }

  async getAllEvents() {
    try {
      console.log("GoogleSheetsClient: Starting to fetch all events from Google Sheets...")

      const [entregasData, convocatoriasData, solicitudesData] = await Promise.all([
        this.getSheetDataAsCSV("Entregas"),
        this.getSheetDataAsCSV("Convocatorias"),
        this.getSheetDataAsCSV("Solicitudes"),
      ])

      console.log("GoogleSheetsClient: Raw data received:", {
        entregas: entregasData.length,
        convocatorias: convocatoriasData.length,
        solicitudes: solicitudesData.length,
      })

      const events = []

      // Procesar Entregas - Validación más permisiva
      if (entregasData.length > 0) {
        console.log("GoogleSheetsClient: Processing Entregas...")
        console.log("GoogleSheetsClient: Entregas header:", entregasData[0])

        for (let i = 1; i < entregasData.length; i++) {
          const row = entregasData[i]
          console.log(`GoogleSheetsClient: Processing Entregas row ${i}:`, row)

          // Validación más permisiva - solo requiere que tenga al menos 3 columnas y un título
          if (row.length >= 2 && (row[3] || row[2])) {
            // Solo requiere Asunto O Descripción
            const event = {
              id: `entregas-${i}`,
              title: row[3] || row[2] || `Entrega ${i}`, // Priorizar Asunto, luego Descripción
              type: "entregas" as const,
              description: row[2] || "", // Solo Descripción (columna C)
              subject: row[3] || `Entrega ${i}`, // Solo Asunto (columna D)
              emailLink:
                row[4] || `mailto:entregas@eest6.edu.ar?subject=${encodeURIComponent(row[3] || `Entrega ${i}`)}`, // Link o mailto automático
              completed: false,
              fechaRecepcion: this.parseDate(row[0] || ""),
              fechaEntrega: this.parseDate(row[1] || ""),
            }
            events.push(event)
            console.log(`GoogleSheetsClient: Added entrega: ${event.title}`)
          } else {
            console.log(`GoogleSheetsClient: Skipping Entregas row ${i} - insufficient data:`, row)
          }
        }
      }

      // Procesar Convocatorias - Validación más permisiva
      if (convocatoriasData.length > 0) {
        console.log("GoogleSheetsClient: Processing Convocatorias...")
        console.log("GoogleSheetsClient: Convocatorias header:", convocatoriasData[0])

        for (let i = 1; i < convocatoriasData.length; i++) {
          const row = convocatoriasData[i]
          console.log(`GoogleSheetsClient: Processing Convocatorias row ${i}:`, row)

          if (row.length >= 2 && (row[3] || row[2])) {
            // Solo requiere Asunto O Descripción
            const event = {
              id: `convocatorias-${i}`,
              title: row[3] || row[2] || `Convocatoria ${i}`,
              type: "convocatorias" as const,
              description: row[2] || "", // Solo Descripción (columna C)
              subject: row[3] || `Convocatoria ${i}`, // Solo Asunto (columna D)
              emailLink:
                row[4] ||
                `mailto:convocatorias@eest6.edu.ar?subject=${encodeURIComponent(row[3] || `Convocatoria ${i}`)}`, // Link o mailto automático
              completed: false,
              fechaRecepcion: this.parseDate(row[0] || ""),
              fechaConvocatoria: this.parseDate(row[1] || ""),
            }
            events.push(event)
            console.log(`GoogleSheetsClient: Added convocatoria: ${event.title}`)
          } else {
            console.log(`GoogleSheetsClient: Skipping Convocatorias row ${i} - insufficient data:`, row)
          }
        }
      }

      // Procesar Solicitudes - Validación más permisiva
      if (solicitudesData.length > 0) {
        console.log("GoogleSheetsClient: Processing Solicitudes...")
        console.log("GoogleSheetsClient: Solicitudes header:", solicitudesData[0])

        for (let i = 1; i < solicitudesData.length; i++) {
          const row = solicitudesData[i]
          console.log(`GoogleSheetsClient: Processing Solicitudes row ${i}:`, row)

          if (row.length >= 2 && (row[3] || row[2])) {
            // Solo requiere Asunto O Descripción
            const event = {
              id: `solicitudes-${i}`,
              title: row[3] || row[2] || `Solicitud ${i}`,
              type: "solicitudes" as const,
              description: row[2] || "", // Solo Descripción (columna C)
              subject: row[3] || `Solicitud ${i}`, // Solo Asunto (columna D)
              emailLink:
                row[4] || `mailto:solicitudes@eest6.edu.ar?subject=${encodeURIComponent(row[3] || `Solicitud ${i}`)}`, // Link o mailto automático
              completed: false,
              fechaRecepcion: this.parseDate(row[0] || ""),
              fechaSolicitud: this.parseDate(row[1] || ""),
            }
            events.push(event)
            console.log(`GoogleSheetsClient: Added solicitud: ${event.title}`)
          } else {
            console.log(`GoogleSheetsClient: Skipping Solicitudes row ${i} - insufficient data:`, row)
          }
        }
      }

      console.log(`GoogleSheetsClient: Total events processed: ${events.length}`)
      console.log(
        "GoogleSheetsClient: Events summary:",
        events.map((e) => ({
          id: e.id,
          title: e.title,
          type: e.type,
          fechaRecepcion: e.fechaRecepcion,
          fechaEspecifica:
            e.type === "entregas"
              ? e.fechaEntrega
              : e.type === "convocatorias"
                ? e.fechaConvocatoria
                : e.fechaSolicitud,
        })),
      )

      // Si no hay eventos, lanzar error para que use fallback
      if (events.length === 0) {
        throw new Error("No se encontraron eventos válidos en las hojas de Google Sheets")
      }

      return events
    } catch (error) {
      console.error("GoogleSheetsClient: Error fetching all events:", error)
      throw error // Re-lanzar el error para que el componente use fallback
    }
  }

  private parseDate(dateString: string): string {
    if (!dateString || dateString.trim() === "") {
      console.log("GoogleSheetsClient: Empty date string, using current date")
      return new Date().toISOString()
    }

    try {
      console.log(`GoogleSheetsClient: Parsing date: "${dateString}"`)

      // Intentar diferentes formatos de fecha
      let date: Date

      // Si ya es una fecha ISO
      if (dateString.includes("T") || dateString.includes("Z")) {
        date = new Date(dateString)
      }
      // Si es formato DD/MM/YYYY
      else if (dateString.includes("/")) {
        const parts = dateString.split("/")
        if (parts.length === 3) {
          // Asumir DD/MM/YYYY
          const day = Number.parseInt(parts[0])
          const month = Number.parseInt(parts[1]) - 1 // Los meses en JS son 0-indexados
          const year = Number.parseInt(parts[2])

          // Validar que los números sean válidos
          if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
            date = new Date(year, month, day)
          } else {
            throw new Error(`Invalid date parts: ${parts}`)
          }
        } else {
          date = new Date(dateString)
        }
      }
      // Si es formato YYYY-MM-DD
      else if (dateString.includes("-")) {
        date = new Date(dateString)
      }
      // Intentar parsear directamente
      else {
        date = new Date(dateString)
      }

      // Verificar si la fecha es válida
      if (isNaN(date.getTime())) {
        console.warn(`GoogleSheetsClient: Invalid date: "${dateString}", using current date`)
        return new Date().toISOString()
      }

      const isoString = date.toISOString()
      console.log(`GoogleSheetsClient: Parsed "${dateString}" to "${isoString}"`)
      return isoString
    } catch (error) {
      console.error(`GoogleSheetsClient: Error parsing date: "${dateString}"`, error)
      return new Date().toISOString()
    }
  }

  // Método para probar la conexión
  async testConnection() {
    try {
      console.log("GoogleSheetsClient: Testing connection...")
      const testData = await this.getSheetDataAsCSV("Entregas")
      return {
        success: testData.length > 0,
        rowCount: testData.length,
        sampleData: testData.slice(0, 3),
      }
    } catch (error) {
      console.error("GoogleSheetsClient: Connection test failed:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  // Método para obtener información detallada de debug
  async getDebugInfo() {
    try {
      console.log("GoogleSheetsClient: Getting debug info...")

      const sheets = ["Entregas", "Convocatorias", "Solicitudes"]
      const debugInfo = []

      for (const sheetName of sheets) {
        const data = await this.getSheetDataAsCSV(sheetName)
        debugInfo.push({
          sheet: sheetName,
          rowCount: data.length,
          hasHeader: data.length > 0,
          header: data[0] || [],
          sampleRows: data.slice(1, 4), // Primeras 3 filas de datos
          isEmpty: data.length <= 1,
        })
      }

      return debugInfo
    } catch (error) {
      console.error("GoogleSheetsClient: Error getting debug info:", error)
      return []
    }
  }
}
