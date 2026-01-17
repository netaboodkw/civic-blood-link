import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ChevronRight, Droplets, Building2, User, FileText, AlertTriangle, Hash, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { z } from "zod";

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
] as const;

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;
const CITIES = ["مدينة الكويت", "حولي", "الفروانية", "الجهراء", "الأحمدي", "مبارك الكبير"] as const;

const URGENCY_LEVELS = [
  { value: "normal", label: "عادي", description: "خلال أيام", color: "bg-muted text-muted-foreground" },
  { value: "high", label: "مستعجل", description: "خلال ساعات", color: "bg-warning/10 text-warning" },
  { value: "urgent", label: "عاجل جدًا", description: "فوري", color: "bg-destructive/10 text-destructive" },
] as const;

// Validation schema
const requestSchema = z.object({
  patientName: z.string().trim().min(2, "اسم المريض مطلوب (حرفين على الأقل)").max(100, "الاسم طويل جدًا"),
  fileNumber: z.string().trim().max(50, "رقم الملف طويل جدًا").optional(),
  bloodType: z.enum(BLOOD_TYPES, { required_error: "فصيلة الدم مطلوبة" }),
  hospital: z.string().min(1, "المستشفى مطلوب"),
  city: z.enum(CITIES, { required_error: "المحافظة مطلوبة" }),
  unitsNeeded: z.number().min(1, "عدد الوحدات يجب أن يكون 1 على الأقل").max(10, "الحد الأقصى 10 وحدات"),
  urgencyLevel: z.enum(["normal", "high", "urgent"]),
  notes: z.string().trim().max(500, "الملاحظات طويلة جدًا").optional(),
});

type RequestFormData = z.infer<typeof requestSchema>;

export default function CreateRequest() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Form state
  const [patientName, setPatientName] = useState("");
  const [fileNumber, setFileNumber] = useState("");
  const [bloodType, setBloodType] = useState<string>("");
  const [hospital, setHospital] = useState("");
  const [city, setCity] = useState<string>("مدينة الكويت");
  const [unitsNeeded, setUnitsNeeded] = useState(1);
  const [urgencyLevel, setUrgencyLevel] = useState<"normal" | "high" | "urgent">("normal");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof RequestFormData, string>>>({});

  const createRequestMutation = useMutation({
    mutationFn: async (data: RequestFormData) => {
      if (!user) throw new Error("يجب تسجيل الدخول");

      const { error } = await supabase.from("blood_requests").insert({
        requester_id: user.id,
        patient_name: data.patientName,
        file_number: data.fileNumber || null,
        blood_type: data.bloodType,
        hospital_name: data.hospital,
        city: data.city,
        units_needed: data.unitsNeeded,
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
    try {
      requestSchema.parse({
        patientName,
        fileNumber: fileNumber || undefined,
        bloodType,
        hospital,
        city,
        unitsNeeded,
        urgencyLevel,
        notes: notes || undefined,
      });
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof RequestFormData, string>> = {};
        err.errors.forEach((e) => {
          const field = e.path[0] as keyof RequestFormData;
          newErrors[field] = e.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("يرجى تصحيح الأخطاء");
      return;
    }

    createRequestMutation.mutate({
      patientName,
      fileNumber: fileNumber || undefined,
      bloodType: bloodType as typeof BLOOD_TYPES[number],
      hospital,
      city: city as typeof CITIES[number],
      unitsNeeded,
      urgencyLevel,
      notes: notes || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-navBar/80 backdrop-blur-xl border-b border-border safe-area-top">
        <div className="flex items-center h-14 px-4 max-w-lg mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-primary ios-spring ios-press"
          >
            <ChevronRight className="w-5 h-5" />
            <span className="text-sm font-medium">رجوع</span>
          </button>
          <h1 className="flex-1 text-center text-lg font-semibold text-navBar-title pr-12">
            إنشاء طلب دم
          </h1>
        </div>
      </header>

      <main className="pb-8 pt-4">
        <div className="max-w-lg mx-auto px-4">
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
                  onChange={(e) => setHospital(e.target.value)}
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

            {/* Units Needed */}
            <div className="animate-slide-up" style={{ animationDelay: "250ms" }}>
              <label className="block text-sm font-medium text-foreground mb-2">
                عدد الوحدات المطلوبة *
              </label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setUnitsNeeded(Math.max(1, unitsNeeded - 1))}
                  className="w-12 h-12 bg-card border border-input rounded-xl text-xl font-bold ios-spring ios-press"
                >
                  -
                </button>
                <span className="text-2xl font-bold text-foreground w-12 text-center">
                  {unitsNeeded}
                </span>
                <button
                  type="button"
                  onClick={() => setUnitsNeeded(Math.min(10, unitsNeeded + 1))}
                  className="w-12 h-12 bg-card border border-input rounded-xl text-xl font-bold ios-spring ios-press"
                >
                  +
                </button>
                <span className="text-sm text-muted-foreground">وحدة</span>
              </div>
            </div>

            {/* Urgency Level */}
            <div className="animate-slide-up" style={{ animationDelay: "300ms" }}>
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
            <div className="animate-slide-up" style={{ animationDelay: "350ms" }}>
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
            <div className="pt-4 animate-slide-up" style={{ animationDelay: "400ms" }}>
              <button
                type="submit"
                disabled={createRequestMutation.isPending}
                className={cn(
                  "w-full flex items-center justify-center gap-2",
                  "bg-primary text-primary-foreground",
                  "rounded-xl px-6 py-4",
                  "font-semibold text-base",
                  "shadow-card hover:shadow-elevated",
                  "transition-all duration-200 ios-spring ios-press",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {createRequestMutation.isPending ? (
                  <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Droplets className="w-5 h-5" />
                    <span>نشر الطلب</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
