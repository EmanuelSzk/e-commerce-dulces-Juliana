import { requireUser } from "@/lib/dal";
import { logout } from "./actions";

export default async function CuentaPage() {
  const profile = await requireUser();

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-semibold">Mi cuenta</h1>

      <dl className="mt-6 space-y-3 rounded-lg border border-black/10 p-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-black/60">Nombre</dt>
          <dd>{profile.name}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-black/60">Email</dt>
          <dd>{profile.email}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-black/60">Tipo de cuenta</dt>
          <dd>{profile.role === "ADMIN" ? "Administradora" : "Clienta"}</dd>
        </div>
      </dl>

      <p className="mt-6 text-sm text-black/60">
        El historial de pedidos se agrega junto con el checkout (Fase 3).
      </p>

      <form action={logout} className="mt-6">
        <button
          type="submit"
          className="rounded-full border border-black/15 px-4 py-2 text-sm"
        >
          Cerrar sesión
        </button>
      </form>
    </div>
  );
}
