"use client";

import { useState } from "react";
import { useKasam } from "../providers";
import { formatMoney, isCurrentMonth } from "../utils";

export default function AccountantPackagePage() {
  const { sales, expenses, accounts } = useKasam();
  const [packageReady, setPackageReady] = useState(false);
  const [clipboardFailed, setClipboardFailed] = useState(false);

  const monthlySales = sales.filter((s) => isCurrentMonth(s.date));
  const monthlyExpenses = expenses.filter((e) => isCurrentMonth(e.date));

  const totalSales = monthlySales.reduce((total, s) => total + s.amount, 0);
  const totalExpenses = monthlyExpenses.reduce(
    (total, e) => total + e.amount,
    0
  );
  const net = totalSales - totalExpenses;

  const cash = monthlySales
    .filter((s) => s.type === "Nakit")
    .reduce((total, s) => total + s.amount, 0);

  const card = monthlySales
    .filter((s) => s.type === "Kart")
    .reduce((total, s) => total + s.amount, 0);

  const transfer = monthlySales
    .filter((s) => s.type === "Havale")
    .reduce((total, s) => total + s.amount, 0);

  const other = monthlySales
    .filter((s) => s.type === "Diğer")
    .reduce((total, s) => total + s.amount, 0);

  const openReceivable = accounts
    .filter((item) => item.type === "Alacak" && !item.paid)
    .reduce((total, item) => total + item.amount, 0);

  const openPayable = accounts
    .filter((item) => item.type === "Borç" && !item.paid)
    .reduce((total, item) => total + item.amount, 0);

  const monthlyRecordCount = monthlySales.length + monthlyExpenses.length;
  const openAccountCount = accounts.filter((a) => !a.paid).length;

  const expenseCategories = [
    "Kira",
    "Malzeme",
    "Personel",
    "Fatura",
    "Reklam",
    "Diğer",
  ];

  const summaryText =
    `Kasam Ay Sonu Özeti\n` +
    `Bu ay gelir: ${formatMoney(totalSales)} ₺\n` +
    `Bu ay gider: ${formatMoney(totalExpenses)} ₺\n` +
    `Net: ${formatMoney(net)} ₺\n` +
    `Açık alacak: ${formatMoney(openReceivable)} ₺\n` +
    `Açık borç: ${formatMoney(openPayable)} ₺`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summaryText);
      setClipboardFailed(false);
    } catch {
      setClipboardFailed(true);
    }
    setPackageReady(true);
  };

  const successBox = packageReady ? (
    clipboardFailed ? (
      <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4">
        <p className="text-sm font-black text-amber-400">Metni seç ve kopyala</p>
        <pre className="mt-2 whitespace-pre-wrap text-xs leading-5 text-zinc-400">
          {summaryText}
        </pre>
      </div>
    ) : (
      <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-center">
        <p className="text-sm font-black text-emerald-400">✓ Özet panoya kopyalandı</p>
        <p className="mt-1 text-xs text-zinc-500">
          WhatsApp veya muhasebecine yapıştırabilirsin.
        </p>
      </div>
    )
  ) : null;

  const copyButton = (isMobile: boolean) => (
    <button
      onClick={handleCopy}
      className={
        isMobile
          ? "mt-4 h-14 w-full rounded-2xl bg-amber-300 font-black text-black shadow-lg shadow-amber-500/20 active:scale-95"
          : "mt-6 w-full rounded-2xl bg-amber-300 px-6 py-4 font-black text-black shadow-lg shadow-amber-500/20 transition hover:bg-amber-200 active:scale-95"
      }
    >
      Özeti Kopyala
    </button>
  );

  return (
    <main className="min-h-dvh bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.14),transparent_32%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.08),transparent_28%),#07070a] text-white">
      {/* MOBILE APP VERSION */}
      <div className="md:hidden px-4 pb-28 pt-3">
        <div className="space-y-3">
          <section className="rounded-[2rem] border border-amber-400/20 bg-[#0b0b0f] p-4 shadow-2xl shadow-amber-500/5">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
              Muhasebe paketi
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight">
              Ay sonu özeti
            </h1>

            <div className="mt-4 rounded-2xl border border-white/10 bg-black/40 p-4">
              <p className="text-[11px] text-zinc-500">Net durum</p>
              <p
                className={`mt-1 text-3xl font-black ${
                  net >= 0 ? "text-emerald-300" : "text-red-300"
                }`}
              >
                {formatMoney(net)} ₺
              </p>
            </div>
          </section>

          {monthlyRecordCount === 0 && (
            <section className="rounded-[1.5rem] border border-amber-400/20 bg-[#0b0b0f] p-6 text-center">
              <p className="text-3xl">📦</p>
              <p className="mt-3 text-base font-black">Bu ay kayıt yok</p>
              <p className="mt-2 text-xs leading-5 text-zinc-500">
                Bu ay satış ve gider ekledikçe muhasebe özeti otomatik oluşur.
              </p>
            </section>
          )}

          <section className="grid grid-cols-2 gap-3">
            <MobileStat title="Bu ay gelir" value={totalSales} color="text-emerald-300" />
            <MobileStat title="Bu ay gider" value={totalExpenses} color="text-red-300" />
            <MobileStat title="Açık alacak" value={openReceivable} color="text-emerald-300" />
            <MobileStat title="Açık borç" value={openPayable} color="text-red-300" />
          </section>

          <section className="rounded-[1.5rem] border border-white/10 bg-[#0b0b0f] p-4">
            <h3 className="text-base font-black">Ödeme kırılımı</h3>
            <div className="mt-4 space-y-2">
              <Row label="Nakit" value={cash} tone="green" />
              <Row label="Kart / POS" value={card} tone="blue" />
              <Row label="Havale" value={transfer} tone="amber" />
              <Row label="Diğer" value={other} tone="zinc" />
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-white/10 bg-[#0b0b0f] p-4">
            <h3 className="text-base font-black">Gider kırılımı</h3>
            <div className="mt-4 space-y-2">
              {expenseCategories.map((category) => {
                const total = monthlyExpenses
                  .filter((expense) => expense.category === category)
                  .reduce((sum, expense) => sum + expense.amount, 0);
                return (
                  <Row key={category} label={category} value={total} tone="red" />
                );
              })}
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-amber-400/20 bg-[#0b0b0f] p-4">
            <h3 className="text-base font-black">Hazır özet</h3>
            <p className="mt-2 text-xs leading-5 text-zinc-500">
              Özeti kopyala, muhasebecine veya WhatsApp'a yapıştır.
            </p>

            <div className="mt-4 space-y-2">
              <ChecklistItem text="Satışlar ödeme tipine göre ayrıldı" />
              <ChecklistItem text="Giderler kategori bazında toplandı" />
              <ChecklistItem text="Açık alacak ve borçlar hesaplandı" />
            </div>

            {packageReady ? successBox : copyButton(true)}
          </section>
        </div>
      </div>

      {/* DESKTOP VERSION - ESKİ YAPI KORUNDU */}
      <div className="hidden pb-10 md:block">
        <section className="relative mx-6 mt-6 hidden overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-amber-950/60 via-zinc-950 to-black p-8 shadow-2xl md:block">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-400/20 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-4 inline-flex rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-xs font-semibold text-amber-300">
                Muhasebeciye hazır paket
              </div>
              <h2 className="text-2xl font-black tracking-tight md:text-5xl">
                Ay sonu özetini tek ekranda hazırla.
              </h2>
              <p className="mt-3 hidden max-w-2xl text-zinc-400 md:block">
                Satış, gider, ödeme tipi, açık alacak ve borçlarını temiz bir
                paket halinde gör.
              </p>
            </div>

            <div className="shrink-0 rounded-3xl border border-white/10 bg-[#0b0b0f] p-5">
              <p className="text-sm text-zinc-400">Net durum</p>
              <p
                className={`mt-2 text-4xl font-black ${
                  net >= 0 ? "text-emerald-300" : "text-red-300"
                }`}
              >
                {formatMoney(net)} ₺
              </p>
            </div>
          </div>
        </section>

        <div className="space-y-6 p-6">
          {monthlyRecordCount === 0 && (
            <div className="rounded-[1.5rem] border border-amber-400/20 bg-[#0b0b0f] p-8 text-center">
              <p className="text-3xl">📦</p>
              <p className="mt-3 text-lg font-black">Bu ay kayıt yok</p>
              <p className="mt-2 text-sm text-zinc-500">
                Bu ay satış ve gider ekledikçe muhasebe özeti otomatik oluşur.
              </p>
            </div>
          )}

          <section className="grid gap-4 md:grid-cols-3">
            <Card title="Bu ay gelir" value={totalSales} tone="green" />
            <Card title="Bu ay gider" value={totalExpenses} tone="red" />
            <Card
              title="Bu ay net"
              value={net}
              tone={net >= 0 ? "green" : "red"}
            />
          </section>

          <section className="grid gap-5 lg:grid-cols-2">
            <Box
              title="Ödeme Tipi Kırılımı"
              subtitle="Satışların nasıl tahsil edildi?"
            >
              <Row label="Nakit" value={cash} tone="green" />
              <Row label="Kart / POS" value={card} tone="blue" />
              <Row label="Havale" value={transfer} tone="amber" />
              <Row label="Diğer" value={other} tone="zinc" />
            </Box>

            <Box
              title="Gider Kategori Kırılımı"
              subtitle="Paranın en çok nereye gidiyor?"
            >
              {expenseCategories.map((category) => {
                const total = monthlyExpenses
                  .filter((expense) => expense.category === category)
                  .reduce((sum, expense) => sum + expense.amount, 0);
                return (
                  <Row key={category} label={category} value={total} tone="red" />
                );
              })}
            </Box>
          </section>

          <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[1.5rem] border border-white/10 bg-[#0b0b0f] p-6 shadow-xl">
              <h3 className="text-xl font-bold">Muhasebeciye Hazır Özet</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-500">
                Özeti kopyala, muhasebecine veya WhatsApp'a yapıştır.
              </p>

              <div className="mt-6 grid gap-3">
                <ChecklistItem text="Satış kayıtları ödeme tipine göre ayrıldı" />
                <ChecklistItem text="Gider kayıtları kategori bazında toplandı" />
                <ChecklistItem text="Açık alacak ve borçlar hesaplandı" />
                <ChecklistItem text="Muhasebeciye gönderilecek özet hazırlandı" />
              </div>

              {packageReady ? successBox : copyButton(false)}
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-[#0b0b0f] p-6 shadow-xl">
              <h3 className="text-xl font-bold">Açık Durum</h3>

              <div className="mt-5 space-y-4">
                <MiniStat
                  label="Açık Alacak"
                  value={openReceivable}
                  color="text-emerald-300"
                />
                <MiniStat
                  label="Açık Borç"
                  value={openPayable}
                  color="text-red-300"
                />
                <MiniStat
                  label="Bu Ay Kayıt"
                  value={monthlyRecordCount}
                  color="text-blue-300"
                  suffix=" kayıt"
                />
                <MiniStat
                  label="Açık Cari"
                  value={openAccountCount}
                  color="text-amber-300"
                  suffix=" kayıt"
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function MobileStat({
  title,
  value,
  color,
}: {
  title: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-[#0b0b0f] p-4 shadow-xl">
      <p className="text-xs text-zinc-500">{title}</p>
      <p className={`mt-2 text-xl font-black ${color}`}>
        {formatMoney(value)} ₺
      </p>
    </div>
  );
}

function Card({
  title,
  value,
  tone,
}: {
  title: string;
  value: number;
  tone: "green" | "red";
}) {
  const color = tone === "green" ? "text-emerald-300" : "text-red-300";
  const border =
    tone === "green" ? "border-emerald-400/20" : "border-red-400/20";

  return (
    <div
      className={`rounded-[1.5rem] border bg-[#0b0b0f] p-6 shadow-xl ${border}`}
    >
      <p className="text-sm text-zinc-400">{title}</p>
      <h3 className={`mt-3 text-3xl font-black ${color}`}>
        {formatMoney(value)} ₺
      </h3>
    </div>
  );
}

function Box({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-[#0b0b0f] p-6 shadow-xl">
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>
      <div className="mt-5 space-y-3">{children}</div>
    </div>
  );
}

function Row({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "green" | "red" | "blue" | "amber" | "zinc";
}) {
  const colors = {
    green: "text-emerald-300",
    red: "text-red-300",
    blue: "text-blue-300",
    amber: "text-amber-300",
    zinc: "text-zinc-300",
  };

  return (
    <div className="flex items-center justify-between rounded-xl border border-white/5 bg-black/40 p-4">
      <span className="text-sm text-zinc-400">{label}</span>
      <strong className={`${colors[tone]} text-sm`}>
        {formatMoney(value)} ₺
      </strong>
    </div>
  );
}

function ChecklistItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-black/40 p-4 text-sm text-zinc-300">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-400 text-xs font-black text-black">
        ✓
      </span>
      {text}
    </div>
  );
}

function MiniStat({
  label,
  value,
  color,
  suffix = " ₺",
}: {
  label: string;
  value: number;
  color: string;
  suffix?: string;
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-black/40 p-4">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className={`mt-2 text-2xl font-black ${color}`}>
        {formatMoney(value)}
        {suffix}
      </p>
    </div>
  );
}
