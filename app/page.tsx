"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
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
  Settings,
  RefreshCw,
  Wifi,
  WifiOff,
  Bug,
  Search,
  X,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import Image from "next/image"
import { formatDate, formatRelativeDate } from "@/utils/date-helpers"
import { convertApiEventToEvent, getDateLabel } from "@/utils/event-helpers"
import type { Event, ApiEvent } from "@/types/event"
import LoginForm from "@/components/login-form"
import { GoogleSheetsClientService } from "@/lib/google-sheets-client"

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

// Datos de ejemplo como fallback
const mockEvents: ApiEvent[] = [
  {
    id: "mock-1",
    title: "Entrega Proyecto Alpha",
    type: "entregas",
    description: "Entrega final del proyecto Alpha con toda la documentación requerida",
    subject: "Proyecto Alpha - Entrega Final",
    emailLink: "mailto:admin@eest6.edu.ar?subject=Proyecto Alpha",
    completed: false,
    fechaRecepcion: "2025-01-01T09:00:00.000Z",
    fechaEntrega: "2025-01-15T09:00:00.000Z",
  },
  {
    id: "mock-2",
    title: "Convocatoria Becas 2025",
    type: "convocatorias",
    description: "Apertura de convocatoria para becas de investigación 2025",
    subject: "Becas de Investigación 2025",
    emailLink: "mailto:becas@eest6.edu.ar?subject=Convocatoria Becas 2025",
    completed: false,
    fechaRecepcion: "2024-12-20T10:00:00.000Z",
    fechaConvocatoria: "2025-01-03T10:00:00.000Z",
  },
  {
    id: "mock-3",
    title: "Solicitud Presupuesto Q1",
    type: "solicitudes",
    description: "Solicitud de presupuesto para el primer trimestre del año",
    subject: "Presupuesto Q1 2025",
    emailLink: "mailto:finanzas@eest6.edu.ar?subject=Presupuesto Q1",
    completed: false,
    fechaRecepcion: "2024-12-28T14:00:00.000Z",
    fechaSolicitud: "2025-01-08T14:00:00.000Z",
  },
]

