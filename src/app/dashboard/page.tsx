"use client"

import React, { useEffect, useState } from "react"

// === MARKER: TYPES =================================================================

type ClientRow = {
  id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  addressNumber: string | null
  dueDay: number | null
  currentPlan: string | null
  currentDebt: number
  totalPaidThisMonth: number
  nextDue: string | null
  isMonthFullyPaid: boolean
}

type Payment = {
  id: string
  amount: number
  plan: string | null
  discount: number | null
  debt: number | null
  next_payment_date: string | null
  created_at: string
}

const PLANS = ["Basic", "Fitness", "Pro fitness", "Pago deuda"] as const

// === MARKER: ROOT DASHBOARD =======================================================

export default function DashboardPage() {
  const [clients, setClients] = useState<ClientRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showNewClient, setShowNewClient] = useState(false)
  const [showNewPayment, setShowNewPayment] = useState(false)
  const [detailClient, setDetailClient] = useState<ClientRow | null>(null)

  const fetchClients = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/clients")
      if (!res.ok) throw new Error("Error cargando clientes")
      const data = await res.json()
      setClients(data)
      setError(null)
    } catch (e: any) {
      console.error(e)
      setError(e.message ?? "Error inesperado")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClients()
  }, [])

  const totalClients = clients.length
  const clientsWithPhone = clients.filter((c) => c.phone).length
  const monthlyIncome = clients.reduce(
    (sum, c) => sum + (c.totalPaidThisMonth || 0),
    0
  )

  const [searchTerm, setSearchTerm] = useState("")
const [sortKey, setSortKey] = useState<
  "name" | "plan" | "paid" | "debt" | "due"
>("name")
const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")

const toggleSort = (key: typeof sortKey) => {
  if (sortKey === key) {
    setSortDir(sortDir === "asc" ? "desc" : "asc")
  } else {
    setSortKey(key)
    setSortDir("asc")
  }
}

const filteredClients = clients.filter((c) => {
  const q = searchTerm.toLowerCase()
  return (
    c.name.toLowerCase().includes(q) ||
    (c.email ?? "").toLowerCase().includes(q) ||
    (c.phone ?? "").toLowerCase().includes(q)
  )
})

