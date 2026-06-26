import { NumericFormat, type NumericFormatProps } from "react-number-format";
import { Input } from "@/components/ui/input";

interface CurrencyInputProps
  extends Omit<
    NumericFormatProps,
    "value" | "onValueChange" | "customInput" | "thousandSeparator" | "decimalSeparator"
  > {
  value: number | "";
  onValueChange: (value: number | "") => void;
  decimalScale?: number;
}

export function CurrencyInput({
  value,
  onValueChange,
  decimalScale = 2,
  ...props
}: CurrencyInputProps) {
  return (
    <NumericFormat
      value={value}
      customInput={Input}
      thousandSeparator="."
      decimalSeparator=","
      decimalScale={decimalScale}
      fixedDecimalScale
      allowNegative={false}
      inputMode="decimal"
      onValueChange={(values) => {
        onValueChange(values.floatValue ?? "");
      }}
      {...props}
    />
  );
}