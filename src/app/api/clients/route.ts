import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"

export async function GET() {
  const { data, error } = await supabase
    .from("clients")
    .select(`
      id,
      name,
      email,
      phone,
      address,
      address_number,
      due_day,
      payments:payments (
        amount,
        plan,
        discount,
        debt,
        next_payment_date,
        created_at
      )
    `)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Supabase error:", error)
    return NextResponse.json(
      { error: "Error fetching clients" },
      { status: 500 }
    )
  }

  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  const result = (data ?? []).map((client: any) => {
    const payments = client.payments ?? []

    const sorted = [...payments].sort(
      (a, b) =>
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
    )
    const lastPayment = sorted[0]

    const paymentsThisMonth = payments.filter((p: any) => {
      const d = new Date(p.created_at)
      return (
        d.getMonth() === currentMonth &&
        d.getFullYear() === currentYear
      )
    })

    const totalPaidThisMonth = paymentsThisMonth.reduce(
      (sum: number, p: any) => sum + Number(p.amount || 0),
      0
    )

    const currentPlan = lastPayment?.plan ?? null
    const currentDebt = Number(lastPayment?.debt ?? 0)
    const nextDue = lastPayment?.next_payment_date ?? null

    // Pago “total” del mes = algo pagado este mes y deuda 0
    const isMonthFullyPaid = totalPaidThisMonth > 0 && currentDebt <= 0

    return {
      id: client.id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: client.address,
      addressNumber: client.address_number,
      dueDay: client.due_day,
      currentPlan,
      currentDebt,
      totalPaidThisMonth,
      nextDue,
      isMonthFullyPaid,
    }
  })

  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  const { name, email, phone, address, addressNumber, dueDay } =
    await req.json()

  const { data, error } = await supabase
    .from("clients")
    .insert([
      {
        name,
        email,
        phone,
        address,
        address_number: addressNumber,
        due_day: dueDay,
      },
    ])
    .select()
    .single()

  if (error) {
    console.error("Supabase error:", error)
    return NextResponse.json(
      { error: "Error creando cliente" },
      { status: 500 }
    )
  }

  return NextResponse.json(data, { status: 201 })
}
