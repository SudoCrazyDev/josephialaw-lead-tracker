"use client";

import { ChevronDown } from "lucide-react";

const selectWrapperClass =
  "relative w-full rounded-xl border border-[#e0e0e5] bg-[#fafafa] focus-within:ring-2 focus-within:ring-[#151a6c] focus-within:border-transparent transition-shadow";
const selectClass =
  "w-full appearance-none bg-transparent px-4 py-2.5 pr-10 rounded-xl text-[#151a6c] placeholder:text-[#9a9aab] focus:outline-none cursor-pointer";

type Option = { value: string; label: string };

type SelectProps = {
  id: string;
  name: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Option[];
  placeholder?: string;
  required?: boolean;
  "aria-label"?: string;
};

export default function Select({
  id,
  name,
  value,
  onChange,
  options,
  placeholder = "Select…",
  required,
  "aria-label": ariaLabel,
}: SelectProps) {
  return (
    <div className={selectWrapperClass}>
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        aria-label={ariaLabel}
        className={selectClass}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 w-5 h-5 -translate-y-1/2 text-[#5a5a6e]"
        aria-hidden
      />
    </div>
  );
}
