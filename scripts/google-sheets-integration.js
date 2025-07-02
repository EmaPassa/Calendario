// Ejemplo de integración con Google Sheets API
// Este código debe ser adaptado en los archivos API de Next.js

const { GoogleSpreadsheet } = require("google-spreadsheet")

class GoogleSheetsService {
  constructor() {
    this.spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID
    this.privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, "\n")
    this.clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL
    this.doc = new GoogleSpreadsheet(this.spreadsheetId)
  }

  async authenticate() {
    await this.doc.useServiceAccountAuth({
      client_email: this.clientEmail,
      private_key: this.privateKey,
    })
    await this.doc.loadInfo()
  }

  async getDocument() {
    return this.doc
  }

  async getEvents() {
    try {
      await this.authenticate()
      const events = []

      // Procesar hoja "Entregas"
      const entregasSheet = this.doc.sheetsByTitle["Entregas"]
      if (entregasSheet) {
        const entregasRows = await entregasSheet.getRows()
        entregasRows.forEach((row) => {
          events.push({
            id: `entregas-${row.rowNumber}`,
            title: row.Titulo || row.Asunto,
            start: new Date(row.Fecha),
            end: new Date(row.Fecha),
            type: "entregas",
            description: row.Descripcion || "",
            subject: row.Asunto || "",
            emailLink: row.EnlaceCorreo || "",
            completed: row.Completado === "TRUE" || row.Completado === true,
          })
        })
      }

      // Procesar hoja "Convocatorias"
      const convocatoriasSheet = this.doc.sheetsByTitle["Convocatorias"]
      if (convocatoriasSheet) {
        const convocatoriasRows = await convocatoriasSheet.getRows()
        convocatoriasRows.forEach((row) => {
          events.push({
            id: `convocatorias-${row.rowNumber}`,
            title: row.Titulo || row.Asunto,
            start: new Date(row.Fecha),
            end: new Date(row.Fecha),
            type: "convocatorias",
            description: row.Descripcion || "",
            subject: row.Asunto || "",
            emailLink: row.EnlaceCorreo || "",
            completed: row.Completado === "TRUE" || row.Completado === true,
          })
        })
      }

      // Procesar hoja "Solicitudes"
      const solicitudesSheet = this.doc.sheetsByTitle["Solicitudes"]
      if (solicitudesSheet) {
        const solicitudesRows = await solicitudesSheet.getRows()
        solicitudesRows.forEach((row) => {
          events.push({
            id: `solicitudes-${row.rowNumber}`,
            title: row.Titulo || row.Asunto,
            start: new Date(row.Fecha),
            end: new Date(row.Fecha),
            type: "solicitudes",
            description: row.Descripcion || "",
            subject: row.Asunto || "",
            emailLink: row.EnlaceCorreo || "",
            completed: row.Completado === "TRUE" || row.Completado === true,
          })
        })
      }

      return events
    } catch (error) {
      console.error("Error fetching events from Google Sheets:", error)
      throw error
    }
  }

  async updateEventStatus(eventId, completed) {
    try {
      await this.authenticate()
      const [type, rowNumber] = eventId.split("-")

      let sheet
      switch (type) {
        case "entregas":
          sheet = this.doc.sheetsByTitle["Entregas"]
          break
        case "convocatorias":
          sheet = this.doc.sheetsByTitle["Convocatorias"]
          break
        case "solicitudes":
          sheet = this.doc.sheetsByTitle["Solicitudes"]
          break
        default:
          throw new Error("Invalid event type")
      }

      if (sheet) {
        const rows = await sheet.getRows()
        const targetRow = rows.find((row) => row.rowNumber == rowNumber)

        if (targetRow) {
          targetRow.Completado = completed
          await targetRow.save()
        }
      }
    } catch (error) {
      console.error("Error updating event status:", error)
      throw error
    }
  }

  async getNews() {
    try {
      const events = await this.getEvents()

      // Filtrar eventos nuevos (últimos 7 días)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const news = events
        .filter((event) => new Date(event.start) >= sevenDaysAgo)
        .map((event) => ({
          ...event,
          date: event.start,
          isNew: new Date(event.start) >= sevenDaysAgo,
        }))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      return news
    } catch (error) {
      console.error("Error fetching news:", error)
      throw error
    }
  }
}

module.exports = GoogleSheetsService

// Ejemplo de uso en API routes:
/*
// En app/api/events/route.ts
import GoogleSheetsService from '@/lib/google-sheets-service';

export async function GET() {
  try {
    const sheetsService = new GoogleSheetsService();
    const events = await sheetsService.getEvents();
    return NextResponse.json(events);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}
*/
