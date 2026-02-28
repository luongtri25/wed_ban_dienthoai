import ProductCard from "@/components/ProductCard";
import { getProducts } from "@/lib/api";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sản phẩm",
  description: "Danh sách điện thoại theo nhu cầu và mức giá.",
  alternates: {
    canonical: "/products",
  },
};

export default async function ProductsPage() {
  const products = await getProducts();

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
          Cập nhật giá mỗi 24h · SSR enabled
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        {[
          "Tất cả",
          "Flagship",
          "Gaming",
          "Giá tốt",
          "Compact",
          "Productivity",
        ].map((chip) => (
          <span
            key={chip}
            className="rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-semibold text-[var(--ink)]"
          >
            {chip}
          </span>
        ))}
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
