import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface TopNavBarProps {
  title: string;
  className?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  rightElement?: React.ReactNode;
}

export function TopNavBar({ 
  title, 
  className, 
  showBackButton = false, 
  onBack,
  rightElement 
}: TopNavBarProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 glass border-b border-border/50",
        className
      )}
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="flex items-center justify-between h-[44px] px-4 max-w-lg mx-auto">
        {/* Right side - Back button (RTL) */}
        <div className="w-16 flex justify-start">
          {showBackButton && onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1 text-primary ios-spring active:opacity-70"
            >
              <ChevronRight className="w-5 h-5" />
              <span className="text-[17px]">رجوع</span>
            </button>
          )}
        </div>
        
        {/* Center - Title */}
        <h1 className="text-[17px] font-semibold text-foreground tracking-tight">
          {title}
        </h1>
        
        {/* Left side - Optional right element (RTL) */}
        <div className="w-16 flex justify-end">
          {rightElement}
        </div>
      </div>
    </header>
  );
}
