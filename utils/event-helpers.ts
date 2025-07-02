import { createDateFromString } from "./date-helpers"
import type { Event, ApiEvent } from "@/types/event"

export const getEffectiveDate = (event: ApiEvent | Event): Date => {
  switch (event.type) {
    case "entregas":
      if (event.fechaEntrega) {
        return typeof event.fechaEntrega === "string" ? createDateFromString(event.fechaEntrega) : event.fechaEntrega
      }
      break
    case "convocatorias":
      if (event.fechaConvocatoria) {
        return typeof event.fechaConvocatoria === "string"
          ? createDateFromString(event.fechaConvocatoria)
          : event.fechaConvocatoria
      }
      break
    case "solicitudes":
      if (event.fechaSolicitud) {
        return typeof event.fechaSolicitud === "string"
          ? createDateFromString(event.fechaSolicitud)
          : event.fechaSolicitud
      }
      break
  }

  // Fallback a fecha de recepción si no hay fecha específica
  const fechaRecepcion =
    typeof event.fechaRecepcion === "string" ? createDateFromString(event.fechaRecepcion) : event.fechaRecepcion

  return fechaRecepcion || new Date()
}

export const convertApiEventToEvent = (apiEvent: ApiEvent): Event => {
  const effectiveDate = getEffectiveDate(apiEvent)

  return {
    ...apiEvent,
    fechaRecepcion: createDateFromString(apiEvent.fechaRecepcion),
    fechaEntrega: apiEvent.fechaEntrega ? createDateFromString(apiEvent.fechaEntrega) : undefined,
    fechaConvocatoria: apiEvent.fechaConvocatoria ? createDateFromString(apiEvent.fechaConvocatoria) : undefined,
    fechaSolicitud: apiEvent.fechaSolicitud ? createDateFromString(apiEvent.fechaSolicitud) : undefined,
    effectiveDate,
  }
}

export const getDateLabel = (type: "entregas" | "convocatorias" | "solicitudes"): string => {
  switch (type) {
    case "entregas":
      return "Fecha de Entrega"
    case "convocatorias":
      return "Fecha de Convocatoria"
    case "solicitudes":
      return "Fecha de Solicitud"
    default:
      return "Fecha"
  }
}
