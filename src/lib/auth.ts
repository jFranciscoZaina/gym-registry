// src/lib/auth.ts
import { NextRequest } from "next/server"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET no está definido en .env.local")
}

type SessionPayload = {
  gymId: string
  email: string
  iat: number
  exp: number
}

// Devuelve el gymId de la cookie "session", o null si no hay sesión válida
export function getSessionGymId(req: NextRequest): string | null {
  const token = req.cookies.get("session")?.value
  if (!token) return null

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as SessionPayload
    return decoded.gymId
  } catch (err) {
    console.error("Error verificando JWT:", err)
    return null
  }
}
