"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timeout);
  }, [pathname]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <Image
          src="https://i.gifer.com/origin/ea/eaab2ae945b4ddb2457f1a350cae03cc_w200.gif"
          alt="Loading..."
          width={80}
          height={80}
          priority
        />
      </div>
    );
  }

  return <>{children}</>;
}
