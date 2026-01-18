import { cn } from "@/lib/utils";
import { LucideIcon, Inbox } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

/**
 * EmptyState - Display when no data is available
 * 
 * QA Checklist:
 * - ✅ Centered layout
 * - ✅ Icon, title, description visible
 * - ✅ RTL text alignment
 * - ✅ Works in dark mode
 */
export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-4", className)}>
      <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-muted-foreground" strokeWidth={1.5} />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1 text-center">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-muted-foreground text-center max-w-[250px] mb-4">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
