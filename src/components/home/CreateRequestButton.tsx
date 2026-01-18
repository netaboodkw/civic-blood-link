import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CreateRequestButtonProps {
  onClick: () => void;
}

export function CreateRequestButton({ onClick }: CreateRequestButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4, ease: "easeOut" }}
      whileTap={{ scale: 0.98 }}
      whileHover={{ scale: 1.01 }}
      className={cn(
        "w-full flex items-center justify-center gap-2.5",
        "bg-primary text-primary-foreground",
        "rounded-2xl px-6 py-4",
        "font-semibold text-[15px]",
        "shadow-sm hover:bg-primary/90",
        "transition-colors duration-200"
      )}
    >
      <Plus className="w-5 h-5" strokeWidth={2.5} />
      <span>إنشاء طلب دم</span>
    </motion.button>
  );
}
