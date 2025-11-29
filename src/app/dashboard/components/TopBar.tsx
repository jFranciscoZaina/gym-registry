"use client"

import React from "react"

interface TopBarProps {
  onNewPayment: () => void
  onNewClient: () => void
}

export default function TopBar({ onNewPayment, onNewClient }: TopBarProps) {
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      if (typeof window !== "undefined") {
        window.location.href = "/login"
      }
    } catch (e) {
      console.error("Error al cerrar sesión", e)
    }
  }

  return (
    <header className="flex items-center justify-between px-8 pt-6 pb-4">
      {/* SECCIÓN IZQUIERDA: Logo y título */}
      <div className="flex items-baseline gap-3">
        <h1 className="text-lg font-semibold text-slate-900">Energym</h1>
        <span className="h-5 w-px bg-slate-300" />
        <span className="text-xs uppercase tracking-wide text-slate-500">
          dashboard
        </span>
      </div>

      {/* SECCIÓN DERECHA: Botones de acción + Logout */}
      <div className="flex items-center gap-3">
        <button
          onClick={onNewPayment}
          className="rounded-full bg-slate-900 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 transition-colors"
        >
          Registrar pago
        </button>
        
        <button
          onClick={onNewClient}
          className="rounded-full bg-white/90 px-5 py-2 text-sm font-medium text-slate-900 border border-slate-200 hover:bg-white transition-colors"
        >
          Agregar cliente
        </button>

        {/* Separador visual para el logout */}
        <div className="h-6 w-px bg-slate-300 mx-1" />

        <button
          onClick={handleLogout}
          className="px-2 text-xs font-medium text-slate-500 hover:text-red-600 transition-colors"
          title="Cerrar sesión"
        >
          Salir
        </button>
      </div>
    </header>
  )
}