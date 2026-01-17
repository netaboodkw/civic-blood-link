import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useUpdateRequest } from "@/hooks/useRequestMutations";
import { toast } from "@/hooks/use-toast";
import type { BloodRequest } from "@/hooks/useMyRequests";

interface EditRequestDialogProps {
  request: BloodRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const HOSPITALS = [
  "مستشفى مبارك الكبير",
  "مستشفى الأميري",
  "مستشفى الصباح",
  "مستشفى الفروانية",
  "مستشفى الجهراء",
  "مستشفى العدان",
  "مستشفى الأحمدي",
  "مستشفى جابر الأحمد",
  "مستشفى زين",
  "مستشفى الرازي",
  "مستشفى ابن سينا",
  "مستشفى الولادة",
  "مستشفى الصدري",
  "مستشفى الطب النفسي",
  "مستشفى السيف",
  "مستشفى رويال حياة",
  "مستشفى دار الشفاء",
  "مستشفى المواساة",
  "أخرى",
];

const CITIES = [
  "مدينة الكويت",
  "حولي",
  "الفروانية",
  "الأحمدي",
  "الجهراء",
  "مبارك الكبير",
];

export function EditRequestDialog({ request, open, onOpenChange }: EditRequestDialogProps) {
  const [patientName, setPatientName] = useState(request?.patient_name || "");
  const [fileNumber, setFileNumber] = useState(request?.file_number || "");
  const [hospital, setHospital] = useState(request?.hospital_name || "");
  const [customHospital, setCustomHospital] = useState("");
  const [city, setCity] = useState(request?.city || "");
  const [unitsNeeded, setUnitsNeeded] = useState(request?.units_needed?.toString() || "1");
  const [urgencyLevel, setUrgencyLevel] = useState(request?.urgency_level || "normal");
  const [notes, setNotes] = useState(request?.notes || "");

  const updateRequest = useUpdateRequest();

  // Reset form when request changes
  useState(() => {
    if (request) {
      setPatientName(request.patient_name || "");
      setFileNumber(request.file_number || "");
      setHospital(HOSPITALS.includes(request.hospital_name) ? request.hospital_name : "أخرى");
      setCustomHospital(HOSPITALS.includes(request.hospital_name) ? "" : request.hospital_name);
      setCity(request.city || "");
      setUnitsNeeded(request.units_needed?.toString() || "1");
      setUrgencyLevel(request.urgency_level || "normal");
      setNotes(request.notes || "");
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!request) return;

    const finalHospital = hospital === "أخرى" ? customHospital : hospital;

    if (!patientName.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال اسم المريض",
        variant: "destructive",
      });
      return;
    }

    if (!finalHospital.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار المستشفى",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateRequest.mutateAsync({
        id: request.id,
        patient_name: patientName.trim(),
        file_number: fileNumber.trim() || undefined,
        hospital_name: finalHospital,
        city,
        units_needed: parseInt(unitsNeeded),
        urgency_level: urgencyLevel,
        notes: notes.trim() || undefined,
      });

      toast({
        title: "تم التحديث",
        description: "تم تحديث الطلب بنجاح",
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث الطلب",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>تعديل الطلب</DialogTitle>
          <DialogDescription>
            قم بتعديل بيانات طلب الدم
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="patient-name">اسم المريض</Label>
            <Input
              id="patient-name"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="أدخل اسم المريض"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file-number">رقم الملف (اختياري)</Label>
            <Input
              id="file-number"
              value={fileNumber}
              onChange={(e) => setFileNumber(e.target.value)}
              placeholder="أدخل رقم الملف"
            />
          </div>

          <div className="space-y-2">
            <Label>المستشفى</Label>
            <Select value={hospital} onValueChange={setHospital}>
              <SelectTrigger>
                <SelectValue placeholder="اختر المستشفى" />
              </SelectTrigger>
              <SelectContent>
                {HOSPITALS.map((h) => (
                  <SelectItem key={h} value={h}>{h}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hospital === "أخرى" && (
              <Input
                value={customHospital}
                onChange={(e) => setCustomHospital(e.target.value)}
                placeholder="أدخل اسم المستشفى"
                className="mt-2"
              />
            )}
          </div>

          <div className="space-y-2">
            <Label>المحافظة</Label>
            <Select value={city} onValueChange={setCity}>
              <SelectTrigger>
                <SelectValue placeholder="اختر المحافظة" />
              </SelectTrigger>
              <SelectContent>
                {CITIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>عدد الوحدات</Label>
            <Select value={unitsNeeded} onValueChange={setUnitsNeeded}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <SelectItem key={n} value={n.toString()}>{n} وحدة</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>مستوى الاستعجال</Label>
            <Select value={urgencyLevel} onValueChange={setUrgencyLevel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">عادي</SelectItem>
                <SelectItem value="high">مستعجل</SelectItem>
                <SelectItem value="urgent">طارئ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">ملاحظات (اختياري)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="أي ملاحظات إضافية"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              className="flex-1"
              disabled={updateRequest.isPending}
            >
              {updateRequest.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "حفظ التغييرات"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateRequest.isPending}
            >
              إلغاء
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
