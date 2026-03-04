"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/format";
import {
  clearCart,
  createMomoPayment,
  createOrder,
  getCart,
  removeCartItem,
  updateCartItemQty,
} from "@/lib/api";

const EMPTY_CART = {
  items: [],
  totalQty: 0,
  totalPrice: 0,
};

export default function CartPageClient() {
  const router = useRouter();
  const [cart, setCart] = useState(EMPTY_CART);
  const [loading, setLoading] = useState(true);
  const [authRequired, setAuthRequired] = useState(false);
  const [error, setError] = useState("");
  const [busyProductId, setBusyProductId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    line1: "",
    line2: "",
    ward: "",
    district: "",
    city: "",
    province: "",
    country: "VN",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    const loadCart = async () => {
      try {
        const data = await getCart();
        if (!active) return;
        setCart(data || EMPTY_CART);
      } catch (err) {
        if (!active) return;
        if (err.status === 401) {
          setAuthRequired(true);
          setCart(EMPTY_CART);
          return;
        }
        setError(err.message || "Không thể tải giỏ hàng");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadCart();
    return () => {
      active = false;
    };
  }, []);

  const changeQty = async (productId, nextQty) => {
    if (!productId || nextQty < 1) return;

    setBusyProductId(productId);
    setError("");
    try {
      const data = await updateCartItemQty(productId, nextQty);
      setCart(data || EMPTY_CART);
    } catch (err) {
      setError(err.message || "Không thể cập nhật số lượng");
    } finally {
      setBusyProductId("");
    }
  };

  const removeItem = async (productId) => {
    if (!productId) return;

    setBusyProductId(productId);
    setError("");
    try {
      const data = await removeCartItem(productId);
      setCart(data || EMPTY_CART);
    } catch (err) {
      setError(err.message || "Không thể xóa sản phẩm");
    } finally {
      setBusyProductId("");
    }
  };

  const onCheckout = async () => {
    if (!cart.items.length) return;
    if (!address.fullName || !address.phone || !address.line1 || !address.city) {
      setError("Vui lòng nhập đầy đủ họ tên, số điện thoại, địa chỉ và thành phố");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const payload = {
        items: cart.items.map((i) => ({ product: i.productId, qty: i.qty })),
        shippingAddress: address,
        paymentMethod,
      };

      if (paymentMethod === "cod") {
        const order = await createOrder(payload);
        await clearCart();
        const nextOrderId = order?._id || order?.id;
        router.push(nextOrderId ? `/orders/${nextOrderId}` : "/orders");
        return;
      }

      const data = await createMomoPayment(payload);
      window.location.href = data.payUrl;
    } catch (err) {
      setError(err.message || "Thanh toán thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-6xl px-6 py-12">
        <div className="rounded-[32px] border border-black/5 bg-white p-8 shadow-sm">
          Đang tải giỏ hàng...
        </div>
      </div>
    );
  }

  if (authRequired) {
    return (
      <div className="mx-auto w-full max-w-6xl px-6 py-12">
        <div className="rounded-[32px] border border-black/5 bg-white p-8 shadow-sm">
          <h1 className="font-display text-2xl text-[var(--ink)]">Giỏ hàng</h1>
          <p className="mt-3 text-sm text-[var(--muted)]">
            Bạn cần đăng nhập để xem giỏ hàng.
          </p>
          <Link
            href="/login"
            className="mt-5 inline-flex rounded-full bg-[var(--ink)] px-5 py-3 text-sm font-semibold text-white"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[32px] border border-black/5 bg-white p-8 shadow-sm">
          <h1 className="font-display text-2xl text-[var(--ink)]">Giỏ hàng của bạn</h1>

          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

          {!cart.items.length ? (
            <div className="mt-6 rounded-3xl border border-dashed border-black/10 bg-[var(--surface)] p-6 text-sm text-[var(--muted)]">
              Chưa có sản phẩm trong giỏ.{" "}
              <Link href="/products" className="font-semibold text-[var(--accent)]">
                Tiếp tục mua sắm
              </Link>
              .
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {cart.items.map((item) => {
                const product = item.product || {};
                const productId = item.productId || product.id;
                const busy = busyProductId === productId;

                return (
                  <div
                    key={productId}
                    className="grid gap-4 rounded-2xl border border-black/10 p-4 sm:grid-cols-[96px_1fr_auto]"
                  >
                    <div className="rounded-2xl bg-[var(--surface)] p-2">
                      <Image
                        src={product.image || "/phone-shell.svg"}
                        alt={product.name || "Product image"}
                        width={88}
                        height={88}
                        className="mx-auto h-20 w-auto"
                      />
                    </div>

                    <div>
                      <Link
                        href={`/products/${product.slug || product.id || productId}`}
                        className="font-semibold text-[var(--ink)]"
                      >
                        {product.name || "Sản phẩm"}
                      </Link>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        Đơn giá: {formatPrice(item.unitPrice || 0)}
                      </p>
                      <div className="mt-3 inline-flex items-center gap-3 rounded-full border border-black/10 px-3 py-1">
                        <button
                          type="button"
                          onClick={() => changeQty(productId, item.qty - 1)}
                          disabled={busy || item.qty <= 1}
                          className="h-7 w-7 rounded-full border border-black/10"
                        >
                          -
                        </button>
                        <span className="min-w-6 text-center text-sm">{item.qty}</span>
                        <button
                          type="button"
                          onClick={() => changeQty(productId, item.qty + 1)}
                          disabled={busy}
                          className="h-7 w-7 rounded-full border border-black/10"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col items-end justify-between gap-2">
                      <p className="text-sm font-semibold text-[var(--ink)]">
                        {formatPrice(item.subtotal || 0)}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeItem(productId)}
                        disabled={busy}
                        className="text-xs font-semibold text-red-600"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-[32px] border border-black/5 bg-white p-8 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
            Tóm tắt đơn hàng
          </h2>
          <div className="mt-4 space-y-3 text-sm text-[var(--muted)]">
            <div className="flex items-center justify-between">
              <span>Số lượng</span>
              <span>{cart.totalQty}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Tạm tính</span>
              <span>{formatPrice(cart.totalPrice || 0)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Vận chuyển</span>
              <span>{formatPrice(0)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-black/10 pt-3 text-base font-semibold text-[var(--ink)]">
              <span>Tổng cộng</span>
              <span>{formatPrice((cart.totalPrice || 0) + 0)}</span>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Phương thức thanh toán
            </p>
            <div className="mt-3 grid gap-2 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                Tiền mặt khi nhận hàng (COD)
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="momo"
                  checked={paymentMethod === "momo"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                Ví MoMo
              </label>
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            <input
              className="h-11 rounded-xl border border-black/10 px-3 text-sm"
              placeholder="Họ và tên"
              value={address.fullName}
              onChange={(e) =>
                setAddress((prev) => ({ ...prev, fullName: e.target.value }))
              }
            />
            <input
              className="h-11 rounded-xl border border-black/10 px-3 text-sm"
              placeholder="Số điện thoại"
              value={address.phone}
              onChange={(e) =>
                setAddress((prev) => ({ ...prev, phone: e.target.value }))
              }
            />
            <input
              className="h-11 rounded-xl border border-black/10 px-3 text-sm"
              placeholder="Địa chỉ (line1)"
              value={address.line1}
              onChange={(e) =>
                setAddress((prev) => ({ ...prev, line1: e.target.value }))
              }
            />
            <input
              className="h-11 rounded-xl border border-black/10 px-3 text-sm"
              placeholder="Thành phố"
              value={address.city}
              onChange={(e) =>
                setAddress((prev) => ({ ...prev, city: e.target.value }))
              }
            />
          </div>

          <button
            type="button"
            onClick={onCheckout}
            disabled={!cart.items.length || submitting}
            className="mt-6 h-12 w-full rounded-full bg-[var(--ink)] text-sm font-semibold text-white shadow-lg shadow-black/15 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Đang xử lý..." : "Thanh toán"}
          </button>
        </div>
      </div>
    </div>
  );
}


