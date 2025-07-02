import { NextResponse } from "next/server"

// Datos de ejemplo con fechas específicas según el tipo
const mockEvents = [
  {
    id: "1",
    title: "Entrega Proyecto Alpha",
    type: "entregas" as const,
    description: "Entrega final del proyecto Alpha con toda la documentación requerida",
    subject: "Proyecto Alpha - Entrega Final",
    emailLink: "mailto:admin@eest6.edu.ar?subject=Proyecto Alpha",
    completed: false,
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
    fechaConvocatoria: "2025-01-10T15:00:00.000Z",
  },
  {
    id: "6",
    title: "Equipos Laboratorio",
    type: "solicitudes" as const,
    description: "Solicitud de nuevos equipos para el laboratorio de investigación",
    subject: "Equipos Laboratorio",
    emailLink: "mailto:compras@eest6.edu.ar?subject=Equipos Lab",
    completed: false,
    fechaSolicitud: "2025-01-25T11:00:00.000Z",
  },
  {
    id: "7",
    title: "Reunión Coordinación",
    type: "entregas" as const,
    description: "Reunión de coordinación para revisar avances",
    subject: "Coordinación Proyectos",
    emailLink: "mailto:coordinacion@eest6.edu.ar?subject=Reunion Coordinacion",
    completed: true,
    fechaEntrega: "2025-01-06T09:00:00.000Z",
  },
  {
    id: "8",
    title: "Presentación Resultados",
    type: "convocatorias" as const,
    description: "Presentación de resultados del trimestre anterior",
    subject: "Resultados Q4 2024",
    emailLink: "mailto:presentaciones@eest6.edu.ar?subject=Resultados Q4",
    completed: false,
    fechaConvocatoria: "2025-01-29T14:00:00.000Z",
  },
  {
    id: "9",
    title: "Solicitud Mantenimiento",
    type: "solicitudes" as const,
    description: "Solicitud de mantenimiento para equipos del laboratorio",
    subject: "Mantenimiento Equipos Lab",
    emailLink: "mailto:mantenimiento@eest6.edu.ar?subject=Mantenimiento",
    completed: false,
    fechaSolicitud: "2025-01-12T10:00:00.000Z",
  },
  {
    id: "10",
    title: "Entrega Documentación",
    type: "entregas" as const,
    description: "Entrega de documentación administrativa del semestre",
    subject: "Documentación Administrativa",
    emailLink: "mailto:admin@eest6.edu.ar?subject=Documentacion",
    completed: false,
    fechaEntrega: "2025-01-30T16:00:00.000Z",
  },
]

export async function GET() {
  try {
    return NextResponse.json(mockEvents)
  } catch (error) {
    console.error("Error fetching events:", error)
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 })
  }
}
