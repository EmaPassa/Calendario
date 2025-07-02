import { createDateFromString } from "./date-helpers"
import type { Event, ApiEvent } from "@/types/event"

export const getEffectiveDate = (event: ApiEvent | Event): Date => {
  switch (event.type) {
    case "solicitudes":
      if (event.fechaSolicitud) {
        return typeof event.fechaSolicitud === "string"
          ? createDateFromString(event.fechaSolicitud)
          : event.fechaSolicitud
      }
      break
    case "convocatorias":
      if (event.fechaConvocatoria) {
        return typeof event.fechaConvocatoria === "string"
          ? createDateFromString(event.fechaConvocatoria)
          : event.fechaConvocatoria
      }
      break
    case "entregas":
      if (event.fechaEntrega) {
        return typeof event.fechaEntrega === "string" ? createDateFromString(event.fechaEntrega) : event.fechaEntrega
      }
      break
  }

  // Fallback a fecha actual si no hay fecha específica
  return new Date()
}

export const convertApiEventToEvent = (apiEvent: ApiEvent): Event => {
  const effectiveDate = getEffectiveDate(apiEvent)

  return {
    ...apiEvent,
    fechaSolicitud: apiEvent.fechaSolicitud ? createDateFromString(apiEvent.fechaSolicitud) : undefined,
    fechaConvocatoria: apiEvent.fechaConvocatoria ? createDateFromString(apiEvent.fechaConvocatoria) : undefined,
    fechaEntrega: apiEvent.fechaEntrega ? createDateFromString(apiEvent.fechaEntrega) : undefined,
    effectiveDate,
  }
}

export const getDateLabel = (type: "entregas" | "convocatorias" | "solicitudes"): string => {
  switch (type) {
    case "solicitudes":
      return "Fecha de Solicitud"
    case "convocatorias":
      return "Fecha de Convocatoria"
    case "entregas":
      return "Fecha de Entrega"
    default:
      return "Fecha"
  }
}
