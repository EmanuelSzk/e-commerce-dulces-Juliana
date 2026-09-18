"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CartIcon, GridIcon, HomeIcon, UserIcon } from "./icons";

export function MobileNav({
  cartUnits,
  accountHref,
}: {
  cartUnits: number;
  accountHref: string;
}) {
  const pathname = usePathname();

  const items = [
    { href: "/", label: "Inicio", icon: HomeIcon, active: pathname === "/" },
    {
      href: "/productos",
      label: "Catálogo",
      icon: GridIcon,
      active: pathname.startsWith("/productos"),
    },
    {
      href: "/carrito",
      label: "Carrito",
      icon: CartIcon,
      active: pathname === "/carrito",
      badge: cartUnits,
    },
    {
      href: accountHref,
      label: "Cuenta",
      icon: UserIcon,
      active: pathname.startsWith("/cuenta"),
    },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-ink/10 bg-cream/95 backdrop-blur md:hidden">
      <ul className="grid grid-cols-4">
        {items.map(({ href, label, icon: Icon, active, badge }) => (
          <li key={label}>
            <Link
              href={href}
              className={`relative flex flex-col items-center gap-1 py-2.5 text-[11px] ${
                active ? "font-medium text-berry" : "text-cocoa"
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
              {badge ? (
                <span className="absolute right-1/2 top-1.5 translate-x-4 rounded-full bg-pink px-1.5 text-[10px] font-medium text-white">
                  {badge}
                </span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
