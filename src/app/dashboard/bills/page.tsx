"use client";

import { useState } from "react";
import { BillsPage, CashierBillsView } from "@/components/bills";
import type { Cashier } from "@/types/auth.types";

export default function BillsMainPage() {
  const [selectedCashier, setSelectedCashier] = useState<Cashier | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());

  if (selectedCashier) {
    return (
      <CashierBillsView
        cashier={selectedCashier}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onBack={() => setSelectedCashier(null)}
      />
    );
  }

  return (
    <BillsPage
      selectedDate={selectedDate}
      onDateChange={setSelectedDate}
      onSelectCashier={setSelectedCashier}
    />
  );
}
