import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar, Loader2 } from "lucide-react";
import { useCreateDonationLog } from "@/hooks/useDonationLogs";
import { toast } from "@/hooks/use-toast";

interface NewDonationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewDonationDialog({ open, onOpenChange }: NewDonationDialogProps) {
  const [donationDate, setDonationDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState("");
  
  const createDonation = useCreateDonationLog();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!donationDate) {
      toast({
        title: "خطأ",
        description: "يرجى تحديد تاريخ التبرع",
        variant: "destructive",
      });
      return;
    }

    try {
      await createDonation.mutateAsync({
        donation_date: new Date(donationDate).toISOString(),
        notes: notes.trim() || undefined,
      });

      toast({
        title: "تم التسجيل",
        description: "تم تسجيل تبرعك بنجاح",
      });

      setNotes("");
      setDonationDate(new Date().toISOString().split("T")[0]);
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تسجيل التبرع",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>تسجيل تبرع جديد</DialogTitle>
          <DialogDescription>
            أدخل تفاصيل تبرعك الأخير
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="donation-date">تاريخ التبرع</Label>
            <div className="relative">
              <Input
                id="donation-date"
                type="date"
                value={donationDate}
                onChange={(e) => setDonationDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="pr-10"
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">ملاحظات (اختياري)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: تبرعت في مستشفى مبارك"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              className="flex-1"
              disabled={createDonation.isPending}
            >
              {createDonation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "تسجيل التبرع"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createDonation.isPending}
            >
              إلغاء
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
