import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useDuplicateCheck } from "@/hooks/useDuplicateCheck";
import { ChevronRight, Droplets, Building2, User, FileText, AlertTriangle, Hash, Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { z } from "zod";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

// Kuwaiti hospitals
const HOSPITALS = [
  "مستشفى مبارك الكبير",
  "مستشفى الأميري",
  "مستشفى الصباح",
  "مستشفى الفروانية",
  "مستشفى الجهراء",
  "مستشفى العدان",
  "مستشفى الأحمدي",
  "مستشفى جابر الأحمد",
  "مستشفى الرازي",
  "مستشفى ابن سينا",
  "مستشفى الولادة",
  "مستشفى الصدر",
  "مستشفى الطب النفسي",
  "مستشفى دار الشفاء",
  "مستشفى رويال حياة",
  "مستشفى السلام الدولي",
  "مستشفى المواساة",
  "مستشفى الهادي",
  "أخرى",
] as const;

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;
const CITIES = ["مدينة الكويت", "حولي", "الفروانية", "الجهراء", "الأحمدي", "مبارك الكبير"] as const;

const URGENCY_LEVELS = [
  { value: "normal", label: "عادي", description: "خلال أيام", color: "bg-muted text-muted-foreground" },
  { value: "high", label: "مستعجل", description: "خلال ساعات", color: "bg-warning/10 text-warning" },
  { value: "urgent", label: "عاجل جدًا", description: "فوري", color: "bg-destructive/10 text-destructive" },
] as const;

// Validation schema - removed unitsNeeded
const requestSchema = z.object({
  patientName: z.string().trim().min(2, "اسم المريض مطلوب (حرفين على الأقل)").max(100, "الاسم طويل جدًا"),
  fileNumber: z.string().trim().max(50, "رقم الملف طويل جدًا").optional(),
  bloodType: z.enum(BLOOD_TYPES, { required_error: "فصيلة الدم مطلوبة" }),
  hospital: z.string().min(1, "المستشفى مطلوب"),
  city: z.enum(CITIES, { required_error: "المحافظة مطلوبة" }),
  urgencyLevel: z.enum(["normal", "high", "urgent"]),
  notes: z.string().trim().max(500, "الملاحظات طويلة جدًا").optional(),
});

type RequestFormData = z.infer<typeof requestSchema>;

interface DuplicateInfo {
  id: string;
  patient_name: string;
  hospital_name: string;
  blood_type: string;
  created_at: string;
}

export default function CreateRequest() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { checkForDuplicate, duplicateCheckDays } = useDuplicateCheck();

  // Form state
  const [patientName, setPatientName] = useState("");
  const [fileNumber, setFileNumber] = useState("");
  const [bloodType, setBloodType] = useState<string>("");
  const [hospital, setHospital] = useState("");
  const [customHospital, setCustomHospital] = useState("");
  const [city, setCity] = useState<string>("مدينة الكويت");
  const [urgencyLevel, setUrgencyLevel] = useState<"normal" | "high" | "urgent">("normal");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof RequestFormData | "customHospital", string>>>({});
  
  // Duplicate detection
  const [duplicateWarning, setDuplicateWarning] = useState<DuplicateInfo | null>(null);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);

  const createRequestMutation = useMutation({
    mutationFn: async (data: RequestFormData) => {
      if (!user) throw new Error("يجب تسجيل الدخول");

      // Use custom hospital name if "أخرى" is selected
      const finalHospital = data.hospital === "أخرى" ? customHospital : data.hospital;

      const { error } = await supabase.from("blood_requests").insert({
        requester_id: user.id,
        patient_name: data.patientName,
        file_number: data.fileNumber || null,
        blood_type: data.bloodType,
        hospital_name: finalHospital,
        city: data.city,
        units_needed: 1, // Default value
        urgency_level: data.urgencyLevel,
        notes: data.notes || null,
        status: "open",
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["public-requests"] });
      queryClient.invalidateQueries({ queryKey: ["matching-requests-count"] });
      toast.success("تم إنشاء الطلب بنجاح");
      navigate("/home");
    },
    onError: (error: Error) => {
      console.error("Error creating request:", error);
      toast.error("حدث خطأ أثناء إنشاء الطلب");
    },
  });

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof RequestFormData | "customHospital", string>> = {};
    
    try {
      requestSchema.parse({
        patientName,
        fileNumber: fileNumber || undefined,
        bloodType,
        hospital,
        city,
        urgencyLevel,
        notes: notes || undefined,
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        err.errors.forEach((e) => {
          const field = e.path[0] as keyof RequestFormData;
          newErrors[field] = e.message;
        });
      }
    }

    // Validate custom hospital if "أخرى" is selected
    if (hospital === "أخرى") {
      if (!customHospital.trim()) {
        newErrors.customHospital = "يرجى كتابة اسم المستشفى";
      } else if (customHospital.trim().length < 3) {
        newErrors.customHospital = "اسم المستشفى قصير جدًا";
      } else if (customHospital.trim().length > 100) {
        newErrors.customHospital = "اسم المستشفى طويل جدًا";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("يرجى تصحيح الأخطاء");
      return;
    }

    const finalHospital = hospital === "أخرى" ? customHospital : hospital;

    // Check for duplicates
    setIsCheckingDuplicate(true);
    try {
      const result = await checkForDuplicate({
        patientName,
        hospitalName: finalHospital,
        fileNumber: fileNumber || undefined,
      });

      if (result.isDuplicate && result.existingRequest) {
        setDuplicateWarning(result.existingRequest);
        setIsCheckingDuplicate(false);
        return;
      }
    } catch (error) {
      console.error("Error checking duplicate:", error);
    }
    setIsCheckingDuplicate(false);

    createRequestMutation.mutate({
      patientName,
      fileNumber: fileNumber || undefined,
      bloodType: bloodType as typeof BLOOD_TYPES[number],
      hospital,
      city: city as typeof CITIES[number],
      urgencyLevel,
      notes: notes || undefined,
    });
  };

  const handleForceSubmit = () => {
    setDuplicateWarning(null);
    createRequestMutation.mutate({
      patientName,
      fileNumber: fileNumber || undefined,
      bloodType: bloodType as typeof BLOOD_TYPES[number],
      hospital,
      city: city as typeof CITIES[number],
      urgencyLevel,
      notes: notes || undefined,
    });
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header 
        className="flex-shrink-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/50"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="flex items-center h-[44px] px-4 max-w-lg mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-primary ios-spring ios-press"
          >
            <ChevronRight className="w-5 h-5" />
            <span className="text-sm font-medium">رجوع</span>
          </button>
          <h1 className="flex-1 text-center text-[17px] font-semibold text-foreground pr-12">
            إنشاء طلب دم
          </h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto overflow-x-hidden overscroll-none">
        <div className="max-w-lg mx-auto px-4 py-4 pb-8" style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }}>
          {/* Duplicate Warning Modal */}
          {duplicateWarning && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-card rounded-2xl p-6 max-w-sm w-full shadow-xl animate-scale-in">
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-amber-500/10 mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-amber-500" />
                </div>
                <h3 className="text-lg font-bold text-center text-foreground mb-2">
                  طلب مشابه موجود
                </h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  يوجد طلب مشابه تم نشره خلال آخر {duplicateCheckDays} أيام:
                </p>
                <div className="glass rounded-xl p-4 mb-4 text-sm">
                  <p><strong>المريض:</strong> {duplicateWarning.patient_name}</p>
                  <p><strong>المستشفى:</strong> {duplicateWarning.hospital_name}</p>
                  <p><strong>فصيلة الدم:</strong> {duplicateWarning.blood_type}</p>
                  <p><strong>تاريخ النشر:</strong> {format(new Date(duplicateWarning.created_at), "d MMMM yyyy", { locale: ar })}</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDuplicateWarning(null)}
                    className="flex-1 py-3 rounded-xl bg-muted text-foreground font-medium"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleForceSubmit}
                    className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-medium"
                  >
                    نشر على أي حال
                  </button>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Patient Name */}
            <div className="animate-slide-up">
              <label className="block text-sm font-medium text-foreground mb-2">
                <User className="w-4 h-4 inline-block ml-1" />
                اسم المريض *
              </label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="أدخل اسم المريض"
                className={cn(
                  "w-full bg-card border rounded-xl py-3.5 px-4 text-foreground",
                  "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50",
                  errors.patientName ? "border-destructive" : "border-input"
                )}
              />
              {errors.patientName && (
                <p className="text-xs text-destructive mt-1">{errors.patientName}</p>
              )}
            </div>

            {/* File Number */}
            <div className="animate-slide-up" style={{ animationDelay: "50ms" }}>
              <label className="block text-sm font-medium text-foreground mb-2">
                <Hash className="w-4 h-4 inline-block ml-1" />
                رقم الملف (اختياري)
              </label>
              <input
                type="text"
                value={fileNumber}
                onChange={(e) => setFileNumber(e.target.value)}
                placeholder="أدخل رقم ملف المريض"
                className={cn(
                  "w-full bg-card border rounded-xl py-3.5 px-4 text-foreground",
                  "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50",
                  errors.fileNumber ? "border-destructive" : "border-input"
                )}
              />
              {errors.fileNumber && (
                <p className="text-xs text-destructive mt-1">{errors.fileNumber}</p>
              )}
            </div>

            {/* Blood Type */}
            <div className="animate-slide-up" style={{ animationDelay: "100ms" }}>
              <label className="block text-sm font-medium text-foreground mb-2">
                <Droplets className="w-4 h-4 inline-block ml-1" />
                فصيلة الدم المطلوبة *
              </label>
              <div className="grid grid-cols-4 gap-2">
                {BLOOD_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setBloodType(type)}
                    className={cn(
                      "py-3 rounded-xl text-sm font-bold transition-all duration-200",
                      "border-2 ios-spring ios-press",
                      bloodType === type
                        ? "bg-destructive/10 border-destructive text-destructive"
                        : "bg-card border-input text-foreground hover:border-primary/50"
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
              {errors.bloodType && (
                <p className="text-xs text-destructive mt-1">{errors.bloodType}</p>
              )}
            </div>

            {/* Hospital */}
            <div className="animate-slide-up" style={{ animationDelay: "150ms" }}>
              <label className="block text-sm font-medium text-foreground mb-2">
                <Building2 className="w-4 h-4 inline-block ml-1" />
                المستشفى *
              </label>
              <div className="relative">
                <select
                  value={hospital}
                  onChange={(e) => {
                    setHospital(e.target.value);
                    if (e.target.value !== "أخرى") {
                      setCustomHospital("");
                    }
                  }}
                  className={cn(
                    "w-full bg-card border rounded-xl py-3.5 px-4 text-foreground appearance-none",
                    "focus:outline-none focus:ring-2 focus:ring-primary/50",
                    errors.hospital ? "border-destructive" : "border-input",
                    !hospital && "text-muted-foreground"
                  )}
                >
                  <option value="">اختر المستشفى</option>
                  {HOSPITALS.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
              {errors.hospital && (
                <p className="text-xs text-destructive mt-1">{errors.hospital}</p>
              )}

              {/* Custom hospital input */}
              {hospital === "أخرى" && (
                <div className="mt-3">
                  <input
                    type="text"
                    value={customHospital}
                    onChange={(e) => setCustomHospital(e.target.value)}
                    placeholder="اكتب اسم المستشفى"
                    className={cn(
                      "w-full bg-card border rounded-xl py-3.5 px-4 text-foreground",
                      "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50",
                      errors.customHospital ? "border-destructive" : "border-input"
                    )}
                  />
                  {errors.customHospital && (
                    <p className="text-xs text-destructive mt-1">{errors.customHospital}</p>
                  )}
                </div>
              )}
            </div>

            {/* City */}
            <div className="animate-slide-up" style={{ animationDelay: "200ms" }}>
              <label className="block text-sm font-medium text-foreground mb-2">
                المحافظة *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {CITIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCity(c)}
                    className={cn(
                      "py-2.5 rounded-xl text-xs font-medium transition-all duration-200",
                      "border ios-spring ios-press",
                      city === c
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card border-input text-foreground hover:border-primary/50"
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Urgency Level */}
            <div className="animate-slide-up" style={{ animationDelay: "250ms" }}>
              <label className="block text-sm font-medium text-foreground mb-2">
                <AlertTriangle className="w-4 h-4 inline-block ml-1" />
                مستوى الاستعجال *
              </label>
              <div className="space-y-2">
                {URGENCY_LEVELS.map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => setUrgencyLevel(level.value)}
                    className={cn(
                      "w-full flex items-center justify-between p-4 rounded-xl",
                      "border-2 transition-all duration-200 ios-spring ios-press",
                      urgencyLevel === level.value
                        ? `${level.color} border-current`
                        : "bg-card border-input hover:border-primary/50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                        urgencyLevel === level.value ? "border-current" : "border-muted-foreground"
                      )}>
                        {urgencyLevel === level.value && (
                          <Check className="w-3 h-3" />
                        )}
                      </span>
                      <span className="font-medium">{level.label}</span>
                    </div>
                    <span className="text-xs opacity-70">{level.description}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="animate-slide-up" style={{ animationDelay: "300ms" }}>
              <label className="block text-sm font-medium text-foreground mb-2">
                <FileText className="w-4 h-4 inline-block ml-1" />
                ملاحظات إضافية (اختياري)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="أي معلومات إضافية..."
                rows={3}
                className={cn(
                  "w-full bg-card border border-input rounded-xl py-3 px-4 text-foreground",
                  "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50",
                  "resize-none"
                )}
              />
              <p className="text-xs text-muted-foreground mt-1 text-left">
                {notes.length}/500
              </p>
            </div>

            {/* Submit Button */}
            <div className="animate-slide-up pt-2" style={{ animationDelay: "350ms" }}>
              <button
                type="submit"
                disabled={createRequestMutation.isPending || isCheckingDuplicate}
                className={cn(
                  "w-full bg-gradient-to-r from-primary to-primary/85 text-primary-foreground",
                  "rounded-2xl py-4 font-bold text-[17px] shadow-lg glow-primary",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "ios-spring ios-press"
                )}
              >
                {createRequestMutation.isPending || isCheckingDuplicate ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    جاري الإنشاء...
                  </span>
                ) : (
                  "نشر الطلب"
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
