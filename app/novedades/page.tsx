"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Calendar, Mail, ExternalLink, LogOut, Filter, RefreshCw, Wifi, WifiOff } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { formatDate, formatRelativeDate } from "@/utils/date-helpers"
import { convertApiEventToEvent } from "@/utils/event-helpers"
import LoginForm from "@/components/login-form"
import { GoogleSheetsClientService } from "@/lib/google-sheets-client"

interface NewsItem {
  id: string
  title: string
  type: "entregas" | "convocatorias" | "solicitudes"
  description: string
  subject: string
  emailLink: string
  date: string
  isNew: boolean
  completed: boolean
}

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

// Datos de ejemplo para novedades
const mockNews: NewsItem[] = [
  {
    id: "mock-1",
    title: "Nueva Convocatoria de Investigación",
    type: "convocatorias",
    description: "Se ha abierto una nueva convocatoria para proyectos de investigación en tecnología",
    subject: "Convocatoria Investigación Tech 2025",
    emailLink: "mailto:investigacion@eest6.edu.ar?subject=Nueva Convocatoria",
    date: "2025-01-10T00:00:00.000Z",
    isNew: true,
    completed: false,
  },
  {
    id: "mock-2",
    title: "Actualización Entrega Proyecto Beta",
    type: "entregas",
    description: "Se ha actualizado la fecha de entrega del proyecto Beta para el 15 de enero",
    subject: "Proyecto Beta - Cambio de Fecha",
    emailLink: "mailto:proyectos@eest6.edu.ar?subject=Proyecto Beta",
    date: "2025-01-08T00:00:00.000Z",
    isNew: true,
    completed: true,
  },
  {
    id: "mock-3",
    title: "Nueva Solicitud de Equipamiento",
    type: "solicitudes",
    description: "Solicitud urgente de equipamiento para el laboratorio de electrónica",
    subject: "Solicitud Equipamiento Lab Electrónica",
    emailLink: "mailto:compras@eest6.edu.ar?subject=Equipamiento",
    date: "2025-01-05T00:00:00.000Z",
    isNew: false,
    completed: false,
  },
]

