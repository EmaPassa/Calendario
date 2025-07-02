"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, RefreshCw, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface DiagnosticResult {
  sheet: string
  status: "success" | "error" | "loading"
  data?: any[]
  error?: string
  rowCount?: number
}

export default function DiagnosticoPage() {
  const [results, setResults] = useState<DiagnosticResult[]>([])
  const [loading, setLoading] = useState(false)

  const runDiagnostic = async () => {
    setLoading(true)
    const sheets = ["Entregas", "Convocatorias", "Solicitudes"]
    const newResults: DiagnosticResult[] = []

    for (const sheet of sheets) {
      try {
        const spreadsheetId = "1oHFohkYkMQBkDQ7hfBpGj0euUvP11fq7I8oBPc4bZQ8"
        const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheet)}`

        console.log(`Testing ${sheet}: ${url}`)

        const response = await fetch(url)

        if (!response.ok) {
          newResults.push({
            sheet,
            status: "error",
            error: `HTTP ${response.status}: ${response.statusText}`,
          })
          continue
        }

        const csvText = await response.text()
        const lines = csvText.split("\n").filter((line) => line.trim())

        newResults.push({
          sheet,
          status: "success",
          rowCount: lines.length - 1, // Excluir header
          data: lines.slice(0, 3), // Mostrar solo las primeras 3 líneas
        })
      } catch (error) {
        newResults.push({
          sheet,
          status: "error",
          error: error instanceof Error ? error.message : "Error desconocido",
        })
      }
    }

    setResults(newResults)
    setLoading(false)
  }

  useEffect(() => {
    runDiagnostic()
  }, [])

  const getStatusIcon = (status: DiagnosticResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "loading":
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
    }
  }

  const testApiEndpoint = async () => {
    try {
      const response = await fetch("/api/events")
      const data = await response.json()
      console.log("API Response:", data)
      alert(`API devolvió ${data.length} eventos. Ver consola para detalles.`)
    } catch (error) {
      console.error("API Error:", error)
      alert("Error al probar la API. Ver consola para detalles.")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Image src="/logo-eest6.png" alt="Logo E.E.S.T. N° 6" width={50} height={50} className="rounded-lg" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Diagnóstico - E.E.S.T. n° 6</h1>
                <p className="text-sm text-gray-600">Verificación de conexión con Google Sheets</p>
              </div>
            </div>
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Calendario
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Controles */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pruebas de Conexión</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-4">
                <Button onClick={runDiagnostic} disabled={loading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                  Probar Google Sheets
                </Button>
                <Button onClick={testApiEndpoint} variant="outline">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Probar API
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Resultados */}
          <div className="space-y-4">
            {results.map((result) => (
              <Card key={result.sheet}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    {getStatusIcon(result.status)}
                    <span>Hoja: "{result.sheet}"</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {result.status === "success" && (
                    <div className="space-y-3">
                      <div className="text-sm text-green-600">
                        ✅ Conexión exitosa - {result.rowCount} filas de datos
                      </div>
                      {result.data && (
                        <div>
                          <h4 className="font-medium mb-2">Primeras líneas:</h4>
                          <div className="bg-gray-50 p-3 rounded text-xs font-mono">
                            {result.data.map((line, index) => (
                              <div key={index} className={index === 0 ? "font-bold" : ""}>
                                {line}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {result.status === "error" && (
                    <div className="space-y-2">
                      <div className="text-sm text-red-600">❌ Error de conexión</div>
                      <div className="bg-red-50 p-3 rounded text-sm text-red-700">{result.error}</div>
                    </div>
                  )}

                  {result.status === "loading" && <div className="text-sm text-blue-600">🔄 Probando conexión...</div>}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Información adicional */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información de Depuración</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm space-y-2">
                <div>
                  <strong>ID de Spreadsheet:</strong> 1oHFohkYkMQBkDQ7hfBpGj0euUvP11fq7I8oBPc4bZQ8
                </div>
                <div>
                  <strong>Método de acceso:</strong> CSV público via Google Sheets
                </div>
                <div>
                  <strong>Hojas requeridas:</strong> Entregas, Convocatorias, Solicitudes
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Nota:</strong> Si ves errores de CORS, es normal en el navegador. La aplicación funcionará
                  correctamente en el servidor.
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Consola del navegador:</strong> Abre las herramientas de desarrollador (F12) y revisa la
                  pestaña "Console" para ver logs detallados.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
