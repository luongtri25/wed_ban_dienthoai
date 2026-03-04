"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

export default function ProductImageGallery({ images = [], productName = "Product" }) {
  const safeImages = useMemo(() => {
    const list = Array.isArray(images) ? images.filter(Boolean) : [];
    return list.length ? list.slice(0, 3) : ["/phone-shell.svg"];
  }, [images]);

  const [activeIndex, setActiveIndex] = useState(0);
  const normalizedIndex = activeIndex < safeImages.length ? activeIndex : 0;
  const currentImage = safeImages[normalizedIndex];

  return (
    <>
      <div className="mt-8 rounded-3xl bg-[var(--surface)] p-8">
        <Image
          src={currentImage}
          alt={productName}
          width={260}
          height={420}
          className="mx-auto h-64 w-auto drop-shadow-[0_30px_40px_rgba(15,17,26,0.3)]"
        />
      </div>

      {safeImages.length > 1 ? (
        <div className="mt-4 grid grid-cols-3 gap-3">
          {safeImages.map((image, index) => {
            const isActive = index === normalizedIndex;
            return (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`rounded-2xl border p-3 transition ${
                  isActive
                    ? "border-[var(--ink)] bg-white"
                    : "border-black/10 bg-[var(--surface)] hover:border-black/30"
                }`}
                aria-label={`Xem ảnh ${index + 1}`}
              >
                <Image
                  src={image}
                  alt={`${productName} ${index + 1}`}
                  width={120}
                  height={120}
                  className="mx-auto h-16 w-auto object-contain"
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </>
  );
}
