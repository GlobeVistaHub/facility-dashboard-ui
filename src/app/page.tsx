"use client";

import MetricCard from "@/components/dashboard/MetricCard";
import MaintenanceTable from "@/components/dashboard/MaintenanceTable";
import { UserButton, useUser } from "@clerk/nextjs";

export default function Home() {
  const { user, isLoaded } = useUser();
  const isAdmin = user?.publicMetadata?.role === "admin";

  return (
    <div className="container mx-auto px-4 md:px-8 py-6 md:py-10 max-w-[1600px] flex flex-col gap-6 md:gap-8 w-full">
      {/* Header */}
      <header className="flex justify-between items-center w-full">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-on-surface tracking-tight">نظرة عامة على المرافق</h1>
          <p className="font-sans text-xs md:text-sm text-on-surface-variant mt-1.5 opacity-80">حالة الأنظمة الهندسية ومؤشرات الأداء الرئيسية</p>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden sm:flex glass-panel px-4 py-2 rounded-full items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_#2ddbde]" />
            <span className="font-sans text-xs font-bold text-primary">الأنظمة تعمل</span>
          </div>
          <button className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-surface-container hover:bg-surface-container-highest transition-colors flex items-center justify-center ghost-border relative">
            <span className="material-symbols-outlined text-on-surface text-[20px]">search</span>
          </button>
          <div className="flex items-center justify-center w-10 h-10">
            <UserButton />
          </div>
        </div>
      </header>

      {/* Metrics Row - Only available to Admins */}
      {!isLoaded ? (
         <section className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full animate-pulse">
            <div className="h-32 bg-surface-container rounded-2xl" />
            <div className="h-32 bg-surface-container rounded-2xl" />
            <div className="h-32 bg-surface-container rounded-2xl" />
         </section>
      ) : isAdmin ? (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
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
      ) : null}

      {/* Main Content Area */}
      <section className="w-full flex-1 min-h-[400px] flex flex-col gap-6">
        <MaintenanceTable />
      </section>

      {/* Footer */}
      <footer className="mt-8 pt-6 border-t ghost-border border-outline-variant/20 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] md:text-sm font-sans text-on-surface-variant w-full opacity-60">
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
