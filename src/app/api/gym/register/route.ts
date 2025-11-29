// src/app/api/gym/register/route.ts
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
    const { name, email, password } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Faltan campos: name, email, password" },
        { status: 400 }
      )
    }

    // Hashear password
    const passwordHash = await bcrypt.hash(password, 10)

    // Crear gym
    const { data, error } = await supabase
      .from("gyms")
      .insert([
        {
          name,
          email,
          password_hash: passwordHash,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Supabase gyms insert error:", error)
      // error.code === "23505" suele ser UNIQUE violation (email repetido)
      const message =
        (error as any).code === "23505"
          ? "Ya existe un gym con ese email"
          : "Error creando gym"

      return NextResponse.json(
        { error: message, details: error.message },
        { status: 400 }
      )
    }

    // Crear JWT de sesión
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
      { status: 201 }
    )

    // Setear cookie httpOnly
    res.cookies.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: JWT_EXPIRES_IN_SECONDS,
    })

    return res
  } catch (err) {
    console.error("Unexpected /api/gym/register error:", err)
    return NextResponse.json(
      { error: "Unexpected error" },
      { status: 500 }
    )
  }
}
