export interface Event {
  id: string
  title: string
  type: "entregas" | "convocatorias" | "solicitudes"
  description: string
  subject: string
  emailLink: string
  completed: boolean
  // Fechas específicas según el tipo
  fechaSolicitud?: Date
  fechaConvocatoria?: Date
  fechaEntrega?: Date
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
  // Fechas específicas según el tipo (como strings desde la API)
  fechaSolicitud?: string
  fechaConvocatoria?: string
  fechaEntrega?: string
}
