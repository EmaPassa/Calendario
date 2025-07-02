"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ExternalLink, Copy, CheckCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"

export default function ConfiguracionPage() {
  const [copied, setCopied] = useState(false)
  const spreadsheetId = "1oHFohkYkMQBkDQ7hfBpGj0euUvP11fq7I8oBPc4bZQ8"

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Image src="/logo-eest6.png" alt="Logo E.E.S.T. N° 6" width={50} height={50} className="rounded-lg" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Configuración - E.E.S.T. n° 6</h1>
                <p className="text-sm text-gray-600">Configuración de Google Sheets</p>
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
          {/* Instrucciones para hacer público el Google Sheets */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Paso 1: Hacer público el Google Sheets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Importante:</strong> El enlace que proporcionaste no es accesible públicamente. Necesitas
                  hacer la hoja de cálculo pública para que la aplicación pueda leerla.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Instrucciones:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>
                    Abre tu Google Sheets en:
                    <a
                      href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-1 text-blue-600 hover:underline inline-flex items-center"
                    >
                      Abrir hoja de cálculo
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </li>
                  <li>
                    Haz clic en el botón <strong>"Compartir"</strong> (esquina superior derecha)
                  </li>
                  <li>
                    En "Acceso general", selecciona <strong>"Cualquier usuario con el enlace"</strong>
                  </li>
                  <li>
                    Asegúrate de que el permiso sea <strong>"Lector"</strong>
                  </li>
                  <li>
                    Haz clic en <strong>"Copiar enlace"</strong> y <strong>"Listo"</strong>
                  </li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* Estructura requerida */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Paso 2: Estructura de las hojas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Tu Google Sheets debe tener exactamente 3 hojas con los siguientes nombres y columnas:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Entregas */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-red-600 mb-2">Hoja: "Entregas"</h4>
                  <div className="space-y-1 text-sm">
                    <div className="font-medium">Columnas (A-E):</div>
                    <div>A: Fecha Recepción</div>
                    <div>B: Fecha Entrega</div>
                    <div>C: Descripción</div>
                    <div>D: Asunto</div>
                    <div>E: Link</div>
                  </div>
                </div>

                {/* Convocatorias */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-blue-600 mb-2">Hoja: "Convocatorias"</h4>
                  <div className="space-y-1 text-sm">
                    <div className="font-medium">Columnas (A-E):</div>
                    <div>A: Fecha Recepción</div>
                    <div>B: Fecha Convocatoria</div>
                    <div>C: Descripción</div>
                    <div>D: Asunto</div>
                    <div>E: Link</div>
                  </div>
                </div>

                {/* Solicitudes */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-green-600 mb-2">Hoja: "Solicitudes"</h4>
                  <div className="space-y-1 text-sm">
                    <div className="font-medium">Columnas (A-E):</div>
                    <div>A: Fecha Recepción</div>
                    <div>B: Fecha Solicitud</div>
                    <div>C: Descripción</div>
                    <div>D: Asunto</div>
                    <div>E: Link</div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Nota:</strong> La primera fila debe contener los encabezados. Los datos comienzan desde la
                  fila 2.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Configuración de API */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Paso 3: Configurar API de Google Sheets (Opcional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Para una integración más robusta, puedes configurar la API de Google Sheets:
              </p>

              <div className="space-y-3">
                <h4 className="font-medium">Instrucciones:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>
                    Ve a{" "}
                    <a
                      href="https://console.cloud.google.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Google Cloud Console
                    </a>
                  </li>
                  <li>Crea un nuevo proyecto o selecciona uno existente</li>
                  <li>Habilita la "Google Sheets API"</li>
                  <li>Crea credenciales (API Key)</li>
                  <li>
                    Agrega la API key como variable de entorno:{" "}
                    <code className="bg-gray-100 px-2 py-1 rounded">NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY</code>
                  </li>
                </ol>
              </div>

              <div className="bg-gray-50 border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">ID de tu hoja de cálculo:</p>
                    <code className="text-xs bg-white px-2 py-1 rounded border">{spreadsheetId}</code>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(spreadsheetId)}>
                    {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estado actual */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Estado Actual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Estado:</strong> Usando datos de ejemplo. Una vez que configures el Google Sheets público, la
                  aplicación cargará automáticamente los datos reales.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
