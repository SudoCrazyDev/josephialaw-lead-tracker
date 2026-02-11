"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRef, useEffect } from "react";
import gsap from "gsap";
import { LayoutDashboard, FileText } from "lucide-react";

export default function DashboardPage() {
  const { data: session } = useSession();
  const welcomeRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        welcomeRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
      );
      gsap.fromTo(
        cardsRef.current?.children ?? [],
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.08,
          delay: 0.2,
          ease: "power2.out",
        }
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="space-y-8">
      <div ref={welcomeRef}>
        <h2
          className="text-2xl font-semibold mb-1"
          style={{ color: "#151a6c" }}
        >
          Welcome back
        </h2>
        <p className="text-[#5a5a6e]">
          {session?.user?.email ?? "User"}
        </p>
      </div>

      <div
        ref={cardsRef}
        className="grid gap-4 sm:grid-cols-2"
      >
        <div className="bg-white rounded-2xl border border-[#e8e8ec] p-6 shadow-sm hover:shadow-md transition-shadow">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
            style={{ backgroundColor: "rgba(21, 26, 108, 0.1)" }}
          >
            <LayoutDashboard className="w-5 h-5" style={{ color: "#151a6c" }} />
          </div>
          <h3 className="font-semibold mb-1" style={{ color: "#151a6c" }}>
            Overview
          </h3>
          <p className="text-sm text-[#5a5a6e]">
            Your marketing portal at a glance.
          </p>
        </div>
        <Link
          href="/dashboard/leads"
          className="bg-white rounded-2xl border border-[#e8e8ec] p-6 shadow-sm hover:shadow-md transition-shadow block"
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
            style={{ backgroundColor: "rgba(190, 123, 60, 0.15)" }}
          >
            <FileText className="w-5 h-5" style={{ color: "#be7b3c" }} />
          </div>
          <h3 className="font-semibold mb-1" style={{ color: "#151a6c" }}>
            Lead Tracker
          </h3>
          <p className="text-sm text-[#5a5a6e]">
            Manage and track leads.
          </p>
        </Link>
      </div>
    </div>
  );
}
