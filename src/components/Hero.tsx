"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Package, DollarSign, Filter, Plus, ArrowRight } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useSwipeable } from "react-swipeable";
import Link from "next/link";
import UserHeader from "./Header";

const COLORS = ["#3B82F6", "#F59E0B", "#10B981", "#EF4444", "#8B5CF6"];

type RecentActivityItem = {
  id: string;
  product: string;
  action: string;
  quantity: number;
  time: string;
};

type HeroProps = {
  username: string;
};

interface InventoryItem {
  id: string;
  product: string;
  name: string;
  stock: number;
  price: number;
  category: string;
  dateAdded?: string;
}

export default function Hero({}: HeroProps) {
  const handlers = useSwipeable({
    onSwipedRight: () => {
      window.location.href = "/dashboard";
    },
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  const [inventoryData, setInventoryData] = useState<{
    stats: {
      totalProducts: number;
      lowStock: number;
      outOfStock: number;
      totalValue: number;
    };
    categories: { name: string; value: number; items: number }[];
    recentActivity: RecentActivityItem[];
  }>({
    stats: { totalProducts: 0, lowStock: 0, outOfStock: 0, totalValue: 0 },
    categories: [],
    recentActivity: [],
  });

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const savedInventory: InventoryItem[] = JSON.parse(
      localStorage.getItem("inventory") || "[]"
    );

    const totalProducts = savedInventory.length;
    const lowStock = savedInventory.filter(
      (item) => item.stock > 0 && item.stock <= 10
    ).length;
    const outOfStock = savedInventory.filter(
      (item) => item.stock === 0
    ).length;
    const totalValue = savedInventory.reduce(
      (acc, item) => acc + item.stock * item.price,
      0
    );

    const categoryMap: Record<
      string,
      { name: string; value: number; items: number }
    > = {};
    savedInventory.forEach((item) => {
      if (!categoryMap[item.category]) {
        categoryMap[item.category] = {
          name: item.category,
          value: 0,
          items: 0,
        };
      }
      categoryMap[item.category].items += 1;
      categoryMap[item.category].value += item.stock;
    });

    const categories = Object.values(categoryMap);

    const recentActivity: RecentActivityItem[] = [...savedInventory]
      .sort(
        (a, b) =>
          new Date(b.dateAdded || "").getTime() -
          new Date(a.dateAdded || "").getTime()
      )
      .slice(0, 5)
      .map((item) => ({
        id: item.id,
        product: item.product,
        action: item.stock === 0 ? "Out of stock" : "Stock updated",
        quantity: item.stock,
        time: item.dateAdded || "N/A",
      }));

    setInventoryData({
      stats: { totalProducts, lowStock, outOfStock, totalValue },
      categories,
      recentActivity,
    });
  }, []);

  return (
    <>
      <section className="min-screen bg-gray-50 min-h-screen px-4 py-6">
        <UserHeader />

        {/* Welcome Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8 mb-8 bg-white p-6 rounded-xl shadow-sm">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold flex items-center gap-2">
              📦 <span>Inventory Dashboard</span>
            </h1>
            <p className="text-gray-600 leading-relaxed">
              Real-time overview of your products, stock, and suppliers.
            </p>
          </div>
          <div className="flex justify-center">
            <Image
              src="https://devtechnosys.ae/blog/wp-content/uploads/2023/04/Inventory-Control.gif"
              alt="Inventory animation"
              className="rounded-lg max-h-56 object-cover"
              width={400}
              height={200}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="mb-8 flex gap-3">
          <Link
            href={"/dashboard"}
            className="px-4 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 flex items-center gap-2"
          >
            <Plus size={18} /> Manage
          </Link>
          <div className="relative">
            <button
              onClick={() => setIsOpen((prev) => !prev)}
              className={`px-4 py-3 rounded-lg border flex items-center gap-2 transition-colors ${
                isOpen
                  ? "bg-gray-100 border-gray-300"
                  : "bg-white hover:bg-gray-50"
              }`}
            >
              <Filter size={18} />
              {isOpen ? "Close Filters" : "Filters"}
            </button>

            {isOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border p-3 z-10">
                <h4 className="font-medium text-sm mb-2">Filter By:</h4>
                <ul className="space-y-2">
                  <li>
                    <button className="w-full text-left text-sm hover:text-orange-600">
                      Category
                    </button>
                  </li>
                  <li>
                    <button className="w-full text-left text-sm hover:text-orange-600">
                      Price Range
                    </button>
                  </li>
                  <li>
                    <button className="w-full text-left text-sm hover:text-orange-600">
                      Date Added
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
<div className="grid grid-cols-4 gap-3 mb-8 overflow-hidden">
          <StatCard
            title="Total Products"
            value={inventoryData.stats.totalProducts}
            icon={<Package />}
            change="+12%"
          />
          <StatCard
            title="Low Stock"
            value={inventoryData.stats.lowStock}
            icon={<Package />}
            change="Needs attention"
            changeColor="orange"
          />
          <StatCard
            title="Out of Stock"
            value={inventoryData.stats.outOfStock}
            icon={<Package />}
            change="Urgent restock"
            changeColor="red"
          />
          <StatCard
            title="Total Value"
            value={`$${inventoryData.stats.totalValue.toLocaleString()}`}
            icon={<DollarSign />}
            change="Inventory value"
            changeColor="green"
          />
        </div>

        {/* Chart & Recent Activity */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Category Pie Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-md p-6">
            <h3 className="text-lg font-semibold mb-6">
              Category Distribution
            </h3>
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={inventoryData.categories}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    label={({
                      name,
                      percent,
                    }: {
                      name: string;
                      percent?: number;
                    }) =>
                      `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`
                    }
                  >
                    {inventoryData.categories.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow p-4 overflow-y-auto">
            <h3 className="text-sm font-semibold mb-3">Recent Activity</h3>
            {inventoryData.recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100"
              >
                <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">{activity.product}</p>
                  <p className="text-sm text-gray-600">
                    {activity.action} • {activity.quantity} units
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Swipe Banner */}
      <div
        {...handlers}
        className="flex items-center justify-center h-16 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 text-white rounded-2xl shadow-lg px-5 cursor-pointer"
      >
        <ArrowRight className="w-6 h-6 mr-2 animate-pulse" />
        <span className="text-lg font-semibold">
          Swipe right to manage your Dashboard
        </span>
      </div>
    </>
  );
}

type StatCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change: string;
  changeColor?: "blue" | "orange" | "red" | "green";
};

function StatCard({
  title,
  value,
  icon,
  change,
  changeColor = "blue",
}: StatCardProps) {
  const colorClass = {
    blue: "border-blue-500",
    orange: "border-orange-500",
    red: "border-red-500",
    green: "border-green-500",
  }[changeColor];

  return (
    <div className={`bg-white rounded-xl p-6 shadow-md border-l-4 ${colorClass}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        {icon}
      </div>
      <div className="mt-2 text-sm text-gray-600">{change}</div>
    </div>
  );
}
