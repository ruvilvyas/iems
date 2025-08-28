"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Home, Package, BarChart, Settings, LucideIcon, X, Menu } from "lucide-react";
import Link from "next/link";
import DashboardHero from "../reports/page";
import InventoryManager from "@/components/InventoryManager";
import DashboardView from "@/components/DashboardView";
import { usePathname } from "next/navigation";

interface TabItem {
  id: string;
  title: string;
  icon: LucideIcon;
}

export default function Dashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const tabs: TabItem[] = [
    { id: "dashboard", title: "Dashboard", icon: Home },
    { id: "products", title: "Products", icon: Package },
    { id: "reports", title: "Reports", icon: BarChart },
    { id: "settings", title: "Settings", icon: Settings },
  ];

  useEffect(() => {
    const user = localStorage.getItem("loggedInUser");
    if (!user && pathname !== "/login" && pathname !== "/register") {
      router.push("/login");
    }
  }, [router, pathname]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white shadow-sm p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          {/* MOBILE MENU BUTTON */}
          <button
            className="md:hidden p-2 rounded hover:bg-gray-100"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>

          {/* Logo */}
          <Link href={"/"} className="flex items-center gap-2">
            <Home className="w-6 h-6 text-gray-800" />
            <h1 className="text-2xl font-bold text-gray-800">IEMS</h1>
          </Link>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setActiveTab("products")}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition text-sm font-medium"
          >
            + Add Product
          </button>
          <button
            onClick={() => {
              localStorage.removeItem("loggedInUser");
              router.push("/login");
            }}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition text-sm font-medium"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 relative">
        {/* Overlay only on mobile when sidebar is open */}
        {sidebarOpen && (
          <div
            className="absolute inset-0 bg-black bg-opacity-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`bg-white border-r shadow-sm w-64 p-4 space-y-2
            absolute md:relative top-0 left-0 h-full
            transform transition-transform duration-300
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
          `}
        >
          {/* Close button for mobile */}
          <div className="flex justify-end md:hidden mb-4">
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="flex flex-col">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSidebarOpen(false); // auto close on mobile
                }}
                className={`flex items-center gap-3 px-5 py-3 text-lg transition-all rounded
                  ${activeTab === tab.id
                    ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
                    : "text-gray-700 hover:bg-gray-100"
                  }`}
              >
                <tab.icon size={20} />
                {tab.title}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-6 md:ml-64">
          {activeTab === "dashboard" && <DashboardView />}
          {activeTab === "products" && <InventoryManager />}
          {activeTab === "reports" && <DashboardHero />}
          {activeTab === "settings" && (
            <div>
              <h2 className="text-xl font-bold mb-4">Settings</h2>
              <p>Manage your account and preferences here.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
