"use client";

import { useState } from "react";

export default function ProductDescription({ text = "", maxChars = 220 }) {
  const content = String(text || "").trim();
  const canToggle = content.length > maxChars;
  const [expanded, setExpanded] = useState(false);

  if (!content) {
    return (
      <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
        Mô tả sản phẩm đang được cập nhật.
      </p>
    );
  }

  const displayText =
    expanded || !canToggle
      ? content
      : `${content.slice(0, maxChars).trimEnd()}...`;

  return (
    <div className="mt-3">
      <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--muted)]">
        {displayText}
      </p>
      {canToggle ? (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="mt-2 text-xs font-semibold text-[var(--accent)]"
        >
          {expanded ? "Thu gọn" : "Xem thêm"}
        </button>
      ) : null}
    </div>
  );
}
