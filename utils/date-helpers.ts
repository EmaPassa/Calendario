import { format, parseISO, isValid, formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

export const formatDate = (date: Date | string, formatStr = "dd/MM/yyyy"): string => {
  try {
    let dateObj: Date

    if (typeof date === "string") {
      dateObj = parseISO(date)
    } else {
      dateObj = date
    }

    if (!isValid(dateObj)) {
      console.warn("Invalid date provided:", date)
      return "Fecha inválida"
    }

    return format(dateObj, formatStr, { locale: es })
  } catch (error) {
    console.error("Error formatting date:", error, "Date:", date)
    return "Fecha inválida"
  }
}

export const formatRelativeDate = (date: Date | string): string => {
  try {
    let dateObj: Date

    if (typeof date === "string") {
      dateObj = parseISO(date)
    } else {
      dateObj = date
    }

    if (!isValid(dateObj)) {
      console.warn("Invalid date provided for relative formatting:", date)
      return "Fecha inválida"
    }

    return formatDistanceToNow(dateObj, { addSuffix: true, locale: es })
  } catch (error) {
    console.error("Error formatting relative date:", error, "Date:", date)
    return "Fecha inválida"
  }
}

export const createDateFromString = (dateString: string): Date => {
  try {
    // First try to parse as ISO string
    let dateObj = parseISO(dateString)

    if (isValid(dateObj)) {
      return dateObj
    }

    // Try different date formats if ISO parsing fails
    const formats = [
      // DD/MM/YYYY format
      /^(\d{2})\/(\d{2})\/(\d{4})$/,
      // MM/DD/YYYY format
      /^(\d{2})\/(\d{2})\/(\d{4})$/,
      // YYYY-MM-DD format
      /^(\d{4})-(\d{2})-(\d{2})$/,
    ]

    for (const format of formats) {
      const match = dateString.match(format)
      if (match) {
        if (format === formats[0]) {
          // DD/MM/YYYY
          const [, day, month, year] = match
          dateObj = new Date(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day))
        } else if (format === formats[1]) {
          // MM/DD/YYYY
          const [, month, day, year] = match
          dateObj = new Date(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day))
        } else if (format === formats[2]) {
          // YYYY-MM-DD
          const [, year, month, day] = match
          dateObj = new Date(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day))
        }

        if (isValid(dateObj)) {
          return dateObj
        }
      }
    }

    // Last resort: try native Date constructor
    dateObj = new Date(dateString)

    if (isValid(dateObj)) {
      return dateObj
    }

    // If all else fails, return current date
    console.warn("Could not parse date string, using current date:", dateString)
    return new Date()
  } catch (error) {
    console.error("Error creating date from string:", error, "String:", dateString)
    return new Date()
  }
}

export const isValidDate = (date: any): boolean => {
  try {
    if (date instanceof Date) {
      return isValid(date)
    }

    if (typeof date === "string") {
      const parsed = parseISO(date)
      return isValid(parsed)
    }

    return false
  } catch (error) {
    return false
  }
}
