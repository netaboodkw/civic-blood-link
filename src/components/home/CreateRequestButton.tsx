import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreateRequestButtonProps {
  onClick: () => void;
}

export function CreateRequestButton({ onClick }: CreateRequestButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-center gap-3",
        "bg-primary text-primary-foreground",
        "rounded-xl px-6 py-4",
        "font-semibold text-base",
        "shadow-card hover:shadow-elevated",
        "transition-all duration-200 ios-spring ios-press",
        "animate-slide-up"
      )}
      style={{ animationDelay: "200ms" }}
    >
      <Plus className="w-5 h-5" />
      <span>إنشاء طلب دم</span>
    </button>
  );
}
