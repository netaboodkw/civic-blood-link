import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppSettings } from "@/hooks/useAppSettings";
import { Heart, Sparkles } from "lucide-react";

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const { data: settings } = useAppSettings();
  const logoUrl = settings?.app_logo_url;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500);
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[100] bg-gradient-to-b from-primary/10 via-background to-background flex items-center justify-center overflow-hidden"
        >
          {/* Animated Background */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 3, opacity: 0.1 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="absolute w-96 h-96 bg-gradient-to-br from-primary to-accent rounded-full blur-3xl"
          />

          <div className="flex flex-col items-center gap-8 relative z-10">
            {/* Animated Logo */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 150, damping: 12, delay: 0.2 }}
              className="relative"
            >
              {logoUrl ? (
                <motion.div className="w-36 h-36 rounded-[2.5rem] overflow-hidden shadow-2xl ring-4 ring-primary/20 bg-white">
                  <img src={logoUrl} alt="نبضة دم" className="w-full h-full object-contain" />
                </motion.div>
              ) : (
                <motion.div className="w-36 h-36 rounded-[2.5rem] bg-gradient-to-br from-primary via-primary to-accent flex items-center justify-center shadow-2xl ring-4 ring-primary/20">
                  <motion.div
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Heart className="w-20 h-20 text-white drop-shadow-lg" fill="currentColor" />
                  </motion.div>
                </motion.div>
              )}
              
              {/* Pulse rings */}
              <motion.div
                className="absolute inset-0 rounded-[2.5rem] border-4 border-primary/40"
                animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
              />
              <motion.div
                className="absolute inset-0 rounded-[2.5rem] border-4 border-primary/30"
                animate={{ scale: [1, 1.7], opacity: [0.4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.4 }}
              />

              {/* Sparkle */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                className="absolute -top-3 -right-3"
              >
                <Sparkles className="w-8 h-8 text-accent" />
              </motion.div>
            </motion.div>

            {/* App Name */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, type: "spring" }}
              className="text-center"
            >
              <h1 className="text-4xl font-extrabold mb-2">
                <span className="bg-gradient-to-l from-primary via-primary to-accent bg-clip-text text-transparent">
                  نبضة دم
                </span>
              </h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-muted-foreground"
              >
                كل نقطة دم تصنع الفرق
              </motion.p>
            </motion.div>

            {/* Loading dots */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="flex gap-2"
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 rounded-full bg-gradient-to-br from-primary to-accent"
                  animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
