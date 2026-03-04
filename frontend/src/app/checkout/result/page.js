import Link from "next/link";

export const metadata = {
  title: "Kết quả thanh toán",
  description: "Trang kết quả thanh toán MoMo.",
};

export const dynamic = "force-dynamic";

export default async function CheckoutResultPage({ searchParams }) {
  const query = await searchParams;

  const orderId = query?.orderId ? String(query.orderId) : "";
  const resultCode = query?.resultCode ? String(query.resultCode) : "";
  const message = query?.message ? String(query.message) : "";
  const success = resultCode === "0";

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-14">
      <div className="rounded-3xl border border-black/10 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          MoMo Checkout Result
        </p>

        <h1 className="mt-3 font-display text-3xl text-[var(--ink)]">
          {success ? "Thanh toán thành công" : "Thanh toán chưa thành công"}
        </h1>

        <p className="mt-3 text-sm text-[var(--muted)]">
          {message || (success ? "MoMo đã xác nhận giao dịch." : "Vui lòng thử lại.")}
        </p>

        <div className="mt-6 rounded-2xl border border-black/10 bg-[var(--surface)] p-4 text-sm text-[var(--muted)]">
          <p>
            <span className="font-semibold text-[var(--ink)]">Mã đơn:</span>{" "}
            {orderId || "-"}
          </p>
          <p className="mt-1">
            <span className="font-semibold text-[var(--ink)]">Result code:</span>{" "}
            {resultCode || "-"}
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {orderId ? (
            <Link
              href={`/orders/${orderId}`}
              className="rounded-full bg-[var(--ink)] px-5 py-3 text-sm font-semibold text-white"
            >
              Xem chi tiết đơn hàng
            </Link>
          ) : null}

          <Link
            href="/orders"
            className="rounded-full border border-black/10 px-5 py-3 text-sm font-semibold text-[var(--ink)]"
          >
            Danh sách đơn hàng
          </Link>

          <Link
            href="/cart"
            className="rounded-full border border-black/10 px-5 py-3 text-sm font-semibold text-[var(--ink)]"
          >
            Quay lại giỏ hàng
          </Link>
        </div>
      </div>
    </div>
  );
}

