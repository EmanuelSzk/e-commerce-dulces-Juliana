// No server-only imports here: the checkout form recalculates totals in the
// browser when the customer switches between delivery and pickup.

export type DeliveryMethod = "DELIVERY" | "PICKUP";

export type ShippingSettings = {
  shippingCost: number;
  freeShippingFrom: number;
};

export function calculateTotals(
  subtotal: number,
  deliveryMethod: DeliveryMethod,
  settings: ShippingSettings,
) {
  const shippingCost =
    deliveryMethod === "PICKUP" || subtotal >= settings.freeShippingFrom
      ? 0
      : settings.shippingCost;

  return { subtotal, shippingCost, total: subtotal + shippingCost };
}
