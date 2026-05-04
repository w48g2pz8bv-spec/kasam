 import type { Metadata } from "next";
import "./globals.css";
import { KasamProvider } from "./providers";
import MobileNav from "./mobile/nav";
import DesktopNav from "./desktop/nav";

export const metadata: Metadata = {
  title: "Kasam",
  description: "Yerel işletmeler için premium işletme kontrol sistemi",
  applicationName: "Kasam",
  appleWebApp: {
    capable: true,
    title: "Kasam",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  themeColor: "#07070a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className="bg-[#07070a] text-white">
        <KasamProvider>
          <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.18),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.14),_transparent_32%),#07070a] md:flex">
            <aside className="hidden w-72 border-r border-white/10 bg-black/45 p-5 backdrop-blur-2xl md:block">
              <div className="mb-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-300 to-emerald-700 font-black text-black shadow-lg shadow-emerald-500/20">
                  K
                </div>

                <h1 className="mt-4 text-2xl font-black">Kasam</h1>
                <p className="mt-1 text-xs text-zinc-500">
                  Premium işletme paneli
                </p>

                <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-bold text-emerald-200">
                  <span className="h-2 w-2 rounded-full bg-emerald-300" />
                  Canlı Takip
                </div>
              </div>

              <DesktopNav />

              <div className="mt-8 rounded-3xl border border-white/10 bg-[#0b0b0f] p-4">
                <p className="text-sm font-semibold">Veriler bulutta güvende</p>
                <p className="mt-2 text-xs leading-5 text-zinc-500">
                  Tüm kayıtlar Supabase'de saklanır. Her cihazdan erişebilirsin.
                </p>
              </div>

              <a
                href="https://wa.me/905387611135?text=Merhaba%20Kasam%20kurulum%20istiyorum"
                target="_blank"
                className="mt-5 block rounded-2xl bg-gradient-to-r from-green-400 to-emerald-600 px-4 py-4 text-center font-black text-black shadow-lg shadow-green-500/20 transition hover:scale-[1.02]"
              >
                🚀 WhatsApp Kurulum
              </a>
            </aside>

            <div className="relative flex-1">
              <div className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-black/60 px-5 py-4 backdrop-blur md:hidden">
                <div>
                  <h1 className="text-lg font-black tracking-tight">Kasam</h1>
                  <p className="text-[10px] text-emerald-400">● Canlı Takip</p>
                </div>

                <a
                  href="https://wa.me/905387611135?text=Merhaba%20Kasam%20kurulum%20istiyorum"
                  target="_blank"
                  className="rounded-full bg-green-400 px-3 py-2 text-xs font-black text-black shadow-lg shadow-green-500/20"
                >
                  Kurulum
                </a>
              </div>

              <header className="hidden justify-between border-b border-white/10 bg-black/25 px-6 py-4 backdrop-blur-xl md:flex">
                <p className="text-sm text-zinc-400">
                  İşletmenin parasını net gör.
                </p>

                <div className="flex gap-2">
                  <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs text-emerald-200">
                    Yerel kayıt
                  </span>
                  <span className="rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs text-green-300">
                    Aktif sistem
                  </span>
                </div>
              </header>

              <div>{children}</div>
              <MobileNav />
            </div>
          </div>
        </KasamProvider>
      </body>
    </html>
  );
}