import { NextResponse } from "next/server"

// Datos de ejemplo para novedades con fechas específicas según el tipo
const mockNews = [
  {
    id: "1",
    title: "Nueva Convocatoria de Investigación",
    type: "convocatorias" as const,
    description: "Se ha abierto una nueva convocatoria para proyectos de investigación en tecnología",
    subject: "Convocatoria Investigación Tech 2025",
    emailLink: "mailto:investigacion@eest6.edu.ar?subject=Nueva Convocatoria",
    isNew: true,
    completed: false,
    fechaConvocatoria: "2025-01-10T00:00:00.000Z",
  },
  {
    id: "2",
    title: "Actualización Entrega Proyecto Beta",
    type: "entregas" as const,
    description: "Se ha actualizado la fecha de entrega del proyecto Beta para el 15 de enero",
    subject: "Proyecto Beta - Cambio de Fecha",
    emailLink: "mailto:proyectos@eest6.edu.ar?subject=Proyecto Beta",
    isNew: true,
    completed: true,
    fechaEntrega: "2025-01-08T00:00:00.000Z",
  },
  {
    id: "3",
    title: "Nueva Solicitud de Equipamiento",
    type: "solicitudes" as const,
    description: "Solicitud urgente de equipamiento para el laboratorio de electrónica",
    subject: "Solicitud Equipamiento Lab Electrónica",
    emailLink: "mailto:compras@eest6.edu.ar?subject=Equipamiento",
    isNew: false,
    completed: false,
    fechaSolicitud: "2025-01-05T00:00:00.000Z",
  },
  {
    id: "4",
    title: "Convocatoria Becas Estudiantiles",
    type: "convocatorias" as const,
    description: "Apertura de convocatoria para becas de apoyo estudiantil 2025",
    subject: "Becas Estudiantiles 2025",
    emailLink: "mailto:becas@eest6.edu.ar?subject=Becas Estudiantiles",
    isNew: true,
    completed: false,
    fechaConvocatoria: "2025-01-03T00:00:00.000Z",
  },
  {
    id: "5",
    title: "Entrega Informes Trimestrales",
    type: "entregas" as const,
    description: "Recordatorio: entrega de informes trimestrales de todas las materias",
    subject: "Informes Trimestrales Q4 2024",
    emailLink: "mailto:academico@eest6.edu.ar?subject=Informes Trimestrales",
    isNew: false,
    completed: true,
    fechaEntrega: "2024-12-28T00:00:00.000Z",
  },
  {
    id: "6",
    title: "Solicitud Mantenimiento Aulas",
    type: "solicitudes" as const,
    description: "Solicitud de mantenimiento preventivo para las aulas del segundo piso",
    subject: "Mantenimiento Aulas 2do Piso",
    emailLink: "mailto:mantenimiento@eest6.edu.ar?subject=Mantenimiento Aulas",
    isNew: false,
    completed: false,
    fechaSolicitud: "2024-12-20T00:00:00.000Z",
  },
  {
    id: "7",
    title: "Convocatoria Olimpiadas de Matemática",
    type: "convocatorias" as const,
    description: "Inscripción abierta para las Olimpiadas de Matemática 2025",
    subject: "Olimpiadas Matemática 2025",
    emailLink: "mailto:matematica@eest6.edu.ar?subject=Olimpiadas",
    isNew: false,
    completed: true,
    fechaConvocatoria: "2024-12-15T00:00:00.000Z",
  },
]

export async function GET() {
  try {
    // Agregar la fecha efectiva a cada elemento según su tipo
    const newsWithEffectiveDate = mockNews.map((item) => {
      let date: string

      switch (item.type) {
        case "solicitudes":
          date = item.fechaSolicitud || new Date().toISOString()
          break
        case "convocatorias":
          date = item.fechaConvocatoria || new Date().toISOString()
          break
        case "entregas":
          date = item.fechaEntrega || new Date().toISOString()
          break
        default:
          date = new Date().toISOString()
      }

      return {
        ...item,
        date,
      }
    })

    return NextResponse.json(newsWithEffectiveDate)
  } catch (error) {
    console.error("Error fetching news:", error)
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 })
  }
}
