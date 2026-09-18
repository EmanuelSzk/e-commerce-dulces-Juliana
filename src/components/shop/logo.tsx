"use client";

import Image from "next/image";
import { useState } from "react";

// Uses public/logo.png once it exists; until then (or if it fails to load)
// shows the name in the brand serif, so adding the file needs no code change.
export function Logo({
  className = "",
  variant = "color",
}: {
  className?: string;
  variant?: "color" | "white";
}) {
  const [missing, setMissing] = useState(false);

  if (missing) {
    return (
      <span
        className={`font-serif text-2xl leading-none ${
          variant === "white" ? "text-cream" : "text-ink"
        } ${className}`}
      >
        Dulces Juliana
      </span>
    );
  }

  return (
    <Image
      src="/logo.png"
      alt="Dulces Juliana"
      width={104}
      height={50}
      priority
      onError={() => setMissing(true)}
      className={`h-[50px] w-auto ${variant === "white" ? "brightness-0 invert" : ""} ${className}`}
    />
  );
}
