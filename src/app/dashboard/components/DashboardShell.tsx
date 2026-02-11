"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useSidebar } from "../context/SidebarContext";

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();
  const router = useRouter();
  const { collapsed } = useSidebar();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f7f4]">
        <div
          className="w-10 h-10 rounded-full border-2 border-[#151a6c] border-t-transparent animate-spin"
          aria-hidden
        />
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  return (
    <div className="min-h-screen bg-[#f8f7f4]">
      <Sidebar />
      <div
        className="transition-[margin-left] duration-300 ease-out"
        style={{ marginLeft: collapsed ? 80 : 260 }}
      >
        <Header />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
