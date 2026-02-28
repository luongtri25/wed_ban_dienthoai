import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/format";

export default function ProductCard({ product }) {
  const price = product.salePrice ?? product.price ?? 0;
  const badge = product.badge || "Sản phẩm";
  const short = product.short || "Xem chi tiết sản phẩm.";
  const stock = product.stock ?? 0;
  const slug = product.slug || product.id;

  return (
    <Link
      href={`/products/${slug}`}
      className="group relative flex h-full flex-col rounded-3xl border border-black/5 bg-white p-5 shadow-[0_10px_40px_rgba(15,17,26,0.08)] transition hover:-translate-y-1"
    >
      <div className="flex items-center justify-between text-xs text-[var(--muted)]">
        <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-[var(--accent)]">
          {badge}
        </span>
        <span>{stock} máy có sẵn</span>
      </div>

      <div className="mt-6 flex-1 rounded-2xl bg-[var(--surface)] p-6">
        <div className="flex h-full items-center justify-center">
          <Image
            src={product.image}
            alt={product.name}
            width={220}
            height={360}
            className="h-44 w-auto drop-shadow-[0_25px_35px_rgba(15,17,26,0.25)] transition group-hover:-rotate-3"
          />
        </div>
      </div>

      <div className="mt-6">
        <h3 className="font-display text-lg text-[var(--ink)]">
          {product.name}
        </h3>
        <p className="mt-2 text-sm text-[var(--muted)]">{short}</p>
        <div className="mt-4 flex items-end justify-between">
          <div>
            <p className="text-xs text-[var(--muted)]">Giá chỉ từ</p>
            <p className="text-lg font-semibold text-[var(--ink)]">
              {formatPrice(price)}
            </p>
          </div>
          <span className="rounded-full border border-black/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--ink)]">
            Xem máy
          </span>
        </div>
      </div>
    </Link>
  );
}
