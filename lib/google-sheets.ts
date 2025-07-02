// Servicio mejorado para conectar con Google Sheets público
export class GoogleSheetsService {
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
      console.log(`Fetching data from: ${url}`)

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "text/csv",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const csvText = await response.text()
      console.log(`CSV data for ${sheetName}:`, csvText.substring(0, 200) + "...")

      // Parsear CSV manualmente
      const lines = csvText.split("\n").filter((line) => line.trim())
      const data = lines.map((line) => {
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
        return result
      })

      return data
    } catch (error) {
      console.error(`Error fetching ${sheetName}:`, error)
      return []
    }
  }

  async getAllEvents() {
    try {
      console.log("Starting to fetch all events from Google Sheets...")

      const [entregasData, convocatoriasData, solicitudesData] = await Promise.all([
        this.getSheetDataAsCSV("Entregas"),
        this.getSheetDataAsCSV("Convocatorias"),
        this.getSheetDataAsCSV("Solicitudes"),
      ])

      console.log("Raw data received:", {
        entregas: entregasData.length,
        convocatorias: convocatoriasData.length,
        solicitudes: solicitudesData.length,
      })

      const events = []

      // Procesar Entregas
      if (entregasData.length > 1) {
        console.log("Processing Entregas...")
        for (let i = 1; i < entregasData.length; i++) {
          const row = entregasData[i]
          if (row.length >= 5 && row[0] && row[1]) {
            // Verificar que tenga datos mínimos
            const event = {
              id: `entregas-${i}`,
              title: row[3] || `Entrega ${i}`, // Asunto
              type: "entregas" as const,
              description: row[2] || "", // Descripción
              subject: row[3] || "", // Asunto
              emailLink: row[4] || "", // Link
              completed: false,
              fechaRecepcion: this.parseDate(row[0]), // Fecha Recepción
              fechaEntrega: this.parseDate(row[1]), // Fecha Entrega
            }
            events.push(event)
            console.log(`Added entrega: ${event.title}`)
          }
        }
      }

      // Procesar Convocatorias
      if (convocatoriasData.length > 1) {
        console.log("Processing Convocatorias...")
        for (let i = 1; i < convocatoriasData.length; i++) {
          const row = convocatoriasData[i]
          if (row.length >= 5 && row[0] && row[1]) {
            const event = {
              id: `convocatorias-${i}`,
              title: row[3] || `Convocatoria ${i}`, // Asunto
              type: "convocatorias" as const,
              description: row[2] || "", // Descripción
              subject: row[3] || "", // Asunto
              emailLink: row[4] || "", // Link
              completed: false,
              fechaRecepcion: this.parseDate(row[0]), // Fecha Recepción
              fechaConvocatoria: this.parseDate(row[1]), // Fecha Convocatoria
            }
            events.push(event)
            console.log(`Added convocatoria: ${event.title}`)
          }
        }
      }

      // Procesar Solicitudes
      if (solicitudesData.length > 1) {
        console.log("Processing Solicitudes...")
        for (let i = 1; i < solicitudesData.length; i++) {
          const row = solicitudesData[i]
          if (row.length >= 5 && row[0] && row[1]) {
            const event = {
              id: `solicitudes-${i}`,
              title: row[3] || `Solicitud ${i}`, // Asunto
              type: "solicitudes" as const,
              description: row[2] || "", // Descripción
              subject: row[3] || "", // Asunto
              emailLink: row[4] || "", // Link
              completed: false,
              fechaRecepcion: this.parseDate(row[0]), // Fecha Recepción
              fechaSolicitud: this.parseDate(row[1]), // Fecha Solicitud
            }
            events.push(event)
            console.log(`Added solicitud: ${event.title}`)
          }
        }
      }

      console.log(`Total events processed: ${events.length}`)
      return events
    } catch (error) {
      console.error("Error fetching all events:", error)
      return []
    }
  }

  private parseDate(dateString: string): string {
    if (!dateString) return new Date().toISOString()

    try {
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
          date = new Date(year, month, day)
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
        console.warn(`Invalid date: ${dateString}, using current date`)
        return new Date().toISOString()
      }

      return date.toISOString()
    } catch (error) {
      console.error(`Error parsing date: ${dateString}`, error)
      return new Date().toISOString()
    }
  }
}
