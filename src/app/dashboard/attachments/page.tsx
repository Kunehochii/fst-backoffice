"use client";

import { useState } from "react";
import { AttachmentsPage, CashierAttachmentsView } from "@/components/attachments";
import type { Cashier } from "@/types/auth.types";

export default function AttachmentsMainPage() {
  const [selectedCashier, setSelectedCashier] = useState<Cashier | null>(null);

  if (selectedCashier) {
    return (
      <CashierAttachmentsView cashier={selectedCashier} onBack={() => setSelectedCashier(null)} />
    );
  }

  return <AttachmentsPage onSelectCashier={setSelectedCashier} />;
}
