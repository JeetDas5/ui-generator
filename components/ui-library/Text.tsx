import * as React from "react";
import { cn } from "@/lib/utils";

export function Typography({
  className,
  children,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "lead" | "large" | "small" | "muted";
}) {
  const styles = {
    default: "leading-7 [&:not(:first-child)]:mt-6",
    lead: "text-xl text-muted-foreground",
    large: "text-lg font-semibold",
    small: "text-sm font-medium leading-none",
    muted: "text-sm text-muted-foreground",
  };

  return (
    <div className={cn(styles[variant], className)} {...props}>
      {children}
    </div>
  );
}

// Keep Text as alias for backwards compatibility
export const Text = Typography;
