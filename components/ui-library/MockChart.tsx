import * as React from "react";
import { cn } from "@/lib/utils";

export function MockChart({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card text-card-foreground shadow",
        className
      )}
      {...props}
    >
      <div className="p-6 flex-col gap-4 space-y-4">
        <div className="space-y-2">
          <h3 className="font-semibold leading-none tracking-tight">
            Revenue Growth
          </h3>
          <p className="text-sm text-muted-foreground">
            Monthly revenue for the current year
          </p>
        </div>
        <div className="h-[200px] w-full flex items-end justify-between gap-2 px-2">
          {[40, 25, 50, 30, 60, 45, 80, 55, 70, 65, 90, 75].map((h, i) => (
            <div
              key={i}
              className="w-full bg-primary/20 hover:bg-primary/40 rounded-t-md transition-all relative group"
              style={{ height: `${h}%` }}
            >
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                ${h}k
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
