"use client";

import { useState, useMemo } from "react";
import { SheetPage, CashierSheetView } from "@/components/sheet";
import { useBusinessKahonSheets, useBusinessInventorySheets } from "@/hooks";
import type { Cashier } from "@/types/auth.types";
import { SheetType, type SheetWithCashier } from "@/types/sheet.types";

export default function SheetMainPage() {
  const [selectedCashier, setSelectedCashier] = useState<Cashier | null>(null);
  const [selectedSheetType, setSelectedSheetType] = useState<SheetType>(SheetType.KAHON);
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());

  // Fetch sheets based on selected type
  const { data: kahonSheets, isLoading: kahonLoading } = useBusinessKahonSheets(selectedDate);
  const { data: inventorySheets, isLoading: inventoryLoading } =
    useBusinessInventorySheets(selectedDate);

  // Get the current sheet for the selected cashier
  const currentSheet = useMemo(() => {
    if (!selectedCashier) return null;

    const sheets = selectedSheetType === SheetType.KAHON ? kahonSheets : inventorySheets;

    return (
      sheets?.find(
        (s) => s.cashier?.id === selectedCashier.id || s.cashierId === selectedCashier.id
      ) || null
    );
  }, [selectedCashier, selectedSheetType, kahonSheets, inventorySheets]);

  const handleSelectCashier = (cashier: Cashier, sheetType: SheetType) => {
    setSelectedCashier(cashier);
    setSelectedSheetType(sheetType);
  };

  const handleBack = () => {
    setSelectedCashier(null);
  };

  // Show sheet view if a cashier is selected and we have the sheet data
  if (selectedCashier && currentSheet) {
    // Ensure sheet has cashier info (might not be populated from API)
    const sheetWithCashier: SheetWithCashier = {
      ...currentSheet,
      cashier: currentSheet.cashier || {
        id: selectedCashier.id,
        username: selectedCashier.username,
        branchName: selectedCashier.branchName,
      },
    };

    return (
      <CashierSheetView
        sheet={sheetWithCashier}
        sheetType={selectedSheetType}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onBack={handleBack}
        isLoading={selectedSheetType === SheetType.KAHON ? kahonLoading : inventoryLoading}
      />
    );
  }

  // Show loading state if cashier is selected but sheet is loading
  if (selectedCashier && (kahonLoading || inventoryLoading)) {
    return (
      <CashierSheetView
        sheet={
          {
            id: "",
            type: selectedSheetType,
            cashierId: selectedCashier.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            rows: [],
            cashier: {
              id: selectedCashier.id,
              username: selectedCashier.username,
              branchName: selectedCashier.branchName,
            },
          } as SheetWithCashier
        }
        sheetType={selectedSheetType}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onBack={handleBack}
        isLoading={true}
      />
    );
  }

  return (
    <SheetPage
      selectedDate={selectedDate}
      onDateChange={setSelectedDate}
      onSelectCashier={handleSelectCashier}
    />
  );
}
