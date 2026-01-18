import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminRequests } from "@/hooks/useAdminRequests";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MoreHorizontal, CheckCircle, XCircle, Clock, Trash2, Loader2, FileText, MapPin, Droplet, Building2, AlertTriangle, MousePointer, MessageCircle, Send, Users, Filter, X } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

import type { Database } from "@/integrations/supabase/types";

type BloodType = Database["public"]["Enums"]["blood_type"];

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const CITIES = ["مدينة الكويت", "حولي", "الفروانية", "الأحمدي", "الجهراء", "مبارك الكبير"];
const STATUSES = [
  { value: "open", label: "مفتوح" },
  { value: "fulfilled", label: "مكتمل" },
  { value: "cancelled", label: "ملغي" },
  { value: "expired", label: "منتهي" },
];
const URGENCY_LEVELS = [
  { value: "normal", label: "عادي" },
  { value: "high", label: "مستعجل" },
  { value: "urgent", label: "طارئ" },
];

// Blood type compatibility map - who can donate to whom
const CAN_RECEIVE_FROM: Record<BloodType, BloodType[]> = {
  "A+": ["A+", "A-", "O+", "O-"],
  "A-": ["A-", "O-"],
  "B+": ["B+", "B-", "O+", "O-"],
  "B-": ["B-", "O-"],
  "AB+": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
  "AB-": ["A-", "B-", "AB-", "O-"],
  "O+": ["O+", "O-"],
  "O-": ["O-"],
};

