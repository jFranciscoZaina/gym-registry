import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"

// GET /api/payments?clientId=xxx  -> historial de pagos de un cliente
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const clientId = searchParams.get("clientId")

  if (!clientId) {
    return NextResponse.json(
      { error: "clientId es requerido" },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Supabase error:", error)
    return NextResponse.json(
      { error: "Error obteniendo pagos" },
      { status: 500 }
    )
  }

  return NextResponse.json(data)
}

// POST /api/payments  -> registrar nuevo pago
export async function POST(req: NextRequest) {
  const { clientId, amount, plan, discount, debt, nextPaymentDate } =
    await req.json()

  if (!clientId || !plan) {
    return NextResponse.json(
      { error: "clientId y plan son requeridos" },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from("payments")
    .insert([
      {
        client_id: clientId,
        amount: amount ?? 0,
        plan,
        discount: discount ?? 0,
        debt: debt ?? 0,
        next_payment_date: nextPaymentDate ?? null,
      },
    ])
    .select()
    .single()

  if (error) {
    console.error("Supabase error:", error)
    return NextResponse.json(
      { error: "Error creando pago" },
      { status: 500 }
    )
  }

  return NextResponse.json(data, { status: 201 })
}
