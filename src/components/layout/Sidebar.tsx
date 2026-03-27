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
    <aside className="w-64 h-full bg-surface-container-low/80 backdrop-blur-xl border-l ghost-border border-outline-variant flex flex-col p-6 shrink-0 relative z-10 glass-panel">
      {/* Brand logo / Title */}
      <div className="mb-12">
        <h1 className="font-display text-2xl font-bold text-primary tracking-tight">مركز التحكم</h1>
        <p className="text-on-surface-variant font-sans text-sm mt-1">إدارة المرافق الهندسية</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-4 px-4 py-3 rounded-md transition-all duration-200 ${
              item.active
                ? "bg-gradient-to-br from-primary to-primary-container text-on-primary-fixed-variant font-bold shadow-lg shadow-black/20"
                : "text-on-surface-variant hover:bg-surface-container-highest hover:text-white"
            }`}
          >
            {/* We can use material symbols if included, simply text for now or abstract icons */}
            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            <span className="font-sans text-sm">{item.name}</span>
          </Link>
        ))}
      </nav>

      {/* User Profile */}
      <div className="pt-6 border-t ghost-border border-outline-variant flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center font-display font-bold text-primary">
          ش
        </div>
        <div>
          <p className="text-sm font-sans font-bold text-on-surface">م. شريف سيف</p>
          <p className="text-xs font-sans text-on-surface-variant">مدير العمليات</p>
        </div>
      </div>
    </aside>
  );
}
