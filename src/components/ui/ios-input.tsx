import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface IOSInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
}

const IOSInput = React.forwardRef<HTMLInputElement, IOSInputProps>(
  ({ className, label, error, icon: Icon, type, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-foreground">
            {Icon && <Icon className="w-4 h-4 inline-block ml-1.5 text-muted-foreground" />}
            {label}
          </label>
        )}
        <div className="relative">
          <input
            type={type}
            className={cn(
              "w-full h-12 bg-card border rounded-xl px-4 text-foreground",
              "placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary",
              "transition-all duration-200",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              error ? "border-destructive focus:ring-destructive/50" : "border-input",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}
      </div>
    );
  }
);
IOSInput.displayName = "IOSInput";

export { IOSInput };
