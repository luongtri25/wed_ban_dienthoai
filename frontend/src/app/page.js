import Link from "next/link";
import Image from "next/image";
import ProductCard from "@/components/ProductCard";
import { getProducts, getCategories } from "@/lib/api";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Trang chủ",
  description:
    "Khám phá điện thoại mới nhất, so sánh nhanh và đặt hàng trong vài phút.",
  alternates: {
    canonical: "/",
  },
};

const toStr = (value) =>
  typeof value === "string" ? value : value?.toString?.() || "";

const isTruthyQuery = (value) => {
  const parsed = toStr(value).toLowerCase();
  return parsed === "1" || parsed === "true" || parsed === "yes";
};

const normalizeText = (value = "") =>
  value
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const buildCategoryHref = (category) => {
  const categoryId = toStr(category?.id || category?._id);
  const normalizedName = normalizeText(category?.name || "");

  if (normalizedName === "phu kien") {
    return "/products?accessory=1";
  }

  if (!categoryId) return "/products";
  return `/products?category=${encodeURIComponent(categoryId)}`;
};

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
  if (typeof raw === "object") {
    return toStr(raw.id || raw._id);
  }
  return toStr(raw);
};

export default async function Home({ searchParams }) {
  const params = await searchParams;
  const showAllCategories = isTruthyQuery(params?.showCategories);

  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  const accessoryCategoryIds = buildAccessoryCategoryIds(categories);
  const sortedProducts = [...products].sort((a, b) => {
    const aIsAccessory = accessoryCategoryIds.has(getProductCategoryId(a));
    const bIsAccessory = accessoryCategoryIds.has(getProductCategoryId(b));
    return Number(aIsAccessory) - Number(bIsAccessory);
  });

  const categoryCards = showAllCategories ? categories : categories.slice(0, 5);

  const featured = sortedProducts.slice(0, 4);
  const heroProduct = sortedProducts[0];
  const heroLink = heroProduct ? `/products/${heroProduct.slug || heroProduct.id}` : "/products";

  return (
    <div>
      <section className="hero-grid">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-4 py-2 text-xs font-semibold text-[var(--muted)] shadow-sm shadow-black/5">
              <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
              SSR ready · Tốc độ tối ưu
            </div>
            <h1 className="mt-6 font-display text-4xl leading-tight text-[var(--ink)] md:text-5xl">
              Mua điện thoại nhanh gọn, chuẩn SEO, trải nghiệm mượt.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-[var(--muted)]">
              Tất cả sản phẩm đều được bố trí rõ ràng theo nhu cầu: flagship,
              gaming, nhỏ gọn hay làm việc. Chọn máy chỉ trong vài phút.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/products"
                className="rounded-full bg-[var(--ink)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-black/15"
              >
                Khám phá sản phẩm
              </Link>
              <Link
                href="/products"
                className="rounded-full border border-black/10 bg-white/70 px-6 py-3 text-sm font-semibold text-[var(--ink)]"
              >
                So sánh nhanh
              </Link>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                { label: "Hàng chính hãng", value: "100%" },
                { label: "Giao nhanh", value: "2h" },
                { label: "Bảo hành", value: "24 tháng" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-black/5 bg-white/80 px-4 py-4 text-center shadow-sm"
                >
                  <p className="text-2xl font-semibold text-[var(--ink)]">
                    {stat.value}
                  </p>
                  <p className="text-xs text-[var(--muted)]">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-black/5 bg-white p-8 shadow-[0_30px_80px_rgba(15,17,26,0.18)]">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                Ưu đãi nổi bật
              </p>
              <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
                -10%
              </span>
            </div>
            <h2 className="mt-4 font-display text-2xl text-[var(--ink)]">
              {heroProduct?.name || "Nebula X1 Pro"}
            </h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {heroProduct?.short || "Màn 120Hz · Camera 108MP · Pin 5200mAh"}
            </p>
            <div className="mt-6 rounded-3xl bg-[var(--surface)] p-6">
              <Image
                src={heroProduct?.image || "/phone-shell.svg"}
                alt={heroProduct?.name || "Nebula X1 Pro"}
                width={220}
                height={360}
                priority
                className="mx-auto h-52 w-auto"
              />
            </div>
            <div className="mt-6 flex items-center justify-between">
              <div>
                <p className="text-xs text-[var(--muted)]">Giá mở bán</p>
                <p className="text-lg font-semibold text-[var(--ink)]">
                  {heroProduct?.salePrice
                    ? heroProduct.salePrice.toLocaleString("vi-VN") + "đ"
                    : "25.990.000đ"}
                </p>
              </div>
              <Link
                href={heroLink}
                className="rounded-full bg-[var(--accent)] px-5 py-2 text-sm font-semibold text-white"
              >
                Xem chi tiết
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="home-categories" className="mx-auto w-full max-w-6xl px-6 py-12">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Danh mục nổi bật
            </p>
            <h2 className="mt-2 font-display text-2xl text-[var(--ink)]">
              Chọn máy theo nhu cầu
            </h2>
          </div>
          <Link
            href={
              showAllCategories
                ? "/#home-categories"
                : "/?showCategories=1#home-categories"
            }
            className="text-sm font-semibold text-[var(--accent)]"
          >
            {showAllCategories ? "Thu gọn" : "Xem tất cả"}
          </Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-5">
          {categoryCards.map((category) => (
            <Link
              key={category.id || category._id || category.name}
              href={buildCategoryHref(category)}
              className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-black/20"
            >
              <p className="font-semibold text-[var(--ink)]">
                {category.name}
              </p>
              <p className="mt-2 text-xs text-[var(--muted)]">
                {category.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-16">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Bán chạy
            </p>
            <h2 className="mt-2 font-display text-2xl text-[var(--ink)]">
              Máy đang được chọn nhiều nhất
            </h2>
          </div>
          <Link
            href="/products"
            className="rounded-full border border-black/10 px-4 py-2 text-xs font-semibold text-[var(--ink)]"
          >
            Xem tất cả sản phẩm
          </Link>
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-20">
        <div className="grid gap-6 lg:grid-cols-3">
          {[
            {
              title: "Tư vấn theo ngân sách",
              detail:
                "Tự động gợi ý máy theo mức giá và ưu tiên của bạn.",
            },
            {
              title: "So sánh thông số",
              detail: "Hiển thị nhanh những điểm khác biệt quan trọng.",
            },
            {
              title: "Thanh toán linh hoạt",
              detail: "Hỗ trợ trả góp, chuyển khoản và COD.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm"
            >
              <h3 className="font-display text-lg text-[var(--ink)]">
                {feature.title}
              </h3>
              <p className="mt-3 text-sm text-[var(--muted)]">
                {feature.detail}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
