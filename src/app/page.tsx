import MetricCard from "@/components/dashboard/MetricCard";
import MaintenanceTable from "@/components/dashboard/MaintenanceTable";
import {
  UserButton
} from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="container mx-auto px-8 py-10 max-w-[1600px] flex flex-col gap-8 w-full">
      {/* Header */}
      <header className="flex justify-between items-center w-full">
        <div>
          <h1 className="font-display text-3xl font-bold text-on-surface tracking-tight">نظرة عامة على المرافق</h1>
          <p className="font-sans text-on-surface-variant mt-1.5">حالة الأنظمة الهندسية ومؤشرات الأداء الرئيسية</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="glass-panel px-6 py-2.5 rounded-full flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_#2ddbde]" />
            <span className="font-sans text-sm font-bold text-primary">جميع الأنظمة تعمل بشكل طبيعي</span>
          </div>
          <button className="w-12 h-12 rounded-full bg-surface-container hover:bg-surface-container-highest transition-colors flex items-center justify-center ghost-border relative">
            <span className="material-symbols-outlined text-on-surface">search</span>
          </button>
          <div className="flex items-center justify-center w-10 h-10">
            <UserButton />
          </div>
        </div>
      </header>

      {/* Metrics Row */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-4">
        <MetricCard
          title="إجمالي التذاكر النشطة"
          value={24}
          icon="confirmation_number"
          highlight="primary"
          trend={{ value: "+3 عن الأمس", isUp: false }}
        />
        <MetricCard
          title="الأعطال التي تم حلها"
          value={142}
          icon="check_circle"
          trend={{ value: "معدل استجابة أسرع بـ 12%", isUp: true }}
        />
        <MetricCard
          title="الأصول الحرجة المتوقفة"
          value={1}
          icon="warning"
          highlight="error"
        />
      </section>

      {/* Main Content Area */}
      <section className="w-full flex-1 min-h-[500px] mt-4 flex flex-col gap-6">
        <MaintenanceTable />
      </section>

      {/* Footer */}
      <footer className="mt-8 pt-6 border-t ghost-border border-outline-variant/20 flex justify-between items-center text-sm font-sans text-on-surface-variant w-full">
        <span>جميع الحقوق محفوظة © 2026 GlobeVistaHub Systems</span>
        <div className="flex items-center gap-4">
          <span>أداء الشبكة: 99.98%</span>
          <span className="w-1 h-1 bg-outline rounded-full" />
          <span>زمن الاستجابة: 45ms</span>
        </div>
      </footer>
    </div>
  );
}
