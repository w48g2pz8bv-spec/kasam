"use client";

import { useState } from "react";
import { useKasam } from "../providers";
import { motion, AnimatePresence } from "framer-motion";
import { formatMoney, parseAmount, getTodayLocalDate, formatDateTR } from "../utils";
import { Account } from "../providers";

const TAB_LABEL: Record<"Alacak" | "Borç", string> = {
  Alacak: "Kimden alacağım var",
  Borç: "Kime borcum var",
};

const TAB_SHORT: Record<"Alacak" | "Borç", string> = {
  Alacak: "Alacak",
  Borç: "Borç",
};

export default function AccountsPage() {
  const { accounts, addAccount, toggleAccountPaid, updateAccount, deleteAccount } =
    useKasam();

  const [activeTab, setActiveTab] = useState<"Alacak" | "Borç">("Alacak");

  const [name, setName] = useState("");
  const [type, setType] = useState<"Alacak" | "Borç">("Alacak");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(getTodayLocalDate());
  const [showDetail, setShowDetail] = useState(false);
  const [saved, setSaved] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState<"Alacak" | "Borç">("Alacak");
  const [editAmount, setEditAmount] = useState("");
  const [editNote, setEditNote] = useState("");
  const [editDate, setEditDate] = useState(getTodayLocalDate());
  const [confirmDeleteAccountId, setConfirmDeleteAccountId] = useState<string | null>(null);

  const totalReceivable = accounts
    .filter((item) => item.type === "Alacak" && !item.paid)
    .reduce((total, item) => total + item.amount, 0);

  const totalPayable = accounts
    .filter((item) => item.type === "Borç" && !item.paid)
    .reduce((total, item) => total + item.amount, 0);

  const filteredAccounts = accounts.filter((item) => item.type === activeTab);
  const visibleAccounts = filteredAccounts.slice(0, 30);

  const accountParsedAmount = parseAmount(amount);
  const formIsValid = name.trim() !== "" && accountParsedAmount > 0;

  const handleAddAccount = () => {
    if (!formIsValid) return;
    addAccount({
      name,
      type,
      amount: accountParsedAmount,
      note,
      paid: false,
      date: date || getTodayLocalDate(),
    });
    setName("");
    setType(activeTab);
    setAmount("");
    setNote("");
    setDate(getTodayLocalDate());
    setShowDetail(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1400);
  };

  const startEditAccount = (item: Account) => {
    setEditingId(item.id ?? null);
    setEditName(item.name);
    setEditType(item.type);
    setEditAmount(String(item.amount));
    setEditNote(item.note);
    setEditDate(item.date || getTodayLocalDate());
    setConfirmDeleteAccountId(null);
  };

  const handleSaveAccountEdit = () => {
    if (!editingId) return;
    const item = accounts.find((a) => a.id === editingId);
    if (!item) return;
    const parsed = parseAmount(editAmount);
    if (parsed <= 0 || editName.trim() === "") return;
    updateAccount(editingId, {
      ...item,
      name: editName,
      type: editType,
      amount: parsed,
      note: editNote,
      date: editDate || item.date || getTodayLocalDate(),
    });
    setEditingId(null);
  };

  const mobileTypeButtons = (
    <div className="grid grid-cols-2 gap-2">
      {(["Alacak", "Borç"] as const).map((t) => (
        <motion.button
          key={t}
          whileTap={{ scale: 0.96 }}
          onClick={() => {
            setActiveTab(t);
            setType(t);
          }}
          className={`rounded-2xl py-3 text-sm font-black transition ${
            activeTab === t
              ? t === "Alacak"
                ? "bg-emerald-400 text-black shadow-lg shadow-emerald-500/20"
                : "bg-red-400 text-black shadow-lg shadow-red-500/20"
              : "bg-white/5 text-zinc-400"
          }`}
        >
          {t === "Alacak" ? "Sana borçlu" : "Sen borçlusun"}
        </motion.button>
      ))}
    </div>
  );

  const mobileForm = (
    <div className="rounded-[2rem] border border-white/10 bg-[#0b0b0f] p-4 shadow-2xl">
      <p className="text-xs font-semibold text-zinc-500">
        {type === "Alacak" ? "Kim sana borçlu?" : "Sen kime borçlusun?"}
      </p>

      <input
        type="text"
        className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-4 text-sm font-semibold outline-none placeholder:text-zinc-600 focus:border-blue-400/40"
        placeholder={type === "Alacak" ? "Müşteri adı" : "Tedarikçi / kişi adı"}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <p className="mt-4 text-xs font-semibold text-zinc-500">Tutar</p>

      <div
        className={`mt-2 rounded-2xl border bg-black/40 px-4 py-4 transition ${
          accountParsedAmount > 0
            ? type === "Alacak"
              ? "border-emerald-400/40"
              : "border-red-400/40"
            : "border-white/10"
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
          {accountParsedAmount > 0 && (
            <p
              className={`text-lg font-black ${
                type === "Alacak" ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {formatMoney(accountParsedAmount)} ₺
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
        className="mt-1 w-full rounded-xl border border-white/5 bg-black/60 px-3 py-2.5 text-sm text-zinc-300 outline-none focus:border-blue-400/40"
      />

      <div className="mt-3">
        <AnimatePresence mode="wait">
          {saved ? (
            <motion.div
              key="saved"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="flex h-14 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-400/10 font-black text-emerald-400"
            >
              ✓ Kayıt oluşturuldu
            </motion.div>
          ) : (
            <motion.button
              key="save"
              whileTap={formIsValid ? { scale: 0.96 } : undefined}
              onClick={handleAddAccount}
              className={`h-14 w-full rounded-2xl font-black transition ${
                formIsValid
                  ? type === "Alacak"
                    ? "bg-emerald-400 text-black shadow-xl shadow-emerald-500/20"
                    : "bg-red-400 text-black shadow-xl shadow-red-500/20"
                  : "bg-white/5 text-zinc-500"
              }`}
            >
              {formIsValid ? "Kaydı oluştur" : "Bilgileri doldur"}
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
              className="mt-3 w-full rounded-xl border border-white/5 bg-black/60 p-3 text-sm outline-none placeholder:text-zinc-600 focus:border-blue-400/40"
              placeholder="Açıklama"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const desktopAddForm = (
    <div className="space-y-3 rounded-[1.5rem] border border-white/10 bg-[#0b0b0f] p-4">
      <div className="flex gap-2">
        {(["Alacak", "Borç"] as const).map((t) => (
          <motion.button
            key={t}
            whileTap={{ scale: 0.92 }}
            onClick={() => setType(t)}
            className={`flex-1 rounded-xl py-3 text-sm font-black transition ${
              type === t
                ? t === "Alacak"
                  ? "bg-emerald-400 text-black"
                  : "bg-red-400 text-black"
                : "bg-white/5 text-zinc-400"
            }`}
          >
            {TAB_SHORT[t]}
          </motion.button>
        ))}
      </div>

      <input
        className="w-full rounded-xl border border-white/5 bg-black/60 p-3 text-sm outline-none transition placeholder:text-zinc-600 focus:border-blue-400/40"
        placeholder={type === "Alacak" ? "Kim sana borçlu?" : "Sen kime borçlusun?"}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <div className="space-y-1">
        <input
          type="text"
          inputMode="decimal"
          autoComplete="off"
          enterKeyHint="done"
          pattern="[0-9.,]*"
          className="relative z-10 w-full rounded-xl border border-white/5 bg-black/60 p-3 text-sm outline-none transition placeholder:text-zinc-600 focus:border-blue-400/40"
          placeholder="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^0-9.,]/g, ""))}
        />
        <p className="px-1 text-[11px] text-zinc-600">₺ otomatik eklenir</p>
        {accountParsedAmount > 0 && (
          <p
            className={`px-1 text-sm font-black ${
              type === "Alacak" ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {formatMoney(accountParsedAmount)} ₺
          </p>
        )}
      </div>

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value || getTodayLocalDate())}
        style={{ colorScheme: "dark" }}
        className="w-full rounded-xl border border-white/5 bg-black/60 px-3 py-2.5 text-sm text-zinc-300 outline-none transition focus:border-blue-400/40"
      />

      <input
        className="w-full rounded-xl border border-white/5 bg-black/60 p-3 text-sm outline-none transition placeholder:text-zinc-600 focus:border-blue-400/40"
        placeholder="Açıklama (opsiyonel)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={handleAddAccount}
        className={`w-full rounded-xl py-3 text-sm font-black shadow-lg transition ${
          formIsValid
            ? "bg-white text-black hover:bg-zinc-100"
            : "bg-white/10 text-zinc-500"
        }`}
      >
        {formIsValid ? "Kaydı oluştur" : "Bilgileri doldur"}
      </motion.button>
    </div>
  );

  const accountRows = (
    <AnimatePresence>
      {visibleAccounts.map((item, i) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.03 }}
          className={`rounded-xl border p-3 transition ${
            item.paid
              ? "border-white/5 bg-[#0b0b0f] opacity-50"
              : activeTab === "Alacak"
              ? "border-emerald-400/20 bg-[#0b0b0f]"
              : "border-red-400/20 bg-[#0b0b0f]"
          }`}
        >
          {editingId === item.id ? (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-zinc-500">
                Cari kaydı düzelt
              </p>

              <div className="grid grid-cols-2 gap-2">
                {(["Alacak", "Borç"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setEditType(t)}
                    className={`rounded-xl py-2 text-xs font-black transition active:scale-95 ${
                      editType === t
                        ? t === "Alacak"
                          ? "bg-emerald-400 text-black"
                          : "bg-red-400 text-black"
                        : "bg-white/5 text-zinc-400"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <input
                type="text"
                className="w-full rounded-xl border border-white/5 bg-black/60 p-3 text-sm outline-none placeholder:text-zinc-600 focus:border-blue-400/40"
                placeholder="Ad"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />

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
                className="w-full rounded-xl border border-white/5 bg-black/60 px-3 py-2.5 text-sm text-zinc-300 outline-none focus:border-blue-400/40"
              />

              <input
                type="text"
                className="w-full rounded-xl border border-white/5 bg-black/60 p-3 text-sm outline-none placeholder:text-zinc-600 focus:border-blue-400/40"
                placeholder="Açıklama"
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSaveAccountEdit}
                  className={`flex-1 rounded-xl py-2.5 text-sm font-black active:scale-95 ${
                    editType === "Alacak"
                      ? "bg-emerald-400 text-black"
                      : "bg-red-400 text-black"
                  }`}
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
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{item.name}</p>
                  <p className="text-[11px] text-zinc-500">
                    {formatDateTR(item.date)}
                    {item.note ? ` · ${item.note}` : ""}
                  </p>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-1">
                  <p
                    className={`font-black ${
                      item.type === "Alacak" ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {formatMoney(item.amount)} ₺
                  </p>

                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    onClick={() => toggleAccountPaid(item.id!)}
                    className={`rounded-full px-3 py-1.5 text-[11px] font-black transition ${
                      item.paid
                        ? "bg-white/10 text-zinc-400"
                        : "bg-yellow-300 text-black shadow-lg shadow-yellow-500/20"
                    }`}
                  >
                    {item.paid ? "Ödendi" : "Bekliyor"}
                  </motion.button>
                </div>
              </div>

              <div className="mt-2 flex items-center justify-end gap-2">
                {confirmDeleteAccountId === item.id ? (
                  <>
                    <span className="text-[11px] text-zinc-400">Silinsin mi?</span>
                    <button
                      type="button"
                      onClick={() => {
                        deleteAccount(item.id!);
                        setConfirmDeleteAccountId(null);
                      }}
                      className="rounded-lg bg-red-400 px-3 py-1 text-[11px] font-black text-black active:scale-95"
                    >
                      Evet sil
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteAccountId(null)}
                      className="rounded-lg bg-white/5 px-3 py-1 text-[11px] font-semibold text-zinc-400 active:scale-95"
                    >
                      Vazgeç
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => startEditAccount(item)}
                      className="rounded-lg bg-zinc-800 px-3 py-1 text-[11px] font-semibold text-zinc-300 active:scale-95"
                    >
                      Düzelt
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteAccountId(item.id!)}
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
  );

  const emptyState = (
    <div className="rounded-[1.5rem] border border-white/5 bg-[#0b0b0f] p-6 text-center">
      <p className="text-3xl">{activeTab === "Alacak" ? "🤝" : "📤"}</p>
      <p className="mt-2 text-sm font-semibold text-zinc-400">
        {activeTab === "Alacak" ? "Kimden alacağın yok" : "Kimseye borcun yok"}
      </p>
      <p className="mt-1 text-xs text-zinc-600">
        Cari ekle → kimden alacağını unutma.
      </p>
    </div>
  );

  const desktopTabSwitcher = (
    <div className="flex gap-1.5 rounded-xl bg-white/5 p-1">
      {(["Alacak", "Borç"] as const).map((tab) => (
        <motion.button
          key={tab}
          whileTap={{ scale: 0.96 }}
          onClick={() => {
            setActiveTab(tab);
            setType(tab);
          }}
          className={`flex-1 rounded-lg py-2.5 text-sm font-black transition ${
            activeTab === tab
              ? tab === "Alacak"
                ? "bg-emerald-400 text-black shadow-lg shadow-emerald-500/20"
                : "bg-red-400 text-black shadow-lg shadow-red-500/20"
              : "text-zinc-400"
          }`}
        >
          {TAB_SHORT[tab]}
        </motion.button>
      ))}
    </div>
  );

  return (
    <main className="min-h-dvh bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.14),transparent_32%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.08),transparent_28%),#07070a] text-white">
      {/* MOBILE APP VERSION */}
      <div className="md:hidden px-4 pb-28 pt-3">
        <div className="space-y-3">
          <section className="rounded-[2rem] border border-white/10 bg-[#0b0b0f] p-4 shadow-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
              Cari takip
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-3">
                <p className="text-[11px] text-zinc-500">Sana borçlu</p>
                <p className="mt-1 text-xl font-black text-emerald-400">
                  {formatMoney(totalReceivable)} ₺
                </p>
              </div>
              <div className="rounded-2xl border border-red-400/20 bg-red-400/5 p-3">
                <p className="text-[11px] text-zinc-500">Sen borçlusun</p>
                <p className="mt-1 text-xl font-black text-red-400">
                  {formatMoney(totalPayable)} ₺
                </p>
              </div>
            </div>
          </section>

          {mobileTypeButtons}
          {mobileForm}

          <div className="flex items-center justify-between">
            <p className="text-sm font-bold">{TAB_LABEL[activeTab]}</p>
            <span className="text-xs text-zinc-500">
              {filteredAccounts.length} kayıt
            </span>
          </div>

          <div className="space-y-2">
            {filteredAccounts.length === 0 && emptyState}
            {accountRows}
          </div>
        </div>
      </div>

      {/* DESKTOP VERSION - ESKİ YAPI KORUNDU */}
      <div className="hidden pb-10 md:block">
        <section className="relative mx-6 mt-6 hidden overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-blue-950/60 via-zinc-950 to-black p-8 shadow-2xl md:block">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-4 inline-flex rounded-full border border-blue-400/20 bg-blue-400/10 px-4 py-2 text-xs font-semibold text-blue-300">
                Cari takip
              </div>
              <h2 className="text-4xl font-black tracking-tight lg:text-5xl">
                Kim sana borçlu, sen kime borçlusun.
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="shrink-0 rounded-3xl border border-emerald-400/20 bg-emerald-400/5 p-5">
                <p className="text-sm text-zinc-400">Sana borçlu</p>
                <p className="mt-2 text-3xl font-black text-emerald-300">
                  {formatMoney(totalReceivable)} ₺
                </p>
              </div>
              <div className="shrink-0 rounded-3xl border border-red-400/20 bg-red-400/5 p-5">
                <p className="text-sm text-zinc-400">Sen borçlusun</p>
                <p className="mt-2 text-3xl font-black text-red-300">
                  {formatMoney(totalPayable)} ₺
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6 hidden gap-6 px-6 md:grid md:grid-cols-[1fr_1.2fr]">
          <div>
            <h3 className="text-xl font-bold">Yeni cari kayıt</h3>
            <p className="mb-4 mt-1 text-sm text-zinc-500">
              Alacak veya borç kaydını hızlıca ekle.
            </p>
            {desktopAddForm}
          </div>

          <div>
            <h3 className="mb-4 text-xl font-bold">Kayıtlar</h3>
            {desktopTabSwitcher}

            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm font-bold">{TAB_LABEL[activeTab]}</p>
              <span className="text-xs text-zinc-500">
                {filteredAccounts.length} kayıt
              </span>
            </div>

            <div className="mt-2 space-y-2">
              {filteredAccounts.length === 0 && emptyState}
              {accountRows}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
