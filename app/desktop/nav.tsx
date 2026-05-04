"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", icon: "⌘", label: "Dashboard" },
  { href: "/sales", icon: "₺", label: "Satışlar" },
  { href: "/expenses", icon: "↓", label: "Giderler" },
  { href: "/accounts", icon: "◎", label: "Cari Takip" },
  { href: "/accountant-package", icon: "◆", label: "Muhasebeci Paketi" },
];

export default function DesktopNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-2">
      {links.map((item) => {
        const active = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`group relative flex items-center gap-3 overflow-hidden rounded-2xl px-4 py-3 text-sm transition ${
              active
                ? "border border-emerald-400/20 bg-emerald-400/10 text-white shadow-lg shadow-emerald-500/10"
                : "border border-transparent text-zinc-400 hover:border-white/10 hover:bg-white/5 hover:text-white"
            }`}
          >
            {active && (
              <span className="absolute inset-y-2 left-0 w-1 rounded-full bg-emerald-400" />
            )}

            <span
              className={`relative flex h-9 w-9 items-center justify-center rounded-xl transition ${
                active
                  ? "bg-emerald-400/20 text-emerald-300"
                  : "bg-white/5 group-hover:bg-emerald-400/15 group-hover:text-emerald-300"
              }`}
            >
              {item.icon}
            </span>

            <span className="relative font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}