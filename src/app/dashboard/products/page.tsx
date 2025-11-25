"use client";

import { useState } from "react";
import { ProductsPage, CashierProductsView } from "@/components/products";
import type { Cashier } from "@/types/auth.types";

export default function ProductsMainPage() {
  const [selectedCashier, setSelectedCashier] = useState<Cashier | null>(null);

  if (selectedCashier) {
    return (
      <CashierProductsView cashier={selectedCashier} onBack={() => setSelectedCashier(null)} />
    );
  }

  return <ProductsPage onSelectCashier={setSelectedCashier} />;
}
