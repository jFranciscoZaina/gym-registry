import { clsx, type ClassValue } from "clsx"

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

// --- NUEVO: parsear fechas YYYY-MM-DD como fechas locales ---
export function parseDateOnlyLocal(dateStr: string): Date {
  return new Date(dateStr + "T00:00:00")
}

export function formatDateEs(dateStr: string | null | undefined): string {
  if (!dateStr) return "—"
  return parseDateOnlyLocal(dateStr).toLocaleDateString("es-AR")
}
