import Link from "next/link";
import { requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/db";

export default async function AdminDashboardPage() {
  await requireAdmin();

  const [pendingOrders, ordersToReview, soldOutVariants] = await Promise.all([
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { reviewNote: { not: null } } }),
    prisma.productVariant.count({ where: { active: true, stock: 0 } }),
  ]);

  const cards = [
    {
      label: "Pedidos pendientes de pago",
      value: pendingOrders,
      href: "/admin/pedidos?estado=PENDING",
    },
    {
      label: "Pedidos para revisar",
      value: ordersToReview,
      href: "/admin/pedidos?revisar=1",
      highlight: ordersToReview > 0,
    },
    {
      label: "Presentaciones sin stock",
      value: soldOutVariants,
      href: "/admin/productos",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold">Tablero</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className={`rounded-lg border p-4 hover:bg-black/5 ${
              card.highlight ? "border-amber-400 bg-amber-50" : "border-black/10"
            }`}
          >
            <p className="text-3xl font-semibold">{card.value}</p>
            <p className="mt-1 text-sm text-black/60">{card.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
