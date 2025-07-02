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
  {
    id: "4",
    title: "Informe Mensual",
    type: "entregas" as const,
    description: "Entrega del informe mensual de actividades",
    subject: "Informe Mensual Diciembre 2024",
    emailLink: "mailto:reportes@eest6.edu.ar?subject=Informe Mensual",
    completed: true,
    fechaRecepcion: "2025-01-10T08:00:00.000Z",
    fechaEntrega: "2025-01-22T08:00:00.000Z",
  },
  {
    id: "5",
    title: "Evaluación Proyectos",
    type: "convocatorias" as const,
    description: "Reunión para evaluar los proyectos presentados en la convocatoria",
    subject: "Evaluación de Proyectos",
    emailLink: "mailto:evaluacion@eest6.edu.ar?subject=Evaluacion Proyectos",
    completed: false,
    fechaRecepcion: "2024-12-15T15:00:00.000Z",
    fechaConvocatoria: "2025-01-10T15:00:00.000Z",
  },
]

export async function GET() {
  try {
    // Intentar cargar desde Google Sheets
    const sheetsService = new GoogleSheetsService()
    const eventsFromSheets = await sheetsService.getAllEvents()

    // Si hay datos de Google Sheets, usarlos; sino usar datos mock
    const events = eventsFromSheets.length > 0 ? eventsFromSheets : mockEvents

    return NextResponse.json(events)
  } catch (error) {
    console.error("Error fetching events:", error)
    // En caso de error, devolver datos mock
    return NextResponse.json(mockEvents)
  }
}
