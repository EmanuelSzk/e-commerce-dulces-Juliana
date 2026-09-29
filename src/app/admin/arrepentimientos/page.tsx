import { requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { formatDate, formatOrderNumber } from "@/lib/format";
import { toggleCancellationResolved } from "./actions";

export default async function AdminArrepentimientosPage() {
  await requireAdmin();

  const requests = await prisma.cancellationRequest.findMany({
    orderBy: [{ resolvedAt: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold">Solicitudes de arrepentimiento</h1>
      <p className="mt-1 text-sm text-black/60">
        Pedidos de cancelación enviados desde el botón de arrepentimiento. Son la
        constancia de que la clienta ejerció su derecho: conviene responderlas y
        marcarlas como resueltas.
      </p>

      {requests.length === 0 ? (
        <p className="mt-6 text-sm text-black/60">No hay solicitudes.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {requests.map((request) => (
            <li
              key={request.id}
              className={`rounded-lg border p-4 ${
                request.resolvedAt ? "border-black/10 opacity-70" : "border-amber-400 bg-amber-50"
              }`}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-medium">
                  {formatOrderNumber(request.id)} · {request.fullName}
                </p>
                <span className="text-xs text-black/50">
                  {formatDate(request.createdAt)}
                  {request.resolvedAt && ` · resuelta ${formatDate(request.resolvedAt)}`}
                </span>
              </div>

              <dl className="mt-2 grid gap-1 text-sm text-black/70">
                <div className="flex gap-2">
                  <dt className="min-w-24 text-black/50">Pedido</dt>
                  <dd>{request.orderReference}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="min-w-24 text-black/50">Email</dt>
                  <dd>
                    <a href={`mailto:${request.email}`} className="underline">
                      {request.email}
                    </a>
                  </dd>
                </div>
                {request.phone && (
                  <div className="flex gap-2">
                    <dt className="min-w-24 text-black/50">Teléfono</dt>
                    <dd>{request.phone}</dd>
                  </div>
                )}
                {request.message && (
                  <div className="flex gap-2">
                    <dt className="min-w-24 text-black/50">Comentario</dt>
                    <dd className="whitespace-pre-line">{request.message}</dd>
                  </div>
                )}
              </dl>

              <form action={toggleCancellationResolved} className="mt-3">
                <input type="hidden" name="id" value={request.id} />
                <input type="hidden" name="resolved" value={request.resolvedAt ? "0" : "1"} />
                <button type="submit" className="text-sm underline">
                  {request.resolvedAt ? "Marcar como pendiente" : "Marcar como resuelta"}
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