const sortedClients = [...filteredClients].sort((a, b) => {
  const dir = sortDir === "asc" ? 1 : -1

  switch (sortKey) {
    case "name":
      return a.name.localeCompare(b.name) * dir
    case "plan":
      return (a.currentPlan ?? "").localeCompare(b.currentPlan ?? "") * dir
    case "paid":
      return ((a.isMonthFullyPaid ? 1 : 0) - (b.isMonthFullyPaid ? 1 : 0)) * dir
    case "debt":
      return (a.currentDebt - b.currentDebt) * dir
    case "due": {
      const aDue = a.nextDue ? new Date(a.nextDue).getTime() : Infinity
      const bDue = b.nextDue ? new Date(b.nextDue).getTime() : Infinity
      return (aDue - bDue) * dir
    }
    default:
      return 0
  }
})


  return (
    <div className="min-h-screen bg-slate-50">
      {/* === MARKER: TOP BAR ====================================================== */}
      <header className="flex items-center justify-between px-8 py-4 border-b bg-slate-900 text-white">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-amber-400 flex items-center justify-center text-xl">
            💪
          </div>
          <div>
            <div className="text-lg font-semibold">GymManager</div>
            <div className="text-xs text-slate-200">Gestión de clientes</div>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
            onClick={() => setShowNewPayment(true)}
          >
            Registrar Pago
          </button>
          <button
            className="rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
            onClick={() => setShowNewClient(true)}
          >
            Agregar Cliente
          </button>
        </div>
      </header>

      <main className="px-8 py-6">
        {/* === MARKER: SEARCH + VIEW ============================================== */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center rounded-md border bg-white px-3 py-2 text-sm text-slate-500">
              <span className="mr-2">🔍</span>
              <input
  className="w-full border-none bg-transparent outline-none"
  placeholder="Buscar por nombre, email o teléfono..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
/>

            </div>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-1 rounded-md bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm">
              ▪ Tarjetas
            </button>
            <button className="flex items-center gap-1 rounded-md bg-orange-500 px-3 py-2 text-xs font-medium text-white shadow-sm">
              🧾 Lista
            </button>
          </div>
        </div>

        {/* === MARKER: STATS_CARDS ================================================ */}
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <StatCard title="Total Clientes" value={totalClients.toString()} />
          <StatCard
  title="Clientes con deuda"
  value={clients.filter((c) => (c.currentDebt ?? 0) > 0).length.toString()}
/>

          <StatCard
            title="Ingresos Mensuales"
            value={
              "$" +
              monthlyIncome.toLocaleString("es-AR", {
                maximumFractionDigits: 0,
              })
            }
          />
        </div>

        {/* === MARKER: MAIN_TABLE ================================================= */}
        <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
          <table className="min-w-full">
            <thead className="bg-slate-100 text-xs uppercase text-slate-500">
              <tr>
              <th
  className="py-2 px-4 text-left cursor-pointer select-none"
  onClick={() => toggleSort("name")}
>
  Persona {sortKey === "name" ? (sortDir === "asc" ? "▲" : "▼") : ""}
</th>

<th
  className="py-2 px-4 text-left cursor-pointer select-none"
  onClick={() => toggleSort("plan")}
>
  Plan {sortKey === "plan" ? (sortDir === "asc" ? "▲" : "▼") : ""}
</th>

<th
  className="py-2 px-4 text-center cursor-pointer select-none"
  onClick={() => toggleSort("paid")}
>
  Pago {sortKey === "paid" ? (sortDir === "asc" ? "▲" : "▼") : ""}
</th>

<th
  className="py-2 px-4 text-left cursor-pointer select-none"
  onClick={() => toggleSort("debt")}
>
  Deuda {sortKey === "debt" ? (sortDir === "asc" ? "▲" : "▼") : ""}
</th>

<th
  className="py-2 px-4 text-left cursor-pointer select-none"
  onClick={() => toggleSort("due")}
>
  Vencimientos {sortKey === "due" ? (sortDir === "asc" ? "▲" : "▼") : ""}
</th>

<th className="py-2 px-4 text-left">Detalle</th>

              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-6 px-4 text-center text-sm text-slate-500"
                  >
                    Cargando clientes...
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-6 px-4 text-center text-sm text-red-500"
                  >
                    {error}
                  </td>
                </tr>
              )}

              {!loading && !error && clients.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-6 px-4 text-center text-sm text-slate-500"
                  >
                    No hay clientes aún
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                sortedClients.map((client) => (
                  <tr
                    key={client.id}
                    className="border-t text-sm text-slate-700"
                  >
                    <td className="py-3 px-4">{client.name}</td>
                    <td className="py-3 px-4">
                      {client.currentPlan ?? (
                        <span className="text-slate-400">Sin plan</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {client.isMonthFullyPaid ? "✔️" : "❌"}
                    </td>
                    <td className="py-3 px-4">
                      {client.currentDebt
                        ? "$" +
                          client.currentDebt.toLocaleString("es-AR", {
                            maximumFractionDigits: 0,
                          })
                        : "—"}
                    </td>
                    <td className="py-3 px-4">
                      {client.nextDue
                        ? new Date(client.nextDue).toLocaleDateString("es-AR")
                        : client.dueDay
                        ? `Día ${client.dueDay}`
                        : "—"}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        className="text-blue-600 hover:underline"
                        onClick={() => setDetailClient(client)}
                      >
                        Detalle
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* === MARKER: MODALS ======================================================= */}

      {showNewClient && (
        <Modal onClose={() => setShowNewClient(false)}>
          <NewClientModal
            onClose={() => setShowNewClient(false)}
            onCreated={fetchClients}
          />
        </Modal>
      )}

      {showNewPayment && (
        <Modal onClose={() => setShowNewPayment(false)}>
          <NewPaymentModal
            clients={clients}
            onClose={() => setShowNewPayment(false)}
            onCreated={fetchClients}
          />
        </Modal>
      )}

      {detailClient && (
        <Modal onClose={() => setDetailClient(null)}>
          <ClientDetailModal
            client={detailClient}
            onClose={() => setDetailClient(null)}
            onChanged={fetchClients}
          />
        </Modal>
      )}
    </div>
  )
}

// === MARKER: STAT_CARD_COMPONENT ================================================

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg bg-white p-4 shadow-sm border">
      <div className="text-xs text-slate-500">{title}</div>
      <div className="mt-2 text-2xl font-semibold text-slate-900">{value}</div>
    </div>
  )
}

// === MARKER: GENERIC_MODAL ======================================================

