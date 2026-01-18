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
        "w-full flex items-center justify-center gap-2.5",
        "bg-primary text-primary-foreground",
        "rounded-2xl px-6 py-4",
        "font-semibold text-[15px]",
        "shadow-sm hover:bg-primary/90",
        "transition-all duration-200 ios-spring active:scale-[0.98]",
        "animate-slide-up"
      )}
      style={{ animationDelay: "200ms" }}
    >
      <Plus className="w-5 h-5" strokeWidth={2.5} />
      <span>إنشاء طلب دم</span>
    </button>
  );
}
