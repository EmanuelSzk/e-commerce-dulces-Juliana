const steps = ["Carrito", "Datos y entrega", "Pago"];

export function CheckoutSteps({ current }: { current: 1 | 2 | 3 }) {
  return (
    <ol className="flex flex-wrap items-center gap-2 text-[13px]">
      {steps.map((label, index) => {
        const number = index + 1;
        const active = number === current;
        return (
          <li
            key={label}
            aria-current={active ? "step" : undefined}
            className={
              active
                ? "rounded-full bg-pink-deep px-4 py-1.5 font-medium text-white"
                : "px-2.5 py-1.5 text-taupe"
            }
          >
            {number} {label}
          </li>
        );
      })}
    </ol>
  );
}
