import type { Metadata } from "next";
import Link from "next/link";
import { getStoreSettings } from "@/lib/services/settings-service";
import { formatPrice } from "@/lib/format";
import { storeContact, storeLegal } from "@/lib/store-info";

export const metadata: Metadata = { title: "Términos y condiciones" };

export default async function TerminosPage() {
  const settings = await getStoreSettings();

  return (
    <article className="prose-shop mx-auto max-w-2xl py-6">
      <h1 className="font-serif text-4xl text-ink md:text-5xl">Términos y condiciones</h1>
      <p className="mt-3 text-[13px] font-light text-taupe">
        Última actualización: septiembre de 2026
      </p>

      <div className="mt-8 space-y-7 text-[15px] font-light leading-relaxed text-cocoa">
        <section>
          <h2 className="font-serif text-2xl text-ink">Quién vende</h2>
          <p className="mt-2">
            Esta tienda es operada por {storeLegal.legalName}
            {storeLegal.taxId ? `, CUIT ${storeLegal.taxId},` : ""} con domicilio en{" "}
            {settings.pickupAddress}. Al hacer un pedido aceptás estas condiciones.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-ink">Productos y precios</h2>
          <p className="mt-2">
            Vendemos productos de repostería elaborados de forma artesanal. Los precios
            se expresan en pesos argentinos e incluyen impuestos, y pueden cambiar sin
            aviso previo; el precio que vale para tu compra es el que figura al momento
            de confirmar el pedido. Las fotos son ilustrativas: al ser productos hechos a
            mano, puede haber diferencias de terminación.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-ink">Pedidos y disponibilidad</h2>
          <p className="mt-2">
            El stock que muestra la tienda es el disponible al momento de la consulta y{" "}
            <strong className="font-medium text-ink">
              recién se descuenta cuando el pago se confirma
            </strong>
            . Puede ocurrir que dos personas compren la última unidad casi al mismo
            tiempo: en ese caso te contactamos para coordinar una alternativa o
            reintegrarte el dinero.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-ink">Formas de pago</h2>
          <p className="mt-2">
            Los pagos se procesan a través de Mercado Pago, que ofrece sus propios medios
            (tarjetas de débito y crédito, dinero en cuenta y otros). La tienda{" "}
            <strong className="font-medium text-ink">
              no guarda los datos de tu tarjeta
            </strong>
            : esa información la maneja Mercado Pago. El pedido se confirma cuando
            Mercado Pago nos informa que el pago fue acreditado.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-ink">Entregas y retiro</h2>
          <p className="mt-2">
            Hacemos envíos a domicilio dentro de Posadas, Misiones, con un costo de{" "}
            {formatPrice(settings.shippingCost)}, sin cargo para compras desde{" "}
            {formatPrice(settings.freeShippingFrom)}. También podés retirar sin cargo en{" "}
            {settings.pickupAddress}
            {settings.pickupHours ? `, ${settings.pickupHours}` : ""}. Coordinamos la
            entrega o el retiro por el teléfono que dejes al finalizar la compra.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-ink">Derecho de arrepentimiento</h2>
          <p className="mt-2">
            Si comprás a distancia, podés arrepentirte dentro de los 10 días corridos
            desde que recibís el producto, según la Ley 24.240 de Defensa del Consumidor.
            Para hacerlo, usá el{" "}
            <Link href="/arrepentimiento" className="font-medium text-berry underline">
              botón de arrepentimiento
            </Link>
            : vas a recibir un número de solicitud y te contactamos para coordinar la
            devolución y el reintegro, que se hace por el mismo medio de pago.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-ink">Consultas y reclamos</h2>
          <p className="mt-2">
            Podés escribirnos
            {storeContact.email ? ` a ${storeContact.email}` : ""}
            {storeContact.whatsappLabel ? ` o por WhatsApp al ${storeContact.whatsappLabel}` : ""}
            . Ante un conflicto, podés acudir a Defensa del Consumidor. Estas condiciones
            se rigen por las leyes argentinas, con jurisdicción en los tribunales de
            Posadas, Misiones.
          </p>
        </section>
      </div>
    </article>
  );
}
