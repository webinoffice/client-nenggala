// src/components/ui/Input.tsx
import { forwardRef, useId, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, className, containerClassName, id, ...props },
  ref,
) {
  const reactId = useId();
  const inputId = id ?? reactId;

  return (
    <div className={cn("flex flex-col gap-2", containerClassName)}>
      {label && (
        <label
          htmlFor={inputId}
          className="font-display text-[11px] font-bold uppercase tracking-widest text-ink"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={cn(
          "h-10 rounded-sm border border-ink/15 bg-paper px-3 text-sm text-ink placeholder:text-muted-foreground",
          "focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/40 transition-colors",
          "disabled:bg-paper-soft disabled:cursor-not-allowed",
          error && "border-brand focus:border-brand",
          className,
        )}
        {...props}
      />
      {error && (
        <span className="text-[11px] font-semibold uppercase tracking-wider text-brand">
          {error}
        </span>
      )}
    </div>
  );
});

export default Input;
