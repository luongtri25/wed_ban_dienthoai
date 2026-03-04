"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/format";
import { getOrders } from "@/lib/api";

const PAYMENT_LABEL = {
  cod: "Tiền mặt (COD)",
  momo: "Ví MoMo",
};

export default function OrdersPageClient() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authRequired, setAuthRequired] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadOrders = async () => {
      try {
        const data = await getOrders();
        if (!active) return;
        setOrders(data);
      } catch (err) {
        if (!active) return;
        if (err.status === 401) {
          setAuthRequired(true);
          return;
        }
        setError(err.message || "Không thể tải danh sách đơn hàng");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadOrders();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-6xl px-6 py-12">
        <div className="rounded-3xl border border-black/10 bg-white p-8">
          Đang tải đơn hàng...
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

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <h1 className="font-display text-3xl text-[var(--ink)]">Đơn hàng của bạn</h1>
      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

      {!orders.length ? (
        <div className="mt-6 rounded-3xl border border-black/10 bg-white p-8 text-sm text-[var(--muted)]">
          Bạn chưa có đơn hàng nào.{" "}
          <Link href="/products" className="font-semibold text-[var(--accent)]">
            Mua sắm ngay
          </Link>
          .
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block rounded-2xl border border-black/10 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-[var(--ink)]">Mã đơn: {order.id}</p>
                <p className="text-sm text-[var(--muted)]">
                  {new Date(order.createdAt).toLocaleString("vi-VN")}
                </p>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-[var(--muted)]">
                <span>{order.items?.length || 0} sản phẩm</span>
                <span>{PAYMENT_LABEL[order.paymentMethod] || order.paymentMethod}</span>
                <span>Trạng thái: {order.status}</span>
                <span>Thanh toán: {order.paymentStatus}</span>
                <span className="font-semibold text-[var(--ink)]">
                  {formatPrice(order.totalPrice || 0)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

