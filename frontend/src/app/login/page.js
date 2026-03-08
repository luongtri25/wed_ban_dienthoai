"use client";

import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleScriptLoaded, setGoogleScriptLoaded] = useState(false);
  const [error, setError] = useState("");

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || "Dang nhap that bai");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("authChanged"));
      router.push("/");
    } catch {
      setError("Khong the ket noi server");
    } finally {
      setLoading(false);
    }
  };

  const onGoogleCredential = useCallback(
    async (idToken) => {
      if (!idToken) {
        setError("Khong lay duoc token Google");
        return;
      }

      setError("");
      setGoogleLoading(true);

      try {
        const res = await fetch(`${API_BASE}/api/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data.message || "Dang nhap Google that bai");
          return;
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        window.dispatchEvent(new Event("authChanged"));
        router.push("/");
      } catch {
        setError("Khong the ket noi server");
      } finally {
        setGoogleLoading(false);
      }
    },
    [router]
  );

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !googleScriptLoaded) return;
    if (!window.google?.accounts?.id) return;

    const container = document.getElementById("google-signin-button");
    if (!container) return;

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      ux_mode: "popup",
      callback: (response) => onGoogleCredential(response.credential),
    });

    container.innerHTML = "";
    window.google.accounts.id.renderButton(container, {
      type: "standard",
      shape: "pill",
      theme: "outline",
      text: "continue_with",
      size: "large",
      logo_alignment: "left",
      width: 320,
    });
  }, [googleScriptLoaded, onGoogleCredential]);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setGoogleScriptLoaded(true)}
      />

      <div className="mx-auto max-w-md rounded-[32px] border border-black/5 bg-white p-8 shadow-[0_25px_60px_rgba(15,17,26,0.15)]">
        <h1 className="font-display text-2xl text-[var(--ink)]">Chao mung tro lai</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Dang nhap de quan ly don hang va uu dai.
        </p>

        <form className="mt-6 grid gap-4" onSubmit={onSubmit}>
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
              Mat khau
            </label>
            <input
              className="h-12 rounded-2xl border border-black/10 px-4 text-sm"
              placeholder="********"
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
            {loading ? "Dang dang nhap..." : "Dang nhap"}
          </button>

          <div className="my-2 flex items-center gap-3 text-xs text-[var(--muted)]">
            <span className="h-px flex-1 bg-black/10" />
            <span>hoac</span>
            <span className="h-px flex-1 bg-black/10" />
          </div>

          {GOOGLE_CLIENT_ID ? (
            <div className="flex flex-col items-center gap-2">
              <div id="google-signin-button" />
              {googleLoading ? (
                <p className="text-xs text-[var(--muted)]">Dang xac thuc Google...</p>
              ) : null}
            </div>
          ) : (
            <p className="text-center text-xs text-amber-600">
              Chua cau hinh NEXT_PUBLIC_GOOGLE_CLIENT_ID
            </p>
          )}

          <p className="text-center text-xs text-[var(--muted)]">
            Chua co tai khoan?{" "}
            <Link className="text-[var(--accent)]" href="/register">
              Dang ky
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
