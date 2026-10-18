"use client";

import { useWatch } from "react-hook-form";
import { useFormContext } from "react-hook-form";
import type { PurchaseWeightFormValues } from "@/schemas/purchaseWeightSchemas";
import NumericInput from "./NumericInput";

const number = (value: string | undefined) => Number(value || 0);

export default function SummaryCard({
  currency,
  amountDecimals,
}: {
  currency: string;
  amountDecimals: number;
}) {
  const { control, register, formState: { errors } } = useFormContext<PurchaseWeightFormValues>();
  const values = useWatch({ control }) as PurchaseWeightFormValues;
  const lines = values.products ?? [];
  const purchaseAmount = lines.reduce((sum, item) => {
    const weight = item.weightDetails;
    const gross = number(weight.grossWeight);
    const netWeight = Math.max(0, gross + number(weight.addWeight) - number(weight.lessWeight));
    const pureWeight = netWeight * (number(item.purchaseTouch) + number(item.profitTouch)) / 100;
    const productAmount =
      values.calculationType === "Fixed(QTY)"
        ? number(weight.quantity) * number(weight.rate)
        : pureWeight * number(weight.rate);
    return sum + productAmount + number(weight.otherCharges);
  }, 0);
  const chargeValues = Object.values(values.charges ?? {});
  const chargesAmount = chargeValues.reduce((sum, charge) => {
    if (typeof charge === "object" && charge !== null) {
      return sum + number(charge.rate) * number(charge.qty);
    }
    return sum;
  }, 0) + number(values.charges?.overallAmount) +
    number(values.charges?.overallQty) * number(values.charges?.overallRs);
  const taxableAmount = Math.max(0, purchaseAmount + chargesAmount - number(values.discount));
  const gstAmount = taxableAmount *
    (number(values.cgst) + number(values.sgst) + number(values.igst)) / 100;
  const totalAmount = taxableAmount + gstAmount;
  const roundOff = number(values.roundOffAmount) * (values.roundOffType === "Sub" ? -1 : 1);
  const netAmount = Math.max(0, totalAmount + roundOff);
  const balance = netAmount - number(values.paidAmount) - number(values.tcsOrTdsPaid);

  const rows = [
    ["Products", purchaseAmount],
    ["Additional charges", chargesAmount],
    ["Discount", -number(values.discount)],
    ["GST", gstAmount],
  ] as const;
  const money = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      minimumFractionDigits: amountDecimals,
      maximumFractionDigits: amountDecimals,
    }).format(value);
  const paidAmountRegistration = register("paidAmount");
  const tcsOrTdsRegistration = register("tcsOrTdsPaid");

  return (
    <aside className="rounded-2xl border border-border bg-surface p-5 shadow-card lg:sticky lg:top-6">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Live total</p>
        <h2 className="mt-1 text-lg font-semibold text-ink">Purchase summary</h2>
      </div>
      <div className="space-y-3 border-b border-border pb-4">
        {rows.map(([label, amount]) => (
          <div key={label} className="flex items-center justify-between gap-4 text-sm">
            <span className="text-ink-muted">{label}</span>
            <span className="font-medium text-ink">{money(amount)}</span>
          </div>
        ))}
        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="text-ink-muted">Round off</span>
          <span className="font-medium text-ink">{money(roundOff)}</span>
        </div>
      </div>
      <div className="py-4">
        <p className="text-sm text-ink-muted">Net payable</p>
        <p className="mt-1 text-3xl font-bold tracking-tight text-primary">{money(netAmount)}</p>
      </div>
      <div className="space-y-3 border-t border-border pt-4">
        <NumericInput
          label="Paid amount"
          name={paidAmountRegistration.name}
          registration={paidAmountRegistration}
          precision={amountDecimals}
          error={errors.paidAmount?.message}
        />
        <NumericInput
          label="TCS / TDS paid"
          name={tcsOrTdsRegistration.name}
          registration={tcsOrTdsRegistration}
          precision={amountDecimals}
          error={errors.tcsOrTdsPaid?.message}
        />
        <div className="flex items-center justify-between rounded-xl bg-primary-light/50 px-3 py-3">
          <span className="text-sm font-semibold text-ink">Balance due</span>
          <span className={`text-lg font-bold ${balance < 0 ? "text-success" : "text-ink"}`}>
            {money(balance)}
          </span>
        </div>
      </div>
    </aside>
  );
}
