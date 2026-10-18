"use client";

import type { ComponentProps, FocusEvent } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import Input from "@/components/ui/Input";

type NumericInputProps = Omit<
  ComponentProps<typeof Input>,
  "type" | "name" | "onBlur" | "onFocus"
> & {
  name: string;
  registration: UseFormRegisterReturn;
  precision?: number;
};

export default function NumericInput({
  name,
  registration,
  precision,
  ...inputProps
}: NumericInputProps) {
  const {
    onBlur: onRegistrationBlur,
    onChange: onRegistrationChange,
    ...registrationProps
  } = registration;
  const selectDefaultZero = (event: FocusEvent<HTMLInputElement>) => {
    if (Number(event.currentTarget.value) === 0) event.currentTarget.select();
  };

  return (
    <Input
      {...inputProps}
      {...registrationProps}
      name={name}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      onFocus={(event) => {
        selectDefaultZero(event);
      }}
      onBlur={(event) => {
        onRegistrationBlur(event);
        const value = event.currentTarget.value.trim();
        if (precision === undefined || value === "" || !Number.isFinite(Number(value))) return;
        const formatted = Number(value).toFixed(precision);
        event.currentTarget.value = formatted;
        onRegistrationChange({
          target: event.currentTarget,
          type: "change",
        });
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowUp" || event.key === "ArrowDown") event.preventDefault();
      }}
      onChange={(event) => {
        const decimalValue = event.currentTarget.value.replace(/[^\d.]/g, "");
        const [integerPart = "", ...fraction] = decimalValue.split(".");
        const integer = integerPart.replace(/^0+(?=\d)/, "");
        const sanitized = precision === 0
          ? integer
          : `${integer}${fraction.length ? `.${fraction.join("")}` : ""}`;
        if (sanitized !== event.currentTarget.value) event.currentTarget.value = sanitized;
        onRegistrationChange(event);
      }}
    />
  );
}
