 "use client";

import { useState } from "react";
import { jsPDF } from "jspdf";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard } from "lucide-react";

export default function DashboardPage() {
  const [monthlySales] = useState([
    { date: "2026-05-01", type: "Nakit", note: "Satış1", amount: 1000 },
    { date: "2026-05-02", type: "Kart", note: "Satış2", amount: 2000 },
  ]);
  const [monthlyExpenses] = useState([
    { date: "2026-05-01", category: "Kira", note: "-", amount: 500 },
  ]);

  const handlePrintReport = () => {
    const doc = new jsPDF();
    doc.text("Kasam Ay Sonu Mali Özeti", 10, 10);
    let y = 20;
    doc.text("Satışlar:", 10, y);
    monthlySales.forEach((s) => {
      y += 10;
      doc.text(
        `${s.date} - ${s.type} - ${s.note} - ${s.amount} ₺`,
        10,
        y
      );
    });
    y += 10;
    doc.text("Giderler:", 10, y);
    monthlyExpenses.forEach((e) => {
      y += 10;
      doc.text(
        `${e.date} - ${e.category} - ${e.note} - ${e.amount} ₺`,
        10,
        y
      );
    });
    doc.save("Kasam_Rapor.pdf");
  };

  const handleWhatsAppShare = () => {
    const summary = `Kasam Ay Sonu Mali Özeti\n` +
      `Toplam Satış: ${monthlySales.reduce((a, b) => a + b.amount, 0)} ₺\n` +
      `Toplam Gider: ${monthlyExpenses.reduce((a, b) => a + b.amount, 0)} ₺`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(summary)}`;
    window.open(url, "_blank");
  };

  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#050507] text-white">
      <header className="p-4 text-xl font-bold">Dashboard</header>

      <main className="p-4">
        <section className="mb-8">
          <h2 className="text-lg font-bold">Ay Sonu Özet</h2>
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <div className="p-4 bg-zinc-800 rounded-lg flex-1">
              <p>Toplam Satış</p>
              <p>{monthlySales.reduce((a, b) => a + b.amount, 0)} ₺</p>
            </div>
            <div className="p-4 bg-zinc-800 rounded-lg flex-1">
              <p>Toplam Gider</p>
              <p>{monthlyExpenses.reduce((a, b) => a + b.amount, 0)} ₺</p>
            </div>
          </div>

          <div className="mt-6 flex flex-col md:flex-row gap-3">
            <button
              onClick={handlePrintReport}
              className="w-full md:w-auto px-4 py-2 bg-white text-black rounded-lg font-bold"
            >
              PDF Kaydet
            </button>

            <button
              onClick={handleWhatsAppShare}
              className="w-full md:w-auto px-4 py-2 bg-green-500 text-black rounded-lg font-bold"
            >
              WhatsApp Özet Aç
            </button>
          </div>
        </section>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div className="absolute inset-0 border-t border-white/[0.06] bg-[#050507]/85 backdrop-blur-2xl" />
        <div className="relative flex items-center justify-around px-2 pb-7 pt-3">
          <Link
            href="/dashboard"
            className="flex min-w-[58px] flex-col items-center gap-1.5 transition active:scale-90"
          >
            <div className="rounded-2xl p-2 bg-emerald-400/10 text-emerald-400 shadow-[0_0_18px_rgba(16,185,129,0.16)]">
              <LayoutDashboard size={20} strokeWidth={2.6} />
            </div>
            <span className="text-[9px] font-black uppercase tracking-tight text-emerald-400">
              Dashboard
            </span>
          </Link>
        </div>
      </nav>
    </div>
  );
}