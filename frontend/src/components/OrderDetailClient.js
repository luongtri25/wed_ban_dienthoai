"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/format";
import { getOrderById } from "@/lib/api";

const PAYMENT_LABEL = {
  cod: "Tiền mặt (COD)",
  momo: "Ví MoMo",
};

export default function OrderDetailClient({ orderId }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authRequired, setAuthRequired] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadOrder = async () => {
      try {
        const data = await getOrderById(orderId);
        if (!active) return;
        setOrder(data);
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
          <Link href="/orders" className="mt-4 inline-flex text-sm font-semibold text-[var(--accent)]">
            Quay lại danh sách đơn hàng
          </Link>
        </div>
      </div>
    );
  }

  const address = order.shippingAddress || {};

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
            Thông tin thanh toán
          </h2>
          <div className="mt-4 space-y-2 text-sm text-[var(--muted)]">
            <p>Phương thức: {PAYMENT_LABEL[order.paymentMethod] || order.paymentMethod}</p>
            <p>Trạng thái đơn: {order.status}</p>
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

