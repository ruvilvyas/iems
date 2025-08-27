"use client";
import { useEffect, useState } from "react";

export default function NotificationsPage() {
  interface InventoryItem {
  id: string;
  product: string;
  name: string;
  stock: number;
  price: number;
  category: string;
  dateAdded?: string;
}
  const [lowStock, setLowStock] = useState<InventoryItem[]>([]);

  useEffect(() => {
    const storedLowStock = localStorage.getItem("lowStockProducts");
    if (storedLowStock) setLowStock(JSON.parse(storedLowStock));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Low Stock Notifications</h1>
      {lowStock.length === 0 ? (
        <p className="text-gray-500">No low-stock products.</p>
      ) : (
        <ul className="space-y-3">
          {lowStock.map((product, idx) => (
            <li key={idx} className="border p-3 rounded shadow-sm">
              <p className="font-semibold">{product.name}</p>
              <p className="text-sm text-red-600">Stock: {product.stock}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
