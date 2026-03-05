"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import { siteConfig } from "@/lib/site";

const parseUser = (raw) => {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const readUserRaw = () => localStorage.getItem("user");

const subscribeAuth = (callback) => {
  const onAuthChanged = () => callback();
  const onStorage = (event) => {
    if (!event || event.key === "user") callback();
  };

  window.addEventListener("authChanged", onAuthChanged);
  window.addEventListener("storage", onStorage);

  return () => {
    window.removeEventListener("authChanged", onAuthChanged);
    window.removeEventListener("storage", onStorage);
  };
};

const getAuthSnapshot = () => readUserRaw();
const getAuthServerSnapshot = () => null;

export default function SiteHeader() {
  const userRaw = useSyncExternalStore(
    subscribeAuth,
    getAuthSnapshot,
    getAuthServerSnapshot
  );
  const user = useMemo(() => parseUser(userRaw), [userRaw]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("authChanged"));
  };

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-[var(--bg)]/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--ink)] text-sm font-semibold text-white shadow-lg shadow-black/15">
            T
          </span>
          <div className="leading-tight">
            <p className="font-display text-lg text-[var(--ink)]">{siteConfig.name}</p>
            <p className="text-xs text-[var(--muted)]">Cửa hàng số 1 Việt Nam</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-[var(--muted)] md:flex">
          <Link className="hover:text-[var(--ink)]" href="/products">
            Sản phẩm
          </Link>
          <Link className="hover:text-[var(--ink)]" href="/products">
            Ưu đãi
          </Link>
          <Link className="hover:text-[var(--ink)]" href="/products">
            Phụ kiện
          </Link>
          <Link className="hover:text-[var(--ink)]" href="/products">
            So sánh
          </Link>
          {user ? (
            <Link className="hover:text-[var(--ink)]" href="/orders">
              Đơn hàng
            </Link>
          ) : null}
          {user?.role === "admin" ? (
            <Link className="hover:text-[var(--ink)]" href="/admin/products">
              Admin
            </Link>
          ) : null}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                href="/orders"
                className="rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-[var(--ink)]"
              >
                Đơn hàng
              </Link>
              <span className="rounded-full border border-black/10 px-4 py-2 text-sm text-[var(--ink)]">
                Xin chào, {user.name}
              </span>
              <button
                onClick={logout}
                className="rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-[var(--ink)]"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-[var(--ink)] transition hover:border-black/30"
            >
              Đăng nhập
            </Link>
          )}

          <Link
            href="/cart"
            className="rounded-full bg-[var(--ink)] px-4 py-2 text-sm font-medium text-white shadow-lg shadow-black/15 transition hover:-translate-y-0.5"
          >
            Giỏ hàng
          </Link>
        </div>
      </div>
    </header>
  );
}
