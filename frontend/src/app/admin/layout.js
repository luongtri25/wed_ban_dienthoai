"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) {
      router.replace("/login");
      return;
    }

    try {
      const user = JSON.parse(raw);
      if (user?.role !== "admin") {
        router.replace("/");
        return;
      }
      setAllowed(true);
    } catch {
      router.replace("/login");
    }
  }, [router]);

  if (!allowed) return null;

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <nav className="mb-6 flex gap-4 text-sm">
        <Link href="/admin/products">Products</Link>
        <Link href="/admin/brands">Brands</Link>
        <Link href="/admin/categories">Categories</Link>
        <Link href="/admin/orders">Orders</Link>
      </nav>
      {children}
    </div>
  );
}
