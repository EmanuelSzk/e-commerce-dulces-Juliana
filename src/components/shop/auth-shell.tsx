import Link from "next/link";

const benefits = [
  "Historial de tus pedidos y el estado de cada pago",
  "Retomá un pago pendiente cuando quieras",
  "Elegí envío a domicilio o retiro en el local",
];

export function AuthShell({
  mode,
  next,
  title,
  subtitle,
  children,
}: {
  mode: "login" | "registro";
  next?: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  // Keeps the "come back here after signing in" destination across tabs.
  const query = next ? `?next=${encodeURIComponent(next)}` : "";
  const tabs = [
    { href: `/cuenta/login${query}`, label: "Ingresar", active: mode === "login" },
    { href: `/cuenta/registro${query}`, label: "Crear cuenta", active: mode === "registro" },
  ];

  return (
    <div className="grid overflow-hidden rounded-card bg-cream shadow-soft md:min-h-[600px] md:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-10 sm:px-12">
        <nav className="flex w-max rounded-full bg-sand p-1">
          {tabs.map((tab) => (
            <Link
              key={tab.label}
              href={tab.href}
              aria-current={tab.active ? "page" : undefined}
              className={`rounded-full px-5 py-2.5 text-[13.5px] ${
                tab.active ? "bg-cream font-medium text-ink shadow-soft" : "text-taupe"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </nav>

        <h1 className="mt-7 font-serif text-[44px] leading-[1.05] text-ink">{title}</h1>
        <p className="mt-2 text-[14.5px] font-light text-cocoa">{subtitle}</p>

        <div className="mt-7 max-w-[420px]">{children}</div>
      </div>

      <div className="hidden flex-col justify-between bg-ink px-11 py-12 text-[#f3e9e3] md:flex">
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#f0a8c6]">
          Tu cuenta en Dulces Juliana
        </p>
        <p className="font-serif text-5xl leading-[1.08]">
          Pedí lo de siempre en dos toques.
        </p>
        <ol className="grid gap-3.5 text-[14.5px] font-light leading-snug">
          {benefits.map((benefit, index) => (
            <li key={benefit} className="flex gap-3">
              <span className="font-medium text-[#f0a8c6]">0{index + 1}</span>
              {benefit}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
