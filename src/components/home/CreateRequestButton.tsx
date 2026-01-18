import { Megaphone } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CreateRequestButtonProps {
  onClick: () => void;
}

export function CreateRequestButton({ onClick }: CreateRequestButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4, ease: "easeOut" }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        "w-full flex items-center justify-center gap-3",
        "bg-gradient-to-r from-primary to-primary/85 text-primary-foreground",
        "rounded-2xl px-6 py-4",
        "font-semibold text-[17px]",
        "shadow-lg glow-primary",
        "transition-all duration-300"
      )}
    >
      <Megaphone className="w-5 h-5" strokeWidth={2} />
      <span>نشر إعلان طلب تبرع</span>
    </motion.button>
  );
}
