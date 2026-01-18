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
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2, duration: 0.4, ease: "easeOut" }}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.05 }}
      className={cn(
        "inline-flex items-center justify-center gap-2",
        "bg-gradient-to-r from-primary to-primary/85 text-primary-foreground",
        "rounded-xl px-4 py-2.5",
        "font-medium text-sm",
        "shadow-md glow-primary",
        "transition-all duration-300"
      )}
    >
      <Plus className="w-4 h-4" strokeWidth={2.5} />
      <span>نشر إعلان</span>
    </motion.button>
  );
}
