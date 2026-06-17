"use client";

interface Props {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  ariaLabel?: string;
  size?: "sm" | "md";
}

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  ariaLabel = "Quantity",
  size = "md",
}: Props) {
  const btn =
    size === "sm"
      ? "h-8 w-8 text-base"
      : "h-10 w-10 text-lg";
  const input =
    size === "sm"
      ? "h-8 w-10 text-sm"
      : "h-10 w-12 text-base";

  const clamp = (n: number) => Math.max(min, Math.min(max, n));

  return (
    <div
      className="inline-flex items-center rounded-full border border-brand-cream-300 bg-white shadow-sm"
      role="group"
      aria-label={ariaLabel}
    >
      <button
        type="button"
        onClick={() => onChange(clamp(value - 1))}
        disabled={value <= min}
        className={`${btn} rounded-l-full text-brand-earth-800 transition hover:bg-brand-cream-100 disabled:cursor-not-allowed disabled:opacity-40`}
        aria-label="Decrease quantity"
      >
        −
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={value}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (Number.isFinite(n)) onChange(clamp(n));
        }}
        className={`${input} border-x border-brand-cream-300 bg-transparent text-center font-semibold text-brand-earth-900 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
        aria-label={ariaLabel}
      />
      <button
        type="button"
        onClick={() => onChange(clamp(value + 1))}
        disabled={value >= max}
        className={`${btn} rounded-r-full text-brand-earth-800 transition hover:bg-brand-cream-100 disabled:cursor-not-allowed disabled:opacity-40`}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}
