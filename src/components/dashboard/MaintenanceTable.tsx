"use client";

import React, { useEffect, useState } from "react";
import { createClerkSupabaseClient } from "@/utils/supabaseClient";
import { useAuth, useUser } from "@clerk/nextjs";

interface Ticket {
  ticket_number: string;
  phone_number: string;
  category: string;
  description: string;
  status: string;
  timestamp: string;
  created_at: string;
}

export default function MaintenanceTable() {
  const { getToken, isLoaded: authLoaded, isSignedIn } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = user?.publicMetadata?.role === "admin";
  const isReady = authLoaded && userLoaded;

  useEffect(() => {
    let supabase: any = null;
    let channel: any = null;

    async function initSupabase() {
      if (!isReady || !isSignedIn || !isAdmin) {
        if (isReady) setLoading(false);
        return;
      }

      try {
        const token = await getToken({ template: "supabase" });
        if (!token) throw new Error("فشل الحصول على رمز المصادقة");

        supabase = createClerkSupabaseClient(token);

        // 1. Initial Fetch
        const { data, error: supabaseError } = await supabase
          .from("tickets")
          .select("*")
          .order("created_at", { ascending: false });

        if (supabaseError) throw supabaseError;

        if (data) {
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
        }

        // 2. Real-time Subscription
        channel = supabase
          .channel("realtime-tickets")
          .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "tickets" },
            (payload: any) => {
              const newTicket = payload.new;
              const mapped = {
                ...newTicket,
                timestamp: new Date(newTicket.created_at).toLocaleString("ar-SA", {
                  hour: "2-digit",
                  minute: "2-digit",
                  day: "2-digit",
                  month: "2-digit",
                }),
              };
              setTickets((prev) => [mapped, ...prev]);
            }
          )
          .subscribe();

      } catch (err: any) {
        console.error("Supabase error:", err);
        setError(err.message || "فشل الاتصال بقاعدة البيانات");
      } finally {
        setLoading(false);
      }
    }

    initSupabase();

    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [getToken, isReady, isSignedIn, isAdmin]);

  const getStatusStyle = (status: string) => {
    if (status.includes("مكتمل") || status.includes("تم الحل") || status.includes("مغلق")) {
      return "bg-outline/10 text-on-surface-variant";
    }
    return "bg-secondary-container/10 text-secondary-container";
  };

  return (
    <div className="bg-surface-container rounded-xl ghost-border overflow-hidden flex flex-col w-full h-full relative min-h-[400px]" dir="rtl">
      <div className="p-6 border-b ghost-border border-outline-variant/30 flex justify-between items-center">
        <h2 className="font-display text-xl font-bold text-on-surface">جدول طلبات الصيانة النشطة</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-surface-variant/40 hover:bg-surface-variant/60 rounded-md transition-colors text-sm font-sans font-medium text-white backdrop-blur-md">
          <span className="material-symbols-outlined text-[18px]">filter_list</span>
          تصفية
        </button>
      </div>

      <div className="overflow-x-auto">
        {!isReady || loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-primary">
            <span className="material-symbols-outlined text-4xl animate-spin mb-2">autorenew</span>
            <span className="text-sm font-sans font-medium">جاري تحميل البيانات...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-error">
            <span className="material-symbols-outlined text-4xl mb-2">error</span>
            <span className="text-sm font-sans font-medium">{error}</span>
          </div>
        ) : !isSignedIn ? (
          <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl mb-2">vpn_key</span>
            <span className="text-sm font-sans font-medium">يرجى تسجيل الدخول لعرض تذاكر الصيانة</span>
          </div>
        ) : !isAdmin ? (
          <div className="flex flex-col items-center justify-center py-24 text-error bg-error/5 mx-6 my-8 rounded-xl border border-error/10">
            <span className="material-symbols-outlined text-6xl mb-4">gpp_maybe</span>
            <h3 className="text-xl font-bold mb-2">عذراً، انت لا تملك صلاحية الوصول</h3>
            <p className="text-on-surface-variant text-sm max-w-sm text-center">لا تملك صلاحيات الآدمن الكافية لعرض هذا الجدول. يرجى التواصل مع مدير النظام.</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl mb-2">inbox</span>
            <span className="text-sm font-sans font-medium">لا توجد تذاكر صيانة نشطة الآن</span>
          </div>
        ) : (
          <table className="w-full text-right font-sans border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50 text-on-surface-variant text-sm border-b ghost-border border-outline-variant/30">
                <th className="py-4 px-6 font-medium">رقم التذكرة</th>
                <th className="py-4 px-6 font-medium">رقم الهاتف</th>
                <th className="py-4 px-6 font-medium">الفئة</th>
                <th className="py-4 px-6 font-medium text-right">الوصف</th>
                <th className="py-4 px-6 font-medium text-center">الحالة</th>
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
                    <td className="py-4 px-6 text-sm text-on-surface-variant max-w-[300px] truncate">{ticket.description}</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-bold inline-flex ${getStatusStyle(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-on-surface-variant text-left font-mono">{ticket.timestamp}</td>
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