function Modal({
  children,
  onClose,
}: {
  children: React.ReactNode
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-700"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  )
}

// === MARKER: NEW_CLIENT_MODAL ===================================================

function NewClientModal({
  onClose,
  onCreated,
}: {
  onClose: () => void
  onCreated: () => void
}) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [addressNumber, setAddressNumber] = useState("")
  const [dueDay, setDueDay] = useState<number | "">("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        phone,
        address,
        addressNumber,
        dueDay: dueDay === "" ? null : dueDay,
      }),
    })

    setLoading(false)

    if (!res.ok) {
      alert("Error creando cliente")
      return
    }

    onCreated()
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-sm">
      <h2 className="text-lg font-semibold mb-2">Agregar Cliente</h2>

      <div>
        <label className="mb-1 block text-xs font-medium">Nombre</label>
        <input
          className="w-full rounded-md border px-3 py-2 text-sm"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium">Email</label>
        <input
          type="email"
          className="w-full rounded-md border px-3 py-2 text-sm"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium">
          Número de teléfono
        </label>
        <input
          className="w-full rounded-md border px-3 py-2 text-sm"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium">Domicilio</label>
        <input
          className="w-full rounded-md border px-3 py-2 text-sm"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Calle / barrio"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium">
          Número / piso / depto (opcional)
        </label>
        <input
          className="w-full rounded-md border px-3 py-2 text-sm"
          value={addressNumber}
          onChange={(e) => setAddressNumber(e.target.value)}
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium">
          Vencimiento de cada mes (día)
        </label>
        <input
          type="number"
          min={1}
          max={31}
          className="w-full rounded-md border px-3 py-2 text-sm"
          value={dueDay}
          onChange={(e) =>
            setDueDay(e.target.value ? Number(e.target.value) : "")
          }
          placeholder="Ej: 10, 15, 30"
        />
      </div>

      <button
        type="submit"
        className="mt-2 w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-70"
        disabled={loading}
      >
        {loading ? "Guardando..." : "Guardar Cliente"}
      </button>
    </form>
  )
}

// === MARKER: NEW_PAYMENT_MODAL ==================================================

