"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/format";
import { cancelMyOrder, getOrderById } from "@/lib/api";

const PAYMENT_LABEL = {
  cod: "Tiền mặt (COD)",
  momo: "Ví MoMo",
};

const STATUS_STEPS = ["pending", "processing", "shipped", "delivered"];

const STATUS_LABEL = {
  pending: "Chờ xác nhận",
  processing: "Đang xử lý",
  shipped: "Đang giao hàng",
  delivered: "Đã giao thành công",
  cancelled: "Đã hủy",
};

const STATUS_NOTE = {
  pending: "Hệ thống đã ghi nhận đơn hàng của bạn.",
  processing: "Shop đang chuẩn bị hàng để giao.",
  shipped: "Đơn vị vận chuyển đang giao hàng.",
  delivered: "Bạn đã nhận được hàng thành công.",
};

const canCancelStatus = (status) => status === "pending" || status === "processing";

export default function OrderDetailClient({ orderId }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authRequired, setAuthRequired] = useState(false);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState("");

  useEffect(() => {
    let active = true;

    const loadOrder = async () => {
      try {
        const data = await getOrderById(orderId);
        if (!active) return;
        setOrder(data);
        setAuthRequired(false);
      } catch (err) {
        if (!active) return;
        if (err.status === 401) {
          setAuthRequired(true);
          return;
        }
        setError(err.message || "Không thể tải chi tiết đơn hàng");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadOrder();
    return () => {
      active = false;
    };
  }, [orderId]);

  const refreshOrder = async () => {
    setActionLoading("refresh");
    setError("");
    try {
      const data = await getOrderById(orderId);
      setOrder(data);
    } catch (err) {
      if (err.status === 401) {
        setAuthRequired(true);
      } else {
        setError(err.message || "Không thể làm mới trạng thái đơn");
      }
    } finally {
      setActionLoading("");
    }
  };

  const cancelOrder = async () => {
    if (!order?.id || !canCancelStatus(order?.status)) return;
    if (!window.confirm("Bạn chắc chắn muốn hủy đơn hàng này?")) return;

    setActionLoading("cancel");
    setError("");
    try {
      const data = await cancelMyOrder(order.id);
      setOrder((prev) => ({ ...prev, ...data }));
    } catch (err) {
      setError(err.message || "Không thể hủy đơn hàng");
    } finally {
      setActionLoading("");
    }
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-6xl px-6 py-12">
        <div className="rounded-3xl border border-black/10 bg-white p-8">
          Đang tải chi tiết đơn hàng...
        </div>
      </div>
    );
  }

  if (authRequired) {
    return (
      <div className="mx-auto w-full max-w-6xl px-6 py-12">
        <div className="rounded-3xl border border-black/10 bg-white p-8">
          <p className="text-sm text-[var(--muted)]">
            Bạn cần đăng nhập để xem đơn hàng.
          </p>
          <Link
            href="/login"
            className="mt-4 inline-flex rounded-full bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-white"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  if (!order || error) {
    return (
      <div className="mx-auto w-full max-w-6xl px-6 py-12">
        <div className="rounded-3xl border border-black/10 bg-white p-8">
          <p className="text-sm text-red-600">{error || "Không tìm thấy đơn hàng"}</p>
          <Link
            href="/orders"
            className="mt-4 inline-flex text-sm font-semibold text-[var(--accent)]"
          >
            Quay lại danh sách đơn hàng
          </Link>
        </div>
      </div>
    );
  }

  const address = order.shippingAddress || {};
  const isCancelled = order.status === "cancelled";
  const currentStepIndex = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl text-[var(--ink)]">Chi tiết đơn hàng</h1>
        <Link href="/orders" className="text-sm font-semibold text-[var(--accent)]">
          Danh sách đơn hàng
        </Link>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
          <p className="text-sm text-[var(--muted)]">Mã đơn: {order.id}</p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Tạo lúc: {new Date(order.createdAt).toLocaleString("vi-VN")}
          </p>

          <div className="mt-6 space-y-4">
            {(order.items || []).map((item, idx) => (
              <div
                key={`${item.productId || idx}-${idx}`}
                className="grid gap-4 rounded-2xl border border-black/10 p-4 sm:grid-cols-[84px_1fr_auto]"
              >
                <div className="rounded-xl bg-[var(--surface)] p-2">
                  <Image
                    src={item.image || "/phone-shell.svg"}
                    alt={item.name || "Order item"}
                    width={80}
                    height={80}
                    className="mx-auto h-16 w-auto"
                  />
                </div>
                <div>
                  <p className="font-semibold text-[var(--ink)]">{item.name}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    Đơn giá: {formatPrice(item.price || 0)}
                  </p>
                  <p className="mt-1 text-sm text-[var(--muted)]">Số lượng: {item.qty}</p>
                </div>
                <p className="text-sm font-semibold text-[var(--ink)]">
                  {formatPrice((item.price || 0) * (item.qty || 0))}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
            Theo dõi đơn hàng
          </h2>

          <div className="mt-4 space-y-3 rounded-2xl bg-[var(--surface)]/60 p-3">
            {STATUS_STEPS.map((step, index) => {
              const done = !isCancelled && currentStepIndex >= index;
              const active = !isCancelled && currentStepIndex === index;
              const stepClass = active
                ? "border-[var(--accent)] bg-[var(--accent-soft)]/70 shadow-sm"
                : done
                ? "border-emerald-200 bg-emerald-50/80"
                : "border-black/10 bg-white";

              return (
                <div key={step} className={`rounded-2xl border px-3 py-3 ${stepClass}`}>
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border ${
                        done
                          ? "border-[var(--accent)] bg-white"
                          : "border-black/20 bg-white"
                      }`}
                    >
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p
                          className={`text-sm font-semibold ${
                            active
                              ? "text-[var(--ink)]"
                              : done
                              ? "text-emerald-700"
                              : "text-[var(--muted)]"
                          }`}
                        >
                          {STATUS_LABEL[step]}
                        </p>
                        {active ? (
                          <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--accent)]">
                            Hiện tại
                          </span>
                        ) : null}
                      </div>
                      <p
                        className={`mt-1 text-xs ${
                          active ? "text-[var(--ink)]/80" : "text-[var(--muted)]"
                        }`}
                      >
                        {STATUS_NOTE[step]}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

            {isCancelled ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">
                Đơn hàng đã bị hủy.
              </div>
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={refreshOrder}
              disabled={actionLoading === "refresh"}
              className="rounded-full border border-black/10 px-3 py-1.5 text-xs font-semibold text-[var(--ink)]"
            >
              {actionLoading === "refresh" ? "Đang làm mới..." : "Làm mới trạng thái"}
            </button>

            {canCancelStatus(order.status) ? (
              <button
                type="button"
                onClick={cancelOrder}
                disabled={actionLoading === "cancel"}
                className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600"
              >
                {actionLoading === "cancel" ? "Đang hủy..." : "Hủy đơn"}
              </button>
            ) : null}
          </div>

          <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
            Thông tin thanh toán
          </h2>
          <div className="mt-4 space-y-2 text-sm text-[var(--muted)]">
            <p>Phương thức: {PAYMENT_LABEL[order.paymentMethod] || order.paymentMethod}</p>
            <p>Trạng thái đơn: {STATUS_LABEL[order.status] || order.status}</p>
            <p>Trạng thái thanh toán: {order.paymentStatus}</p>
            <p className="font-semibold text-[var(--ink)]">
              Tổng tiền: {formatPrice(order.totalPrice || 0)}
            </p>
          </div>

          <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
            Địa chỉ giao hàng
          </h2>
          <div className="mt-4 space-y-1 text-sm text-[var(--muted)]">
            <p className="font-semibold text-[var(--ink)]">{address.fullName || "-"}</p>
            <p>{address.phone || "-"}</p>
            <p>{address.line1 || "-"}</p>
            <p>
              {[address.ward, address.district, address.city].filter(Boolean).join(", ") || "-"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
