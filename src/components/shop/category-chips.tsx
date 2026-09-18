import Link from "next/link";
import { chipClass } from "@/components/ui/styles";

export function CategoryChips({
  categories,
  activeSlug,
}: {
  categories: { id: string; name: string; slug: string }[];
  activeSlug?: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link href="/productos" className={chipClass(!activeSlug)}>
        Todos
      </Link>
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/productos?categoria=${category.slug}`}
          className={chipClass(activeSlug === category.slug)}
        >
          {category.name}
        </Link>
      ))}
    </div>
  );
}
