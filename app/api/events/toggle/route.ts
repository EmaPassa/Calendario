import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { eventId } = await request.json()

    // Aquí implementarías la lógica para actualizar el estado en Google Sheets
    // await updateEventStatusInGoogleSheets(eventId)

    console.log(`Toggling completion status for event: ${eventId}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error toggling event completion:", error)
    return NextResponse.json({ error: "Failed to toggle event completion" }, { status: 500 })
  }
}
