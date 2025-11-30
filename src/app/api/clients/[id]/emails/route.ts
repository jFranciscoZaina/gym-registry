// src/app/api/clients/[id]/emails/route.ts
import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const clientId = params.id

  if (!clientId) {
    return NextResponse.json(
      { error: "clientId is required" },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from("email_logs")
    .select("id, sent_at, type, subject, due_date, status")
    .eq("client_id", clientId)
    .order("sent_at", { ascending: false })

  if (error) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ emails: data })
}
