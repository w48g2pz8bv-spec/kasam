"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase, BUSINESS_ID } from "./lib/supabase";
import { getTodayLocalDate } from "./utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Sale = {
  id?: string;
  amount: number;
  type: string;
  note: string;
  date: string;
};

export type Expense = {
  id?: string;
  amount: number;
  category: string;
  note: string;
  date: string;
};

export type Account = {
  id?: string;
  name: string;
  type: "Alacak" | "Borç";
  amount: number;
  note: string;
  paid: boolean;
  date?: string;
};

// ---------------------------------------------------------------------------
// Context type — id-based API
// ---------------------------------------------------------------------------

type KasamContextType = {
  sales: Sale[];
  expenses: Expense[];
  accounts: Account[];
  addSale: (sale: Sale) => void;
  addExpense: (expense: Expense) => void;
  addAccount: (account: Account) => void;
  updateSale: (id: string, updated: Sale) => void;
  deleteSale: (id: string) => void;
  updateExpense: (id: string, updated: Expense) => void;
  deleteExpense: (id: string) => void;
  updateAccount: (id: string, updated: Account) => void;
  deleteAccount: (id: string) => void;
  toggleAccountPaid: (id: string) => void;
};

const KasamContext = createContext<KasamContextType | null>(null);

// ---------------------------------------------------------------------------
// LocalStorage — sadece migration için korunuyor
// ---------------------------------------------------------------------------

function safeParseArray<T>(value: string | null): T[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    console.warn("Kasam localStorage verisi bozuk, boş listeye dönüldü.");
    return [];
  }
}

