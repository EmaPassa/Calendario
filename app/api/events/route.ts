import { NextResponse } from "next/server"
import { GoogleSheetsService } from "@/lib/google-sheets"

// Datos de ejemplo con la nueva estructura (fallback si Google Sheets no funciona)
const mockEvents = [
  {
    id: "1",
    title: "Entrega Proyecto Alpha",
    type: "entregas" as const,
    description: "Entrega final del proyecto Alpha con toda la documentación requerida",
    subject: "Proyecto Alpha - Entrega Final",
    emailLink: "mailto:admin@eest6.edu.ar?subject=Proyecto Alpha",
    completed: false,
    fechaRecepcion: "2025-01-01T09:00:00.000Z",
    fechaEntrega: "2025-01-15T09:00:00.000Z",
  },
  {
    id: "2",
    title: "Convocatoria Becas 2025",
    type: "convocatorias" as const,
    description: "Apertura de convocatoria para becas de investigación 2025",
    subject: "Becas de Investigación 2025",
    emailLink: "mailto:becas@eest6.edu.ar?subject=Convocatoria Becas 2025",
    completed: false,
    fechaRecepcion: "2024-12-20T10:00:00.000Z",
    fechaConvocatoria: "2025-01-03T10:00:00.000Z",
  },
  {
    id: "3",
    title: "Solicitud Presupuesto Q1",
    type: "solicitudes" as const,
    description: "Solicitud de presupuesto para el primer trimestre del año",
    subject: "Presupuesto Q1 2025",
    emailLink: "mailto:finanzas@eest6.edu.ar?subject=Presupuesto Q1",
    completed: false,
    fechaRecepcion: "2024-12-28T14:00:00.000Z",
    fechaSolicitud: "2025-01-08T14:00:00.000Z",
  },
]

export async function GET() {
  try {
    console.log("API: Starting to fetch events...")

    // Intentar cargar desde Google Sheets
    const sheetsService = new GoogleSheetsService()
    const eventsFromSheets = await sheetsService.getAllEvents()

    console.log(`API: Received ${eventsFromSheets.length} events from Google Sheets`)

    // Si hay datos de Google Sheets, usarlos; sino usar datos mock
    const events = eventsFromSheets.length > 0 ? eventsFromSheets : mockEvents

    console.log(
      `API: Returning ${events.length} events (source: ${eventsFromSheets.length > 0 ? "Google Sheets" : "Mock"})`,
    )

    return NextResponse.json(events)
  } catch (error) {
    console.error("API: Error fetching events:", error)
    // En caso de error, devolver datos mock
    return NextResponse.json(mockEvents)
  }
}
