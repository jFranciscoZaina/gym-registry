import type { ClientRow } from "../page"
import { formatDateEs } from "@/lib/utils"

export default function ClientsTable({
  clients,
  loading,
  error,
  sortKey,
  sortDir,
  onToggleSort,
  onOpenDetail,
}: {
  clients: ClientRow[]
  loading: boolean
  error: string | null
  sortKey: "name" | "plan" | "paid" | "debt" | "due"
  sortDir: "asc" | "desc"
  onToggleSort: (key: "name" | "plan" | "paid" | "debt" | "due") => void
  onOpenDetail: (client: ClientRow) => void
}) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <table className="min-w-full table-auto">
        {/* HEADER */}
        <thead className="border-b border-slate-200 bg-white text-sm font-medium text-slate-600">
          <tr>
            <th
              className="cursor-pointer select-none px-6 py-4 text-left"
              onClick={() => onToggleSort("name")}
            >
              Persona{" "}
              <span className="text-xs font-normal">
                {sortKey === "name" ? (sortDir === "asc" ? "▲" : "▼") : ""}
              </span>
            </th>

            <th
              className="cursor-pointer select-none px-6 py-4 text-left"
              onClick={() => onToggleSort("plan")}
            >
              Plan{" "}
              <span className="text-xs font-normal">
                {sortKey === "plan" ? (sortDir === "asc" ? "▲" : "▼") : ""}
              </span>
            </th>

            <th
              className="cursor-pointer select-none px-6 py-4 text-center"
              onClick={() => onToggleSort("paid")}
            >
              Pago{" "}
              <span className="text-xs font-normal">
                {sortKey === "paid" ? (sortDir === "asc" ? "▲" : "▼") : ""}
              </span>
            </th>

            <th
              className="cursor-pointer select-none px-6 py-4 text-left"
              onClick={() => onToggleSort("debt")}
            >
              Deuda{" "}
              <span className="text-xs font-normal">
                {sortKey === "debt" ? (sortDir === "asc" ? "▲" : "▼") : ""}
              </span>
            </th>

            <th
              className="cursor-pointer select-none px-6 py-4 text-left"
              onClick={() => onToggleSort("due")}
            >
              Vencimientos{" "}
              <span className="text-xs font-normal">
                {sortKey === "due" ? (sortDir === "asc" ? "▲" : "▼") : ""}
              </span>
            </th>

            <th className="px-6 py-4 text-left">Detalle</th>
          </tr>
        </thead>

        {/* BODY */}
        <tbody className="bg-white text-base text-slate-800">
          {loading && (
            <tr>
              <td
                colSpan={6}
                className="px-6 py-6 text-center text-sm text-slate-500"
              >
                Cargando clientes...
              </td>
            </tr>
          )}

          {!loading && error && (
            <tr>
              <td
                colSpan={6}
                className="px-6 py-6 text-center text-sm text-red-500"
              >
                {error}
              </td>
            </tr>
          )}

          {!loading && !error && clients.length === 0 && (
            <tr>
              <td
                colSpan={6}
                className="px-6 py-6 text-center text-sm text-slate-500"
              >
                No hay clientes aún
              </td>
            </tr>
          )}

          {!loading &&
            !error &&
            clients.map((client) => (
              <tr
                key={client.id}
                className="border-b border-slate-200 text-sm text-slate-700 transition hover:bg-slate-50"
              >
                <td className="px-6 py-4 text-base">{client.name}</td>

                <td className="px-6 py-4 text-base">
                  {client.currentPlan ?? (
                    <span className="text-slate-400">Sin plan</span>
                  )}
                </td>

                <td className="px-6 py-4 text-center">
                  {client.isMonthFullyPaid ? (
                    <span className="text-xl text-green-600">✔</span>
                  ) : (
                    <span className="text-xl text-red-500">✕</span>
                  )}
                </td>

                <td className="px-6 py-4 text-base">
                  {client.currentDebt > 0
                    ? "$" +
                      client.currentDebt.toLocaleString("es-AR", {
                        maximumFractionDigits: 0,
                      })
                    : "—"}
                </td>

                <td className="px-6 py-4 text-base">
                  {formatDateEs(client.nextDue)}
                </td>

                <td className="px-6 py-4">
                  <button
                    className="text-sm text-slate-500 underline underline-offset-2 hover:text-slate-800"
                    onClick={() => onOpenDetail(client)}
                  >
                    Detalle
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}
