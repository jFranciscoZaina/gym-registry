import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: NextRequest) {
  try {
    const {
      clientId,
      amount,
      plan,
      discount,
      debt,
      periodFrom,
      periodTo,
    } = await req.json();

    // 1) Insert payment
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert([
        {
          client_id: clientId,
          amount,
          plan,
          discount,
          debt,
          period_from: periodFrom,
          period_to: periodTo,
          next_payment_date: periodTo,
        },
      ])
      .select()
      .single();

    if (paymentError) {
      console.error(paymentError);
      return NextResponse.json(
        { error: "Error inserting payment" },
        { status: 500 }
      );
    }

    // 2) Update client snapshot fields
    // active_until = period_to + 45 days
    const activeUntil = new Date(periodTo);
    activeUntil.setDate(activeUntil.getDate() + 45);

    const { error: updateErr } = await supabase
      .from("clients")
      .update({
        plan: plan,
        last_payment_amount: amount,
        last_payment_date: new Date().toISOString().slice(0, 10),
        next_payment_date: periodTo,
        current_debt: debt,
        active_until: activeUntil.toISOString().slice(0, 10),
      })
      .eq("id", clientId);

    if (updateErr) {
      console.error(updateErr);
      return NextResponse.json(
        { error: "Error updating client after payment" },
        { status: 500 }
      );
    }

    return NextResponse.json(payment, { status: 201 });
  } catch (err) {
    console.error("Payment POST error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
