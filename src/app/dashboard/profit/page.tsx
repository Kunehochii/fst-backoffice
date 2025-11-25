"use client";

import { useState } from "react";
import { ProfitPage, CashierProfitView } from "@/components/profit";
import type { Cashier } from "@/types/auth.types";

export default function ProfitMainPage() {
  const [selectedCashier, setSelectedCashier] = useState<Cashier | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());

  if (selectedCashier) {
    return (
      <CashierProfitView
        cashier={selectedCashier}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onBack={() => setSelectedCashier(null)}
      />
    );
  }

  return (
    <ProfitPage
      selectedDate={selectedDate}
      onDateChange={setSelectedDate}
      onSelectCashier={setSelectedCashier}
    />
  );
}
