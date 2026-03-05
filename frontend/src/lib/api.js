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

const normalizeBrand = (brand) => {
  const rawId = brand?._id ?? brand?.id ?? "";
  const id = typeof rawId === "string" ? rawId : rawId?.toString?.() || "";
  return { ...brand, id };
};

const normalizeCategory = (category) => {
  const rawId = category?._id ?? category?.id ?? "";
  const id = typeof rawId === "string" ? rawId : rawId?.toString?.() || "";
  return {
    ...category,
    id,
    description: category.description || "Chọn máy theo nhu cầu.",
  };
};

const normalizeText = (value = "") =>
  value
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

export async function apiGet(path, { revalidate } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    cache: revalidate ? undefined : "no-store",
    next: revalidate ? { revalidate } : undefined,
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export const getProducts = async ({ brand, category, accessory } = {}) => {
  const qs = new URLSearchParams();
  if (brand) qs.set("brand", brand);
  if (category) qs.set("category", category);
  if (accessory) qs.set("accessory", "1");

  const path = qs.toString() ? `/api/products?${qs}` : "/api/products";
  const data = await apiGet(path);
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

export const getBrands = async () => {
  const data = await apiGet("/api/brands");
  if (!Array.isArray(data)) return [];

  const unique = new Map();
  for (const brand of data.map(normalizeBrand)) {
    const key = normalizeText(brand.name);
    if (!unique.has(key)) unique.set(key, brand);
  }

  return Array.from(unique.values());
};

export const getCategories = async () => {
  const data = await apiGet("/api/categories");
  return Array.isArray(data) ? data.map(normalizeCategory) : [];
};

const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") : null;

export const uploadProductImage = async (file) => {
  const token = getToken();
  if (!token) {
    const err = new Error("Vui lòng đăng nhập");
    err.status = 401;
    throw err;
  }

  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`${API_BASE}/api/products/upload-image`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || `API error ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return data;
};

const apiAuth = async (path, { method = "GET", body } = {}) => {
  const token = getToken();
  if (!token) {
    const err = new Error("Vui lòng đăng nhập");
    err.status = 401;
    throw err;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || `API error ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return data;
};

export const getCart = () => apiAuth("/api/cart");
export const addCartItem = (productId, qty = 1) =>
  apiAuth("/api/cart/items", { method: "POST", body: { productId, qty } });
export const updateCartItemQty = (productId, qty) =>
  apiAuth(`/api/cart/items/${productId}`, { method: "PUT", body: { qty } });
export const removeCartItem = (productId) =>
  apiAuth(`/api/cart/items/${productId}`, { method: "DELETE" });
export const clearCart = () => apiAuth("/api/cart", { method: "DELETE" });

export const createOrder = (payload) =>
  apiAuth("/api/orders", { method: "POST", body: payload });

export const createMomoPayment = (payload) =>
  apiAuth("/api/payments/momo/create", { method: "POST", body: payload });

export const createProduct = (payload) =>
  apiAuth("/api/products", { method: "POST", body: payload });
export const updateProduct = (id, payload) =>
  apiAuth(`/api/products/${id}`, { method: "PUT", body: payload });
export const deleteProduct = (id) =>
  apiAuth(`/api/products/${id}`, { method: "DELETE" });

export const createBrand = (payload) =>
  apiAuth("/api/brands", { method: "POST", body: payload });
export const updateBrand = (id, payload) =>
  apiAuth(`/api/brands/${id}`, { method: "PUT", body: payload });
export const deleteBrand = (id) =>
  apiAuth(`/api/brands/${id}`, { method: "DELETE" });

export const createCategory = (payload) =>
  apiAuth("/api/categories", { method: "POST", body: payload });
export const updateCategory = (id, payload) =>
  apiAuth(`/api/categories/${id}`, { method: "PUT", body: payload });
export const deleteCategory = (id) =>
  apiAuth(`/api/categories/${id}`, { method: "DELETE" });

export const updateOrderStatus = (orderId, status) =>
  apiAuth(`/api/orders/${orderId}/status`, {
    method: "PATCH",
    body: { status },
  });

export const cancelMyOrder = (orderId) =>
  apiAuth(`/api/orders/${orderId}/cancel`, {
    method: "PATCH",
  });

const normalizeOrder = (order) => {
  if (!order) return null;
  const rawId = order._id ?? order.id ?? "";
  const id = typeof rawId === "string" ? rawId : rawId?.toString?.() || "";

  return {
    ...order,
    id,
    items: Array.isArray(order.items)
      ? order.items.map((item) => {
          const rawProductId = item.product?._id ?? item.product ?? "";
          const productId =
            typeof rawProductId === "string"
              ? rawProductId
              : rawProductId?.toString?.() || "";

          return {
            ...item,
            productId,
          };
        })
      : [],
  };
};

export const getOrders = async () => {
  const data = await apiAuth("/api/orders");
  return Array.isArray(data) ? data.map(normalizeOrder) : [];
};

export const getOrderById = async (id) => {
  if (!id) return null;
  const data = await apiAuth(`/api/orders/${id}`);
  return normalizeOrder(data);
};
