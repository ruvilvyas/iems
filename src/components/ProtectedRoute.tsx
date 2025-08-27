"use client";
import { useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const user = localStorage.getItem("loggedInUser");
    if (!user && pathname !== "/login" && pathname !== "/register") {
      router.push("/login");
    }
  }, [router, pathname]);

  return <>{children}</>;
}
