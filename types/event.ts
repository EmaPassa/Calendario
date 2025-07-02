export interface Event {
  id: string
  title: string // Se usará el campo "Asunto" como título
  type: "entregas" | "convocatorias" | "solicitudes"
  description: string // Campo "Descripción"
  subject: string // Campo "Asunto"
  emailLink: string // Campo "Link"
  completed: boolean
  // Fechas específicas según la nueva estructura
  fechaRecepcion: Date // Fecha Recepción (común para todos)
  fechaEntrega?: Date // Solo para entregas
  fechaConvocatoria?: Date // Solo para convocatorias
  fechaSolicitud?: Date // Solo para solicitudes
  // Fecha efectiva que se usa para mostrar en el calendario
  effectiveDate: Date
}

export interface ApiEvent {
  id: string
  title: string
  type: "entregas" | "convocatorias" | "solicitudes"
  description: string
  subject: string
  emailLink: string
  completed: boolean
  // Fechas como strings desde la API/Google Sheets
  fechaRecepcion: string
  fechaEntrega?: string
  fechaConvocatoria?: string
  fechaSolicitud?: string
}