function NewPaymentModal({
  clients,
  onClose,
  onCreated,
}: {
  clients: ClientRow[]
  onClose: () => void
  onCreated: () => void
}) {
  const [clientId, setClientId] = useState("")
  const [plan, setPlan] = useState("")
  const [amount, setAmount] = useState<number | "">("")
  const [discount, setDiscount] = useState<number | "">("")
  const [debt, setDebt] = useState<number | "">("")
  const [loading, setLoading] = useState(false)

  const [selectedClientDebt, setSelectedClientDebt] = useState(0)
  const [selectedClientDueDay, setSelectedClientDueDay] = useState<
    number | null
  >(null)

  const selectedClient = clients.find((c) => c.id === clientId) || null

  const handleClientChange = (id: string) => {
    setClientId(id)
    const c = clients.find((cl) => cl.id === id)
  
    const d = c ? Number(c.currentDebt || 0) : 0
    setSelectedClientDebt(d)
    setSelectedClientDueDay(c?.dueDay ?? null)
  
    if (d > 0) {
      // ✅ si tiene deuda: autocompletamos todo para pago de deuda
      setPlan("Pago deuda")
      setAmount(d)      // paga todo por defecto
      setDiscount(0)    // sin bonificación por defecto
      setDebt(0)        // queda saldado (y se recalcula si cambia)
    } else {
      // si no tiene deuda, limpiamos monto/deuda pero no forzamos plan
      setAmount("")
      setDiscount("")
      setDebt("")
    }
  }
  

  const handlePlanChange = (value: string) => {
    setPlan(value)

    if (value === "Pago deuda" && selectedClientDebt > 0) {
      // monto por defecto = deuda actual
      setAmount(selectedClientDebt)
      setDebt(0)
    }
  }

  // Recalcular deuda cuando se modifica monto/bonificación en Pago deuda
  useEffect(() => {
    if (plan !== "Pago deuda") return
    const baseDebt = selectedClientDebt || 0
    const a = typeof amount === "number" ? amount : Number(amount || 0)
    const d = typeof discount === "number" ? discount : Number(discount || 0)

    const newDebt = Math.max(baseDebt - a - d, 0)
    if (debt !== newDebt) {
      setDebt(newDebt)
    }
  }, [plan, amount, discount, selectedClientDebt]) // eslint-disable-line react-hooks/exhaustive-deps

  const computeNextPaymentDate = () => {
    const now = new Date()
    if (selectedClientDueDay && selectedClientDueDay >= 1 && selectedClientDueDay <= 31) {
      let month = now.getMonth()
      let year = now.getFullYear()
      if (now.getDate() > selectedClientDueDay) {
        month += 1
        if (month > 11) {
          month = 0
          year += 1
        }
      }
      const target = new Date(year, month, selectedClientDueDay)
      return target.toISOString().slice(0, 10)
    } else {
      const target = new Date()
      target.setDate(target.getDate() + 30)
      return target.toISOString().slice(0, 10)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientId) {
      alert("Seleccioná un cliente")
      return
    }
    if (!plan) {
      alert("Seleccioná un plan")
      return
    }

    const numericAmount =
      typeof amount === "number" ? amount : Number(amount || 0)
    const numericDiscount =
      typeof discount === "number" ? discount : Number(discount || 0)
    const numericDebt =
      typeof debt === "number" ? debt : Number(debt || 0)

    setLoading(true)

    const nextPaymentDate = computeNextPaymentDate()

    const res = await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId,
        amount: numericAmount,
        plan,
        discount: numericDiscount,
        debt: numericDebt,
        nextPaymentDate,
      }),
    })

    setLoading(false)

    if (!res.ok) {
      alert("Error registrando pago")
      return
    }

    onCreated()
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-sm">
      <h2 className="text-lg font-semibold mb-2">Registrar un nuevo pago</h2>

      {/* Persona */}
      <div>
        <label className="mb-1 block text-xs font-medium">Persona</label>
        <select
          className="w-full rounded-md border px-3 py-2 text-sm bg-white"
          value={clientId}
          onChange={(e) => handleClientChange(e.target.value)}
          required
        >
          <option value="">Seleccionar cliente...</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} {c.email ? `— ${c.email}` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Plan */}
      <div>
        <label className="mb-1 block text-xs font-medium">Plan</label>
        <select
          className="w-full rounded-md border px-3 py-2 text-sm bg-white"
          value={plan}
          onChange={(e) => handlePlanChange(e.target.value)}
          required
        >
          <option value="">Seleccionar plan...</option>
          {PLANS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        {plan === "Pago deuda" && selectedClientDebt > 0 && (
          <p className="mt-1 text-xs text-slate-500">
            Deuda actual del plan seleccionado: $
            {selectedClientDebt.toLocaleString("es-AR", {
              maximumFractionDigits: 0,
            })}
          </p>
        )}
      </div>

      {/* Pago */}
      <div>
        <label className="mb-1 block text-xs font-medium">Pago</label>
        <input
          type="number"
          className="w-full rounded-md border px-3 py-2 text-sm"
          value={amount}
          onChange={(e) =>
            setAmount(e.target.value ? Number(e.target.value) : "")
          }
          placeholder="Monto pagado hoy"
          required
        />
      </div>

      {/* Bonificación */}
      <div>
        <label className="mb-1 block text-xs font-medium">Bonificación</label>
        <input
          type="number"
          className="w-full rounded-md border px-3 py-2 text-sm"
          value={discount}
          onChange={(e) =>
            setDiscount(e.target.value ? Number(e.target.value) : "")
          }
          placeholder="Descuento aplicado (opcional)"
        />
      </div>

      {/* Deuda */}
      <div>
        <label className="mb-1 block text-xs font-medium">
          Deuda total después de este pago
        </label>
        <input
          type="number"
          className="w-full rounded-md border px-3 py-2 text-sm"
          value={debt}
          onChange={(e) =>
            setDebt(e.target.value ? Number(e.target.value) : "")
          }
          placeholder="0 si queda saldado"
        />
      </div>

      <button
        type="submit"
        className="mt-2 w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-70"
        disabled={loading}
      >
        {loading ? "Guardando pago..." : "Guardar Pago"}
      </button>
    </form>
  )
}

// === MARKER: CLIENT_DETAIL_MODAL ================================================

