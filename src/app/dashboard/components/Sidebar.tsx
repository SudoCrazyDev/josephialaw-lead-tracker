"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import {
  LayoutDashboard,
  FileText,
  Webhook,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useSidebar } from "../context/SidebarContext";

const LOGO_URL =
  "https://divorcewithaplan.com/wp-content/uploads/2025/04/DWAP_LOGO_DARK_Web.webp";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/leads", label: "Lead Tracker", icon: FileText },
  { href: "/dashboard/webhooks", label: "Webhooks", icon: Webhook },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { collapsed, setCollapsed } = useSidebar();
  const sidebarRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const logoWrapRef = useRef<HTMLDivElement>(null);
  const labelsRef = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    if (!sidebarRef.current || !contentRef.current) return;

    const ctx = gsap.context(() => {
      gsap.to(sidebarRef.current, {
        width: collapsed ? 80 : 260,
        duration: 0.35,
        ease: "power2.inOut",
        overwrite: true,
      });

      if (logoWrapRef.current) {
        gsap.to(logoWrapRef.current, {
          opacity: collapsed ? 0 : 1,
          width: collapsed ? 0 : 200,
          duration: 0.3,
          ease: "power2.inOut",
          overwrite: true,
        });
      }

      labelsRef.current.forEach((el, i) => {
        if (!el) return;
        gsap.to(el, {
          opacity: collapsed ? 0 : 1,
          duration: 0.25,
          delay: collapsed ? 0 : 0.05,
          ease: "power2.out",
          overwrite: true,
        });
      });
    });

    return () => ctx.revert();
  }, [collapsed]);

  return (
    <aside
      ref={sidebarRef}
      className="fixed left-0 top-0 z-30 h-screen flex flex-col bg-[#151a6c] text-white overflow-hidden shadow-xl"
      style={{ width: 260 }}
    >
      <div ref={contentRef} className="flex flex-col h-full py-5 px-3">
        {/* Logo + Collapse */}
        <div className="flex items-center gap-2 px-2 mb-6">
          <div
            ref={logoWrapRef}
            className="min-w-0 flex-1 overflow-hidden"
            style={{ width: 200 }}
          >
            <Link
              href="/dashboard"
              className="flex items-center gap-3 min-w-0 w-max rounded-xl hover:bg-white/10 transition-colors py-1.5 pr-1"
            >
            <div className="shrink-0 w-10 h-10 relative rounded-lg overflow-hidden bg-white/10">
              <Image
                src={LOGO_URL}
                alt="Logo"
                fill
                className="object-contain p-1"
              />
            </div>
            <span
              ref={(el) => {
                labelsRef.current[0] = el;
              }}
              className="font-semibold text-sm whitespace-nowrap overflow-hidden"
            >
            Marketing Portal
          </span>
            </Link>
          </div>
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg text-white/85 hover:bg-white/10 hover:text-white transition-colors"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item, i) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                  isActive
                    ? "bg-[#be7b3c] text-white"
                    : "text-white/85 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="shrink-0 w-5 h-5" strokeWidth={2} />
                <span
                  ref={(el) => {
                    labelsRef.current[i + 1] = el;
                  }}
                  className="text-sm font-medium whitespace-nowrap overflow-hidden"
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
