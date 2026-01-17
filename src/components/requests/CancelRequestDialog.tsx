import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCancelRequest } from "@/hooks/useRequestMutations";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface CancelRequestDialogProps {
  requestId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CancelRequestDialog({ requestId, open, onOpenChange }: CancelRequestDialogProps) {
  const cancelRequest = useCancelRequest();

  const handleCancel = async () => {
    if (!requestId) return;

    try {
      await cancelRequest.mutateAsync(requestId);
      toast({
        title: "تم الإلغاء",
        description: "تم إلغاء الطلب بنجاح",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إلغاء الطلب",
        variant: "destructive",
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle>إلغاء الطلب</AlertDialogTitle>
          <AlertDialogDescription>
            هل أنت متأكد من إلغاء هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row-reverse gap-2">
          <AlertDialogCancel disabled={cancelRequest.isPending}>
            تراجع
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCancel}
            disabled={cancelRequest.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {cancelRequest.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "إلغاء الطلب"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