function ClientDetailModal({
  client,
  onClose,
  onChanged,
}: {
  client: ClientRow
  onClose: () => void
  onChanged: () => void
}) {
  const [email, setEmail] = useState(client.email ?? "")
  const [phone, setPhone] = useState(client.phone ?? "")
  const [address, setAddress] = useState(client.address ?? "")
  const [addressNumber, setAddressNumber] = useState(
    client.addressNumber ?? ""
  )
  const [dueDay, setDueDay] = useState<number | "">(
    client.dueDay ?? ""
  )

  const [payments, setPayments] = useState<Payment[]>([])
  const [loadingPayments, setLoadingPayments] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoadingPayments(true)
      const res = await fetch(`/api/payments?clientId=${client.id}`)
      if (res.ok) {
        const data = await res.json()
        setPayments(data)
      }
      setLoadingPayments(false)
    }
    load()
  }, [client.id])

  const handleSave = async () => {
    setSaving(true)
    const res = await fetch(`/api/clients/${client.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        phone,
        address,
        addressNumber,
        dueDay: dueDay === "" ? null : dueDay,
      }),
    })
    setSaving(false)
    if (!res.ok) {
      alert("Error guardando cambios")
      return
    }
    onChanged()
    onClose()
  }

  const handleDelete = async () => {
    if (!confirm("¿Eliminar este cliente y todo su historial de pagos?")) {
      return
    }
    setDeleting(true)
    const res = await fetch(`/api/clients/${client.id}`, {
      method: "DELETE",
    })
    setDeleting(false)
    if (!res.ok) {
      alert("Error eliminando cliente")
      return
    }
    onChanged()
    onClose()
  }

  return (
    <div className="space-y-5 text-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold mb-1">
            Detalle de cliente
          </h2>
          <p className="text-xs text-slate-500">
            Podés editar datos de contacto y vencimiento.
          </p>
        </div>
        <button
          onClick={handleDelete}
          className="rounded-md border border-red-300 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
          disabled={deleting}
        >
          {deleting ? "Eliminando..." : "Eliminar cliente"}
        </button>
      </div>

      {/* Datos del cliente */}
      <div className="rounded-md border bg-slate-50 p-3 space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium">
            Nombre (no editable)
          </label>
          <input
            value={client.name}
            readOnly
            className="w-full rounded-md border bg-slate-100 px-3 py-2 text-sm text-slate-700"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium">Email</label>
          <input
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium">
            Número de teléfono
          </label>
          <input
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium">
            Domicilio
          </label>
          <input
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium">
            Número / piso / depto
          </label>
          <input
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={addressNumber}
            onChange={(e) => setAddressNumber(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium">
            Vencimiento de cada mes (día)
          </label>
          <input
            type="number"
            min={1}
            max={31}
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={dueDay}
            onChange={(e) =>
              setDueDay(e.target.value ? Number(e.target.value) : "")
            }
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            disabled={saving}
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>

      {/* === MARKER: PAYMENT_HISTORY_SECTION ===================================== */}
      <div>
        <h3 className="mb-2 text-sm font-semibold">
          Historial de pagos
        </h3>
        <div className="max-h-64 overflow-auto rounded-md border">
          {loadingPayments ? (
            <div className="p-4 text-xs text-slate-500">
              Cargando historial...
            </div>
          ) : payments.length === 0 ? (
            <div className="p-4 text-xs text-slate-500">
              Este cliente aún no tiene pagos registrados.
            </div>
          ) : (
            <table className="min-w-full text-xs">
              <thead className="bg-slate-100 text-slate-500">
                <tr>
                  <th className="py-2 px-2 text-left">Fecha</th>
                  <th className="py-2 px-2 text-left">Plan</th>
                  <th className="py-2 px-2 text-right">Pago</th>
                  <th className="py-2 px-2 text-right">Bonificación</th>
                  <th className="py-2 px-2 text-right">Deuda</th>
                  <th className="py-2 px-2 text-left">Vencimiento</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="py-2 px-2">
                      {new Date(p.created_at).toLocaleDateString("es-AR")}
                    </td>
                    <td className="py-2 px-2">{p.plan ?? "—"}</td>
                    <td className="py-2 px-2 text-right">
                      {"$" +
                        (p.amount ?? 0).toLocaleString("es-AR", {
                          maximumFractionDigits: 0,
                        })}
                    </td>
                    <td className="py-2 px-2 text-right">
                      {p.discount
                        ? "$" +
                          p.discount.toLocaleString("es-AR", {
                            maximumFractionDigits: 0,
                          })
                        : "—"}
                    </td>
                    <td className="py-2 px-2 text-right">
                      {p.debt != null
                        ? "$" +
                          p.debt.toLocaleString("es-AR", {
                            maximumFractionDigits: 0,
                          })
                        : "—"}
                    </td>
                    <td className="py-2 px-2">
                      {p.next_payment_date
                        ? new Date(
                            p.next_payment_date
                          ).toLocaleDateString("es-AR")
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
