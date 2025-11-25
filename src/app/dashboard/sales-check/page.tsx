"use client";

import { useState } from "react";
import { SalesCheckPage, CashierSalesView } from "@/components/sales-check";
import type { Cashier } from "@/types/auth.types";

type SalesTab = "sales" | "voided";

export default function SalesCheckMainPage() {
  const [selectedCashier, setSelectedCashier] = useState<Cashier | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [activeTab, setActiveTab] = useState<SalesTab>("sales");

  if (selectedCashier) {
    return (
      <CashierSalesView
        cashier={selectedCashier}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onBack={() => setSelectedCashier(null)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    );
  }

  return (
    <SalesCheckPage
      selectedDate={selectedDate}
      onDateChange={setSelectedDate}
      onSelectCashier={setSelectedCashier}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    />
  );
}
