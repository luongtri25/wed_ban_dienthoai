import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getProduct } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};

  return {
    title: product.name,
    description: product.short,
    alternates: {
      canonical: `/products/${product.slug || product.id}`,
    },
    openGraph: {
      title: product.name,
      description: product.short,
      url: `${siteConfig.url}/products/${product.slug || product.id}`,
      images: [
        {
          url: product.image,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
    },
  };
}

export default async function ProductDetail({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const specsEntries = Object.entries(product.specs || {});
  const displayPrice = product.salePrice ?? product.price ?? 0;
  const originalPrice = product.salePrice ? product.price : null;

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    image: [`${siteConfig.url}${product.image}`],
    description: product.description || product.short,
    brand: {
      "@type": "Brand",
      name:
        typeof product.brand === "object" && product.brand?.name
          ? product.brand.name
          : product.brand || "Mobile",
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "VND",
      price: displayPrice,
      availability: "https://schema.org/InStock",
    },
  };

  if (product.rating && product.reviewCount) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    };
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <div className="text-xs text-[var(--muted)]">
        <Link href="/products" className="hover:text-[var(--ink)]">
          Sản phẩm
        </Link>
        <span className="mx-2">/</span>
        <span>{product.name}</span>
      </div>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[32px] border border-black/5 bg-white p-8 shadow-[0_30px_80px_rgba(15,17,26,0.15)]">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
              {product.badge}
            </span>
            <span className="text-xs text-[var(--muted)]">
              {product.stock ?? 0} máy có sẵn
            </span>
          </div>
          <div className="mt-8 rounded-3xl bg-[var(--surface)] p-8">
            <Image
              src={product.image}
              alt={product.name}
              width={260}
              height={420}
              className="mx-auto h-64 w-auto drop-shadow-[0_30px_40px_rgba(15,17,26,0.3)]"
            />
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3 text-xs text-[var(--muted)]">
            {specsEntries.slice(0, 3).map(([key, value]) => (
              <div
                key={key}
                className="rounded-2xl border border-black/5 bg-white px-3 py-3 text-center"
              >
                <p className="font-semibold text-[var(--ink)]">{value}</p>
                <p className="mt-1 text-[var(--muted)]">{key}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h1 className="font-display text-3xl text-[var(--ink)]">
            {product.name}
          </h1>
          <p className="mt-3 text-sm text-[var(--muted)]">
            {product.short || product.description}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-[var(--muted)]">
            {product.rating ? (
              <span className="rounded-full bg-white px-3 py-1 shadow-sm">
                {product.rating}★ ({product.reviewCount || 0})
              </span>
            ) : null}
            {product.brand ? (
              <span className="rounded-full bg-white px-3 py-1 shadow-sm">
                {typeof product.brand === "object" ? product.brand.name : product.brand}
              </span>
            ) : null}
            {product.category ? (
              <span className="rounded-full bg-white px-3 py-1 shadow-sm">
                {typeof product.category === "object"
                  ? product.category.name
                  : product.category}
              </span>
            ) : null}
          </div>

          <div className="mt-6 rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
              Giá ưu đãi
            </p>
            <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-2xl font-semibold text-[var(--ink)]">
                  {formatPrice(displayPrice)}
                </p>
                {originalPrice ? (
                  <p className="text-xs text-[var(--muted)] line-through">
                    {formatPrice(originalPrice)}
                  </p>
                ) : null}
              </div>
              <button className="rounded-full bg-[var(--ink)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-black/15">
                Thêm vào giỏ
              </button>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
              Thông số chi tiết
            </h2>
            <div className="mt-4 grid gap-3">
              {specsEntries.length ? (
                specsEntries.map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between rounded-2xl border border-black/5 bg-white px-4 py-3 text-sm"
                  >
                    <span className="text-[var(--muted)]">{key}</span>
                    <span className="font-semibold text-[var(--ink)]">
                      {value}
                    </span>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-black/5 bg-white px-4 py-3 text-sm text-[var(--muted)]">
                  Thông số đang được cập nhật.
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            {[
              "Miễn phí giao nhanh trong nội thành.",
              "Hỗ trợ trả góp 0% qua thẻ tín dụng.",
              "Đổi mới trong 30 ngày nếu lỗi NSX.",
            ].map((note) => (
              <div
                key={note}
                className="rounded-2xl border border-black/5 bg-white px-4 py-3 text-xs text-[var(--muted)]"
              >
                {note}
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="mt-12 grid gap-6 lg:grid-cols-3">
        {[
          {
            title: "Hiệu năng ổn định",
            detail: "Chip tối ưu năng lượng, giữ nhiệt độ luôn mát.",
          },
          {
            title: "Camera linh hoạt",
            detail: "Chụp đêm sắc nét với cảm biến lớn và AI.",
          },
          {
            title: "Pin trâu",
            detail: "Dùng trọn ngày dài, hỗ trợ sạc nhanh an toàn.",
          },
        ].map((card) => (
          <div
            key={card.title}
            className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm"
          >
            <h3 className="font-display text-lg text-[var(--ink)]">
              {card.title}
            </h3>
            <p className="mt-3 text-sm text-[var(--muted)]">{card.detail}</p>
          </div>
        ))}
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}

