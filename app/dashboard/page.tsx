// app/dashboard/page.tsx
"use client";

import React, { useRef } from "react";
import { formatMoney } from "../utils"; // mevcut util fonksiyonunu kullan
import { monthlyRevenue, monthlyExpenses, netAmount } from "../data/mockData"; // gerçek veri ile değiştir

export default function DashboardPage() {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrintReport = () => {
    const printContent = printRef.current;
    const WinPrint = window.open("", "", "width=900,height=650");
    WinPrint!.document.write(printContent!.outerHTML);
    WinPrint!.document.close();
    WinPrint!.focus();
    WinPrint!.print();
    WinPrint!.close();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      <div ref={printRef} className="p-8 bg-white text-black">
        <h2 className="text-xl font-bold mb-4">Ay Sonu Mali Özeti</h2>
        <p>Gelir: {formatMoney(monthlyRevenue)} ₺</p>
        <p>Gider: {formatMoney(monthlyExpenses)} ₺</p>
        <p>Net: {formatMoney(netAmount)} ₺</p>
      </div>

      <button
        onClick={handlePrintReport}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        PDF Kaydet
      </button>
    </div>
  );
}