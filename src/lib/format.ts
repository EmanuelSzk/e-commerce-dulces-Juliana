const currencyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Argentina/Buenos_Aires",
});

export function formatPrice(value: number | string) {
  return currencyFormatter.format(Number(value));
}

export function formatDate(value: Date) {
  return dateFormatter.format(value);
}

// Short, human-friendly reference for an order id (cuid).
export function formatOrderNumber(orderId: string) {
  return `#${orderId.slice(-8).toUpperCase()}`;
}
