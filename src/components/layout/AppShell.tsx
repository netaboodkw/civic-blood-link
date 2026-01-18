import { ReactNode } from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: ReactNode;
  /** Page title displayed in header */
  title: string;
  /** Show back button */
  showBack?: boolean;
  /** Back button handler */
  onBack?: () => void;
  /** Right side element (e.g., action button) */
  rightAction?: ReactNode;
  /** Bottom navigation element */
  bottomNav?: ReactNode;
  /** Additional class for main content */
  className?: string;
  /** Animation key for page transitions */
  animationKey?: string;
}

/**
 * AppShell - iOS-style app container with fixed header/footer and scrollable content
 * 
 * Features:
 * - Fixed header with blur effect and safe-area support
 * - Scrollable content area with overscroll prevention
 * - Optional fixed bottom navigation with safe-area support
 * - Page transition animations
 * 
 * QA Checklist:
 * - ✅ Safe area insets (top/bottom) handled
 * - ✅ No horizontal overflow
 * - ✅ Header stays fixed on scroll
 * - ✅ Bottom nav stays fixed on scroll
 * - ✅ Content scrolls independently
 * - ✅ Works on 320px-1024px breakpoints
 * - ✅ RTL support maintained
 */
export function AppShell({
  children,
  title,
  showBack = false,
  onBack,
  rightAction,
  bottomNav,
  className,
  animationKey,
}: AppShellProps) {
  return (
    <div className="fixed inset-0 flex flex-col bg-gradient-to-b from-background to-muted/30">
      {/* Fixed Header - iOS style with blur */}
      <header
        className="flex-shrink-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="flex items-center justify-between h-[44px] px-4 max-w-lg mx-auto">
          {/* Right side - Back button (RTL) */}
          <div className="w-16 flex justify-start">
            {showBack && onBack && (
              <button
                onClick={onBack}
                className="flex items-center gap-1 text-primary ios-spring active:opacity-70"
                aria-label="رجوع"
              >
                <ChevronRight className="w-5 h-5" />
                <span className="text-[17px]">رجوع</span>
              </button>
            )}
          </div>

          {/* Center - Title */}
          <h1 className="text-[17px] font-semibold text-foreground tracking-tight truncate max-w-[200px]">
            {title}
          </h1>

          {/* Left side - Optional action (RTL) */}
          <div className="w-16 flex justify-end">
            {rightAction}
          </div>
        </div>
      </header>

      {/* Scrollable Content Area */}
      <motion.main
        className={cn(
          "flex-1 overflow-y-auto overflow-x-hidden overscroll-none",
          className
        )}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        key={animationKey}
      >
        <div
          className="max-w-lg mx-auto px-4 py-4"
          style={{
            paddingBottom: bottomNav
              ? "calc(1rem + 56px + env(safe-area-inset-bottom))"
              : "calc(1rem + env(safe-area-inset-bottom))",
          }}
        >
          {children}
        </div>
      </motion.main>

      {/* Fixed Bottom Navigation */}
      {bottomNav && (
        <div
          className="flex-shrink-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/50"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          {bottomNav}
        </div>
      )}
    </div>
  );
}
