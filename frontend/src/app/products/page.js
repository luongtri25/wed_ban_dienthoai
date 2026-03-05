import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { getBrands, getCategories, getProducts } from "@/lib/api";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sản phẩm",
  description: "Danh sách điện thoại theo nhu cầu và mức giá.",
  alternates: {
    canonical: "/products",
  },
};

const toStr = (value) =>
  typeof value === "string" ? value : value?.toString?.() || "";

const normalizeText = (value = "") =>
  value
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const isTruthyQuery = (value) => {
  const parsed = toStr(value).toLowerCase();
  return parsed === "1" || parsed === "true" || parsed === "yes";
};

const buildProductsHref = ({ brand = "", category = "", accessory = false } = {}) => {
  const query = new URLSearchParams();
  if (brand) query.set("brand", brand);
  if (category) query.set("category", category);
  if (accessory) query.set("accessory", "1");

  const search = query.toString();
  return search ? `/products?${search}` : "/products";
};

const chipClassName = (active) =>
  `rounded-full border px-4 py-2 text-xs font-semibold transition ${
    active
      ? "border-[var(--ink)] bg-[var(--ink)] text-white"
      : "border-black/10 bg-white text-[var(--ink)] hover:border-black/30"
  }`;

const buildAccessoryCategoryIds = (categories) => {
  const normalizedById = new Map(
    categories.map((category) => [
      toStr(category.id || category._id),
      {
        id: toStr(category.id || category._id),
        parentId: toStr(category.parent),
        name: normalizeText(category.name || ""),
      },
    ])
  );

  const root = Array.from(normalizedById.values()).find(
    (category) => category.name === "phu kien"
  );
  if (!root) return new Set();

  const accessoryIds = new Set([root.id]);
  let changed = true;

  while (changed) {
    changed = false;
    for (const category of normalizedById.values()) {
      if (!category.id) continue;
      if (accessoryIds.has(category.id)) continue;
      if (category.parentId && accessoryIds.has(category.parentId)) {
        accessoryIds.add(category.id);
        changed = true;
      }
    }
  }

  return accessoryIds;
};

const getProductCategoryId = (product) => {
  const raw = product?.category;
  if (!raw) return "";
  if (typeof raw === "object") return toStr(raw.id || raw._id);
  return toStr(raw);
};

export default async function ProductsPage({ searchParams }) {
  const params = await searchParams;
  const selectedBrand = toStr(params?.brand);
  const selectedCategory = toStr(params?.category);
  const accessoryOnly = isTruthyQuery(params?.accessory);

  const [brands, categories, products] = await Promise.all([
    getBrands(),
    getCategories(),
    getProducts({
      brand: selectedBrand || undefined,
      category: selectedCategory || undefined,
      accessory: accessoryOnly,
    }),
  ]);

  const selectedBrandName =
    brands.find((brand) => brand.id === selectedBrand)?.name || "";
  const selectedCategoryName =
    categories.find((category) => category.id === selectedCategory)?.name || "";
  const accessoryCategoryIds = buildAccessoryCategoryIds(categories);
  const sortedProducts = [...products].sort((a, b) => {
    const aIsAccessory = accessoryCategoryIds.has(getProductCategoryId(a));
    const bIsAccessory = accessoryCategoryIds.has(getProductCategoryId(b));
    return Number(aIsAccessory) - Number(bIsAccessory);
  });

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Catalog
          </p>
          <h1 className="mt-2 font-display text-3xl text-[var(--ink)]">
            Bộ sưu tập điện thoại 2026
          </h1>
          <p className="mt-3 max-w-xl text-sm text-[var(--muted)]">
            Chọn nhanh theo phong cách sử dụng. Tất cả sản phẩm đều có thông số
            rõ ràng và ưu đãi minh bạch.
          </p>
        </div>
        <div className="rounded-2xl border border-black/5 bg-white px-5 py-4 text-xs text-[var(--muted)] shadow-sm">
          {sortedProducts.length} sản phẩm
          {selectedBrandName ? ` · Hãng: ${selectedBrandName}` : ""}
          {selectedCategoryName ? ` · Danh mục: ${selectedCategoryName}` : ""}
          {accessoryOnly ? " · Phụ kiện" : ""}
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href={buildProductsHref()}
          className={chipClassName(!selectedBrand && !selectedCategory && !accessoryOnly)}
        >
          Tất cả
        </Link>

        <Link
          href={buildProductsHref({
            brand: selectedBrand,
            category: accessoryOnly ? selectedCategory : "",
            accessory: !accessoryOnly,
          })}
          className={chipClassName(accessoryOnly)}
        >
          Phụ kiện
        </Link>

        {brands.map((brand) => (
          <Link
            key={brand.id}
            href={buildProductsHref({
              brand: brand.id,
              category: selectedCategory,
              accessory: accessoryOnly,
            })}
            className={chipClassName(selectedBrand === brand.id)}
          >
            {brand.name}
          </Link>
        ))}
      </div>

      {sortedProducts.length ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-3xl border border-dashed border-black/10 bg-white p-6 text-sm text-[var(--muted)]">
          Không có sản phẩm phù hợp bộ lọc hiện tại.
        </div>
      )}
    </div>
  );
}
