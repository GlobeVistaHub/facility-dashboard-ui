import Link from "next/link";
import React from "react";

export default function Sidebar() {
  const navItems = [
    { name: "لوحة القيادة", href: "#", icon: "dashboard", active: true },
    { name: "إدارة الأصول", href: "#", icon: "inventory_2", active: false },
    { name: "استهلاك الطاقة", href: "#", icon: "bolt", active: false },
    { name: "تنبيهات النظام", href: "#", icon: "notifications_active", active: false },
    { name: "التقارير", href: "#", icon: "analytics", active: false },
    { name: "الإعدادات", href: "#", icon: "settings", active: false },
  ];

  return (
    <aside className="fixed bottom-0 left-0 right-0 h-16 bg-surface-container-low/95 backdrop-blur-xl border-t ghost-border border-outline-variant flex flex-row items-center justify-around px-2 z-50 md:sticky md:top-0 md:right-0 md:bottom-auto md:left-auto md:w-64 md:h-screen md:border-t-0 md:border-l md:flex-col md:p-6 md:justify-start glass-panel transition-all duration-300 overflow-hidden">
      {/* Brand logo - Hidden on mobile */}
      <div className="hidden md:block mb-12">
        <h1 className="font-display text-2xl font-bold text-primary tracking-tight">مركز التحكم</h1>
        <p className="text-on-surface-variant font-sans text-sm mt-1">إدارة المرافق الهندسية</p>
      </div>

      {/* Navigation */}
      <nav className="flex flex-row md:flex-col md:flex-1 gap-1 md:gap-2 w-full justify-around md:justify-start">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col md:flex-row items-center gap-1 md:gap-4 px-2 md:px-4 py-2 md:py-3 rounded-lg transition-all duration-200 ${
              item.active
                ? "md:bg-gradient-to-br md:from-primary md:to-primary-container text-primary md:text-on-primary-fixed-variant font-bold md:shadow-lg md:shadow-black/20"
                : "text-on-surface-variant hover:bg-surface-container-highest md:hover:text-white"
            }`}
          >
            <span className={`material-symbols-outlined text-[20px] md:text-[22px] ${item.active ? 'fill-1' : ''}`}>{item.icon}</span>
            <span className="font-sans text-[10px] md:text-sm font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>

      {/* User Profile - Hidden on mobile */}
      <div className="hidden md:flex pt-6 border-t ghost-border border-outline-variant items-center gap-3 w-full">
        <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center font-display font-bold text-primary">
          ش
        </div>
        <div className="truncate">
          <p className="text-sm font-sans font-bold text-on-surface truncate">م. شريف سيف</p>
          <p className="text-xs font-sans text-on-surface-variant">مدير العمليات</p>
        </div>
      </div>
    </aside>
  );
}
