import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Clock, ChevronDown, ChevronUp, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DonationCenter {
  name: string;
  location: string;
  weekdayHours: string;
  weekendHours?: string;
  fridayHours?: string;
}

const donationCenters: DonationCenter[] = [
  {
    name: "بنك الدم المركزي",
    location: "الجابرية",
    weekdayHours: "الأحد - الخميس: 7:30 ص - 8:30 م",
    weekendHours: "السبت: 7:30 ص - 8:00 م",
    fridayHours: "الجمعة: 2:00 م - 8:00 م",
  },
  {
    name: "مركز التعاونيات لنقل الدم",
    location: "بجانب مستشفى العدان",
    weekdayHours: "الأحد - الخميس: 7:30 ص - 8:30 م",
  },
  {
    name: "فرع التبرع بمستشفى جابر الأحمد",
    location: "مستشفى جابر الأحمد",
    weekdayHours: "الأحد - الخميس: 7:30 ص - 8:30 م",
  },
  {
    name: "فرع مركز العبدالرزاق",
    location: "منطقة الصباح",
    weekdayHours: "الأحد - الخميس: 7:30 ص - 8:30 م",
  },
  {
    name: "فرع التبرع بمستشفى الفروانية",
    location: "مستشفى الفروانية",
    weekdayHours: "الأحد - الخميس: 7:30 ص - 8:30 م",
  },
  {
    name: "فرع التبرع بمستشفى الجهراء الجديد",
    location: "مستشفى الجهراء الجديد",
    weekdayHours: "الأحد - الخميس: 7:30 ص - 8:30 م",
  },
  {
    name: "فرع الشيخة سلوى الأحمد",
    location: "بجانب مستشفى الولادة",
    weekdayHours: "الأحد - الخميس: 7:30 ص - 1:00 م",
  },
  {
    name: "فرع مركز السديراوي",
    location: "الشويخ السكني",
    weekdayHours: "الأحد - الخميس: 7:30 ص - 1:00 م",
  },
];

export function DonationLocationsCard() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl overflow-hidden"
    >
      {/* Header Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-5 py-4 flex items-center justify-between bg-gradient-to-l from-primary/5 to-transparent hover:from-primary/10 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg">
            <MapPin className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <div className="text-right">
            <h3 className="font-bold text-foreground">أماكن التبرع بالدم</h3>
            <p className="text-xs text-muted-foreground">مواعيد العمل في بنك الدم وفروعه</p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="w-8 h-8 glass rounded-lg flex items-center justify-center"
        >
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        </motion.div>
      </button>

      {/* Expandable Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 max-h-[400px] overflow-y-auto">
              {donationCenters.map((center, index) => (
                <motion.div
                  key={center.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass rounded-xl p-4 border-r-4 border-primary"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5 text-primary" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-foreground text-sm mb-1 leading-tight">
                        {center.name}
                      </h4>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                        <MapPin className="w-3 h-3" />
                        <span>{center.location}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs">
                          <Clock className="w-3 h-3 text-green-500" />
                          <span className="text-foreground">{center.weekdayHours}</span>
                        </div>
                        {center.weekendHours && (
                          <div className="flex items-center gap-2 text-xs">
                            <Clock className="w-3 h-3 text-blue-500" />
                            <span className="text-foreground">{center.weekendHours}</span>
                          </div>
                        )}
                        {center.fridayHours && (
                          <div className="flex items-center gap-2 text-xs">
                            <Clock className="w-3 h-3 text-amber-500" />
                            <span className="text-foreground">{center.fridayHours}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Footer Note */}
            <div className="px-4 pb-4">
              <div className="glass rounded-xl p-3 text-center bg-amber-500/5 border border-amber-500/20">
                <p className="text-xs text-muted-foreground">
                  ⚠️ يُنصح بالاتصال قبل الزيارة للتأكد من المواعيد
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
