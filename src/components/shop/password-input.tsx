"use client";

import { useState } from "react";

export function PasswordInput({
  id,
  name,
  autoComplete,
}: {
  id: string;
  name: string;
  autoComplete: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="mt-1.5 flex items-center rounded-tile bg-sand pr-3 focus-within:ring-2 focus-within:ring-pink/50">
      <input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        className="w-full bg-transparent px-4 py-3 text-sm text-ink outline-none"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="shrink-0 text-[12.5px] font-light text-taupe hover:text-ink"
      >
        {visible ? "Ocultar" : "Mostrar"}
      </button>
    </div>
  );
}
