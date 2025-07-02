// Script para configurar la integración con Google Sheets API
// Ejecutar: node scripts/setup-google-sheets.js

const fs = require("fs")
const path = require("path")

console.log("🔧 Configuración de Google Sheets API")
console.log("=====================================\n")

console.log("Para conectar tu aplicación con Google Sheets, sigue estos pasos:\n")

console.log("1. Ve a Google Cloud Console (https://console.cloud.google.com/)")
console.log("2. Crea un nuevo proyecto o selecciona uno existente")
console.log("3. Habilita la Google Sheets API")
console.log("4. Crea credenciales (Service Account)")
console.log("5. Descarga el archivo JSON de credenciales")
console.log('6. Renombra el archivo a "google-credentials.json"')
console.log("7. Colócalo en la carpeta raíz del proyecto\n")

console.log("Variables de entorno necesarias:")
console.log("- GOOGLE_SHEETS_SPREADSHEET_ID (ID de tu hoja de cálculo)")
console.log("- GOOGLE_SHEETS_PRIVATE_KEY (clave privada del service account)")
console.log("- GOOGLE_SHEETS_CLIENT_EMAIL (email del service account)\n")

console.log("El ID de tu hoja de cálculo es:")
console.log("1oHFohkYkMQBkDQ7hfBpGj0euUvP11fq7I8oBPc4bZQ8\n")

console.log("Ejemplo de archivo .env.local:")
console.log("GOOGLE_SHEETS_SPREADSHEET_ID=1oHFohkYkMQBkDQ7hfBpGj0euUvP11fq7I8oBPc4bZQ8")
console.log('GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"')
console.log("GOOGLE_SHEETS_CLIENT_EMAIL=tu-service-account@tu-proyecto.iam.gserviceaccount.com\n")

console.log("Una vez configurado, actualiza los archivos API para usar Google Sheets en lugar de datos mock.")
