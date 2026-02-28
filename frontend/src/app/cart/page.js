export const metadata = {
  title: "Giỏ hàng",
  description: "Xem nhanh các sản phẩm đã chọn.",
};

export default function CartPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[32px] border border-black/5 bg-white p-8 shadow-sm">
          <h1 className="font-display text-2xl text-[var(--ink)]">
            Giỏ hàng của bạn
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Hiện tại chưa có sản phẩm nào. Hãy tiếp tục mua sắm.
          </p>
          <div className="mt-6 rounded-3xl border border-dashed border-black/10 bg-[var(--surface)] p-6 text-sm text-[var(--muted)]">
            Khi kết nối backend, danh sách sản phẩm sẽ hiển thị tại đây.
          </div>
        </div>
        <div className="rounded-[32px] border border-black/5 bg-white p-8 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
            Tóm tắt đơn hàng
          </h2>
          <div className="mt-4 space-y-3 text-sm text-[var(--muted)]">
            <div className="flex items-center justify-between">
              <span>Tạm tính</span>
              <span>0đ</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Vận chuyển</span>
              <span>0đ</span>
            </div>
            <div className="flex items-center justify-between border-t border-black/10 pt-3 text-base font-semibold text-[var(--ink)]">
              <span>Tổng cộng</span>
              <span>0đ</span>
            </div>
          </div>
          <button className="mt-6 h-12 w-full rounded-full bg-[var(--ink)] text-sm font-semibold text-white shadow-lg shadow-black/15">
            Thanh toán
          </button>
        </div>
      </div>
    </div>
  );
}

