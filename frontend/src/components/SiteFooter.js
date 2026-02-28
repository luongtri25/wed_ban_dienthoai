import Link from "next/link";
import { siteConfig } from "@/lib/site";

export default function SiteFooter() {
  return (
    <footer className="border-t border-black/5 bg-[var(--ink)] text-white">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <p className="font-display text-xl">{siteConfig.name}</p>
          <p className="mt-4 text-sm text-white/70">
            Trải nghiệm mua điện thoại chuẩn SSR: tốc độ, rõ ràng, minh bạch giá.
          </p>
          <div className="mt-6 flex items-center gap-3 text-xs text-white/60">
            <span className="rounded-full bg-white/10 px-3 py-1">Hotline 1900 9999</span>
            <span className="rounded-full bg-white/10 px-3 py-1">support@nebula.vn</span>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-white/80">
            Danh mục
          </p>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            <li>
              <Link href="/products">Flagship</Link>
            </li>
            <li>
              <Link href="/products">Gaming</Link>
            </li>
            <li>
              <Link href="/products">Giá tốt</Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-white/80">
            Dịch vụ
          </p>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            <li>
              <Link href="/products">Thu cũ đổi mới</Link>
            </li>
            <li>
              <Link href="/products">Trả góp 0%</Link>
            </li>
            <li>
              <Link href="/products">Bảo hành 24 tháng</Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-white/80">
            Cập nhật
          </p>
          <p className="mt-4 text-sm text-white/70">
            Đăng ký nhận ưu đãi và tin mở bán mới.
          </p>
          <form className="mt-4 flex gap-2">
            <input
              className="h-10 flex-1 rounded-full border border-white/20 bg-transparent px-4 text-sm text-white placeholder:text-white/40"
              placeholder="Email của bạn"
              type="email"
            />
            <button className="h-10 rounded-full bg-white px-4 text-sm font-medium text-[var(--ink)]">
              Gửi
            </button>
          </form>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        © 2026 {siteConfig.name}. All rights reserved.
      </div>
    </footer>
  );
}