export default function CalendarPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [filters, setFilters] = useState({
    entregas: true,
    convocatorias: true,
    solicitudes: true,
    showCompleted: true,
    showPending: true,
  })
  const [loading, setLoading] = useState(true)
  const [dataSource, setDataSource] = useState<"sheets" | "mock">("mock")
  const [lastFetch, setLastFetch] = useState<Date | null>(null)
  const [eventCount, setEventCount] = useState(0)
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "testing">("disconnected")
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [debugInfo, setDebugInfo] = useState<any[]>([])

  // Instancia del servicio de Google Sheets
  const [sheetsService] = useState(() => new GoogleSheetsClientService())

  // Función para buscar eventos
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []

    const query = searchQuery.toLowerCase().trim()
    const results = events.filter((event) => {
      // Buscar en título, asunto y descripción
      const titleMatch = event.title.toLowerCase().includes(query)
      const subjectMatch = event.subject.toLowerCase().includes(query)
      const descriptionMatch = event.description.toLowerCase().includes(query)

      return titleMatch || subjectMatch || descriptionMatch
    })

    // Ordenar por fecha efectiva (más recientes primero)
    return results.sort((a, b) => b.effectiveDate.getTime() - a.effectiveDate.getTime())
  }, [events, searchQuery])

  // Función para resaltar texto
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text

    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
    const parts = text.split(regex)

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      ),
    )
  }

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
      fetchEventsFromSheets()
    }
  }, [isAuthenticated])

  useEffect(() => {
    filterEvents()
  }, [events, filters])

  useEffect(() => {
    // Mostrar resultados de búsqueda si hay query
    setShowSearchResults(searchQuery.trim().length > 0)
  }, [searchQuery])

  const handleLogin = (password: string) => {
    setIsAuthenticated(true)
    localStorage.setItem("eest6-auth", "authenticated")
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem("eest6-auth")
  }

  const fetchEventsFromSheets = async () => {
    try {
      setLoading(true)
      setConnectionStatus("testing")
      setErrorMessage("")
      console.log("Frontend: Fetching events directly from Google Sheets...")

      // Intentar cargar desde Google Sheets
      const sheetsEvents = await sheetsService.getAllEvents()

      console.log("Frontend: Successfully loaded from Google Sheets:", sheetsEvents.length, "events")
      const eventsWithDates: Event[] = sheetsEvents.map(convertApiEventToEvent)
      setEvents(eventsWithDates)
      setEventCount(sheetsEvents.length)
      setDataSource("sheets")
      setConnectionStatus("connected")
      setLastFetch(new Date())

      // Obtener información de debug
      const debug = await sheetsService.getDebugInfo()
      setDebugInfo(debug)
    } catch (error) {
      console.error("Frontend: Error fetching events from Google Sheets:", error)
      setErrorMessage(error instanceof Error ? error.message : "Error desconocido")

      // Usar datos mock como fallback
      console.log("Frontend: Using mock data as fallback")
      const eventsWithDates: Event[] = mockEvents.map(convertApiEventToEvent)
      setEvents(eventsWithDates)
      setEventCount(mockEvents.length)
      setDataSource("mock")
      setConnectionStatus("disconnected")

      // Intentar obtener información de debug incluso si falló
      try {
        const debug = await sheetsService.getDebugInfo()
        setDebugInfo(debug)
      } catch (debugError) {
        console.error("Frontend: Error getting debug info:", debugError)
      }
    } finally {
      setLoading(false)
    }
  }

  const testConnection = async () => {
    try {
      setConnectionStatus("testing")
      console.log("Frontend: Testing Google Sheets connection...")

      const testResult = await sheetsService.testConnection()

      if (testResult.success) {
        console.log("Frontend: Connection test successful")
        setConnectionStatus("connected")
        setErrorMessage("")
        // Recargar eventos después de una prueba exitosa
        await fetchEventsFromSheets()
      } else {
        console.log("Frontend: Connection test failed:", testResult.error)
        setConnectionStatus("disconnected")
        setErrorMessage(testResult.error || "Error de conexión")
      }
    } catch (error) {
      console.error("Frontend: Connection test error:", error)
      setConnectionStatus("disconnected")
      setErrorMessage(error instanceof Error ? error.message : "Error de conexión")
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
    // Solo cambiar localmente ya que no tenemos API para persistir
    setEvents((prev) => prev.map((event) => (event.id === eventId ? { ...event, completed: !event.completed } : event)))
    if (selectedEvent?.id === eventId) {
      setSelectedEvent((prev) => (prev ? { ...prev, completed: !prev.completed } : null))
    }
  }

  const handleFilterChange = (filterType: keyof typeof filters) => {
    setFilters((prev) => ({ ...prev, [filterType]: !prev[filterType] }))
  }

  const clearSearch = () => {
    setSearchQuery("")
    setShowSearchResults(false)
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
          <p className="text-gray-600">Cargando eventos desde Google Sheets...</p>
          <p className="text-sm text-gray-500 mt-2">Conectando directamente con la hoja de cálculo...</p>
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
              <Link href="/diagnostico">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Diagnóstico
                </Button>
              </Link>
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
        <Alert
          className={`mb-6 ${dataSource === "sheets" ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}`}
        >
          <div className="flex items-center">
            {connectionStatus === "connected" && <Wifi className="h-4 w-4 text-green-600 mr-2" />}
            {connectionStatus === "disconnected" && <WifiOff className="h-4 w-4 text-red-600 mr-2" />}
            {connectionStatus === "testing" && <RefreshCw className="h-4 w-4 text-blue-600 mr-2 animate-spin" />}
            <AlertCircle className={`h-4 w-4 ${dataSource === "sheets" ? "text-green-600" : "text-yellow-600"}`} />
          </div>
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <strong>
                  {dataSource === "sheets" ? "✅ Conectado a Google Sheets" : "⚠️ Usando datos de ejemplo"}
                </strong>
                <div className="text-sm mt-1">
                  {dataSource === "sheets"
                    ? `${eventCount} eventos cargados directamente desde Google Sheets. Última actualización: ${lastFetch?.toLocaleTimeString()}`
                    : `${eventCount} eventos de ejemplo. ${errorMessage ? `Error: ${errorMessage}` : "No se pudo conectar con Google Sheets."}`}
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchEventsFromSheets}
                  disabled={loading || connectionStatus === "testing"}
                >
                  <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
                  Actualizar
                </Button>
                <Button variant="outline" size="sm" onClick={testConnection} disabled={connectionStatus === "testing"}>
                  <Wifi className="h-4 w-4 mr-1" />
                  Probar Conexión
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Panel de filtros y búsqueda */}
          <div className="lg:col-span-1 space-y-6">
            {/* Buscador */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Search className="h-5 w-5 mr-2" />
                  Buscador
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Buscar en título, asunto o descripción..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearSearch}
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {searchQuery && (
                  <div className="text-sm text-gray-600">
                    {searchResults.length > 0 ? (
                      <span>
                        {searchResults.length} resultado{searchResults.length !== 1 ? "s" : ""} encontrado
                        {searchResults.length !== 1 ? "s" : ""}
                      </span>
                    ) : (
                      <span className="text-red-600">No se encontraron resultados</span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Filtros */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  Filtros
                  <div className="ml-2">
                    {connectionStatus === "connected" && <Wifi className="h-4 w-4 text-green-500" />}
                    {connectionStatus === "disconnected" && <WifiOff className="h-4 w-4 text-red-500" />}
                    {connectionStatus === "testing" && <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />}
                  </div>
                </CardTitle>
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
                    Fuente: {dataSource === "sheets" ? "Google Sheets (Directo)" : "Datos de ejemplo"}
                  </p>
                  <p className="text-xs text-gray-500">Eventos cargados: {eventCount}</p>
                  <p className="text-xs text-gray-500">
                    Estado:{" "}
                    {connectionStatus === "connected"
                      ? "Conectado"
                      : connectionStatus === "testing"
                        ? "Probando..."
                        : "Desconectado"}
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

                {/* Debug info mejorado */}
                <div className="pt-4 border-t">
                  <details className="text-xs">
                    <summary className="cursor-pointer text-gray-500 flex items-center">
                      <Bug className="h-3 w-3 mr-1" />
                      Debug Info
                    </summary>
                    <div className="mt-2 space-y-1 text-gray-400">
                      <div>Data Source: {dataSource}</div>
                      <div>Connection: {connectionStatus}</div>
                      <div>Event Count: {eventCount}</div>
                      <div>Last Fetch: {lastFetch?.toLocaleString()}</div>
                      <div>Events: {events.length}</div>
                      <div>Filtered: {filteredEvents.length}</div>
                      {errorMessage && <div>Error: {errorMessage}</div>}

                      {debugInfo.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-300">
                          <div className="font-medium">Hojas de Google Sheets:</div>
                          {debugInfo.map((info, index) => (
                            <div key={index} className="ml-2">
                              <div>
                                {info.sheet}: {info.rowCount} filas
                              </div>
                              {info.isEmpty && <div className="text-red-400"> ⚠️ Vacía</div>}
                              {info.header.length > 0 && (
                                <div className="text-xs"> Header: {info.header.join(", ")}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </details>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contenido principal - Calendario o Resultados de búsqueda */}
          <div className="lg:col-span-3">
            {showSearchResults ? (
              /* Resultados de búsqueda */
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <div className="flex items-center">
                      <Search className="h-5 w-5 mr-2" />
                      Resultados de búsqueda para "{searchQuery}"
                    </div>
                    <Button variant="outline" size="sm" onClick={clearSearch}>
                      <X className="h-4 w-4 mr-1" />
                      Cerrar búsqueda
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {searchResults.length === 0 ? (
                    <div className="text-center py-12">
                      <Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron resultados</h3>
                      <p className="text-gray-600">
                        No hay eventos que coincidan con "{searchQuery}". Intenta con otros términos.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-sm text-gray-600 mb-4">
                        {searchResults.length} resultado{searchResults.length !== 1 ? "s" : ""} encontrado
                        {searchResults.length !== 1 ? "s" : ""} • Ordenado por fecha (más recientes primero)
                      </div>

                      {searchResults.map((event) => (
                        <Card
                          key={event.id}
                          className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                            event.completed ? "opacity-75" : ""
                          }`}
                          onClick={() => setSelectedEvent(event)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h3
                                  className={`font-medium mb-1 ${event.completed ? "line-through text-gray-500" : ""}`}
                                >
                                  {highlightText(event.title, searchQuery)}
                                </h3>
                                <div className="flex items-center space-x-2 mb-2 flex-wrap gap-2">
                                  <Badge
                                    variant="secondary"
                                    style={{
                                      backgroundColor: eventTypeColors[event.type],
                                      color: "white",
                                    }}
                                  >
                                    {eventTypeLabels[event.type]}
                                  </Badge>
                                  <Badge
                                    variant={event.completed ? "secondary" : "outline"}
                                    className={
                                      event.completed ? "bg-gray-500 text-white" : "border-orange-500 text-orange-600"
                                    }
                                  >
                                    {event.completed ? "Completado" : "Pendiente"}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">
                                  {formatDate(event.effectiveDate)} • {formatRelativeDate(event.effectiveDate)}
                                </p>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div>
                                <h4 className="font-medium text-sm text-gray-700">Asunto</h4>
                                <p className={`text-sm ${event.completed ? "line-through text-gray-500" : ""}`}>
                                  {highlightText(event.subject, searchQuery)}
                                </p>
                              </div>

                              {event.description && (
                                <div>
                                  <h4 className="font-medium text-sm text-gray-700">Descripción</h4>
                                  <p className={`text-sm ${event.completed ? "line-through text-gray-500" : ""}`}>
                                    {highlightText(event.description, searchQuery)}
                                  </p>
                                </div>
                              )}

                              <div className="flex items-center justify-between pt-2 border-t">
                                <div className="flex items-center space-x-4">
                                  {event.emailLink && (
                                    <a
                                      href={event.emailLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <Mail className="h-4 w-4 mr-1" />
                                      Ver correo
                                      <ExternalLink className="h-3 w-3 ml-1" />
                                    </a>
                                  )}
                                </div>

                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`search-completed-${event.id}`}
                                    checked={event.completed}
                                    onCheckedChange={(e) => {
                                      e.stopPropagation()
                                      toggleEventCompletion(event.id)
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <label
                                    htmlFor={`search-completed-${event.id}`}
                                    className="text-sm cursor-pointer"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {event.completed ? "Completado" : "Pendiente"}
                                  </label>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              /* Calendario normal */
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
            )}
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
