// src/components/ui/Select.tsx
import {
  forwardRef,
  useId,
  type SelectHTMLAttributes,
  type ReactNode,
} from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
  children: ReactNode;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, className, containerClassName, id, children, ...props },
  ref,
) {
  const reactId = useId();
  const selectId = id ?? reactId;

  return (
    <div className={cn("flex flex-col gap-2", containerClassName)}>
      {label && (
        <label
          htmlFor={selectId}
          className="font-display text-[11px] font-bold uppercase tracking-widest text-ink"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          className={cn(
            "w-full h-10 rounded-sm border border-ink/15 bg-paper px-3 pr-9 text-sm text-ink appearance-none",
            "focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/40 transition-colors",
            "disabled:bg-paper-soft disabled:cursor-not-allowed",
            error && "border-brand focus:border-brand",
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          size={16}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
        />
      </div>
      {error && (
        <span className="text-[11px] font-semibold uppercase tracking-wider text-brand">
          {error}
        </span>
      )}
    </div>
  );
});

export default Select;
