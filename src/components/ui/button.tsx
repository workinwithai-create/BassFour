import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type Variant = "solid" | "ghost" | "line";

export function Button({
  className,
  variant = "solid",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors duration-150 ease-out disabled:cursor-not-allowed disabled:opacity-40",
        variant === "solid" && "bg-accent text-accent-fg hover:bg-fg",
        variant === "line" && "border border-line bg-surface text-fg hover:border-accent",
        variant === "ghost" && "bg-transparent text-muted hover:bg-surface-2 hover:text-fg",
        className,
      )}
      {...props}
    />
  );
}
