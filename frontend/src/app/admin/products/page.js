"use client";

import { useEffect, useState } from "react";
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
  uploadProductImage,
} from "@/lib/api";

const createEmptyForm = () => ({
  id: "",
  name: "",
  price: "",
  salePrice: "",
  stock: "0",
  description: "",
  imageUrls: ["", "", ""],
  isActive: true,
});

const normalizeImageUrls = (images = [], fallback = "") => {
  const picked = Array.isArray(images) ? images.filter(Boolean).slice(0, 3) : [];
  if (!picked.length && fallback) picked.push(fallback);
  return [picked[0] || "", picked[1] || "", picked[2] || ""];
};

const cleanImageUrls = (imageUrls = []) =>
  imageUrls.map((url) => String(url || "").trim()).filter(Boolean).slice(0, 3);

export default function AdminProductsPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(createEmptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const loadItems = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getProducts();
      setItems(data);
    } catch (err) {
      setError(err.message || "Khong the tai danh sach san pham");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const setImageUrlAt = (index, value) => {
    setForm((prev) => {
      const next = [...prev.imageUrls];
      next[index] = value;
      return { ...prev, imageUrls: next };
    });
  };

  const onUploadImages = async (e) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;

    const existingCount = cleanImageUrls(form.imageUrls).length;
    const remainingSlots = Math.max(0, 3 - existingCount);
    const files = selected.slice(0, remainingSlots);

    if (!files.length) {
      setError("Toi da 3 anh cho moi san pham");
      e.target.value = "";
      return;
    }

    setUploading(true);
    setError("");
    try {
      const uploaded = [];
      for (const file of files) {
        const data = await uploadProductImage(file);
        if (data?.url) uploaded.push(data.url);
      }

      setForm((prev) => {
        const next = [...prev.imageUrls];
        for (const url of uploaded) {
          const emptyIndex = next.findIndex((item) => !String(item || "").trim());
          if (emptyIndex === -1) break;
          next[emptyIndex] = url;
        }
        return { ...prev, imageUrls: next };
      });
    } catch (err) {
      setError(err.message || "Upload anh that bai");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const resetForm = () => setForm(createEmptyForm());

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        name: form.name.trim(),
        price: Number(form.price),
        stock: Number(form.stock || 0),
        description: form.description || "",
        isActive: !!form.isActive,
      };

      if (form.salePrice !== "") payload.salePrice = Number(form.salePrice);

      const images = cleanImageUrls(form.imageUrls);
      if (images.length) payload.images = images;
      else if (form.id) payload.images = [];

      if (form.id) {
        await updateProduct(form.id, payload);
      } else {
        await createProduct(payload);
      }

      resetForm();
      await loadItems();
    } catch (err) {
      setError(err.message || "Khong the luu san pham");
    } finally {
      setSaving(false);
    }
  };

  const onEdit = (item) => {
    setForm({
      id: item.id || item._id || "",
      name: item.name || "",
      price: String(item.price ?? ""),
      salePrice: item.salePrice != null ? String(item.salePrice) : "",
      stock: String(item.stock ?? 0),
      description: item.description || "",
      imageUrls: normalizeImageUrls(item.images, item.image),
      isActive: item.isActive !== false,
    });
  };

  const onDelete = async (id) => {
    if (!window.confirm("Xoa san pham nay?")) return;
    try {
      await deleteProduct(id);
      await loadItems();
    } catch (err) {
      setError(err.message || "Khong the xoa san pham");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl text-[var(--ink)]">Admin - Products</h1>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <form onSubmit={onSubmit} className="grid gap-3 rounded-2xl border border-black/10 bg-white p-4">
        <input
          name="name"
          value={form.name}
          onChange={onChange}
          placeholder="Ten san pham"
          className="h-10 rounded-xl border border-black/10 px-3 text-sm"
          required
        />
        <input
          name="price"
          value={form.price}
          onChange={onChange}
          placeholder="Gia"
          type="number"
          min="0"
          className="h-10 rounded-xl border border-black/10 px-3 text-sm"
          required
        />
        <input
          name="salePrice"
          value={form.salePrice}
          onChange={onChange}
          placeholder="Gia khuyen mai (optional)"
          type="number"
          min="0"
          className="h-10 rounded-xl border border-black/10 px-3 text-sm"
        />
        <input
          name="stock"
          value={form.stock}
          onChange={onChange}
          placeholder="Ton kho"
          type="number"
          min="0"
          className="h-10 rounded-xl border border-black/10 px-3 text-sm"
        />
        <textarea
          name="description"
          value={form.description}
          onChange={onChange}
          placeholder="Mo ta"
          className="rounded-xl border border-black/10 px-3 py-2 text-sm"
          rows={3}
        />

        <div className="grid gap-3 rounded-xl border border-black/10 p-3">
          <label className="text-sm font-medium text-[var(--ink)]">Anh san pham (toi da 3)</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={onUploadImages}
            className="block w-full text-sm"
          />
          {uploading ? (
            <p className="text-xs text-[var(--muted)]">Dang upload anh...</p>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-3">
            {form.imageUrls.map((url, index) => (
              <div key={index} className="space-y-2">
                <input
                  value={url}
                  onChange={(e) => setImageUrlAt(index, e.target.value)}
                  placeholder={`/productImg/image-${index + 1}.jpg`}
                  className="h-10 w-full rounded-xl border border-black/10 px-3 text-sm"
                />
                {url ? (
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="h-20 w-full rounded-lg border border-black/10 object-cover"
                  />
                ) : (
                  <div className="grid h-20 w-full place-items-center rounded-lg border border-dashed border-black/10 text-xs text-[var(--muted)]">
                    Chua co anh
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isActive" checked={form.isActive} onChange={onChange} />
          Dang kinh doanh
        </label>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving || uploading}
            className="rounded-full bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Dang luu..." : form.id ? "Cap nhat" : "Tao moi"}
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="rounded-full border border-black/10 px-4 py-2 text-sm"
          >
            Reset
          </button>
        </div>
      </form>

      <div className="rounded-2xl border border-black/10 bg-white p-4">
        {loading ? (
          <p className="text-sm text-[var(--muted)]">Dang tai...</p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const id = item.id || item._id;
              const images = normalizeImageUrls(item.images, item.image).filter(Boolean);

              return (
                <div
                  key={id}
                  className="flex items-center justify-between rounded-xl border border-black/10 px-3 py-2"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      {(images.length ? images : ["/phone-shell.svg"]).slice(0, 3).map((image, idx) => (
                        <img
                          key={`${id}-${idx}`}
                          src={image}
                          alt={item.name || "Product"}
                          className="h-10 w-10 rounded-lg border border-black/10 object-cover"
                        />
                      ))}
                    </div>
                    <div>
                      <p className="font-semibold text-[var(--ink)]">{item.name}</p>
                      <p className="text-xs text-[var(--muted)]">
                        Gia: {item.price} | Ton: {item.stock}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit(item)}
                      className="rounded-full border border-black/10 px-3 py-1 text-xs"
                    >
                      Sua
                    </button>
                    <button
                      onClick={() => onDelete(id)}
                      className="rounded-full border border-red-200 px-3 py-1 text-xs text-red-600"
                    >
                      Xoa
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

