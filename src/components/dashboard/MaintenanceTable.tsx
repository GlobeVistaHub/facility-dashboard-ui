"use client";

import React, { useEffect, useState } from "react";

interface Ticket {
  ticket_number: string;
  phone_number: string;
  category: string;
  description: string;
  status: string;
  timestamp: string;
}

export default function MaintenanceTable() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTickets() {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://psalaayzizmoflskttgg.supabase.co";
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_rerBJpPEefsGUx5wAvnXfQ_l8Sj2RPU";

        const response = await fetch(
          `${supabaseUrl}/rest/v1/tickets?select=*&order=created_at.desc`,
          {
            headers: {
              "apikey": supabaseKey,
              "Authorization": `Bearer ${supabaseKey}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("خطأ في جلب بيانات التذاكر من قاعدة البيانات");
        }
        
        const data = await response.json();
        
        // Map created_at to timestamp to match the existing UI interface
        const mappedTickets = data.map((t: any) => ({
          ...t,
          timestamp: new Date(t.created_at).toLocaleString("ar-SA", {
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "2-digit",
          }),
        }));

        setTickets(mappedTickets);
      } catch (err: any) {
        setError(err.message || "فشل الاتصال بقاعدة البيانات");
      } finally {
        setLoading(false);
      }
    }

    fetchTickets();
  }, []);

  // Map Arabic statuses to color codes
  const getStatusStyle = (status: string) => {
    if (status.includes("حرج") || status.includes("طوارئ")) {
      return "bg-error/10 text-error";
    }
    if (status.includes("قيد المعالجة") || status === "جديد" || status.includes("نشط")) {
      return "bg-primary/10 text-primary";
    }
    if (status.includes("مكتمل") || status.includes("تم الحل") || status.includes("مغلق")) {
      return "bg-outline/10 text-on-surface-variant";
    }
    // Default/warning style
    return "bg-secondary-container/10 text-secondary-container";
  };

  return (
    <div className="bg-surface-container rounded-xl ghost-border overflow-hidden flex flex-col w-full h-full relative">
      <div className="p-6 border-b ghost-border border-outline-variant/30 flex justify-between items-center">
        <h2 className="font-display text-xl font-bold text-on-surface">جدول طلبات الصيانة النشطة</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-surface-variant/40 hover:bg-surface-variant/60 rounded-md transition-colors text-sm font-sans font-medium text-white backdrop-blur-md">
          <span className="material-symbols-outlined text-[18px]">filter_list</span>
          تصفية
        </button>
      </div>

      <div className="overflow-x-auto min-h-[300px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-primary">
            <span className="material-symbols-outlined text-4xl animate-spin mb-2">autorenew</span>
            <span className="text-sm font-sans font-medium">جاري تحميل البيانات...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-error">
            <span className="material-symbols-outlined text-4xl mb-2">error</span>
            <span className="text-sm font-sans font-medium">{error}</span>
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl mb-2">inbox</span>
            <span className="text-sm font-sans font-medium">لا توجد تذاكر صيانة نشطة</span>
          </div>
        ) : (
          <table className="w-full text-right font-sans border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50 text-on-surface-variant text-sm border-b ghost-border border-outline-variant/30">
                <th className="py-4 px-6 font-medium">رقم التذكرة</th>
                <th className="py-4 px-6 font-medium">رقم الهاتف</th>
                <th className="py-4 px-6 font-medium">الفئة</th>
                <th className="py-4 px-6 font-medium text-right">الوصف</th>
                <th className="py-4 px-6 font-medium">الحالة</th>
                <th className="py-4 px-6 font-medium text-left">الوقت</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket, index) => {
                const isCritical = ticket.status.includes("حرج") || ticket.status.includes("طوارئ");
                
                return (
                  <tr 
                    key={ticket.ticket_number || index} 
                    className={`group transition-colors ${
                      index !== tickets.length - 1 ? 'border-b ghost-border border-outline-variant/10' : ''
                    } hover:bg-surface-container-high`}
                  >
                    <td className="py-4 px-6 text-sm text-on-surface font-medium">{ticket.ticket_number}</td>
                    <td className="py-4 px-6 text-sm font-sans text-on-surface-variant font-medium">{ticket.phone_number}</td>
                    <td className="py-4 px-6 text-sm text-on-surface font-bold relative">
                      {isCritical && (
                        <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-error rounded-full" />
                      )}
                      {ticket.category}
                    </td>
                    <td className="py-4 px-6 text-sm text-on-surface-variant">{ticket.description}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex ${getStatusStyle(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-on-surface-variant text-left">{ticket.timestamp}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
