"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addCartItem } from "@/lib/api";

export default function AddToCartButton({ productId, disabled }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onAdd = async () => {
    if (!productId) {
      alert("Không tìm thấy sản phẩm");
      return;
    }

    setLoading(true);
    try {
      await addCartItem(productId, 1);
      router.push("/cart");
    } catch (err) {
      if (err.status === 401) router.push("/login");
      else alert(err.message || "Không thể thêm vào giỏ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={onAdd}
      disabled={disabled || loading}
      className="rounded-full bg-[var(--ink)] px-6 py-3 text-sm font-semibold text-white"
    >
      {loading ? "Đang thêm..." : "Thêm vào giỏ"}
    </button>
  );
}

