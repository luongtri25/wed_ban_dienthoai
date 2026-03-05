"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getOrders, updateOrderStatus } from "@/lib/api";
import { formatPrice } from "@/lib/format";

const PAYMENT_LABEL = {
  cod: "Tiền mặt (COD)",
  momo: "Ví MoMo",
};

const NEXT_STATUS = {
  pending: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState("");
  const [error, setError] = useState("");

  const loadOrders = async () => {
    setError("");
    setLoading(true);
    try {
      const data = await getOrders(); // admin sẽ nhận toàn bộ đơn từ backend
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const sorted = useMemo(
    () =>
      [...orders].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [orders]
  );

  const onChangeStatus = async (order, nextStatus) => {
    if (!nextStatus || nextStatus === order.status) return;
    const key = `${order.id}-${nextStatus}`;
    setSavingKey(key);
    setError("");
    try {
      await updateOrderStatus(order.id, nextStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: nextStatus } : o))
      );
    } catch (err) {
      setError(err.message || "Cập nhật trạng thái thất bại");
    } finally {
      setSavingKey("");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl text-[var(--ink)]">Admin - Orders</h1>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="rounded-2xl border border-black/10 bg-white p-4">
        {loading ? (
          <p className="text-sm text-[var(--muted)]">Đang tải...</p>
        ) : !sorted.length ? (
          <p className="text-sm text-[var(--muted)]">Chưa có đơn hàng.</p>
        ) : (
          <div className="space-y-3">
            {sorted.map((order) => {
              const nextAllowed = NEXT_STATUS[order.status] || [];
              const customer =
                order.shippingAddress?.fullName || order.user?.name || "Khách hàng";

              return (
                <div
                  key={order.id}
                  className="rounded-xl border border-black/10 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-[var(--ink)]">
                      Mã đơn: {order.id}
                    </p>
                    <p className="text-xs text-[var(--muted)]">
                      {new Date(order.createdAt).toLocaleString("vi-VN")}
                    </p>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-[var(--muted)]">
                    <span>Khách: {customer}</span>
                    <span>{order.items?.length || 0} sản phẩm</span>
                    <span>{PAYMENT_LABEL[order.paymentMethod] || order.paymentMethod}</span>
                    <span>Thanh toán: {order.paymentStatus}</span>
                    <span className="font-semibold text-[var(--ink)]">
                      {formatPrice(order.totalPrice || 0)}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <span className="text-xs text-[var(--muted)]">Trạng thái hiện tại:</span>
                    <span className="rounded-full border border-black/10 px-3 py-1 text-xs">
                      {order.status}
                    </span>

                    <select
                      className="h-9 rounded-lg border border-black/10 px-2 text-sm"
                      defaultValue=""
                      disabled={!nextAllowed.length}
                      onChange={(e) => {
                        const value = e.target.value;
                        e.target.value = "";
                        onChangeStatus(order, value);
                      }}
                    >
                      <option value="">Đổi trạng thái...</option>
                      {nextAllowed.map((status) => (
                        <option
                          key={status}
                          value={status}
                          disabled={savingKey === `${order.id}-${status}`}
                        >
                          {status}
                        </option>
                      ))}
                    </select>

                    <Link
                      href={`/orders/${order.id}`}
                      className="text-xs font-semibold text-[var(--accent)]"
                    >
                      Xem chi tiết
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
