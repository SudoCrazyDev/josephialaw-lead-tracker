"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import gsap from "gsap";
import { Settings, LogOut, ChevronDown } from "lucide-react";

export default function Header() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!dropdownRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        dropdownRef.current,
        { opacity: 0, y: -8, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.2,
          ease: "power2.out",
        }
      );
    });

    return () => ctx.revert();
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = session?.user?.email
    ? session.user.email.slice(0, 2).toUpperCase()
    : "?";

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-6 bg-white/80 backdrop-blur-md border-b border-[#e8e8ec]">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold" style={{ color: "#151a6c" }}>
          Dashboard
        </h1>
      </div>

      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-3 px-3 py-2 rounded-xl border border-[#e8e8ec] bg-white hover:bg-[#f8f7f4] transition-colors"
          aria-expanded={open}
          aria-haspopup="true"
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium text-white shrink-0"
            style={{ backgroundColor: "#be7b3c" }}
          >
            {initials}
          </div>
          <span className="text-sm font-medium hidden sm:block" style={{ color: "#151a6c" }}>
            {session?.user?.email ?? "Account"}
          </span>
          <ChevronDown
            className={`w-4 h-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
            style={{ color: "#151a6c" }}
          />
        </button>

        {open && (
          <div
            ref={dropdownRef}
            className="absolute right-0 top-full mt-2 w-56 py-2 rounded-xl bg-white border border-[#e8e8ec] shadow-xl"
          >
            <div className="px-4 py-2 border-b border-[#e8e8ec]">
              <p className="text-xs text-[#8a8a9a]">Signed in as</p>
              <p className="text-sm font-medium truncate" style={{ color: "#151a6c" }}>
                {session?.user?.email}
              </p>
            </div>
            <Link
              href="/dashboard/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[#f8f7f4] transition-colors"
              style={{ color: "#151a6c" }}
            >
              <Settings className="w-4 h-4 shrink-0" />
              Settings
            </Link>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-[#f8f7f4] transition-colors text-left"
              style={{ color: "#151a6c" }}
            >
              <LogOut className="w-4 h-4 shrink-0" />
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
