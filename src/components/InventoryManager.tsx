"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * Inventory item type
 */
type Item = {
  id: string; // stable id
  product: string;
  category: string;
  supplier: string;
  stock: number;
  price: number;
  dateAdded: string;
};

/** safe read with backup recovery */
function readInventorySafe(): Item[] {
  const raw = localStorage.getItem("inventory");
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    // try to recover from backup if available
    const backup = localStorage.getItem("inventory_backup");
    if (backup) {
      try {
        const parsedBackup = JSON.parse(backup);
        return Array.isArray(parsedBackup) ? parsedBackup : [];
      } catch (e) {
        console.error("inventory and backup corrupted", e);
        return [];
      }
    }
    console.error("inventory parse error", err);
    return [];
  }
}

export default function InventoryManager() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editParam = searchParams.get("edit");

  // initialize from localStorage (avoid an initial empty-write)
  const [data, setData] = useState<Item[]>(() => readInventorySafe());

  // editing index (local/internal). Either comes from URL ?edit= or from clicking Edit button
  const [editingIndex, setEditingIndex] = useState<number | null>(() => {
    if (typeof editParam === "string" && !Number.isNaN(Number(editParam))) {
      return Number(editParam);
    }
    return null;
  });

  const [form, setForm] = useState({
    product: "",
    category: "",
    supplier: "",
    stock: "",
    price: "",
    dateAdded: "",
  });

  // keep state in sync if some other tab changed localStorage
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === "inventory") {
        setData(readInventorySafe());
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // if URL param ?edit changed or data changed, set form to the item to edit
  useEffect(() => {
    if (editingIndex !== null && data[editingIndex]) {
      const it = data[editingIndex];
      setForm({
        product: it.product,
        category: it.category,
        supplier: it.supplier,
        stock: String(it.stock),
        price: String(it.price),
        dateAdded: it.dateAdded || new Date().toLocaleDateString(),
      });
    }
  }, [editingIndex, data]);

  // sync to localStorage but guard so we don't write unnecessarily
  useEffect(() => {
    try {
      const prevRaw = localStorage.getItem("inventory") || "[]";
      const nextRaw = JSON.stringify(data);
      if (prevRaw !== nextRaw) {
        // keep backup before overwriting
        localStorage.setItem("inventory_backup", prevRaw);
        localStorage.setItem("inventory", nextRaw);
      }
    } catch (e) {
      console.error("Failed to save inventory:", e);
    }
  }, [data]);

  // handle form updates
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  // Add/Update
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // validation
    if (!form.product.trim() || !form.stock || !form.price) {
      alert("Please fill required fields (product, stock, price).");
      return;
    }

    const newItem: Item = {
      id:
        editingIndex !== null && data[editingIndex]?.id
          ? data[editingIndex].id
          : Date.now().toString(),
      product: form.product.trim(),
      category: form.category.trim() || "Uncategorized",
      supplier: form.supplier.trim() || "Unknown",
      stock: Number.parseInt(String(form.stock), 10) || 0,
      price: Number.parseFloat(String(form.price)) || 0,
      dateAdded: form.dateAdded || new Date().toLocaleDateString(),
    };

    setData((prev) => {
      if (editingIndex !== null && prev[editingIndex]) {
        const copy = [...prev];
        copy[editingIndex] = newItem;
        return copy;
      }
      return [...prev, newItem];
    });

    // reset form and editing state
    setForm({ product: "", category: "", supplier: "", stock: "", price: "", dateAdded: "" });
    setEditingIndex(null);

    // if the URL contained ?edit=, remove it so user doesn't stay in edit mode when at /curd
    try {
      const path = window.location.pathname;
      router.replace(path); // clear query
    } catch (err) {
      console.log(err);
    }
  };

  // local Edit button (works when component is inline in Dashboard)
  const startEdit = (index: number) => {
    setEditingIndex(index);
    // pre-filling will happen via the effect above
    // also update URL to show edit state (optional)
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("edit", String(index));
      router.replace(url.pathname + url.search);
    } catch {}
  };

  const handleDelete = (index: number) => {
    if (!confirm("Delete this product? This action cannot be undone.")) return;
    setData((prev) => prev.filter((_, i) => i !== index));
    // clear URL edit if we deleted the currently editing item
    if (editingIndex === index) {
      setEditingIndex(null);
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete("edit");
        router.replace(url.pathname + url.search);
      } catch {}
    }
  };

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">{editingIndex !== null ? "Edit Product" : "Add Product"}</h2>
        <div className="space-x-2">
          <Link href="/dashboard">
            <button className="text-sm px-3 py-1 rounded bg-gray-100">Back</button>
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input name="product" placeholder="Product Name" value={form.product} onChange={handleChange} className="border p-2 rounded" required />
        <input name="category" placeholder="Category" value={form.category} onChange={handleChange} className="border p-2 rounded" />
        <input name="supplier" placeholder="Supplier" value={form.supplier} onChange={handleChange} className="border p-2 rounded" />
        <input name="stock" type="number" placeholder="Stock" value={form.stock} onChange={handleChange} className="border p-2 rounded" required />
        <input name="price" type="number" step="0.01" placeholder="Price" value={form.price} onChange={handleChange} className="border p-2 rounded" required />
        <button type="submit" className="bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600">{editingIndex !== null ? "Update Product" : "Add Product"}</button>
      </form>

      <h2 className="text-xl font-bold mb-4">Product List</h2>
      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded-lg shadow">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3">#</th>
              <th className="p-3">Product</th>
              <th className="p-3">Category</th>
              <th className="p-3">Supplier</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Price</th>
              <th className="p-3">Date Added</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((item, index) => (
                <tr className="border-t" key={item.id}>
                  <td className="p-3">{index + 1}</td>
                  <td className="p-3">{item.product}</td>
                  <td className="p-3">{item.category}</td>
                  <td className="p-3">{item.supplier}</td>
                  <td className="p-3">{item.stock}</td>
                  <td className="p-3">${item.price}</td>
                  <td className="p-3">{item.dateAdded}</td>
                  <td className="p-3 space-x-2">
                    <button onClick={() => startEdit(index)} className="text-blue-500 hover:underline">Edit</button>
                    <button onClick={() => handleDelete(index)} className="text-red-500 hover:underline">Delete</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="text-center p-4 text-gray-500">No products yet. Add one above.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
