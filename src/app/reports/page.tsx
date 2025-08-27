"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { Package, DollarSign, AlertTriangle, Users, PlusCircle } from "lucide-react";

type Product = {
  product: string;
  category: string;
  supplier: string;
  stock: number;
  price: number;
  dateAdded: string;
};

const StatCard = ({
  title,
  value,
  icon: Icon,
  change,
  changeType
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  change: string;
  changeType: "increase" | "decrease";
}) => (
  <div className="rounded-xl border bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
    <div className="flex items-start justify-between">
      <div className="flex flex-col space-y-2">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {title}
        </span>
        <span className="text-3xl font-bold text-gray-900 dark:text-white">{value}</span>
      </div>
      <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-700">
        <Icon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
      </div>
    </div>
    <div className="mt-4 flex items-center space-x-1 text-sm">
      <span
        className={changeType === "increase" ? "text-green-500" : "text-red-500"}
      >
        {change}
      </span>
      <span className="text-gray-500 dark:text-gray-400">
        from last month
      </span>
    </div>
  </div>
);

export default function DashboardHero() {
  const [data, setData] = useState<Product[]>([]);
  const [monthlySales, setMonthlySales] = useState<{ name: string; sales: number }[]>([]);
  const [lowStock, setLowStock] = useState<Product[]>([]);

  useEffect(() => {
    const savedData: Product[] = JSON.parse(localStorage.getItem("inventory") || "[]");
    setData(savedData);

    // Example: Generate monthly sales from dateAdded + price * stock
    const salesMap: { [month: string]: number } = {};
    savedData.forEach((item) => {
      const month = new Date(item.dateAdded).toLocaleString("default", { month: "short" });
      const salesValue = item.price * item.stock; // Placeholder: replace with real sales data if available
      salesMap[month] = (salesMap[month] || 0) + salesValue;
    });
    setMonthlySales(
      Object.entries(salesMap).map(([name, sales]) => ({ name, sales }))
    );

    // Low stock filter
    setLowStock(savedData.filter((item) => item.stock < 10));
  }, []);

  return (
    <main className="flex-1 bg-gray-50 p-6 md:p-8 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Report</h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Here&apos;s your inventory snapshot for today.
            </p>
          </div>
          <button className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
            <PlusCircle className="mr-2 h-5 w-5" />
            Add New Product
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Sales"
            value={`$${monthlySales.reduce((sum, m) => sum + m.sales, 0).toLocaleString()}`}
            icon={DollarSign}
            change="+5.2%"
            changeType="increase"
          />
          <StatCard
            title="Total Products"
            value={data.length}
            icon={Package}
            change="+15"
            changeType="increase"
          />
          <StatCard
            title="Low Stock Items"
            value={lowStock.length}
            icon={AlertTriangle}
            change="-3"
            changeType="decrease"
          />
          <StatCard
            title="Total Suppliers"
            value={new Set(data.map(item => item.supplier)).size}
            icon={Users}
            change="+2"
            changeType="increase"
          />
        </div>

        {/* Chart + Low Stock Table */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Chart */}
          <div className="rounded-xl border bg-white p-6 shadow-sm lg:col-span-2 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Monthly Sales</h3>
            <div className="mt-6 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlySales}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sales" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Low Stock Items */}
          <div className="rounded-xl border bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Low Stock Items</h3>
            <div className="mt-4 flow-root">
              <ul className="-my-5 divide-y divide-gray-200 dark:divide-gray-700">
                {lowStock.map((item, index) => (
                  <li key={index} className="py-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{item.product}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Supplier: {item.supplier}
                        </p>
                      </div>
                      <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800">
                        {item.stock} left
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
