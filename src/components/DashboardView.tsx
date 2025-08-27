"use client";
import { useState, useEffect } from "react";

type Item = {
  id: string;
  product: string;
  category: string;
  supplier: string;
  stock: number;
  price: number;
  dateAdded: string;
};

export default function DashboardView() {
  const [products, setProducts] = useState<Item[]>([]);

  // Load products from localStorage
  useEffect(() => {
    const raw = localStorage.getItem("inventory");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setProducts(parsed);
        }
      } catch {
        console.error("Failed to parse inventory");
      }
    }
  }, []);

  // Group products by category
  const groupedProducts = products.reduce((acc: Record<string, Item[]>, product) => {
    if (!acc[product.category]) acc[product.category] = [];
    acc[product.category].push(product);
    return acc;
  }, {});

  // Date formatting helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-10 px-4 sm:px-6 lg:px-8 py-6">
      {Object.keys(groupedProducts).length === 0 ? (
        <p className="text-gray-500 text-center text-lg">
          No products yet. <span className="text-indigo-600">Add some from the inventory form.</span>
        </p>
      ) : (
        Object.keys(groupedProducts).map((category) => (
          <div key={category}>
            {/* Category Header */}
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="text-indigo-600">▌</span> {category}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {groupedProducts[category].map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-transform transform hover:scale-[1.02] p-5 border border-gray-100"
                >
                  <h3 className="text-lg font-semibold text-gray-900">{product.product}</h3>
                  <p className="text-gray-500 text-sm">Supplier: {product.supplier}</p>
                  <p
                    className={`text-sm font-medium ${
                      product.stock > 10 ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    Stock: {product.stock}
                  </p>
                  <p className="text-lg font-bold text-gray-800 mt-2">
                    ${product.price.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Added: {formatDate(product.dateAdded)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
