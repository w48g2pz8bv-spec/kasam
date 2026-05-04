"use client";
import { LayoutDashboard, ArrowUpRight, ArrowDownLeft, Users, Package } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();
  
  const navItems = [
    { name: "Dash", href: "/", icon: LayoutDashboard },
    { name: "Satış", href: "/sales", icon: ArrowUpRight },
    { name: "Gider", href: "/expenses", icon: ArrowDownLeft },
    { name: "Cari", href: "/accounts", icon: Users },
    { name: "Paket", href: "/accountant-package", icon: Package },
  ];

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md md:hidden z-50">
      <div className="flex items-center justify-around py-3 px-2 glass-card rounded-3xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1 transition-all">
              <Icon className={`w-6 h-6 ${isActive ? 'text-[#10b981]' : 'text-zinc-500'}`} />
              <span className={`text-[10px] ${isActive ? 'text-white' : 'text-zinc-500'}`}>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}