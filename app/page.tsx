"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Mail,
  ExternalLink,
  LogOut,
  CalendarIcon,
  AlertCircle,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import Image from "next/image"
import { formatDate } from "@/utils/date-helpers"
import { convertApiEventToEvent, getDateLabel } from "@/utils/event-helpers"
import type { Event, ApiEvent } from "@/types/event"
import LoginForm from "@/components/login-form"

const eventTypeColors = {
  entregas: "#ef4444",
  convocatorias: "#3b82f6",
  solicitudes: "#10b981",
}

const eventTypeLabels = {
  entregas: "Entregas",
  convocatorias: "Convocatorias",
  solicitudes: "Solicitudes",
}

const monthNames = [
  "ENERO",
  "FEBRERO",
  "MARZO",
  "ABRIL",
  "MAYO",
  "JUNIO",
  "JULIO",
  "AGOSTO",
  "SEPTIEMBRE",
  "OCTUBRE",
  "NOVIEMBRE",
  "DICIEMBRE",
]

const dayNames = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]

export default function CalendarPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [filters, setFilters] = useState({
    entregas: true,
    convocatorias: true,
    solicitudes: true,
    showCompleted: true,
    showPending: true,
  })
  const [loading, setLoading] = useState(true)
  const [dataSource, setDataSource] = useState<"sheets" | "mock">("mock")

  useEffect(() => {
    // Verificar si ya está autenticado
    const authStatus = localStorage.getItem("eest6-auth")
    if (authStatus === "authenticated") {
      setIsAuthenticated(true)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchEvents()
    }
  }, [isAuthenticated])

  useEffect(() => {
    filterEvents()
  }, [events, filters])

  const handleLogin = (password: string) => {
    setIsAuthenticated(true)
    localStorage.setItem("eest6-auth", "authenticated")
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem("eest6-auth")
  }

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/events")
      const data: ApiEvent[] = await response.json()

      const eventsWithDates: Event[] = data.map(convertApiEventToEvent)
      setEvents(eventsWithDates)

      // Detectar si los datos vienen de Google Sheets o son mock
      if (data.length > 0 && data[0].id.includes("entregas-") && data.length > 5) {
        setDataSource("sheets")
      } else {
        setDataSource("mock")
      }
    } catch (error) {
      console.error("Error fetching events:", error)
      setEvents([])
      setDataSource("mock")
    } finally {
      setLoading(false)
    }
  }

  const filterEvents = () => {
    const filtered = events.filter((event) => {
      const typeFilter = filters[event.type]
      const statusFilter = event.completed ? filters.showCompleted : filters.showPending
      return typeFilter && statusFilter
    })
    setFilteredEvents(filtered)
  }

  const toggleEventCompletion = async (eventId: string) => {
    try {
      const response = await fetch("/api/events/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      })

      if (response.ok) {
        setEvents((prev) =>
          prev.map((event) => (event.id === eventId ? { ...event, completed: !event.completed } : event)),
        )
        if (selectedEvent?.id === eventId) {
          setSelectedEvent((prev) => (prev ? { ...prev, completed: !prev.completed } : null))
        }
      }
    } catch (error) {
      console.error("Error toggling event completion:", error)
    }
  }

  const handleFilterChange = (filterType: keyof typeof filters) => {
    setFilters((prev) => ({ ...prev, [filterType]: !prev[filterType] }))
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()

    const startDay = (firstDay.getDay() + 6) % 7

    const days = []

    for (let i = 0; i < startDay; i++) {
      const prevMonth = new Date(year, month, 0)
      const day = prevMonth.getDate() - startDay + i + 1
      days.push({
        day,
        date: new Date(year, month - 1, day),
        isCurrentMonth: false,
        isToday: false,
      })
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const today = new Date()
      const isToday = date.toDateString() === today.toDateString()

      days.push({
        day,
        date,
        isCurrentMonth: true,
        isToday,
      })
    }

    const remainingCells = 42 - days.length
    for (let day = 1; day <= remainingCells; day++) {
      days.push({
        day,
        date: new Date(year, month + 1, day),
        isCurrentMonth: false,
        isToday: false,
      })
    }

    return days
  }

  const getEventsForDay = (date: Date) => {
    return filteredEvents.filter((event) => {
      return event.effectiveDate.toDateString() === date.toDateString()
    })
  }

  const getSmallCalendar = (monthOffset: number) => {
    const date = new Date(currentDate)
    date.setMonth(currentDate.getMonth() + monthOffset)
    const year = date.getFullYear()
    const month = date.getMonth()
    const monthName = monthNames[month]

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startDay = (firstDay.getDay() + 6) % 7

    const weeks = []
    let currentWeek = []

    for (let i = 0; i < startDay; i++) {
      currentWeek.push(null)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      currentWeek.push(day)
      if (currentWeek.length === 7) {
        weeks.push(currentWeek)
        currentWeek = []
      }
    }

    while (currentWeek.length < 7 && currentWeek.length > 0) {
      currentWeek.push(null)
    }
    if (currentWeek.length > 0) {
      weeks.push(currentWeek)
    }

    return { monthName, year, weeks }
  }

  // Mostrar formulario de login si no está autenticado
  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando eventos...</p>
        </div>
      </div>
    )
  }

  const days = getDaysInMonth(currentDate)
  const prevMonth = getSmallCalendar(-1)
  const nextMonth = getSmallCalendar(1)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Image src="/logo-eest6.png" alt="Logo E.E.S.T. N° 6" width={50} height={50} className="rounded-lg" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Calendario de Eventos de E.E.S.T. n° 6</h1>
                <p className="text-sm text-gray-600">Banfield - Lomas de Zamora</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/novedades">
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Ver Novedades
                </Button>
              </Link>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Salir
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alerta sobre la fuente de datos */}
        {dataSource === "mock" && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Usando datos de ejemplo.</strong> Para cargar datos desde Google Sheets, asegúrate de que la hoja
              sea pública y configure la API key.
              <Link href="/configuracion" className="ml-2 text-blue-600 hover:underline">
                Ver instrucciones de configuración
              </Link>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Panel de filtros */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Filtros</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-3">Tipos de eventos</h3>
                  <div className="space-y-2">
                    {Object.entries(eventTypeLabels).map(([key, label]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          id={key}
                          checked={filters[key as keyof typeof filters] as boolean}
                          onCheckedChange={() => handleFilterChange(key as keyof typeof filters)}
                        />
                        <label htmlFor={key} className="flex items-center space-x-2 cursor-pointer">
                          <div
                            className="w-3 h-3 rounded"
                            style={{ backgroundColor: eventTypeColors[key as keyof typeof eventTypeColors] }}
                          />
                          <span className="text-sm">{label}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-3">Estado</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="pending"
                        checked={filters.showPending}
                        onCheckedChange={() => handleFilterChange("showPending")}
                      />
                      <label htmlFor="pending" className="text-sm cursor-pointer">
                        Pendientes
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="completed"
                        checked={filters.showCompleted}
                        onCheckedChange={() => handleFilterChange("showCompleted")}
                      />
                      <label htmlFor="completed" className="text-sm cursor-pointer">
                        Completados
                      </label>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    Total de eventos: <span className="font-medium">{filteredEvents.length}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Fuente: {dataSource === "sheets" ? "Google Sheets" : "Datos de ejemplo"}
                  </p>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="font-medium mb-2 text-sm">Estructura de fechas</h3>
                  <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded bg-red-500"></div>
                      <span>Entregas: Fecha Entrega</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded bg-blue-500"></div>
                      <span>Convocatorias: Fecha Convocatoria</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded bg-green-500"></div>
                      <span>Solicitudes: Fecha Solicitud</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Calendario */}
          <div className="lg:col-span-3">
            <Card className="calendar-card">
              <CardContent className="p-6">
                {/* Calendarios pequeños y navegación */}
                <div className="flex justify-between items-start mb-6">
                  {/* Calendario anterior */}
                  <div className="text-center">
                    <div className="text-xs font-medium text-gray-600 mb-2">
                      {prevMonth.monthName} {prevMonth.year}
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-xs">
                      {["L", "M", "X", "J", "V", "S", "D"].map((day) => (
                        <div key={day} className="w-6 h-6 flex items-center justify-center font-medium text-gray-500">
                          {day}
                        </div>
                      ))}
                      {prevMonth.weeks.map((week, weekIndex) =>
                        week.map((day, dayIndex) => (
                          <div
                            key={`${weekIndex}-${dayIndex}`}
                            className="w-6 h-6 flex items-center justify-center text-gray-400"
                          >
                            {day || ""}
                          </div>
                        )),
                      )}
                    </div>
                  </div>

                  {/* Título principal y navegación */}
                  <div className="text-center flex-1">
                    <div className="flex items-center justify-center space-x-4 mb-2">
                      <Button variant="ghost" size="sm" onClick={() => navigateMonth("prev")}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <h2 className="text-4xl font-bold">{monthNames[currentDate.getMonth()]}</h2>
                      <Button variant="ghost" size="sm" onClick={() => navigateMonth("next")}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-4xl font-bold text-red-600">{currentDate.getFullYear()}</div>
                  </div>

                  {/* Calendario siguiente */}
                  <div className="text-center">
                    <div className="text-xs font-medium text-gray-600 mb-2">
                      {nextMonth.monthName} {nextMonth.year}
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-xs">
                      {["L", "M", "X", "J", "V", "S", "D"].map((day) => (
                        <div key={day} className="w-6 h-6 flex items-center justify-center font-medium text-gray-500">
                          {day}
                        </div>
                      ))}
                      {nextMonth.weeks.map((week, weekIndex) =>
                        week.map((day, dayIndex) => (
                          <div
                            key={`${weekIndex}-${dayIndex}`}
                            className="w-6 h-6 flex items-center justify-center text-gray-400"
                          >
                            {day || ""}
                          </div>
                        )),
                      )}
                    </div>
                  </div>
                </div>

                {/* Calendario principal */}
                <div className="calendar-grid">
                  {/* Encabezados de días */}
                  <div className="grid grid-cols-7 mb-2">
                    {dayNames.map((day) => (
                      <div key={day} className="day-header">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Días del calendario */}
                  <div className="grid grid-cols-7 gap-1">
                    {days.map((dayInfo, index) => {
                      const dayEvents = getEventsForDay(dayInfo.date)
                      const isWeekend = index % 7 >= 5

                      return (
                        <div
                          key={index}
                          className={`day-cell ${!dayInfo.isCurrentMonth ? "other-month" : ""} ${
                            dayInfo.isToday ? "today" : ""
                          }`}
                        >
                          <div className={`day-number ${isWeekend && dayInfo.isCurrentMonth ? "weekend" : ""}`}>
                            {dayInfo.day}
                          </div>
                          <div className="events-container">
                            {dayEvents.map((event) => (
                              <div
                                key={event.id}
                                className={`event-item ${event.completed ? "completed" : ""}`}
                                style={{ color: eventTypeColors[event.type] }}
                                onClick={() => setSelectedEvent(event)}
                              >
                                {event.title}
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal de detalles del evento */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{selectedEvent?.title}</span>
              <Badge
                variant="secondary"
                style={{
                  backgroundColor: selectedEvent ? eventTypeColors[selectedEvent.type] : undefined,
                  color: "white",
                }}
              >
                {selectedEvent ? eventTypeLabels[selectedEvent.type] : ""}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-1">Asunto</h4>
                <p className="text-sm">{selectedEvent.subject}</p>
              </div>

              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-1">Descripción</h4>
                <p className="text-sm">{selectedEvent.description}</p>
              </div>

              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-1 flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  {getDateLabel(selectedEvent.type)}
                </h4>
                <p className="text-sm">{formatDate(selectedEvent.effectiveDate)}</p>
              </div>

              {/* Mostrar todas las fechas disponibles */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="font-medium text-sm text-gray-700 mb-2">Fechas del evento</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fecha de Recepción:</span>
                    <span className="font-medium">{formatDate(selectedEvent.fechaRecepcion)}</span>
                  </div>
                  {selectedEvent.fechaSolicitud && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fecha de Solicitud:</span>
                      <span className="font-medium">{formatDate(selectedEvent.fechaSolicitud)}</span>
                    </div>
                  )}
                  {selectedEvent.fechaConvocatoria && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fecha de Convocatoria:</span>
                      <span className="font-medium">{formatDate(selectedEvent.fechaConvocatoria)}</span>
                    </div>
                  )}
                  {selectedEvent.fechaEntrega && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fecha de Entrega:</span>
                      <span className="font-medium">{formatDate(selectedEvent.fechaEntrega)}</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedEvent.emailLink && (
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-1">Enlace</h4>
                  <a
                    href={selectedEvent.emailLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                  >
                    <Mail className="h-4 w-4 mr-1" />
                    Abrir enlace
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="completed"
                    checked={selectedEvent.completed}
                    onCheckedChange={() => toggleEventCompletion(selectedEvent.id)}
                  />
                  <label htmlFor="completed" className="text-sm cursor-pointer">
                    Marcar como {selectedEvent.completed ? "pendiente" : "completado"}
                  </label>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
