"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || "Đăng ký thất bại");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("authChanged"));
      router.push("/");
    } catch (err) {
      setError("Không thể kết nối server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <div className="mx-auto max-w-md rounded-[32px] border border-black/5 bg-white p-8 shadow-[0_25px_60px_rgba(15,17,26,0.15)]">
        <h1 className="font-display text-2xl text-[var(--ink)]">
          Tạo tài khoản mới
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Nhận ưu đãi và theo dõi đơn hàng dễ dàng.
        </p>
        <form className="mt-6 grid gap-4" onSubmit={onSubmit}>
          <div className="grid gap-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Họ và tên
            </label>
            <input
              className="h-12 rounded-2xl border border-black/10 px-4 text-sm"
              placeholder="Nguyễn Văn A"
              type="text"
              name="name"
              value={form.name}
              onChange={onChange}
              required
            />
          </div>
          <div className="grid gap-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Email
            </label>
            <input
              className="h-12 rounded-2xl border border-black/10 px-4 text-sm"
              placeholder="you@email.com"
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              required
            />
          </div>
          <div className="grid gap-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Số điện thoại
            </label>
            <input
              className="h-12 rounded-2xl border border-black/10 px-4 text-sm"
              placeholder="0900000000"
              type="tel"
              name="phone"
              value={form.phone}
              onChange={onChange}
            />
          </div>
          <div className="grid gap-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Mật khẩu
            </label>
            <input
              className="h-12 rounded-2xl border border-black/10 px-4 text-sm"
              placeholder="••••••••"
              type="password"
              name="password"
              value={form.password}
              onChange={onChange}
              required
            />
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button
            className="mt-2 h-12 rounded-full bg-[var(--ink)] text-sm font-semibold text-white shadow-lg shadow-black/15"
            disabled={loading}
          >
            {loading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
          </button>
          <p className="text-center text-xs text-[var(--muted)]">
            Đã có tài khoản?{" "}
            <Link className="text-[var(--accent)]" href="/login">
              Đăng nhập
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
