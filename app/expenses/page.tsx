 "use client";

import Link from "next/link";
import { useState } from "react";
import { useKasam } from "../providers";
import { motion, AnimatePresence } from "framer-motion";
import {
  formatMoney,
  parseAmount,
  getTodayLocalDate,
  isToday,
  isYesterday,
  isCurrentMonth,
  formatDateTR,
} from "../utils";
import { Expense } from "../providers";

const CATEGORIES = ["Kira", "Personel", "Fatura", "Malzeme", "Reklam", "Diğer"];

const CAT_ICON: Record<string, string> = {
  Kira: "🏢",
  Personel: "👤",
  Fatura: "📄",
  Malzeme: "📦",
  Reklam: "📢",
  Diğer: "•",
};

type Filter = "today" | "yesterday" | "month" | "all";

const FILTER_LABELS: Record<Filter, string> = {
  today: "Bugün",
  yesterday: "Dün",
  month: "Bu ay",
  all: "Tümü",
};

const LIST_TITLES: Record<Filter, string> = {
  today: "Bugünkü giderler",
  yesterday: "Dünkü giderler",
  month: "Bu ayki giderler",
  all: "Son giderler",
};

export default function ExpensesPage() {
  const { expenses, addExpense, updateExpense, deleteExpense } = useKasam();

  const [category, setCategory] = useState("Kira");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(getTodayLocalDate());
  const [showDetail, setShowDetail] = useState(false);
  const [saved, setSaved] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editCategory, setEditCategory] = useState("Kira");
  const [editNote, setEditNote] = useState("");
  const [editDate, setEditDate] = useState(getTodayLocalDate());
  const [confirmDeleteExpenseId, setConfirmDeleteExpenseId] = useState<string | null>(null);

  const [filter, setFilter] = useState<Filter>("today");

  const todayExpensesList = expenses.filter((e) => isToday(e.date));
  const totalExpenses = todayExpensesList.reduce((total, expense) => total + expense.amount, 0);

  const parsedAmount = parseAmount(amount);
  const isValid = parsedAmount > 0;

  const buttonLabel =
    amount === "" ? "Tutar yaz" : !isValid ? "Geçerli tutar gir" : "Gideri Kaydet";

  const handleAddExpense = () => {
    if (!isValid) return;

    addExpense({
      amount: parsedAmount,
      category,
      note,
      date: date || getTodayLocalDate(),
    });

    setAmount("");
    setNote("");
    setDate(getTodayLocalDate());
    setShowDetail(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const startEditExpense = (expense: Expense) => {
    setEditingId(expense.id ?? null);
    setEditAmount(String(expense.amount));
    setEditCategory(expense.category);
    setEditNote(expense.note);
    setEditDate(expense.date || getTodayLocalDate());
    setConfirmDeleteExpenseId(null);
  };

  const handleSaveExpenseEdit = () => {
    if (!editingId) return;

    const expense = expenses.find((e) => e.id === editingId);
    if (!expense) return;

    const parsed = parseAmount(editAmount);
    if (parsed <= 0) return;

    updateExpense(editingId, {
      ...expense,
      amount: parsed,
      category: editCategory,
      note: editNote,
      date: editDate || expense.date || getTodayLocalDate(),
    });

    setEditingId(null);
  };

  const filteredExpenses = expenses
    .filter((expense) => {
      if (filter === "today") return isToday(expense.date);
      if (filter === "yesterday") return isYesterday(expense.date);
      if (filter === "month") return isCurrentMonth(expense.date);
      return true;
    })
    .slice(0, 20);

  const inputForm = (
    <div className="relative z-10 overflow-hidden rounded-[2.5rem] border border-white/[0.05] bg-[#0c0c0c] p-5 shadow-2xl shadow-red-500/[0.04]">
      <div className="pointer-events-none absolute -left-14 -top-14 h-40 w-40 rounded-full bg-red-500/10 blur-[70px]" />

      <p className="relative text-center text-[10px] font-black uppercase tracking-[0.24em] text-zinc-500">
        Gider Tutarı
      </p>

      <div
        className={`relative mt-4 rounded-[2rem] border bg-black/50 px-4 py-6 transition ${
          isValid
            ? "border-red-400/40 shadow-[0_0_32px_rgba(248,113,113,0.10)]"
            : "border-white/[0.06]"
        }`}
      >
        <div className="flex items-end justify-center gap-3">
          <input
            type="text"
            inputMode="decimal"
            autoComplete="off"
            enterKeyHint="done"
            pattern="[0-9.,]*"
            className="w-full bg-transparent text-center text-6xl font-black tracking-[-0.08em] text-white outline-none placeholder:text-zinc-800"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.,]/g, ""))}
          />
          <span className="pb-2 text-3xl font-light text-zinc-600">₺</span>
        </div>

        {isValid && (
          <p className="mt-3 text-center text-sm font-black text-red-400">
            -{formatMoney(parsedAmount)} ₺
          </p>
        )}
      </div>

      <p className="mt-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
        Kategori
      </p>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {CATEGORIES.map((cat) => (
          <motion.button
            key={cat}
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={() => setCategory(cat)}
            className={`flex flex-col items-center justify-center gap-2 rounded-3xl border py-4 text-[10px] font-black uppercase tracking-widest transition ${
              category === cat
                ? "border-red-400/40 bg-red-400/10 text-red-400 shadow-[0_0_22px_rgba(248,113,113,0.12)]"
                : "border-white/[0.05] bg-white/[0.035] text-zinc-500"
            }`}
          >
            <span className="text-lg">{CAT_ICON[cat]}</span>
            {cat}
          </motion.button>
        ))}
      </div>

      <p className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
        Tarih
      </p>

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value || getTodayLocalDate())}
        style={{ colorScheme: "dark" }}
        className="mt-2 w-full rounded-2xl border border-white/[0.06] bg-black/50 px-4 py-3 text-sm font-semibold text-zinc-300 outline-none transition focus:border-red-400/40"
      />

      <button
        type="button"
        onClick={() => setShowDetail(!showDetail)}
        className="mt-4 text-xs font-bold text-zinc-500"
      >
        {showDetail ? "açıklamayı gizle ↑" : "+ açıklama ekle"}
      </button>

      <AnimatePresence>
        {showDetail && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <input
              type="text"
              className="mt-3 w-full rounded-2xl border border-white/[0.06] bg-black/50 p-4 text-sm text-zinc-200 outline-none placeholder:text-zinc-700 transition focus:border-red-400/40"
              placeholder="Açıklama"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-5">
        <AnimatePresence mode="wait">
          {saved ? (
            <motion.div
              key="saved"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="flex h-20 items-center justify-center rounded-3xl border border-red-400/30 bg-red-400/10 font-black text-red-400"
            >
              ✓ Gider kaydedildi
            </motion.div>
          ) : (
            <motion.button
              key="save"
              type="button"
              whileTap={isValid ? { scale: 0.96 } : undefined}
              onClick={handleAddExpense}
              className={`flex h-20 w-full items-center justify-center gap-3 rounded-3xl text-sm font-black uppercase tracking-widest transition ${
                isValid
                  ? "bg-red-400 text-black shadow-[0_12px_34px_rgba(248,113,113,0.20)]"
                  : "bg-white/[0.04] text-zinc-600"
              }`}
            >
              <span>✓</span>
              {buttonLabel}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  const filterBar = (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {(["today", "yesterday", "month", "all"] as const).map((f) => (
        <button
          key={f}
          type="button"
          onClick={() => setFilter(f)}
          className={`shrink-0 rounded-full border px-4 py-2 text-[11px] font-black uppercase tracking-widest transition active:scale-95 ${
            filter === f
              ? "border-white bg-white text-black"
              : "border-white/[0.06] bg-white/[0.04] text-zinc-500"
          }`}
        >
          {FILTER_LABELS[f]}
        </button>
      ))}
    </div>
  );

  const expenseList = (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-black tracking-tight">{LIST_TITLES[filter]}</p>
        <span className="rounded-full border border-white/[0.06] bg-white/[0.04] px-3 py-1 text-[11px] font-bold text-zinc-500">
          {expenses.length} kayıt
        </span>
      </div>

      {filterBar}

      {filteredExpenses.length === 0 && (
        <div className="rounded-[2rem] border border-white/[0.06] bg-[#0c0c0c] p-7 text-center shadow-2xl shadow-black/20">
          <p className="text-3xl">📋</p>
          <p className="mt-3 text-sm font-bold text-zinc-400">
            {filter === "today"
              ? "Bugün gider yok"
              : filter === "yesterday"
              ? "Dün gider yok"
              : filter === "month"
              ? "Bu ay gider yok"
              : "Henüz gider yok"}
          </p>
          <p className="mt-1 text-xs text-zinc-600">
            Gider ekle → nereye para gittiğini gör.
          </p>
        </div>
      )}

      <AnimatePresence>
        {filteredExpenses.map((expense, i) => (
          <motion.div
            key={expense.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="rounded-[1.5rem] border border-white/[0.06] bg-[#0c0c0c] p-4 shadow-xl shadow-black/20"
          >
            {editingId === expense.id ? (
              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                  Gideri düzelt
                </p>

                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setEditCategory(cat)}
                      className={`rounded-2xl border px-1 py-2.5 text-xs font-black transition active:scale-95 ${
                        editCategory === cat
                          ? "border-red-400/40 bg-red-400 text-black"
                          : "border-white/[0.06] bg-white/[0.04] text-zinc-500"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  enterKeyHint="done"
                  pattern="[0-9.,]*"
                  className="w-full rounded-2xl border border-white/[0.06] bg-black/50 px-4 py-4 text-3xl font-black outline-none placeholder:text-zinc-700"
                  placeholder="0"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value.replace(/[^0-9.,]/g, ""))}
                />

                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value || getTodayLocalDate())}
                  style={{ colorScheme: "dark" }}
                  className="w-full rounded-2xl border border-white/[0.06] bg-black/50 px-4 py-3 text-sm text-zinc-300 outline-none transition focus:border-red-400/40"
                />

                <input
                  type="text"
                  className="w-full rounded-2xl border border-white/[0.06] bg-black/50 p-4 text-sm outline-none placeholder:text-zinc-600 transition focus:border-red-400/40"
                  placeholder="Açıklama"
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                />

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSaveExpenseEdit}
                    className="flex-1 rounded-2xl bg-red-400 py-3 text-sm font-black text-black active:scale-95"
                  >
                    Kaydet
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="flex-1 rounded-2xl bg-white/[0.05] py-3 text-sm font-black text-zinc-400 active:scale-95"
                  >
                    Vazgeç
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-red-400/10 bg-red-400/10 text-base text-red-300">
                      {CAT_ICON[expense.category] ?? "•"}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-zinc-100">
                        {expense.note || expense.category}
                      </p>
                      <p className="mt-0.5 text-[11px] font-medium text-zinc-500">
                        {expense.category} · {formatDateTR(expense.date)}
                      </p>
                    </div>
                  </div>

                  <p className="shrink-0 text-lg font-black tracking-tight text-red-400">
                    -{formatMoney(expense.amount)} ₺
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-end gap-2">
                  {confirmDeleteExpenseId === expense.id ? (
                    <>
                      <span className="text-[11px] text-zinc-400">Silinsin mi?</span>
                      <button
                        type="button"
                        onClick={() => {
                          deleteExpense(expense.id!);
                          setConfirmDeleteExpenseId(null);
                        }}
                        className="rounded-xl bg-red-400 px-3 py-1.5 text-[11px] font-black text-black active:scale-95"
                      >
                        Evet sil
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteExpenseId(null)}
                        className="rounded-xl bg-white/[0.05] px-3 py-1.5 text-[11px] font-semibold text-zinc-400 active:scale-95"
                      >
                        Vazgeç
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => startEditExpense(expense)}
                        className="rounded-xl bg-white/[0.06] px-3 py-1.5 text-[11px] font-semibold text-zinc-300 active:scale-95"
                      >
                        Düzelt
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteExpenseId(expense.id!)}
                        className="rounded-xl bg-red-400/10 px-3 py-1.5 text-[11px] font-semibold text-red-400 active:scale-95"
                      >
                        Sil
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );

  return (
    <main className="min-h-dvh bg-[radial-gradient(circle_at_top_left,rgba(248,113,113,0.14),transparent_32%),radial-gradient(circle_at_top_right,rgba(244,63,94,0.08),transparent_28%),#050507] text-white">
      <div className="px-4 pb-32 pt-4 md:hidden">
        <div className="mb-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.04] text-lg text-zinc-400"
          >
            ←
          </Link>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-zinc-500">
            Gider Kaydı
          </p>
          <div className="h-11 w-11" />
        </div>

        <div className="space-y-4">
          <section className="overflow-hidden rounded-[2.25rem] border border-red-400/20 bg-[#0c0c0c] p-5 shadow-2xl shadow-red-500/[0.04]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">
                  Bugünkü gider
                </p>
                <h1 className="mt-2 text-4xl font-black tracking-[-0.06em] text-red-400">
                  {formatMoney(totalExpenses)} ₺
                </h1>
                <p className="mt-2 text-xs font-medium text-zinc-500">
                  Harcamalarını kategoriye göre takip et.
                </p>
              </div>
              <div className="rounded-full border border-red-400/20 bg-red-400/10 px-3 py-1.5 text-[11px] font-black text-red-300">
                {todayExpensesList.length} kayıt
              </div>
            </div>
          </section>

          {inputForm}
          {expenseList}
        </div>
      </div>

      <div className="hidden pb-10 md:block">
        <section className="relative mx-6 mt-6 hidden overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-red-950/60 via-zinc-950 to-black p-8 shadow-2xl md:block">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-red-500/20 blur-3xl" />
          <div className="relative flex items-end justify-between gap-6">
            <div>
              <div className="mb-4 inline-flex rounded-full border border-red-400/20 bg-red-400/10 px-4 py-2 text-xs font-semibold text-red-300">
                Gider yönetimi
              </div>
              <h2 className="text-4xl font-black tracking-tight lg:text-5xl">
                Her gideri kategoriye kaydet.
              </h2>
            </div>
            <div className="shrink-0 rounded-3xl border border-white/10 bg-[#0c0c0c] p-5">
              <p className="text-sm text-zinc-400">Bugünkü gider</p>
              <p className="mt-2 text-4xl font-black text-red-300">
                {formatMoney(totalExpenses)} ₺
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                {todayExpensesList.length} kayıt
              </p>
            </div>
          </div>
        </section>

        <div className="mt-6 hidden gap-6 px-6 md:grid md:grid-cols-[1fr_1.2fr]">
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Yeni gider ekle</h3>
            {inputForm}
          </div>
          <div>
            <h3 className="mb-4 text-xl font-bold">Son giderler</h3>
            {expenseList}
          </div>
        </div>
      </div>
    </main>
  );
}