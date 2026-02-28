const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const normalizeProduct = (product) => {
  if (!product) return null;
  const rawId = product._id ?? product.id ?? "";
  const id = typeof rawId === "string" ? rawId : rawId?.toString?.() || "";
  const description = product.description || "";
  const short =
    product.short ||
    (description
      ? `${description.slice(0, 80)}${description.length > 80 ? "..." : ""}`
      : "");
  const image =
    product.image ||
    (Array.isArray(product.images) ? product.images[0] : null) ||
    "/phone-shell.svg";

  return {
    ...product,
    id,
    slug: product.slug || id,
    short,
    badge: product.badge || "Sản phẩm",
    image,
    specs: product.specs || {},
  };
};

const normalizeCategory = (category) => ({
  ...category,
  description: category.description || "Chọn máy theo nhu cầu.",
});

export async function apiGet(path, { revalidate } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    cache: revalidate ? undefined : "no-store",
    next: revalidate ? { revalidate } : undefined,
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export const getProducts = async () => {
  const data = await apiGet("/api/products");
  return Array.isArray(data) ? data.map(normalizeProduct) : [];
};

export const getProduct = async (slugOrId) => {
  if (!slugOrId) return null;
  const isObjectId = /^[a-fA-F0-9]{24}$/.test(slugOrId);
  const path = isObjectId
    ? `/api/products/${slugOrId}`
    : `/api/products/slug/${encodeURIComponent(slugOrId)}`;

  try {
    const data = await apiGet(path);
    return normalizeProduct(data);
  } catch {
    return null;
  }
};

export const getCategories = async () => {
  const data = await apiGet("/api/categories");
  return Array.isArray(data) ? data.map(normalizeCategory) : [];
};
