// Servicio para conectar con Google Sheets
export class GoogleSheetsService {
  private spreadsheetId: string
  private apiKey: string

  constructor() {
    this.spreadsheetId = "1oHFohkYkMQBkDQ7hfBpGj0euUvP11fq7I8oBPc4bZQ8"
    this.apiKey = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY || ""
  }

  async getSheetData(sheetName: string) {
    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${sheetName}?key=${this.apiKey}`

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Error fetching sheet data: ${response.statusText}`)
      }

      const data = await response.json()
      return data.values || []
    } catch (error) {
      console.error(`Error fetching ${sheetName}:`, error)
      return []
    }
  }

  async getAllEvents() {
    try {
      const [entregasData, convocatoriasData, solicitudesData] = await Promise.all([
        this.getSheetData("Entregas"),
        this.getSheetData("Convocatorias"),
        this.getSheetData("Solicitudes"),
      ])

      const events = []

      // Procesar Entregas
      if (entregasData.length > 1) {
        const headers = entregasData[0]
        for (let i = 1; i < entregasData.length; i++) {
          const row = entregasData[i]
          if (row.length >= 5) {
            events.push({
              id: `entregas-${i}`,
              title: row[3] || `Entrega ${i}`, // Asunto
              type: "entregas" as const,
              description: row[2] || "", // Descripción
              subject: row[3] || "", // Asunto
              emailLink: row[4] || "", // Link
              completed: false,
              fechaRecepcion: row[0] || "", // Fecha Recepción
              fechaEntrega: row[1] || "", // Fecha Entrega
            })
          }
        }
      }

      // Procesar Convocatorias
      if (convocatoriasData.length > 1) {
        for (let i = 1; i < convocatoriasData.length; i++) {
          const row = convocatoriasData[i]
          if (row.length >= 5) {
            events.push({
              id: `convocatorias-${i}`,
              title: row[3] || `Convocatoria ${i}`, // Asunto
              type: "convocatorias" as const,
              description: row[2] || "", // Descripción
              subject: row[3] || "", // Asunto
              emailLink: row[4] || "", // Link
              completed: false,
              fechaRecepcion: row[0] || "", // Fecha Recepción
              fechaConvocatoria: row[1] || "", // Fecha Convocatoria
            })
          }
        }
      }

      // Procesar Solicitudes
      if (solicitudesData.length > 1) {
        for (let i = 1; i < solicitudesData.length; i++) {
          const row = solicitudesData[i]
          if (row.length >= 5) {
            events.push({
              id: `solicitudes-${i}`,
              title: row[3] || `Solicitud ${i}`, // Asunto
              type: "solicitudes" as const,
              description: row[2] || "", // Descripción
              subject: row[3] || "", // Asunto
              emailLink: row[4] || "", // Link
              completed: false,
              fechaRecepcion: row[0] || "", // Fecha Recepción
              fechaSolicitud: row[1] || "", // Fecha Solicitud
            })
          }
        }
      }

      return events
    } catch (error) {
      console.error("Error fetching all events:", error)
      return []
    }
  }
}
