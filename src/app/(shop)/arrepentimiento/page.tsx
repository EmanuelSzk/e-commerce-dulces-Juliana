import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/dal";
import { storeContact } from "@/lib/store-info";
import { CancellationForm } from "@/components/shop/cancellation-form";
import { CheckIcon } from "@/components/shop/icons";
import { buttonClass } from "@/components/ui/styles";

export const metadata: Metadata = { title: "Botón de arrepentimiento" };

export default async function ArrepentimientoPage({
  searchParams,
}: PageProps<"/arrepentimiento">) {
  const { enviado } = await searchParams;
  const profile = await getCurrentUser();

  if (typeof enviado === "string") {
    return (
      <div className="mx-auto max-w-xl py-8">
        <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-berry">
          <CheckIcon />
          Solicitud registrada
        </p>
        <h1 className="mt-3 font-serif text-4xl text-ink">Recibimos tu pedido de cancelación</h1>
        <p className="mt-4 text-[15px] font-light leading-relaxed text-cocoa">
          Tu solicitud quedó registrada con el número{" "}
          <strong className="font-medium text-ink">#{enviado}</strong> y la fecha de hoy.
          Guardá ese número: es tu constancia. Nos vamos a comunicar con vos para
          coordinar la devolución y el reintegro del dinero, que se hace por el mismo
          medio con el que pagaste.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/cuenta" className={buttonClass("primary", "md")}>
            Ver mis pedidos
          </Link>
          <Link href="/" className={buttonClass("outline", "md")}>
            Volver a la tienda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl py-6">
      <h1 className="font-serif text-4xl text-ink md:text-5xl">Botón de arrepentimiento</h1>
      <p className="mt-4 text-[15px] font-light leading-relaxed text-cocoa">
        Si comprás a distancia tenés derecho a arrepentirte dentro de los{" "}
        <strong className="font-medium text-ink">10 días corridos</strong> desde que
        recibís el producto, sin costo ni necesidad de explicar por qué (Ley 24.240 de
        Defensa del Consumidor). Completá este formulario y te contactamos para coordinar
        la devolución y el reintegro.
      </p>
      <p className="mt-3 text-[15px] font-light leading-relaxed text-cocoa">
        Si todavía no pagaste, podés cancelar el pedido vos misma desde{" "}
        <Link href="/carrito" className="font-medium text-berry underline">
          el carrito
        </Link>
        {storeContact.whatsappLabel
          ? `. Para cualquier consulta también podés escribirnos por WhatsApp al ${storeContact.whatsappLabel}.`
          : "."}
      </p>

      <CancellationForm defaultName={profile?.name} defaultEmail={profile?.email} />
    </div>
  );
}
