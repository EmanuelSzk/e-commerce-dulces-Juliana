import type { Metadata } from "next";
import { getStoreSettings } from "@/lib/services/settings-service";
import { storeContact, storeLegal } from "@/lib/store-info";

export const metadata: Metadata = { title: "Política de privacidad" };

export default async function PrivacidadPage() {
  const settings = await getStoreSettings();

  return (
    <article className="mx-auto max-w-2xl py-6">
      <h1 className="font-serif text-4xl text-ink md:text-5xl">Política de privacidad</h1>
      <p className="mt-3 text-[13px] font-light text-taupe">
        Última actualización: septiembre de 2026
      </p>

      <div className="mt-8 space-y-7 text-[15px] font-light leading-relaxed text-cocoa">
        <section>
          <h2 className="font-serif text-2xl text-ink">Qué datos guardamos</h2>
          <p className="mt-2">
            Si creás una cuenta: tu nombre y tu correo electrónico. Si hacés un pedido:
            además el teléfono de contacto y, cuando elegís envío, la dirección de
            entrega. También guardamos el detalle de tus pedidos y su estado de pago.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-ink">Para qué los usamos</h2>
          <p className="mt-2">
            Únicamente para preparar y entregar tus pedidos, coordinar la entrega o el
            retiro, y responder tus consultas. No vendemos ni cedemos tus datos a
            terceros con fines publicitarios, y no te enviamos publicidad si no la pediste.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-ink">Pagos</h2>
          <p className="mt-2">
            Los pagos los procesa Mercado Pago. Los datos de tu tarjeta se cargan en su
            plataforma y{" "}
            <strong className="font-medium text-ink">nunca llegan a esta tienda</strong>.
            De cada pago solo guardamos su identificador y su estado, para saber si el
            pedido está pagado.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-ink">Dónde se guardan</h2>
          <p className="mt-2">
            La información se almacena en servidores de Supabase, nuestro proveedor de
            base de datos, ubicados fuera del país. El acceso está restringido a quienes
            administran la tienda.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-ink">Cookies</h2>
          <p className="mt-2">
            Usamos solo dos cookies necesarias para que la tienda funcione: una mantiene
            tu sesión iniciada y otra recuerda los productos de tu carrito. No usamos
            cookies de publicidad ni de seguimiento, ni servicios de analítica.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-ink">Tus derechos</h2>
          <p className="mt-2">
            Podés pedirnos acceder, rectificar o suprimir tus datos personales, conforme
            a la Ley 25.326 de Protección de Datos Personales. Escribinos
            {storeContact.email ? ` a ${storeContact.email}` : " por los medios de contacto del sitio"}{" "}
            y resolvemos tu pedido. Tené en cuenta que los datos de pedidos ya realizados
            pueden conservarse por obligaciones contables e impositivas.
          </p>
          <p className="mt-2">
            Responsable: {storeLegal.legalName}
            {storeLegal.taxId ? ` (CUIT ${storeLegal.taxId})` : ""}, {settings.pickupAddress}.
          </p>
        </section>
      </div>
    </article>
  );
}
