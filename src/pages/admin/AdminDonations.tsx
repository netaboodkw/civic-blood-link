import { AdminLayout } from "@/components/admin/AdminLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function AdminDonations() {
  const { data: donations, isLoading } = useQuery({
    queryKey: ["admin-donations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("donation_logs")
        .select("*")
        .order("donation_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return (
    <AdminLayout title="سجل التبرعات">
      <div className="bg-background rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">معرف المتبرع</TableHead>
              <TableHead className="text-right">تاريخ التبرع</TableHead>
              <TableHead className="text-right">معرف الطلب</TableHead>
              <TableHead className="text-right">ملاحظات</TableHead>
              <TableHead className="text-right">تاريخ التسجيل</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <TableRow key={i}>
                  {Array(5).fill(0).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : !donations || donations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  لا يوجد سجلات تبرع
                </TableCell>
              </TableRow>
            ) : (
              donations.map((donation) => (
                <TableRow key={donation.id}>
                  <TableCell className="font-mono text-sm">
                    {donation.donor_id.slice(0, 8)}...
                  </TableCell>
                  <TableCell>
                    {format(new Date(donation.donation_date), "dd MMM yyyy", { locale: ar })}
                  </TableCell>
                  <TableCell>
                    {donation.request_id ? (
                      <span className="font-mono text-sm">{donation.request_id.slice(0, 8)}...</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>{donation.notes || "-"}</TableCell>
                  <TableCell>
                    {format(new Date(donation.created_at), "dd MMM yyyy HH:mm", { locale: ar })}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
}
