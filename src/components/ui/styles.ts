// Class helpers instead of components: the same look applies to <button>,
// <Link> and <a> alike.

type ButtonVariant = "primary" | "ink" | "outline";
type ButtonSize = "md" | "lg";

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition disabled:cursor-not-allowed disabled:opacity-50";

const buttonVariants: Record<ButtonVariant, string> = {
  primary: "bg-pink-deep text-white shadow-pink hover:bg-berry",
  ink: "bg-ink text-cream hover:bg-cocoa",
  outline: "border border-ink/20 text-ink hover:bg-ink/5",
};

const buttonSizes: Record<ButtonSize, string> = {
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3.5 text-[15px]",
};

export function buttonClass(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  extra = "",
) {
  return `${buttonBase} ${buttonVariants[variant]} ${buttonSizes[size]} ${extra}`;
}

export function chipClass(active: boolean) {
  return `rounded-full px-4 py-2 text-sm transition ${
    active ? "bg-ink font-medium text-cream" : "bg-cream text-cocoa hover:bg-sand"
  }`;
}

type BadgeTone = "pink" | "blush" | "ink" | "sand";

const badgeTones: Record<BadgeTone, string> = {
  pink: "bg-pink text-white",
  blush: "bg-blush text-berry",
  ink: "bg-ink/85 text-cream",
  sand: "bg-sand text-cocoa",
};

export function badgeClass(tone: BadgeTone = "blush") {
  return `inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${badgeTones[tone]}`;
}

export const inputClass =
  "mt-1.5 w-full rounded-tile bg-sand px-4 py-3 text-sm text-ink placeholder:text-taupe outline-none focus:ring-2 focus:ring-pink/50";

export const cardClass = "rounded-card bg-cream shadow-soft";

// 1 columna en celulares chicos (<360px, ver --breakpoint-xs), 2 en celulares
// comunes y tablets, 4 en escritorio.
export const productGridClass = "grid grid-cols-1 gap-4 xs:grid-cols-2 lg:grid-cols-4";
