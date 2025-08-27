"use client";
import { NotebookIcon } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
export default function UserHeader() {
  interface productt{
     id: string;
  name: string;
  quantity: number;
  }
  const [user, setUser] = useState<{ name?: string; email?: string; profilePic?: string; shopName?: string } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  
  const [lowStock, setLowStock] = useState<productt[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("loggedInUser");
    if (storedUser) setUser(JSON.parse(storedUser));

    const storedLowStock = localStorage.getItem("lowStockProducts");
    if (storedLowStock) setLowStock(JSON.parse(storedLowStock));

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    setUser(null);
    setMenuOpen(false);
  };

  return (
    <div className="flex items-center justify-between mb-8 relative">
      {/* Welcome text */}
      <div>
        <p className="text-sm text-gray-500">Welcome back</p>
        <h2 className="text-lg font-semibold">{user?.name || "Guest"}👋🏻</h2>
      </div>

      <div className="flex items-center gap-4" ref={menuRef}>
        {/* Notification Icon */}
        <div className="relative">
          <Link href="/notifications">
            <NotebookIcon className="w-7 h-7 cursor-pointer text-gray-700 hover:text-black" />
          </Link>
          {lowStock.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {lowStock.length}
            </span>
          )}
        </div>

        {/* Profile image */}
        <div className="relative">
          <Image
            src={user?.profilePic || "/iems.png"}
            alt="User profile"
            className="w-12 h-12 rounded-full border-2 border-white shadow-md object-cover cursor-pointer"
            onClick={() => setMenuOpen((prev) => !prev)}
                          width={400}
 height={200}
          />

          {/* Dropdown menu */}
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white shadow-lg rounded-lg border p-4 z-50">
              <div className="flex items-center gap-3 border-b pb-3 mb-3">
                <Image
                  src={user?.profilePic || "/iems.png"}
                  alt="User"
                  className="w-10 h-10 rounded-full object-cover"
                                width={400}
 height={200}
                />
                <div>
                  <p className="font-semibold">{user?.name || "Guest"}</p>
                  <p className="text-xs text-gray-500">{user?.email || "No email"}</p>
                </div>
              </div>
              <p className="text-sm mb-3">
                🏪 <span className="font-medium">{user?.shopName || "No shop added"}</span>
              </p>
              <button
                onClick={handleLogout}
                className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600 transition"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
