 "use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menu = [
  { href: "/", label: "⌘", name: "Panel" },
  { href: "/sales", label: "₺", name: "Satış" },
  { href: "/expenses", label: "↓", name: "Gider" },
  { href: "/accounts", label: "◎", name: "Cari" },
  { href: "/accountant-package", label: "◆", name: "Paket" },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed left-1/2 z-30 flex w-[92%] max-w-md -translate-x-1/2 justify-around rounded-[2rem] border border-white/10 bg-[#0b0b0f] px-2 py-3 shadow-2xl shadow-emerald-500/20 md:hidden"
      style={{
        bottom: "calc(env(safe-area-inset-bottom) + 16px)",
      }}
    >
      {menu.map((item) => {
        const active = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`relative flex min-w-14 flex-col items-center gap-1 rounded-2xl px-3 py-2 text-xs ${
              active ? "bg-emerald-400/15" : ""
            }`}
          >
            <span
              className={`text-lg font-black ${
                active ? "text-emerald-300" : "text-zinc-500"
              }`}
            >
              {item.label}
            </span>

            <span
              className={`text-[10px] font-semibold ${
                active ? "text-emerald-200" : "text-zinc-500"
              }`}
            >
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}