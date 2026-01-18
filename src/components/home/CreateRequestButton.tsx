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
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        "w-full flex items-center justify-center gap-2.5",
        "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground",
        "rounded-2xl px-6 py-4",
        "font-semibold text-[16px]",
        "shadow-lg glow-primary",
        "transition-all duration-300"
      )}
    >
      <Plus className="w-5 h-5" strokeWidth={2.5} />
      <span>إنشاء طلب دم</span>
    </motion.button>
  );
}
