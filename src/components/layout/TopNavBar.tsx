import { cn } from "@/lib/utils";

interface TopNavBarProps {
  title: string;
  className?: string;
}

export function TopNavBar({ title, className }: TopNavBarProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 glass safe-area-top",
        className
      )}
    >
      <div className="flex items-center justify-center h-14 px-4 max-w-lg mx-auto">
        <h1 className="text-[17px] font-semibold text-foreground tracking-tight">
          {title}
        </h1>
      </div>
    </header>
  );
}
