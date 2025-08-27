"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const loggedInUser = localStorage.getItem("loggedInUser");

    // Allow login page without redirect
    if (!loggedInUser && pathname !== "/login") {
      router.push("/login");
    }
  }, [router, pathname]);

  return <>{children}</>;
}