export default function AdminRequests() {
  const { requests, isLoading, updateStatus, deleteRequest, isUpdating, isDeleting } = useAdminRequests();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [matchingCount, setMatchingCount] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [isLoadingMatching, setIsLoadingMatching] = useState(false);

  // Filters
  const [bloodTypeFilter, setBloodTypeFilter] = useState<string>("all");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [urgencyFilter, setUrgencyFilter] = useState<string>("all");

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      if (bloodTypeFilter !== "all" && request.blood_type !== bloodTypeFilter) return false;
      if (cityFilter !== "all" && request.city !== cityFilter) return false;
      if (statusFilter !== "all" && request.status !== statusFilter) return false;
      if (urgencyFilter !== "all" && request.urgency_level !== urgencyFilter) return false;
      return true;
    });
  }, [requests, bloodTypeFilter, cityFilter, statusFilter, urgencyFilter]);

  const hasActiveFilters = bloodTypeFilter !== "all" || cityFilter !== "all" || statusFilter !== "all" || urgencyFilter !== "all";

  const clearFilters = () => {
    setBloodTypeFilter("all");
    setCityFilter("all");
    setStatusFilter("all");
    setUrgencyFilter("all");
  };

  const statusLabels: Record<string, string> = {
    open: "مفتوح",
    fulfilled: "مكتمل",
    cancelled: "ملغي",
    expired: "منتهي",
  };

  const statusColors: Record<string, string> = {
    open: "bg-amber-500/10 text-amber-600 border-amber-500/30",
    fulfilled: "bg-green-500/10 text-green-600 border-green-500/30",
    cancelled: "bg-red-500/10 text-red-600 border-red-500/30",
    expired: "bg-gray-500/10 text-gray-600 border-gray-500/30",
  };

  const handleDeleteClick = (requestId: string) => {
    setSelectedRequestId(requestId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedRequestId) {
      deleteRequest(selectedRequestId);
    }
    setDeleteDialogOpen(false);
    setSelectedRequestId(null);
  };

  const handleSendToMatchingClick = async (request: any) => {
    setSelectedRequest(request);
    setIsLoadingMatching(true);
    setSendDialogOpen(true);

    try {
      // Get eligible donors with compatible blood types in the same city
      const compatibleTypes = CAN_RECEIVE_FROM[request.blood_type] || [];
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const { count, error } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .in("blood_type", compatibleTypes)
        .eq("city", request.city)
        .or(`last_donation_date.is.null,last_donation_date.lt.${ninetyDaysAgo.toISOString()}`);

      if (error) throw error;
      setMatchingCount(count || 0);
    } catch (error) {
      console.error("Error fetching matching donors:", error);
      setMatchingCount(0);
    } finally {
      setIsLoadingMatching(false);
    }
  };

  const handleConfirmSend = async () => {
    if (!selectedRequest) return;
    
    setIsSending(true);
    try {
      // Get all matching donors with push tokens
      const compatibleTypes = CAN_RECEIVE_FROM[selectedRequest.blood_type] || [];
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const { data: donors, error } = await supabase
        .from("profiles")
        .select("id, full_name, phone, push_token")
        .in("blood_type", compatibleTypes)
        .eq("city", selectedRequest.city)
        .or(`last_donation_date.is.null,last_donation_date.lt.${ninetyDaysAgo.toISOString()}`);

      if (error) throw error;

      // Create in-app notifications for all matching donors
      const notifications = donors?.map(donor => ({
        user_id: donor.id,
        title: selectedRequest.urgency_level === "urgent" ? "🚨 طلب عاجل للتبرع بالدم!" : "📢 طلب تبرع بالدم",
        body: `يوجد طلب للتبرع بفصيلة ${selectedRequest.blood_type} في ${selectedRequest.hospital_name}، ${selectedRequest.city}`,
        type: "blood_request",
        related_request_id: selectedRequest.id,
      })) || [];

      if (notifications.length > 0) {
        const { error: notifError } = await supabase
          .from("notifications")
          .insert(notifications);
        
        if (notifError) throw notifError;
      }

      // Send iOS push notifications to donors with push tokens
      const donorsWithPushToken = donors?.filter(d => d.push_token) || [];
      let pushSent = 0;
      let pushFailed = 0;

      if (donorsWithPushToken.length > 0) {
        const title = selectedRequest.urgency_level === "urgent" 
          ? "🚨 طلب عاجل للتبرع بالدم!" 
          : "📢 طلب تبرع بالدم";
        const body = `يوجد طلب للتبرع بفصيلة ${selectedRequest.blood_type} في ${selectedRequest.hospital_name}، ${selectedRequest.city}`;

        const { data: pushResult, error: pushError } = await supabase.functions.invoke('send-ios-push', {
          body: {
            user_ids: donorsWithPushToken.map(d => d.id),
            title,
            body,
          }
        });

        if (pushError) {
          console.error('Push notification error:', pushError);
        } else {
          pushSent = pushResult?.sent || 0;
          pushFailed = pushResult?.failed || 0;
        }
      }

      const inAppCount = donors?.length || 0;
      const pushCount = donorsWithPushToken.length;
      
      let message = `تم إرسال ${inAppCount} إشعار داخلي`;
      if (pushCount > 0) {
        message += ` + ${pushSent} إشعار iOS`;
        if (pushFailed > 0) {
          message += ` (${pushFailed} فشل)`;
        }
      }
      
      toast.success(message);
      setSendDialogOpen(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error("Error sending notifications:", error);
      toast.error("حدث خطأ أثناء إرسال الإشعارات");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AdminLayout title="إدارة طلبات الدم">
      {/* Filters */}
      <div className="glass-card rounded-2xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-primary" />
          <span className="font-medium text-sm">فلترة الطلبات</span>
          {hasActiveFilters && (
            <Badge className="bg-primary/10 text-primary text-xs">
              {[bloodTypeFilter, cityFilter, statusFilter, urgencyFilter].filter(f => f !== "all").length} فلتر
            </Badge>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Select value={bloodTypeFilter} onValueChange={setBloodTypeFilter}>
            <SelectTrigger className="glass text-sm h-9">
              <SelectValue placeholder="فصيلة الدم" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الفصائل</SelectItem>
              {BLOOD_TYPES.map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={cityFilter} onValueChange={setCityFilter}>
            <SelectTrigger className="glass text-sm h-9">
              <SelectValue placeholder="المدينة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع المدن</SelectItem>
              {CITIES.map((city) => (
                <SelectItem key={city} value={city}>{city}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="glass text-sm h-9">
              <SelectValue placeholder="الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الحالات</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
            <SelectTrigger className="glass text-sm h-9">
              <SelectValue placeholder="الاستعجال" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع المستويات</SelectItem>
              {URGENCY_LEVELS.map((l) => (
                <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 w-full gap-2 text-muted-foreground"
            onClick={clearFilters}
          >
            <X className="w-3 h-3" />
            مسح الفلاتر
          </Button>
        )}
      </div>

      {/* Results count */}
      {!isLoading && (
        <p className="text-sm text-muted-foreground mb-3">
          {filteredRequests.length} طلب {hasActiveFilters ? "(مفلتر)" : ""}
        </p>
      )}

      <div className="space-y-3">
        {isLoading ? (
          Array(5).fill(0).map((_, i) => (
            <div key={i} className="glass-card rounded-2xl p-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-muted rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-muted rounded" />
                  <div className="h-3 w-24 bg-muted rounded" />
                </div>
              </div>
            </div>
          ))
        ) : filteredRequests.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-muted-foreground">{hasActiveFilters ? "لا يوجد طلبات مطابقة للفلتر" : "لا يوجد طلبات"}</p>
          </div>
        ) : (
          filteredRequests.map((request, index) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "glass-card rounded-2xl p-4",
                request.urgency_level === "urgent" && "ring-2 ring-red-500/30"
              )}
            >
              <div className="flex items-start gap-4">
                {/* Blood Type Badge */}
                <div className="w-14 h-14 glass rounded-xl flex flex-col items-center justify-center bg-red-500/10 shrink-0">
                  <Droplet className="w-5 h-5 text-red-500 mb-0.5" fill="currentColor" strokeWidth={1.5} />
                  <span className="text-sm font-bold text-red-500">{request.blood_type}</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-bold text-foreground">{request.patient_name || "مريض"}</h3>
                    {request.urgency_level === "urgent" && (
                      <Badge className="bg-red-500 text-white text-xs gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        عاجل
                      </Badge>
                    )}
                    <Badge className={cn("text-xs border", statusColors[request.status])}>
                      {statusLabels[request.status]}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                    <div className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" strokeWidth={2} />
                      <span>{request.hospital_name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" strokeWidth={2} />
                      <span>{request.city}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(request.created_at), "dd MMM yyyy", { locale: ar })}
                    </span>
                    {request.file_number && (
                      <>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          ملف: {request.file_number}
                        </span>
                      </>
                    )}
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <MousePointer className="w-3 h-3" />
                      {(request as any).click_count || 0} نقرة
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button 
                      className="glass rounded-xl p-2.5 hover:bg-primary/5 transition-colors disabled:opacity-50"
                      disabled={isUpdating || isDeleting}
                    >
                      {isUpdating || isDeleting ? (
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      ) : (
                        <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="glass-card border-border/50">
                    <DropdownMenuItem 
                      onClick={() => updateStatus({ requestId: request.id, status: "open" })}
                      disabled={request.status === "open"}
                      className="gap-2"
                    >
                      <Clock className="h-4 w-4 text-amber-500" strokeWidth={2} />
                      تعيين كمفتوح
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => updateStatus({ requestId: request.id, status: "fulfilled" })}
                      disabled={request.status === "fulfilled"}
                      className="gap-2"
                    >
                      <CheckCircle className="h-4 w-4 text-green-500" strokeWidth={2} />
                      تعيين كمكتمل
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => updateStatus({ requestId: request.id, status: "cancelled" })}
                      disabled={request.status === "cancelled"}
                      className="gap-2"
                    >
                      <XCircle className="h-4 w-4 text-red-500" strokeWidth={2} />
                      تعيين كملغي
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleSendToMatchingClick(request)}
                      disabled={request.status !== "open"}
                      className="gap-2 text-green-600 focus:text-green-600"
                    >
                      <Send className="h-4 w-4" strokeWidth={2} />
                      إرسال للمطابقين
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleDeleteClick(request.id)}
                      className="gap-2 text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={2} />
                      حذف الطلب
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="glass-card border-border/50">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right">هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              سيتم حذف هذا الطلب نهائياً ولا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel className="glass">إلغاء</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Send to Matching Donors Dialog */}
      <AlertDialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
        <AlertDialogContent className="glass-card border-border/50">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right flex items-center gap-2">
              <Send className="h-5 w-5 text-green-500" />
              إرسال إشعار للمتبرعين المطابقين
            </AlertDialogTitle>
            <AlertDialogDescription className="text-right space-y-3">
              {isLoadingMatching ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <p>
                    سيتم إرسال إشعار لجميع المتبرعين المؤهلين الذين يطابقون فصيلة الدم والمدينة.
                  </p>
                  <div className="glass rounded-xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{matchingCount} متبرع</p>
                      <p className="text-xs text-muted-foreground">سيستلمون الإشعار</p>
                    </div>
                  </div>
                  {selectedRequest && (
                    <div className="glass rounded-xl p-4 space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Droplet className="h-4 w-4 text-red-500" fill="currentColor" />
                        <span>فصيلة الدم: <strong>{selectedRequest.blood_type}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>المدينة: <strong>{selectedRequest.city}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span>المستشفى: <strong>{selectedRequest.hospital_name}</strong></span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel className="glass" disabled={isSending}>إلغاء</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmSend}
              disabled={matchingCount === 0 || isSending || isLoadingMatching}
              className="bg-green-500 text-white hover:bg-green-600 gap-2"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              إرسال الإشعار
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
