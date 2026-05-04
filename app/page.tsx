 "use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useKasam } from "./providers";
import { formatMoney, isToday, isCurrentMonth } from "./utils";
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Activity 
} from "lucide-react";

export default function Page() {
  const { sales, expenses, accounts } = useKasam();

  // Hesaplamalar (Aynı kalıyor)
  const todaySalesList = sales.filter((s) => isToday(s.date));
  const todaySales = todaySalesList.reduce((t, s) => t + s.amount, 0);
  const todayExpenses = expenses.filter((e) => isToday(e.date)).reduce((t, e) => t + e.amount, 0);
  const cash = todaySalesList.filter((s) => s.type === "Nakit").reduce((t, s) => t + s.amount, 0);
  const pos = todaySalesList.filter((s) => s.type === "Kart").reduce((t, s) => t + s.amount, 0);
  const receivable = accounts.filter((i) => i.type === "Alacak" && !i.paid).reduce((t, i) => t + i.amount, 0);
  const payable = accounts.filter((i) => i.type === "Borç" && !i.paid).reduce((t, i) => t + i.amount, 0);
  const monthlyNet = sales.filter((s) => isCurrentMonth(s.date)).reduce((t, s) => t + s.amount, 0) - 
                     expenses.filter((e) => isCurrentMonth(e.date)).reduce((t, e) => t + e.amount, 0);
  
  const net = todaySales - todayExpenses;
  const isPositive = net >= 0;

  return (
    <main className="min-h-screen bg-[#050505] text-zinc-100 p-4 pb-24 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* TOP HERO SECTION - DAHA DA GELİŞMİŞ */}
        <motion.section 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[2.5rem] bg-[#0c0c0c] border border-white/[0.03] p-8 shadow-3xl"
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-bold">Kasa Canlı</span>
          </div>

          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-baseline gap-2">
                <h1 className="text-7xl font-bold tracking-tighter font-mono">
                  {formatMoney(net)}
                </h1>
                <span className="text-2xl text-zinc-600 font-light font-mono">₺</span>
              </div>
              <p className="mt-4 text-zinc-500 text-sm font-medium">
                Bugün henüz satış girişi yapılmadı.
              </p>
            </div>

            <div className="bg-[#141414] border border-white/[0.05] rounded-2xl p-4 text-right">
               <p className="text-[9px] uppercase tracking-widest text-zinc-600 font-black mb-1">Aylık Net</p>
               <p className={`text-lg font-bold font-mono ${monthlyNet >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                 {formatMoney(monthlyNet)} ₺
               </p>
            </div>
          </div>
        </motion.section>

        {/* ACTIONS */}
        <section className="grid grid-cols-2 gap-4">
          <Link href="/sales" className="flex h-20 items-center justify-center gap-3 rounded-3xl bg-[#10b981] hover:bg-[#0da371] text-black font-black transition-all shadow-[0_10px_30px_rgba(16,185,129,0.1)]">
            <ArrowUpRight size={22} strokeWidth={3} />
            <span className="uppercase tracking-widest text-xs">Satış Ekle</span>
          </Link>
          <Link href="/expenses" className="flex h-20 items-center justify-center gap-3 rounded-3xl bg-[#141414] border border-rose-500/20 text-rose-500 font-black transition-all">
            <ArrowDownLeft size={22} strokeWidth={3} />
            <span className="uppercase tracking-widest text-xs">Gider Ekle</span>
          </Link>
        </section>

        {/* BENTO GRID STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatBox label="Nakit" value={cash} icon={<Wallet size={14}/>} />
          <StatBox label="Kart / Pos" value={pos} icon={<CreditCard size={14}/>} />
          <StatBox label="Tahsilat" value={receivable} icon={<Activity size={14}/>} color="text-emerald-400" />
          <StatBox label="Ödemeler" value={payable} icon={<TrendingDown size={14}/>} color="text-rose-400" />
        </div>

        {/* BOTTOM CARDS */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/accounts" className="p-8 rounded-[2rem] bg-[#0c0c0c] border border-white/[0.03] hover:border-emerald-500/20 transition-all group">
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2">Müşteri & Tedarikçi</p>
            <h3 className="text-2xl font-bold">Cari Takip</h3>
            <p className="text-zinc-500 text-xs mt-2 font-medium">Alacak ve borç dengesini yönet.</p>
          </Link>

          <Link href="/accountant-package" className="p-8 rounded-[2rem] bg-[#0c0c0c] border border-white/[0.03] hover:border-amber-500/20 transition-all">
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2">Mali Özet</p>
            <h3 className="text-2xl font-bold">Muhasebe Paketi</h3>
            <p className="text-zinc-500 text-xs mt-2 font-medium">Ay sonu raporlarını tek tıkla hazırla.</p>
          </Link>
        </section>

      </div>
    </main>
  );
}

function StatBox({ label, value, icon, color = "text-white" }: { label: string, value: number, icon: any, color?: string }) {
  return (
    <div className="bg-[#0c0c0c] border border-white/[0.03] rounded-[2rem] p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-white/[0.03] rounded-lg text-zinc-500">{icon}</div>
      </div>
      <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-xl font-bold font-mono ${color}`}>{formatMoney(value)}<span className="text-[10px] ml-1 opacity-40">₺</span></p>
    </div>
  );
}