// ---------------------------------------------------------------------------
// DB satırı → uygulama tipi dönüşümleri
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToSale(r: any): Sale {
  return {
    id: r.id,
    amount: r.amount,
    type: r.type,
    note: r.note ?? "",
    date: r.date,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToExpense(r: any): Expense {
  return {
    id: r.id,
    amount: r.amount,
    category: r.category,
    note: r.note ?? "",
    date: r.date,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToAccount(r: any): Account {
  return {
    id: r.id,
    name: r.name,
    type: r.type as "Alacak" | "Borç",
    amount: r.amount,
    note: r.note ?? "",
    paid: r.paid,
    date: r.date,
  };
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function KasamProvider({ children }: { children: React.ReactNode }) {
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Her state değişiminde localStorage'a yaz (offline fallback)
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem("kasam-sales", JSON.stringify(sales));
  }, [sales, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem("kasam-expenses", JSON.stringify(expenses));
  }, [expenses, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem("kasam-accounts", JSON.stringify(accounts));
  }, [accounts, isLoaded]);

  // -------------------------------------------------------------------------
  // İlk yükleme: Supabase fetch + localStorage migration
  // -------------------------------------------------------------------------

  useEffect(() => {
    // --- Adım 1: localStorage'dan hemen yükle, ekranı göster ---
    const lsSales = safeParseArray<Sale>(localStorage.getItem("kasam-sales"))
      .map((item): Sale => ({ ...item, id: item.id ?? crypto.randomUUID() }));
    const lsExpenses = safeParseArray<Expense>(localStorage.getItem("kasam-expenses"))
      .map((item): Expense => ({ ...item, id: item.id ?? crypto.randomUUID() }));
    const lsAccounts = safeParseArray<Account>(localStorage.getItem("kasam-accounts"))
      .map((item): Account => ({ ...item, id: item.id ?? crypto.randomUUID() }));

    setSales(lsSales);
    setExpenses(lsExpenses);
    setAccounts(lsAccounts);
    setIsLoaded(true); // ekran hemen açılır

    // --- Adım 2: Arka planda Supabase sync ---
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      return;
    }
 
    void (async () => {
      try {
        const [s, e, a] = await Promise.all([
          supabase.from("sales").select("*").eq("business_id", BUSINESS_ID).order("created_at", { ascending: false }),
          supabase.from("expenses").select("*").eq("business_id", BUSINESS_ID).order("created_at", { ascending: false }),
          supabase.from("accounts").select("*").eq("business_id", BUSINESS_ID).order("created_at", { ascending: false }),
        ]);

        if (s.error || e.error || a.error) {
          console.warn("Supabase sync hatası:", s.error?.message ?? e.error?.message ?? a.error?.message);
          return;
        }

        const remoteSales = (s.data ?? []).map(rowToSale);
        const remoteExpenses = (e.data ?? []).map(rowToExpense);
        const remoteAccounts = (a.data ?? []).map(rowToAccount);

        const alreadyMigrated = localStorage.getItem("kasam-migrated") === "true";

        // Migration: Supabase boşsa, local'de veri varsa Supabase'e taşı
        if (
          !alreadyMigrated &&
          remoteSales.length === 0 &&
          remoteExpenses.length === 0 &&
          remoteAccounts.length === 0 &&
          lsSales.length + lsExpenses.length + lsAccounts.length > 0
        ) {
          await Promise.all([
            lsSales.length > 0 &&
              supabase.from("sales").insert(
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                lsSales.map(({ id: _id, ...rest }) => ({ ...rest, business_id: BUSINESS_ID }))
              ),
            lsExpenses.length > 0 &&
              supabase.from("expenses").insert(
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                lsExpenses.map(({ id: _id, ...rest }) => ({ ...rest, business_id: BUSINESS_ID }))
              ),
            lsAccounts.length > 0 &&
              supabase.from("accounts").insert(
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                lsAccounts.map(({ id: _id, date, ...rest }) => ({
                  ...rest,
                  date: date ?? getTodayLocalDate(),
                  business_id: BUSINESS_ID,
                }))
              ),
          ]);

          const [s2, e2, a2] = await Promise.all([
            supabase.from("sales").select("*").eq("business_id", BUSINESS_ID).order("created_at", { ascending: false }),
            supabase.from("expenses").select("*").eq("business_id", BUSINESS_ID).order("created_at", { ascending: false }),
            supabase.from("accounts").select("*").eq("business_id", BUSINESS_ID).order("created_at", { ascending: false }),
          ]);

          setSales((s2.data ?? []).map(rowToSale));
          setExpenses((e2.data ?? []).map(rowToExpense));
          setAccounts((a2.data ?? []).map(rowToAccount));

          localStorage.removeItem("kasam-sales");
          localStorage.removeItem("kasam-expenses");
          localStorage.removeItem("kasam-accounts");
          localStorage.setItem("kasam-migrated", "true");
          return;
        }

        if (!alreadyMigrated) localStorage.setItem("kasam-migrated", "true");

        // Supabase'de gerçek veri varsa state'i güncelle
        if (remoteSales.length > 0 || remoteExpenses.length > 0 || remoteAccounts.length > 0) {
          setSales(remoteSales);
          setExpenses(remoteExpenses);
          setAccounts(remoteAccounts);
        }
      } catch (err) {
        console.warn("Supabase sync başarısız, localStorage verisi kullanılıyor:", err);
      }
    })();
  }, []);

  // -------------------------------------------------------------------------
  // ADD — optimistic, insert başarısızsa temp kayıt geri alınır
  // -------------------------------------------------------------------------

      const addSale = (sale: Sale) => {
        const tempId = crypto.randomUUID();
        setSales((prev) => [{ ...sale, id: tempId }, ...prev]);

        return;

        void (async () => {
      if (
        !process.env.NEXT_PUBLIC_SUPABASE_URL ||
        !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ) {
        return;
      }

      try {
        const { data, error } = await supabase
          .from("sales")
          .insert({ amount: sale.amount, type: sale.type, note: sale.note, date: sale.date, business_id: BUSINESS_ID })
          .select()
          .single();

        if (data) {
          setSales((prev) => prev.map((s) => (s.id === tempId ? rowToSale(data) : s)));
        } else {
          if (error) console.error("addSale failed:", error.message);
        }
      } catch (err) {
        console.error("addSale network error:", err);
      }
    })();
  };

      const addExpense = (expense: Expense) => {
        const tempId = crypto.randomUUID();
        setExpenses((prev) => [{ ...expense, id: tempId }, ...prev]);

        return;

        void (async () => {
      try {
        const { data, error } = await supabase
          .from("expenses")
          .insert({ amount: expense.amount, category: expense.category, note: expense.note, date: expense.date, business_id: BUSINESS_ID })
          .select()
          .single();
        if (data) {
          setExpenses((prev) => prev.map((e) => (e.id === tempId ? rowToExpense(data) : e)));
        } else {
          if (error) console.error("addExpense failed:", error.message);
        }
      } catch (err) {
        console.error("addExpense network error:", err);
      }
    })();
  };

    const addAccount = (account: Account) => {
      const tempId = crypto.randomUUID();
      setAccounts((prev) => [{ ...account, id: tempId }, ...prev]);

      return;

      void (async () => {
      try {
        const { data, error } = await supabase
          .from("accounts")
          .insert({
            name: account.name,
            type: account.type,
            amount: account.amount,
            note: account.note,
            paid: account.paid,
            date: account.date ?? getTodayLocalDate(),
            business_id: BUSINESS_ID,
          })
          .select()
          .single();
        if (data) {
          setAccounts((prev) => prev.map((a) => (a.id === tempId ? rowToAccount(data) : a)));
        } else {
          if (error) console.error("addAccount failed:", error.message);
        }
      } catch (err) {
        console.error("addAccount network error:", err);
      }
    })();
  };

  // -------------------------------------------------------------------------
  // UPDATE — id ile bul, optimistic state güncelle, Supabase'e yaz
  // -------------------------------------------------------------------------

  const updateSale = (id: string, updated: Sale) => {
    setSales((prev) =>
      prev.map((s) => (s.id === id ? { ...updated, id } : s))
    );
    void (async () => {
      const { error } = await supabase
        .from("sales")
        .update({ amount: updated.amount, type: updated.type, note: updated.note, date: updated.date })
        .eq("id", id);
      if (error) console.error("updateSale failed:", error.message);
    })();
  };

  const updateExpense = (id: string, updated: Expense) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...updated, id } : e))
    );
    void (async () => {
      const { error } = await supabase
        .from("expenses")
        .update({ amount: updated.amount, category: updated.category, note: updated.note, date: updated.date })
        .eq("id", id);
      if (error) console.error("updateExpense failed:", error.message);
    })();
  };

  const updateAccount = (id: string, updated: Account) => {
    setAccounts((prev) =>
      prev.map((a) => (a.id === id ? { ...updated, id } : a))
    );
    void (async () => {
      const { error } = await supabase
        .from("accounts")
        .update({
          name: updated.name,
          type: updated.type,
          amount: updated.amount,
          note: updated.note,
          paid: updated.paid,
          date: updated.date ?? getTodayLocalDate(),
        })
        .eq("id", id);
      if (error) console.error("updateAccount failed:", error.message);
    })();
  };

  // -------------------------------------------------------------------------
  // DELETE — id ile filtrele, Supabase'den sil
  // -------------------------------------------------------------------------

  const deleteSale = (id: string) => {
    setSales((prev) => prev.filter((s) => s.id !== id));
    void (async () => {
      const { error } = await supabase.from("sales").delete().eq("id", id);
      if (error) console.error("deleteSale failed:", error.message);
    })();
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    void (async () => {
      const { error } = await supabase.from("expenses").delete().eq("id", id);
      if (error) console.error("deleteExpense failed:", error.message);
    })();
  };

  const deleteAccount = (id: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
    void (async () => {
      const { error } = await supabase.from("accounts").delete().eq("id", id);
      if (error) console.error("deleteAccount failed:", error.message);
    })();
  };

  // -------------------------------------------------------------------------
  // TOGGLE paid
  // -------------------------------------------------------------------------

  const toggleAccountPaid = (id: string) => {
    const account = accounts.find((a) => a.id === id);
    if (!account) return;
    const newPaid = !account.paid;
    setAccounts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, paid: newPaid } : a))
    );
    void (async () => {
      const { error } = await supabase.from("accounts").update({ paid: newPaid }).eq("id", id);
      if (error) console.error("toggleAccountPaid failed:", error.message);
    })();
  };

  // -------------------------------------------------------------------------
  // Render — veri yüklenene kadar null döndür
  // -------------------------------------------------------------------------

  if (!isLoaded) return null;

  return (
    <KasamContext.Provider
      value={{
        sales,
        expenses,
        accounts,
        addSale,
        addExpense,
        addAccount,
        updateSale,
        deleteSale,
        updateExpense,
        deleteExpense,
        updateAccount,
        deleteAccount,
        toggleAccountPaid,
      }}
    >
      {children}
    </KasamContext.Provider>
  );
}

export function useKasam() {
  const context = useContext(KasamContext);
  if (!context) throw new Error("useKasam must be used inside KasamProvider");
  return context;
}
