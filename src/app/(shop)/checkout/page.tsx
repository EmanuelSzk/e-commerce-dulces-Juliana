import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/dal";
import { readCart, resolveCart } from "@/lib/services/cart-service";
import { getStoreSettings } from "@/lib/services/settings-service";
import { CheckoutForm } from "@/components/shop/checkout-form";
import { CheckoutSteps } from "@/components/shop/checkout-steps";

export const metadata: Metadata = { title: "Finalizar compra" };

export default async function CheckoutPage() {
  const profile = await requireUser();
  const [cart, settings] = await Promise.all([
    readCart().then(resolveCart),
    getStoreSettings(),
  ]);

  // Stock changed since the cart was reviewed: send the customer back so the
  // adjustments are visible before paying.
  if (cart.subtotal === 0 || cart.hasIssues) {
    redirect("/carrito");
  }

  return (
    <div className="py-2">
      <CheckoutSteps current={2} />
      <h1 className="mt-5 font-serif text-4xl text-ink">Datos y entrega</h1>
      <div className="mt-6">
        <CheckoutForm
          lines={cart.lines.map((line) => ({
            variantId: line.variantId,
            title: `${line.productName} — ${line.variantName}`,
            quantity: line.quantity,
            lineTotal: line.lineTotal,
          }))}
          subtotal={cart.subtotal}
          shippingCost={settings.shippingCost}
          freeShippingFrom={settings.freeShippingFrom}
          pickupAddress={settings.pickupAddress}
          defaultName={profile.name}
        />
      </div>
    </div>
  );
}
