import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-center px-6 py-24 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
        404
      </p>
      <h1 className="mt-4 font-display text-3xl text-[var(--ink)]">
        Không tìm thấy trang
      </h1>
      <p className="mt-3 max-w-md text-sm text-[var(--muted)]">
        Trang bạn tìm không tồn tại hoặc đã được chuyển đi nơi khác.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-full bg-[var(--ink)] px-6 py-3 text-sm font-semibold text-white"
      >
        Quay về trang chủ
      </Link>
    </div>
  );
}

