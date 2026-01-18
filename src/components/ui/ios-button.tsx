import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface IOSButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
}

const IOSButton = React.forwardRef<HTMLButtonElement, IOSButtonProps>(
  ({ className, children, variant = "primary", size = "md", loading = false, fullWidth = false, disabled, ...props }, ref) => {
    const variants = {
      primary: "bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 active:bg-primary/80",
      secondary: "glass text-foreground hover:bg-muted/80 active:bg-muted",
      ghost: "text-primary hover:bg-primary/10 active:bg-primary/20",
      destructive: "bg-destructive text-destructive-foreground shadow-lg shadow-destructive/25 hover:bg-destructive/90",
    };

    const sizes = {
      sm: "h-10 px-4 text-sm rounded-xl",
      md: "h-12 px-6 text-base rounded-2xl",
      lg: "h-14 px-8 text-lg rounded-2xl",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-semibold",
          "transition-all duration-200 ease-out",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:pointer-events-none",
          "ios-spring active:scale-[0.97]",
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="w-5 h-5 animate-spin" />}
        {children}
      </button>
    );
  }
);
IOSButton.displayName = "IOSButton";

export { IOSButton };
