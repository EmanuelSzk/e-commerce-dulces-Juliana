import { formatPrice } from "@/lib/format";
import { storeLocation } from "@/lib/store-info";
import { badgeClass, buttonClass } from "@/components/ui/styles";
import { MapPinIcon } from "./icons";

// Área visible alrededor del local (en grados), equivale a unas pocas cuadras.
const SPAN = { lat: 0.004, lng: 0.006 };

function mapUrls() {
  const { lat, lng } = storeLocation;
  const bbox = [lng - SPAN.lng, lat - SPAN.lat, lng + SPAN.lng, lat + SPAN.lat]
    .map((value) => value.toFixed(6))
    .join(",");
  return {
    embed: `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`,
    full: `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`,
  };
}

export function PickupMap({
  settings,
}: {
  settings: { shippingCost: number; freeShippingFrom: number; pickupAddress: string };
}) {
  const urls = mapUrls();
  // Enlace estándar de Google Maps (sin clave): abre el recorrido desde donde
  // esté la persona. Usa la dirección de Configuración.
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    settings.pickupAddress,
  )}`;

  return (
    <section
      aria-labelledby="retiro-titulo"
      className="grid items-stretch gap-5 md:grid-cols-[1.4fr_1fr]"
    >
      <div className="relative h-72 overflow-hidden rounded-card bg-sand shadow-soft md:h-auto md:min-h-[360px]">
        <iframe
          title="Mapa con la ubicación del local de Dulces Juliana"
          src={urls.embed}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 h-full w-full border-0 [filter:saturate(0.85)_sepia(0.12)]"
        />
      </div>

      <div className="flex flex-col rounded-card bg-surface p-6 sm:p-7">
        <span className={`${badgeClass("blush")} w-max`}>Retiro sin cargo</span>
        <h2 id="retiro-titulo" className="mt-4 font-serif text-[34px] leading-[1.08] text-ink">
          Retirá tu pedido en el local
        </h2>
        <p className="mt-3 text-[15px] font-light leading-relaxed text-cocoa">
          Al finalizar la compra elegí &ldquo;Retiro en el local&rdquo; y pasá a buscarlo.
          Si preferís, te lo llevamos a tu casa.
        </p>

        <p className="mt-5 flex items-start gap-2.5 text-[15px] font-medium text-ink">
          <MapPinIcon className="mt-0.5 h-5 w-5 shrink-0 text-pink-deep" />
          {settings.pickupAddress}
        </p>

        <dl className="mt-4 grid gap-2 text-[13.5px] font-light text-cocoa">
          <div className="flex gap-3">
            <dt className="min-w-20 font-medium text-ink">Retiro</dt>
            <dd>Sin cargo</dd>
          </div>
          <div className="flex gap-3">
            <dt className="min-w-20 font-medium text-ink">Envío</dt>
            <dd>
              {formatPrice(settings.shippingCost)} en Posadas · gratis desde{" "}
              {formatPrice(settings.freeShippingFrom)}
            </dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-wrap items-center gap-3 md:mt-auto md:pt-6">
          <a
            href={directions}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClass("primary", "md")}
          >
            Cómo llegar
          </a>
          <a
            href={urls.full}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-berry hover:underline"
          >
            Ver mapa más grande
          </a>
        </div>
      </div>
    </section>
  );
}
