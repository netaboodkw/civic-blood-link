import { useNavigate } from "react-router-dom";
import { TopNavBar } from "@/components/layout/TopNavBar";
import { ChevronRight, FileEdit } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CreateRequest() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Custom nav with back button */}
      <header className="sticky top-0 z-40 bg-navBar/80 backdrop-blur-xl border-b border-border safe-area-top">
        <div className="flex items-center h-14 px-4 max-w-lg mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-primary ios-spring ios-press"
          >
            <ChevronRight className="w-5 h-5" />
            <span className="text-sm font-medium">رجوع</span>
          </button>
          <h1 className="flex-1 text-center text-lg font-semibold text-navBar-title pr-16">
            إنشاء طلب
          </h1>
        </div>
      </header>

      <main className="pb-8 pt-2">
        <div className="max-w-lg mx-auto px-4">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-primary-soft rounded-2xl flex items-center justify-center mb-4 animate-fade-in">
              <FileEdit className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2 animate-slide-up">
              قريبًا
            </h2>
            <p className="text-sm text-muted-foreground animate-slide-up" style={{ animationDelay: "50ms" }}>
              سيتم إضافة نموذج إنشاء الطلب قريبًا
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