export default function NovedadesPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [news, setNews] = useState<NewsItem[]>([])
  const [filteredNews, setFilteredNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "testing">("disconnected")
  const [filters, setFilters] = useState({
    entregas: true,
    convocatorias: true,
    solicitudes: true,
    showCompleted: true,
    showPending: true,
    showOnlyNew: false,
  })

  // Instancia del servicio de Google Sheets
  const [sheetsService] = useState(() => new GoogleSheetsClientService())

  useEffect(() => {
    const authStatus = localStorage.getItem("eest6-auth")
    if (authStatus === "authenticated") {
      setIsAuthenticated(true)
      fetchNewsFromSheets()
    } else {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    filterNews()
  }, [news, filters])

  const handleLogin = (password: string) => {
    setIsAuthenticated(true)
    localStorage.setItem("eest6-auth", "authenticated")
    fetchNewsFromSheets()
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem("eest6-auth")
  }

  const fetchNewsFromSheets = async () => {
    try {
      setLoading(true)
      setConnectionStatus("testing")
      console.log("Novedades: Fetching news directly from Google Sheets...")

      // Intentar cargar desde Google Sheets
      const sheetsEvents = await sheetsService.getAllEvents()

      if (sheetsEvents.length > 0) {
        console.log("Novedades: Successfully loaded from Google Sheets:", sheetsEvents.length, "events")

        // Convertir eventos a formato de noticias
        const newsItems: NewsItem[] = sheetsEvents.map((event) => {
          const eventWithDates = convertApiEventToEvent(event)
          const sevenDaysAgo = new Date()
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

          return {
            id: event.id,
            title: event.title,
            type: event.type,
            description: event.description,
            subject: event.subject,
            emailLink: event.emailLink,
            date: eventWithDates.effectiveDate.toISOString(),
            isNew: eventWithDates.effectiveDate >= sevenDaysAgo,
            completed: event.completed,
          }
        })

        setNews(newsItems)
        setConnectionStatus("connected")
      } else {
        console.log("Novedades: No events from Google Sheets, using mock data")
        setNews(mockNews)
        setConnectionStatus("disconnected")
      }
    } catch (error) {
      console.error("Novedades: Error fetching news from Google Sheets:", error)
      setNews(mockNews)
      setConnectionStatus("disconnected")
    } finally {
      setLoading(false)
    }
  }

  const filterNews = () => {
    const filtered = news.filter((item) => {
      // Filtro por tipo
      const typeFilter = filters[item.type]

      // Filtro por estado (completado/pendiente)
      const statusFilter = item.completed ? filters.showCompleted : filters.showPending

      // Filtro por novedades (solo nuevos)
      const newFilter = filters.showOnlyNew ? item.isNew : true

      return typeFilter && statusFilter && newFilter
    })

    // Ordenar por fecha (más recientes primero)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    setFilteredNews(filtered)
  }

  const handleFilterChange = (filterType: keyof typeof filters) => {
    setFilters((prev) => ({ ...prev, [filterType]: !prev[filterType] }))
  }

  const toggleNewsCompletion = (newsId: string) => {
    // Solo cambiar localmente ya que no tenemos API para persistir
    setNews((prev) => prev.map((item) => (item.id === newsId ? { ...item, completed: !item.completed } : item)))
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Calendar className="h-12 w-12 animate-spin mx-auto mb-4 text-green-600" />
          <p className="text-gray-600">Cargando novedades desde Google Sheets...</p>
          <p className="text-sm text-gray-500 mt-2">Conectando directamente con la hoja de cálculo...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Image src="/logo-eest6.png" alt="Logo E.E.S.T. N° 6" width={50} height={50} className="rounded-lg" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  Novedades - E.E.S.T. n° 6
                  <div className="ml-2">
                    {connectionStatus === "connected" && <Wifi className="h-4 w-4 text-green-500" />}
                    {connectionStatus === "disconnected" && <WifiOff className="h-4 w-4 text-red-500" />}
                    {connectionStatus === "testing" && <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />}
                  </div>
                </h1>
                <p className="text-sm text-gray-600">
                  Banfield - Lomas de Zamora •{" "}
                  {connectionStatus === "connected" ? "Conectado a Google Sheets" : "Datos de ejemplo"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" onClick={fetchNewsFromSheets} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
                Actualizar
              </Button>
              <Link href="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver al Calendario
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Panel de filtros */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-3">Tipos de eventos</h3>
                  <div className="space-y-2">
                    {Object.entries(eventTypeLabels).map(([key, label]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          id={`news-${key}`}
                          checked={filters[key as keyof typeof filters] as boolean}
                          onCheckedChange={() => handleFilterChange(key as keyof typeof filters)}
                        />
                        <label htmlFor={`news-${key}`} className="flex items-center space-x-2 cursor-pointer">
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
                        id="news-pending"
                        checked={filters.showPending}
                        onCheckedChange={() => handleFilterChange("showPending")}
                      />
                      <label htmlFor="news-pending" className="text-sm cursor-pointer">
                        Pendientes
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="news-completed"
                        checked={filters.showCompleted}
                        onCheckedChange={() => handleFilterChange("showCompleted")}
                      />
                      <label htmlFor="news-completed" className="text-sm cursor-pointer">
                        Completados
                      </label>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-3">Novedades</h3>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="only-new"
                      checked={filters.showOnlyNew}
                      onCheckedChange={() => handleFilterChange("showOnlyNew")}
                    />
                    <label htmlFor="only-new" className="text-sm cursor-pointer">
                      Solo elementos nuevos
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>
                      Total: <span className="font-medium">{filteredNews.length}</span> elementos
                    </p>
                    <p>
                      Nuevos:{" "}
                      <span className="font-medium text-green-600">
                        {filteredNews.filter((item) => item.isNew).length}
                      </span>
                    </p>
                    <p>
                      Pendientes:{" "}
                      <span className="font-medium text-orange-600">
                        {filteredNews.filter((item) => !item.completed).length}
                      </span>
                    </p>
                    <p>
                      Completados:{" "}
                      <span className="font-medium text-gray-500">
                        {filteredNews.filter((item) => item.completed).length}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500 pt-2 border-t">
                      Fuente: {connectionStatus === "connected" ? "Google Sheets (Directo)" : "Datos de ejemplo"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de novedades */}
          <div className="lg:col-span-3">
            {filteredNews.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay novedades</h3>
                  <p className="text-gray-600">
                    No se encontraron elementos que coincidan con los filtros seleccionados.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4 bg-transparent"
                    onClick={() =>
                      setFilters({
                        entregas: true,
                        convocatorias: true,
                        solicitudes: true,
                        showCompleted: true,
                        showPending: true,
                        showOnlyNew: false,
                      })
                    }
                  >
                    Limpiar filtros
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {filteredNews.length} {filteredNews.length === 1 ? "novedad encontrada" : "novedades encontradas"}
                  </h2>
                  <div className="text-sm text-gray-500">Ordenado por fecha (más recientes primero)</div>
                </div>

                {filteredNews.map((item) => (
                  <Card
                    key={item.id}
                    className={`transition-all duration-200 hover:shadow-md ${
                      item.isNew ? "ring-2 ring-green-500 bg-green-50" : ""
                    } ${item.completed ? "opacity-75" : ""}`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className={`text-lg mb-2 ${item.completed ? "line-through text-gray-500" : ""}`}>
                            {item.title}
                          </CardTitle>
                          <div className="flex items-center space-x-2 mb-2 flex-wrap gap-2">
                            <Badge
                              variant="secondary"
                              style={{
                                backgroundColor: eventTypeColors[item.type],
                                color: "white",
                              }}
                            >
                              {eventTypeLabels[item.type]}
                            </Badge>
                            {item.isNew && (
                              <Badge variant="default" className="bg-green-500">
                                Nuevo
                              </Badge>
                            )}
                            <Badge
                              variant={item.completed ? "secondary" : "outline"}
                              className={
                                item.completed ? "bg-gray-500 text-white" : "border-orange-500 text-orange-600"
                              }
                            >
                              {item.completed ? "Completado" : "Pendiente"}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            {formatDate(item.date)} • {formatRelativeDate(item.date)}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-sm text-gray-700 mb-1">Asunto</h4>
                          <p className={`text-sm ${item.completed ? "line-through text-gray-500" : ""}`}>
                            {item.subject}
                          </p>
                        </div>

                        <div>
                          <h4 className="font-medium text-sm text-gray-700 mb-1">Descripción</h4>
                          <p className={`text-sm ${item.completed ? "line-through text-gray-500" : ""}`}>
                            {item.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t">
                          <div className="flex items-center space-x-4">
                            {item.emailLink && (
                              <a
                                href={item.emailLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
                              >
                                <Mail className="h-4 w-4 mr-1" />
                                Ver correo
                                <ExternalLink className="h-3 w-3 ml-1" />
                              </a>
                            )}
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`completed-${item.id}`}
                              checked={item.completed}
                              onCheckedChange={() => toggleNewsCompletion(item.id)}
                            />
                            <label htmlFor={`completed-${item.id}`} className="text-sm cursor-pointer">
                              Marcar como {item.completed ? "pendiente" : "completado"}
                            </label>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
