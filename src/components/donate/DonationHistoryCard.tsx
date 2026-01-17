import { Droplet, Calendar } from "lucide-react";
import type { DonationLog } from "@/hooks/useDonationLogs";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface DonationHistoryCardProps {
  donations: DonationLog[];
  isLoading: boolean;
}

export function DonationHistoryCard({ donations, isLoading }: DonationHistoryCardProps) {
  return (
    <div className="bg-card rounded-xl shadow-card overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h2 className="text-base font-semibold text-card-foreground">
          سجل التبرعات
        </h2>
      </div>

      <div className="p-5">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg animate-pulse-soft">
                <div className="w-10 h-10 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 bg-muted rounded" />
                  <div className="h-3 w-32 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : donations.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Droplet className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              لا يوجد سجل تبرعات سابقة
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {donations.map((donation) => (
              <div
                key={donation.id}
                className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-soft">
                  <Droplet className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    {format(new Date(donation.donation_date), "d MMMM yyyy", { locale: ar })}
                  </div>
                  {donation.notes && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {donation.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
