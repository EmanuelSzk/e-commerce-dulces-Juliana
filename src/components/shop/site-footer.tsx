import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { storeContact, storeLegal, whatsappLink } from "@/lib/store-info";
import { Logo } from "./logo";

const legalLinks = [
  { href: "/terminos", label: "Términos y condiciones" },
  { href: "/privacidad", label: "Política de privacidad" },
  { href: "/arrepentimiento", label: "Botón de arrepentimiento" },
];

export function SiteFooter({
  categories,
  settings,
}: {
  categories: { id: string; name: string; slug: string }[];
  settings: {
    shippingCost: number;
    freeShippingFrom: number;
    pickupAddress: string;
    pickupHours?: string | null;
  };
}) {
  const whatsapp = whatsappLink();

  return (
    <footer className="bg-ink pb-20 text-[13.5px] font-light leading-relaxed text-[#f3e9e3] md:pb-0">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-8 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
        <div>
          <Logo variant="white" />
          <p className="mt-3 max-w-xs text-[#f3e9e3]/70">
            Repostería artesanal en Posadas, Misiones.
          </p>
        </div>

        <div>
          <p className="mb-2 font-medium">Tienda</p>
          <ul className="space-y-1">
            <li><Link href="/productos" className="hover:underline">Catálogo</Link></li>
            {categories.map((category) => (
              <li key={category.id}>
                <Link href={`/productos?categoria=${category.slug}`} className="hover:underline">
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-2 font-medium">Envíos y retiro</p>
          <p>
            Envío a domicilio en Posadas: {formatPrice(settings.shippingCost)}, gratis
            desde {formatPrice(settings.freeShippingFrom)}.
          </p>
          <p className="mt-2">Retiro sin cargo en {settings.pickupAddress}.</p>
          {settings.pickupHours && <p className="mt-1">{settings.pickupHours}</p>}

          <p className="mb-2 mt-5 font-medium">Legales</p>
          <ul className="space-y-1">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:underline">{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-2 font-medium">Contacto</p>
          <ul className="space-y-1">
            {whatsapp && (
              <li>
                <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  WhatsApp {storeContact.whatsappLabel ?? ""}
                </a>
              </li>
            )}
            {storeContact.email && (
              <li>
                <a href={`mailto:${storeContact.email}`} className="hover:underline">
                  {storeContact.email}
                </a>
              </li>
            )}
            {storeContact.instagram && (
              <li>
                <a
                  href={`https://instagram.com/${storeContact.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  @{storeContact.instagram}
                </a>
              </li>
            )}
            <li>{settings.pickupAddress}</li>
          </ul>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-8 text-[12px] text-[#f3e9e3]/60 sm:px-8">
        © {new Date().getFullYear()} {storeLegal.legalName}
        {storeLegal.taxId && ` · CUIT ${storeLegal.taxId}`}
      </div>
    </footer>
  );
}
