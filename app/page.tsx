"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useKasam } from "./providers";
import { formatMoney, isToday, isCurrentMonth } from "./utils";

export default function Page() {
  const { sales, expenses, accounts } = useKasam();

  const todaySalesList = sales.filter((s) => isToday(s.date));
  const todaySales = todaySalesList.reduce((t, s) => t + s.amount, 0);

  const todayExpenses = expenses
    .filter((e) => isToday(e.date))
    .reduce((t, e) => t + e.amount, 0);

  const cash = todaySalesList
    .filter((s) => s.type === "Nakit")
    .reduce((t, s) => t + s.amount, 0);

  const pos = todaySalesList
    .filter((s) => s.type === "Kart")
    .reduce((t, s) => t + s.amount, 0);

  const receivable = accounts
    .filter((i) => i.type === "Alacak" && !i.paid)
    .reduce((t, i) => t + i.amount, 0);

  const payable = accounts
    .filter((i) => i.type === "Borç" && !i.paid)
    .reduce((t, i) => t + i.amount, 0);

  const monthlySales = sales
    .filter((s) => isCurrentMonth(s.date))
    .reduce((t, s) => t + s.amount, 0);

  const monthlyExpenses = expenses
    .filter((e) => isCurrentMonth(e.date))
    .reduce((t, e) => t + e.amount, 0);

  const monthlyNet = monthlySales - monthlyExpenses;

  const recordCount = sales.length + expenses.length + accounts.length;
  const net = todaySales - todayExpenses;
  const isPositive = net >= 0;

  const insightText =
    recordCount === 0
      ? "Kasayı takip etmek için ilk kaydını gir."
      : todaySales === 0
      ? "Bugün hiç satış yok. En az 1 satış gir."
      : todayExpenses > todaySales
      ? "Giderler satıştan fazla. Kontrol et."
      : receivable > 0
      ? "Tahsil edilmemiş para var. Takip et."
      : payable > 0
      ? "Ödenecek borç var. Planla."
      : "Bugün kârdasın. Devam et.";

  return (
    <main className="min-h-dvh bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_32%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.10),transparent_28%),#07070a] text-white">
      {/* MOBILE APP DASHBOARD */}
      <div className="md:hidden px-4 pb-28 pt-3">
        <div className="space-y-3">
          <section className="rounded-[2rem] border border-white/10 bg-[#0b0b0f] p-4 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
                  Kasam durumu
                </p>

                <h1
                  className={`mt-2 text-4xl font-black tracking-tight ${
                    isPositive ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {formatMoney(net)} ₺
                </h1>

                <p className="mt-1 text-sm font-bold text-white">
                  {recordCount === 0
                    ? "Kasayı takip etmek için ilk kaydını gir."
                    : isPositive
                    ? "Bugün kasan iyi gidiyor"
                    : "Giderler önde"}
                </p>
              </div>

              <div
                className={`rounded-full px-3 py-1 text-[11px] font-black ${
                  recordCount === 0
                    ? "bg-zinc-400/10 text-zinc-300"
                    : isPositive
                    ? "bg-emerald-400/10 text-emerald-300"
                    : "bg-red-400/10 text-red-300"
                }`}
              >
                {recordCount === 0 ? "Başla" : isPositive ? "Kârda" : "Kontrol"}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <MiniLine label="Satış" value={todaySales} color="text-emerald-300" />
              <MiniLine label="Gider" value={todayExpenses} color="text-red-300" />
            </div>
          </section>

          <section className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/5 bg-[#0b0b0f] p-3">
              <p className="text-[11px] text-zinc-500">Bugün net</p>
              <p className={`mt-1 text-lg font-black ${net >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {formatMoney(net)} ₺
              </p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-[#0b0b0f] p-3">
              <p className="text-[11px] text-zinc-500">Bu ay net</p>
              <p className={`mt-1 text-lg font-black ${monthlyNet >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {formatMoney(monthlyNet)} ₺
              </p>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-3">
            <motion.div whileTap={{ scale: 0.96 }}>
              <Link
                href="/sales"
                className="flex h-16 items-center justify-center gap-2 rounded-2xl bg-emerald-400 text-sm font-black text-black shadow-xl shadow-emerald-500/20"
              >
                <span className="text-xl">+</span>
                Satış ekle
              </Link>
            </motion.div>

            <motion.div whileTap={{ scale: 0.96 }}>
              <Link
                href="/expenses"
                className="flex h-16 items-center justify-center gap-2 rounded-2xl border border-red-400/30 bg-red-400/10 text-sm font-black text-red-300 shadow-xl"
              >
                <span className="text-xl">−</span>
                Gider ekle
              </Link>
            </motion.div>
          </section>

          <section className="grid grid-cols-2 gap-3">
            <MobileStat label="Nakit" value={cash} color="text-yellow-300" />
            <MobileStat label="POS" value={pos} color="text-blue-300" />
            <MobileStat label="Tahsil" value={receivable} color="text-emerald-300" />
            <MobileStat label="Ödeme" value={payable} color="text-red-300" />
          </section>

          <section className="grid grid-cols-2 gap-3">
            <motion.div whileTap={{ scale: 0.96 }}>
              <Link
                href="/accounts"
                className="block rounded-[1.4rem] border border-blue-400/20 bg-blue-400/5 p-4 shadow-xl"
              >
                <p className="text-xs font-semibold text-zinc-500">Cari takip</p>
                <p className="mt-2 text-sm font-black text-blue-300">
                  Alacak / borç
                </p>
              </Link>
            </motion.div>

            <motion.div whileTap={{ scale: 0.96 }}>
              <Link
                href="/accountant-package"
                className="block rounded-[1.4rem] border border-amber-400/20 bg-amber-400/5 p-4 shadow-xl"
              >
                <p className="text-xs font-semibold text-zinc-500">Muhasebe</p>
                <p className="mt-2 text-sm font-black text-amber-300">
                  Ay sonu paketi
                </p>
              </Link>
            </motion.div>
          </section>

          <section className="rounded-[1.5rem] border border-white/10 bg-[#0b0b0f] p-4">
            <p className="text-sm font-black">Bugünün yorumu</p>
            <p className="mt-1 text-xs leading-5 text-zinc-500">
              {insightText}
            </p>
          </section>
        </div>
      </div>

      {/* DESKTOP DASHBOARD */}
      <div className="hidden px-4 pb-28 pt-3 md:block md:pb-10">
        <div className="relative mx-auto max-w-xl space-y-3 md:max-w-6xl">
          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-[1.5rem] border p-4 shadow-2xl md:p-6 ${
              isPositive
                ? "border-emerald-400/20 bg-gradient-to-br from-emerald-950/60 to-[#0b0b0f]"
                : "border-red-400/20 bg-gradient-to-br from-red-950/60 to-[#0b0b0f]"
            }`}
          >
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 md:text-xs">
              Bugün kasada ne kaldı
            </p>

            <h1
              className={`mt-1 text-4xl font-black tracking-tight md:mt-2 md:text-5xl ${
                isPositive ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {formatMoney(net)} ₺
            </h1>

            <p
              className={`mt-2 text-sm font-black md:mt-3 md:text-lg ${
                isPositive ? "text-emerald-300" : "text-red-300"
              }`}
            >
              {recordCount === 0
                ? "Kasayı takip etmek için ilk kaydını gir."
                : isPositive
                ? "Bugün iyisin 👍"
                : "Dikkat, giderler önde"}
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              {formatMoney(todaySales)} ₺ satış · {formatMoney(todayExpenses)} ₺ gider
            </p>
          </motion.section>

          <section className="grid grid-cols-2 gap-3">
            <motion.div whileTap={{ scale: 0.95 }}>
              <Link
                href="/sales"
                className="flex h-16 items-center justify-center gap-3 rounded-2xl bg-emerald-400 font-black text-black shadow-xl shadow-emerald-500/20 md:h-20"
              >
                <span className="text-xl md:text-2xl">+</span>
                <span className="text-xs md:text-sm">Satış ekle</span>
              </Link>
            </motion.div>

            <motion.div whileTap={{ scale: 0.95 }}>
              <Link
                href="/expenses"
                className="flex h-16 items-center justify-center gap-3 rounded-2xl border border-red-400/30 bg-red-400/10 font-black text-red-300 shadow-xl md:h-20"
              >
                <span className="text-xl md:text-2xl">−</span>
                <span className="text-xs md:text-sm">Gider ekle</span>
              </Link>
            </motion.div>
          </section>

          <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat label="Bugünkü satış" value={todaySales} color="text-emerald-400" />
            <Stat label="Bugünkü gider" value={todayExpenses} color="text-red-400" />
            <Stat label="Nakit" value={cash} color="text-yellow-400" />
            <Stat label="POS" value={pos} color="text-blue-400" />
          </section>

          <section className="grid grid-cols-2 gap-3 md:grid-cols-3">
            <Stat label="Tahsil edilecek" value={receivable} color="text-emerald-400" small />
            <Stat label="Ödenecek" value={payable} color="text-red-400" small />
            <Stat label="Bu ay net" value={monthlyNet} color={monthlyNet >= 0 ? "text-emerald-400" : "text-red-400"} small />
          </section>

          <section className="grid grid-cols-2 gap-3">
            <Link
              href="/accounts"
              className="rounded-[1.5rem] border border-blue-400/20 bg-[#0b0b0f] p-4 shadow-xl"
            >
              <p className="text-xs font-semibold text-zinc-500">Cari takip</p>
              <p className="mt-2 text-xl font-black text-blue-300">
                Alacak / Borç
              </p>
            </Link>

            <Link
              href="/accountant-package"
              className="rounded-[1.5rem] border border-amber-400/20 bg-[#0b0b0f] p-4 shadow-xl"
            >
              <p className="text-xs font-semibold text-zinc-500">Muhasebe</p>
              <p className="mt-2 text-xl font-black text-amber-300">
                Ay sonu paketi
              </p>
            </Link>
          </section>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className={`flex items-center gap-3 rounded-2xl border p-3 ${
              isPositive
                ? "border-emerald-400/20 bg-emerald-400/5"
                : "border-red-400/20 bg-red-400/5"
            }`}
          >
            <span className="text-lg">{isPositive ? "📈" : "📉"}</span>
            <p className={`text-xs font-semibold md:text-sm ${isPositive ? "text-emerald-300" : "text-red-300"}`}>
              {insightText}
            </p>
          </motion.div>
        </div>
      </div>
    </main>
  );
}

function MiniLine({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-black/30 p-3">
      <p className="text-[11px] text-zinc-500">{label}</p>
      <p className={`mt-1 text-lg font-black ${color}`}>
        {formatMoney(value)} ₺
      </p>
    </div>
  );
}

function MobileStat({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <motion.div
      whileTap={{ scale: 0.96 }}
      className="rounded-[1.4rem] border border-white/10 bg-[#0b0b0f] p-4 shadow-xl"
    >
      <p className="text-xs font-semibold text-zinc-500">{label}</p>
      <p className={`mt-2 text-xl font-black ${color}`}>
        {formatMoney(value)} ₺
      </p>
    </motion.div>
  );
}

function Stat({
  label,
  value,
  color,
  small,
}: {
  label: string;
  value: number;
  color: string;
  small?: boolean;
}) {
  return (
    <motion.div
      whileTap={{ scale: 0.96 }}
      className="rounded-[1.5rem] border border-white/10 bg-[#0b0b0f] p-3 shadow-xl md:p-4"
    >
      <p className="text-xs font-semibold text-zinc-500">{label}</p>
      <p className={`mt-1 font-black md:mt-2 ${small ? "text-lg md:text-xl" : "text-xl md:text-2xl"} ${color}`}>
        {formatMoney(value)} ₺
      </p>
    </motion.div>
  );
}
