// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export const runtime = "nodejs"

const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRES_IN_SECONDS = 60 * 60 * 24 * 7 // 7 días

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET no está definido en .env.local")
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Faltan campos: email, password" },
        { status: 400 }
      )
    }

    // Buscar gym por email
    const { data, error } = await supabase
      .from("gyms")
      .select("id, name, email, password_hash")
      .eq("email", email)
      .single()

    if (error || !data) {
      console.error("Supabase gyms select error:", error)
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      )
    }

    // Verificar contraseña
    const isValid = await bcrypt.compare(password, data.password_hash)

    if (!isValid) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      )
    }

    // Crear token
    const token = jwt.sign(
      {
        gymId: data.id,
        email: data.email,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN_SECONDS }
    )

    const res = NextResponse.json(
      {
        id: data.id,
        name: data.name,
        email: data.email,
      },
      { status: 200 }
    )

    // Guardar cookie de sesión
    res.cookies.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: JWT_EXPIRES_IN_SECONDS,
    })

    return res
  } catch (err) {
    console.error("Unexpected /api/auth/login error:", err)
    return NextResponse.json(
      { error: "Unexpected error" },
      { status: 500 }
    )
  }
}
