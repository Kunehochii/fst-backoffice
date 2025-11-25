"use client";

import { useState } from "react";
import { DeliveryPage, CashierDeliveryView } from "@/components/delivery";
import type { Cashier } from "@/types/auth.types";

export default function DeliveryMainPage() {
  const [selectedCashier, setSelectedCashier] = useState<Cashier | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());

  if (selectedCashier) {
    return (
      <CashierDeliveryView
        cashier={selectedCashier}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onBack={() => setSelectedCashier(null)}
      />
    );
  }

  return (
    <DeliveryPage
      selectedDate={selectedDate}
      onDateChange={setSelectedDate}
      onSelectCashier={setSelectedCashier}
    />
  );
}
