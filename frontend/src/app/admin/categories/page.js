"use client";

import { useEffect, useState } from "react";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/api";

const EMPTY_FORM = { id: "", name: "", parent: "", isActive: true };

export default function AdminCategoriesPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");

  const loadItems = async () => {
    try {
      setItems(await getCategories());
    } catch (err) {
      setError(err.message || "Không thể tải danh mục");
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { name: form.name.trim(), isActive: !!form.isActive };
      if (form.parent.trim()) payload.parent = form.parent.trim();

      if (form.id) await updateCategory(form.id, payload);
      else await createCategory(payload);

      setForm(EMPTY_FORM);
      await loadItems();
    } catch (err) {
      setError(err.message || "Không thể lưu danh mục");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl text-[var(--ink)]">Admin - Categories</h1>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <form onSubmit={onSubmit} className="grid gap-3 rounded-2xl border border-black/10 bg-white p-4">
        <input name="name" value={form.name} onChange={onChange} placeholder="Tên danh mục" className="h-10 rounded-xl border border-black/10 px-3 text-sm" required />
        <input name="parent" value={form.parent} onChange={onChange} placeholder="Parent id (tùy chọn)" className="h-10 rounded-xl border border-black/10 px-3 text-sm" />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isActive" checked={form.isActive} onChange={onChange} />
          Active
        </label>
        <div className="flex gap-2">
          <button className="rounded-full bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-white">
            {form.id ? "Cập nhật" : "Tạo mới"}
          </button>
          <button type="button" onClick={() => setForm(EMPTY_FORM)} className="rounded-full border border-black/10 px-4 py-2 text-sm">
            Reset
          </button>
        </div>
      </form>

      <div className="rounded-2xl border border-black/10 bg-white p-4 space-y-3">
        {items.map((item) => (
          <div key={item.id || item._id} className="flex items-center justify-between rounded-xl border border-black/10 px-3 py-2">
            <div>
              <p className="font-semibold">{item.name}</p>
              <p className="text-xs text-[var(--muted)]">Parent: {item.parent || "-"}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setForm({ id: item.id || item._id, name: item.name || "", parent: item.parent || "", isActive: item.isActive !== false })} className="rounded-full border border-black/10 px-3 py-1 text-xs">Sửa</button>
              <button onClick={async () => { await deleteCategory(item.id || item._id); await loadItems(); }} className="rounded-full border border-red-200 px-3 py-1 text-xs text-red-600">Xóa</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

