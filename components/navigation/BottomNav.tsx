 "use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowUpRight,
  ArrowDownLeft,
  Users,
  Briefcase,
} from "lucide-react";

const navItems = [
  { name: "Özet", href: "/", icon: LayoutDashboard },
  { name: "Satış", href: "/sales", icon: ArrowUpRight },
  { name: "Gider", href: "/expenses", icon: ArrowDownLeft },
  { name: "Cari", href: "/accounts", icon: Users },
  { name: "Paket", href: "/accountant-package", icon: Briefcase },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="absolute inset-0 border-t border-white/[0.06] bg-[#050507]/85 backdrop-blur-2xl" />

      <div className="relative flex items-center justify-around px-2 pb-7 pt-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex min-w-[58px] flex-col items-center gap-1.5 transition active:scale-90"
            >
              <div
                className={`rounded-2xl p-2 transition ${
                  isActive
                    ? "bg-emerald-400/10 text-emerald-400 shadow-[0_0_18px_rgba(16,185,129,0.16)]"
                    : "text-zinc-500"
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.6 : 2} />
              </div>

              <span
                className={`text-[9px] font-black uppercase tracking-tight ${
                  isActive ? "text-emerald-400" : "text-zinc-500"
                }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}