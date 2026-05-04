"use client";

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
  const totalExpenses = todayExpensesList.reduce(
    (total, expense) => total + expense.amount,
    0
  );

  const parsedAmount = parseAmount(amount);
  const isValid = parsedAmount > 0;

  const buttonLabel =
    amount === ""
      ? "Tutar yaz"
      : !isValid
      ? "Geçerli tutar gir"
      : "Gideri Kaydet";

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
    <div className="rounded-[2rem] border border-white/10 bg-[#0b0b0f] p-4 shadow-2xl">
      <p className="text-xs font-semibold text-zinc-500">Kategori seç</p>

      <div className="mt-2 grid grid-cols-3 gap-2">
        {CATEGORIES.map((cat) => (
          <motion.button
            key={cat}
            whileTap={{ scale: 0.96 }}
            onClick={() => setCategory(cat)}
            className={`rounded-2xl px-2 py-3 text-xs font-black transition ${
              category === cat
                ? "bg-red-400 text-black shadow-lg shadow-red-500/20"
                : "bg-white/5 text-zinc-400"
            }`}
          >
            <span className="mr-1">{CAT_ICON[cat]}</span>
            {cat}
          </motion.button>
        ))}
      </div>

      <p className="mt-4 text-xs font-semibold text-zinc-500">Gider tutarını yaz</p>

      <div
        className={`mt-2 rounded-2xl border bg-black/40 px-4 py-4 transition ${
          isValid ? "border-red-400/40" : "border-white/10"
        }`}
      >
        <input
          type="text"
          inputMode="decimal"
          autoComplete="off"
          enterKeyHint="done"
          pattern="[0-9.,]*"
          className="w-full bg-transparent text-4xl font-black tracking-tight outline-none placeholder:text-zinc-700"
          placeholder="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^0-9.,]/g, ""))}
        />
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="text-[11px] text-zinc-600">₺ otomatik eklenir</p>
          {isValid && (
            <p className="text-lg font-black text-red-400">
              -{formatMoney(parsedAmount)} ₺
            </p>
          )}
        </div>
      </div>

      <p className="mt-3 text-xs font-semibold text-zinc-500">Tarih</p>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value || getTodayLocalDate())}
        style={{ colorScheme: "dark" }}
        className="mt-1 w-full rounded-xl border border-white/5 bg-black/60 px-3 py-2.5 text-sm text-zinc-300 outline-none focus:border-red-400/40"
      />

      <div className="mt-3">
        <AnimatePresence mode="wait">
          {saved ? (
            <motion.div
              key="saved"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="flex h-14 items-center justify-center rounded-2xl border border-red-400/30 bg-red-400/10 font-black text-red-400"
            >
              ✓ Gider kaydedildi
            </motion.div>
          ) : (
            <motion.button
              key="save"
              whileTap={isValid ? { scale: 0.96 } : undefined}
              onClick={handleAddExpense}
              className={`h-14 w-full rounded-2xl font-black transition ${
                isValid
                  ? "bg-red-400 text-black shadow-xl shadow-red-500/20"
                  : "bg-white/5 text-zinc-500"
              }`}
            >
              {buttonLabel}
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <button
        type="button"
        onClick={() => setShowDetail(!showDetail)}
        className="mt-3 text-xs font-semibold text-zinc-500"
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
              className="mt-3 w-full rounded-xl border border-white/5 bg-black/60 p-3 text-sm outline-none placeholder:text-zinc-600 focus:border-red-400/40"
              placeholder="Açıklama"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const filterBar = (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {(["today", "yesterday", "month", "all"] as const).map((f) => (
        <button
          key={f}
          type="button"
          onClick={() => setFilter(f)}
          className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-black transition active:scale-95 ${
            filter === f ? "bg-white text-black" : "bg-white/5 text-zinc-400"
          }`}
        >
          {FILTER_LABELS[f]}
        </button>
      ))}
    </div>
  );

  const expenseList = (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold">{LIST_TITLES[filter]}</p>
        <span className="text-xs text-zinc-500">{expenses.length} kayıt</span>
      </div>

      {filterBar}

      {filteredExpenses.length === 0 && (
        <div className="rounded-[1.5rem] border border-white/5 bg-[#0b0b0f] p-6 text-center">
          <p className="text-3xl">📋</p>
          <p className="mt-2 text-sm font-semibold text-zinc-400">
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
            className="rounded-xl border border-white/5 bg-[#0b0b0f] p-3"
          >
            {editingId === expense.id ? (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-zinc-500">
                  Gideri düzelt
                </p>

                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setEditCategory(cat)}
                      className={`rounded-xl px-1 py-2 text-xs font-black transition active:scale-95 ${
                        editCategory === cat
                          ? "bg-red-400 text-black"
                          : "bg-white/5 text-zinc-400"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/40 px-3 py-3">
                  <input
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    enterKeyHint="done"
                    pattern="[0-9.,]*"
                    className="w-full bg-transparent text-2xl font-black tracking-tight outline-none placeholder:text-zinc-700"
                    placeholder="0"
                    value={editAmount}
                    onChange={(e) =>
                      setEditAmount(e.target.value.replace(/[^0-9.,]/g, ""))
                    }
                  />
                </div>

                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value || getTodayLocalDate())}
                  style={{ colorScheme: "dark" }}
                  className="w-full rounded-xl border border-white/5 bg-black/60 px-3 py-2.5 text-sm text-zinc-300 outline-none focus:border-red-400/40"
                />

                <input
                  type="text"
                  className="w-full rounded-xl border border-white/5 bg-black/60 p-3 text-sm outline-none placeholder:text-zinc-600 focus:border-red-400/40"
                  placeholder="Açıklama"
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                />

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSaveExpenseEdit}
                    className="flex-1 rounded-xl bg-red-400 py-2.5 text-sm font-black text-black active:scale-95"
                  >
                    Kaydet
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="flex-1 rounded-xl bg-white/5 py-2.5 text-sm font-black text-zinc-400 active:scale-95"
                  >
                    Vazgeç
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-400/10 text-base text-red-300">
                      {CAT_ICON[expense.category] ?? "•"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">
                        {expense.note || expense.category}
                      </p>
                      <p className="text-[11px] text-zinc-500">
                        {expense.category} · {formatDateTR(expense.date)}
                      </p>
                    </div>
                  </div>
                  <p className="font-black text-red-400">
                    -{formatMoney(expense.amount)} ₺
                  </p>
                </div>

                <div className="mt-2 flex items-center justify-end gap-2">
                  {confirmDeleteExpenseId === expense.id ? (
                    <>
                      <span className="text-[11px] text-zinc-400">Silinsin mi?</span>
                      <button
                        type="button"
                        onClick={() => {
                          deleteExpense(expense.id!);
                          setConfirmDeleteExpenseId(null);
                        }}
                        className="rounded-lg bg-red-400 px-3 py-1 text-[11px] font-black text-black active:scale-95"
                      >
                        Evet sil
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteExpenseId(null)}
                        className="rounded-lg bg-white/5 px-3 py-1 text-[11px] font-semibold text-zinc-400 active:scale-95"
                      >
                        Vazgeç
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => startEditExpense(expense)}
                        className="rounded-lg bg-zinc-800 px-3 py-1 text-[11px] font-semibold text-zinc-300 active:scale-95"
                      >
                        Düzelt
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteExpenseId(expense.id!)}
                        className="rounded-lg bg-red-400/10 px-3 py-1 text-[11px] font-semibold text-red-400 active:scale-95"
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
    <main className="min-h-dvh bg-[radial-gradient(circle_at_top_left,rgba(248,113,113,0.14),transparent_32%),radial-gradient(circle_at_top_right,rgba(244,63,94,0.08),transparent_28%),#07070a] text-white">
      {/* MOBILE APP VERSION */}
      <div className="md:hidden px-4 pb-28 pt-3">
        <div className="space-y-3">
          <section className="rounded-[2rem] border border-red-400/20 bg-[#0b0b0f] p-4 shadow-2xl shadow-red-500/5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
                  Bugünkü gider
                </p>
                <h1 className="mt-1 text-3xl font-black tracking-tight text-red-400">
                  {formatMoney(totalExpenses)} ₺
                </h1>
              </div>
              <div className="rounded-full bg-red-400/10 px-3 py-1 text-[11px] font-black text-red-300">
                {todayExpensesList.length} kayıt
              </div>
            </div>
          </section>

          {inputForm}
          {expenseList}
        </div>
      </div>

      {/* DESKTOP VERSION - ESKİ YAPI KORUNDU */}
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
            <div className="shrink-0 rounded-3xl border border-white/10 bg-[#0b0b0f] p-5">
              <p className="text-sm text-zinc-400">Toplam gider</p>
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
