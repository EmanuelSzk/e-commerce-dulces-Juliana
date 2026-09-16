export const orderStatusLabels = {
  PENDING: "Pendiente de pago",
  PAID: "Pagado",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
} as const;

export const deliveryMethodLabels = {
  DELIVERY: "Envío a domicilio",
  PICKUP: "Retiro en el local",
} as const;
