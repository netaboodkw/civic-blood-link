import { AdminLayout } from "@/components/admin/AdminLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { motion } from "framer-motion";
import { Droplet, Calendar, FileText, User, Filter, X } from "lucide-react";
import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function AdminDonations() {
  const { data: donations, isLoading } = useQuery({
    queryKey: ["admin-donations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("donation_logs")
        .select(`
          *,
          profiles:donor_id (full_name, blood_type, city)
        `)
        .order("donation_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Filters
  const [bloodTypeFilter, setBloodTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredDonations = useMemo(() => {
    if (!donations) return [];
    return donations.filter((donation) => {
      const profile = (donation as any).profiles;
      if (bloodTypeFilter !== "all" && profile?.blood_type !== bloodTypeFilter) return false;
      if (searchQuery && !profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [donations, bloodTypeFilter, searchQuery]);

  const hasActiveFilters = bloodTypeFilter !== "all" || searchQuery !== "";

  const clearFilters = () => {
    setBloodTypeFilter("all");
    setSearchQuery("");
  };

  return (
    <AdminLayout title="سجل التبرعات">
      {/* Filters */}
      <div className="glass-card rounded-2xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-primary" />
          <span className="font-medium text-sm">فلترة السجلات</span>
          {hasActiveFilters && (
            <Badge className="bg-primary/10 text-primary text-xs">
              {(bloodTypeFilter !== "all" ? 1 : 0) + (searchQuery ? 1 : 0)} فلتر
            </Badge>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Input
            placeholder="بحث بالاسم..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="glass text-sm h-9"
          />

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
      {!isLoading && donations && (
        <p className="text-sm text-muted-foreground mb-3">
          {filteredDonations.length} تبرع {hasActiveFilters ? "(مفلتر)" : ""}
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
        ) : filteredDonations.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center">
            <Droplet className="w-12 h-12 text-muted-foreground mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-muted-foreground">{hasActiveFilters ? "لا يوجد سجلات مطابقة للفلتر" : "لا يوجد سجلات تبرع"}</p>
          </div>
        ) : (
          filteredDonations.map((donation, index) => (
            <motion.div
              key={donation.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card rounded-2xl p-4"
            >
              <div className="flex items-center gap-4">
                {/* Icon */}
                <div className="w-12 h-12 glass rounded-xl flex items-center justify-center bg-red-500/10 shrink-0">
                  <Droplet className="w-6 h-6 text-red-500" fill="currentColor" strokeWidth={1.5} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-muted-foreground" strokeWidth={2} />
                    <h3 className="font-bold text-foreground truncate">
                      {(donation as any).profiles?.full_name || "متبرع"}
                    </h3>
                    {(donation as any).profiles?.blood_type && (
                      <span className="text-sm font-bold text-red-500">
                        {(donation as any).profiles.blood_type}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" strokeWidth={2} />
                      <span>{format(new Date(donation.donation_date), "dd MMM yyyy", { locale: ar })}</span>
                    </div>
                    {donation.request_id && (
                      <div className="flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" strokeWidth={2} />
                        <span>مرتبط بطلب</span>
                      </div>
                    )}
                  </div>
                  {donation.notes && (
                    <p className="text-sm text-muted-foreground mt-2 truncate">
                      {donation.notes}
                    </p>
                  )}
                </div>

                {/* Time */}
                <div className="text-left shrink-0">
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(donation.created_at), "HH:mm", { locale: ar })}
                  </span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </AdminLayout>
  );
}
