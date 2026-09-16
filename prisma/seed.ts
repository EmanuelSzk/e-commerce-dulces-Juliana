import "dotenv/config";
import { prisma } from "../src/lib/db";

type SeedProduct = {
  name: string;
  slug: string;
  description: string;
  categorySlug: string;
  variants: { name: string; price: number; stock: number }[];
};

const categories = [
  { name: "Tortas", slug: "tortas" },
  { name: "Alfajores", slug: "alfajores" },
  { name: "Budines", slug: "budines" },
  { name: "Cookies", slug: "cookies" },
  { name: "Sin TACC", slug: "sin-tacc" },
  { name: "Mesa dulce", slug: "mesa-dulce" },
];

const products: SeedProduct[] = [
  {
    name: "Torta Rogel",
    slug: "torta-rogel",
    description:
      "Doce capas de masa hojaldrada, dulce de leche repostero y merengue italiano quemado a mano. Se arma el mismo día de la entrega.",
    categorySlug: "tortas",
    variants: [
      { name: "8 porciones", price: 28500, stock: 3 },
      { name: "12 porciones", price: 39900, stock: 5 },
      { name: "20 porciones", price: 62000, stock: 0 },
    ],
  },
  {
    name: "Alfajores de maicena",
    slug: "alfajores-de-maicena",
    description:
      "Alfajores de maicena rellenos con dulce de leche y bordes de coco rallado.",
    categorySlug: "alfajores",
    variants: [
      { name: "× 6", price: 5200, stock: 24 },
      { name: "× 12", price: 9800, stock: 18 },
    ],
  },
  {
    name: "Cheesecake de frutos rojos",
    slug: "cheesecake-de-frutos-rojos",
    description:
      "Base de galleta, relleno cremoso de queso y salsa de frutos rojos hecha en casa.",
    categorySlug: "tortas",
    variants: [{ name: "10 porciones", price: 26000, stock: 6 }],
  },
  {
    name: "Lemon pie",
    slug: "lemon-pie",
    description:
      "Masa sablée, curd de limón bien ácido y merengue italiano flameado.",
    categorySlug: "tortas",
    variants: [{ name: "10 porciones", price: 24500, stock: 4 }],
  },
  {
    name: "Pastafrola de membrillo",
    slug: "pastafrola-de-membrillo",
    description: "Receta clásica, con membrillo artesanal y masa de vainilla.",
    categorySlug: "tortas",
    variants: [{ name: "8 porciones", price: 12900, stock: 7 }],
  },
  {
    name: "Budín de limón y amapolas",
    slug: "budin-de-limon-y-amapolas",
    description: "Budín húmedo de limón con semillas de amapola y glasé cítrico.",
    categorySlug: "budines",
    variants: [{ name: "Unidad", price: 7200, stock: 12 }],
  },
  {
    name: "Cookies con chips",
    slug: "cookies-con-chips",
    description: "Cookies grandes, crocantes por fuera y tiernas por dentro.",
    categorySlug: "cookies",
    variants: [{ name: "× 6", price: 6800, stock: 30 }],
  },
  {
    name: "Chipá casero",
    slug: "chipa-casero",
    description: "Chipá de almidón de mandioca y queso, naturalmente sin TACC.",
    categorySlug: "sin-tacc",
    variants: [{ name: "× 6", price: 5400, stock: 0 }],
  },
];

const shippingRules = [
  { id: "envio-posadas", name: "Posadas", cost: 3200 },
  { id: "envio-interior", name: "Interior de Misiones", cost: 6000 },
];

async function main() {
  const categoryIds = new Map<string, string>();

  for (const category of categories) {
    const saved = await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name },
      create: category,
    });
    categoryIds.set(category.slug, saved.id);
  }

  for (const product of products) {
    const { variants, categorySlug, ...productData } = product;
    const categoryId = categoryIds.get(categorySlug)!;

    const saved = await prisma.product.upsert({
      where: { slug: product.slug },
      update: { ...productData, categoryId },
      create: { ...productData, categoryId },
    });

    for (const [position, variant] of variants.entries()) {
      await prisma.productVariant.upsert({
        where: {
          productId_name: { productId: saved.id, name: variant.name },
        },
        update: { ...variant, position },
        create: { ...variant, position, productId: saved.id },
      });
    }
  }

  for (const rule of shippingRules) {
    await prisma.shippingRule.upsert({
      where: { id: rule.id },
      update: rule,
      create: rule,
    });
  }

  console.log(
    `Seed completado: ${categories.length} categorías, ${products.length} productos.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
