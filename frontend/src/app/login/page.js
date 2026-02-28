import Link from "next/link";

export const metadata = {
  title: "Đăng nhập",
  description: "Đăng nhập để theo dõi đơn hàng và ưu đãi cá nhân.",
};

export default function LoginPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <div className="mx-auto max-w-md rounded-[32px] border border-black/5 bg-white p-8 shadow-[0_25px_60px_rgba(15,17,26,0.15)]">
        <h1 className="font-display text-2xl text-[var(--ink)]">
          Chào mừng trở lại
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Đăng nhập để quản lý đơn hàng và ưu đãi.
        </p>
        <form className="mt-6 grid gap-4">
          <div className="grid gap-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Email
            </label>
            <input
              className="h-12 rounded-2xl border border-black/10 px-4 text-sm"
              placeholder="you@email.com"
              type="email"
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
            />
          </div>
          <button className="mt-2 h-12 rounded-full bg-[var(--ink)] text-sm font-semibold text-white shadow-lg shadow-black/15">
            Đăng nhập
          </button>
          <p className="text-center text-xs text-[var(--muted)]">
            Chưa có tài khoản?{" "}
            <Link className="text-[var(--accent)]" href="/register">
              Đăng ký
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

