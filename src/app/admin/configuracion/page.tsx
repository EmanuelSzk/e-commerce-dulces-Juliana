import { requireAdmin } from "@/lib/dal";
import { getStoreSettings } from "@/lib/services/settings-service";
import { SettingsForm } from "@/components/admin/settings-form";

export default async function AdminConfiguracionPage({
  searchParams,
}: PageProps<"/admin/configuracion">) {
  await requireAdmin();

  const { guardado } = await searchParams;
  const settings = await getStoreSettings();

  return (
    <div>
      <h1 className="text-2xl font-semibold">Configuración</h1>
      <p className="mt-1 text-sm text-black/60">
        Estos valores se aplican al carrito y al checkout.
      </p>

      {guardado === "1" && (
        <p className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">
          Configuración guardada.
        </p>
      )}

      <div className="mt-6">
        <SettingsForm settings={settings} />
      </div>
    </div>
  );
}
