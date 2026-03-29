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
        
        // IMPORTANT: WebSockets don't send HTTP headers. We MUST explicitly
        // give the Realtime client the Clerk JWT so it can pass RLS!
        supabase.realtime.setAuth(token);

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
              console.log("Real-time insertion detected!", payload);
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
          .subscribe((status: string) => {
            console.log("Real-time subscription status:", status);
            if (status === 'SUBSCRIBED') {
              console.log("Successfully connected to the real-time broadcast!");
            }
            if (status === 'CHANNEL_ERROR') {
              setError("فشل الاتصال اللحظي - يرجى فحص إعدادات Supabase");
            }
          });

      } catch (err: any) {
        console.error("Supabase connection fatal error:", err);
        setError(err.message || "فشل الاتصال بقاعدة البيانات");
      } finally {
        setLoading(false);
      }
    }

    initSupabase();

    return () => {
      if (channel) {
        console.log("Cleaning up real-time subscription...");
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

      <div className="flex-1 overflow-y-auto">
        {!isReady || loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-primary bg-surface-container-lowest/5 animate-pulse">
            <span className="material-symbols-outlined text-5xl animate-spin mb-4">progress_activity</span>
            <span className="text-base font-sans font-medium tracking-wide">جاري مزامنة البيانات اللحظية...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-error px-6 text-center">
            <span className="material-symbols-outlined text-5xl mb-4">cloud_off</span>
            <span className="text-base font-sans font-medium">{error}</span>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-error/10 hover:bg-error/20 rounded-full text-sm font-bold transition-all"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : !isSignedIn ? (
          <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
            <span className="material-symbols-outlined text-5xl mb-4">lock</span>
            <span className="text-base font-sans font-medium">يرجى تسجيل الدخول للوصول إلى النظام</span>
          </div>
        ) : !isAdmin ? (
          <div className="flex flex-col items-center justify-center py-32 text-on-surface-variant/60">
            <span className="material-symbols-outlined text-5xl mb-4 text-error opacity-90 drop-shadow-sm">gpp_maybe</span>
            <span className="text-base font-sans font-medium text-error">ليس لديك صلاحية لعرض هذه البيانات</span>
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-on-surface-variant/40">
            <span className="material-symbols-outlined text-6xl mb-4">history_toggle_off</span>
            <span className="text-lg font-sans font-medium">لا توجد بلاغات نشطة في الوقت الحالي</span>
          </div>
        ) : (
          <div className="w-full">
            {/* Desktop Table - Hidden on Mobile */}
            <table className="hidden md:table w-full text-right font-sans border-collapse">
              <thead>
                <tr className="bg-surface-container-low/80 backdrop-blur-sm text-on-surface-variant text-sm border-b ghost-border border-outline-variant/30 sticky top-0 z-20">
                  <th className="py-5 px-6 font-bold tracking-wider">رقم التذكرة</th>
                  <th className="py-5 px-6 font-bold tracking-wider">رقم الهاتف</th>
                  <th className="py-5 px-6 font-bold tracking-wider">الفئة</th>
                  <th className="py-5 px-6 font-bold tracking-wider text-right">الوصف</th>
                  <th className="py-5 px-6 font-bold tracking-wider text-center">الحالة</th>
                  <th className="py-5 px-6 font-bold tracking-wider text-left">الوقت</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket, index) => {
                  const isCritical = ticket.status.includes("حرج") || ticket.status.includes("طوارئ");
                  return (
                    <tr 
                      key={ticket.ticket_number || index} 
                      className={`group transition-all duration-300 ${
                        index !== tickets.length - 1 ? 'border-b ghost-border border-outline-variant/5' : ''
                      } hover:bg-surface-container-highest/40 animate-in fade-in slide-in-from-right-2`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="py-5 px-6 text-sm text-on-surface font-bold font-mono tracking-tighter">#{ticket.ticket_number}</td>
                      <td className="py-5 px-6 text-sm font-sans text-on-surface-variant font-medium">{ticket.phone_number}</td>
                      <td className="py-5 px-6 text-sm text-primary font-black relative">
                        {isCritical && (
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-error rounded-l-full shadow-[0_0_10px_rgba(255,0,0,0.5)]" />
                        )}
                        {ticket.category}
                      </td>
                      <td className="py-5 px-6 text-sm text-on-surface-variant max-w-[350px] leading-relaxed truncate">{ticket.description}</td>
                      <td className="py-5 px-6 text-center">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] uppercase font-black tracking-widest inline-flex shadow-sm ${getStatusStyle(ticket.status)}`}>
                          {ticket.status}
                        </span>
                      </td>
                      <td className="py-5 px-6 text-sm text-on-surface-variant text-left font-mono tracking-tighter opacity-70">{ticket.timestamp}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Mobile Cards - Hidden on Desktop */}
            <div className="md:hidden flex flex-col gap-4 p-4 pb-24">
              {tickets.map((ticket, index) => {
                const isCritical = ticket.status.includes("حرج") || ticket.status.includes("طوارئ");
                return (
                  <div 
                    key={ticket.ticket_number || index}
                    className="relative bg-surface-container-high/60 backdrop-blur-lg rounded-2xl p-5 border ghost-border border-outline-variant/20 shadow-xl animate-in zoom-in-95 duration-300 overflow-hidden"
                  >
                    {isCritical && (
                      <div className="absolute top-0 right-0 w-2 h-full bg-error" />
                    )}
                    
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest block mb-1">تذكرة رقم</span>
                        <h3 className="text-xl font-bold text-primary font-mono tracking-tighter">#{ticket.ticket_number}</h3>
                      </div>
                      <span className={`px-3 py-1.5 rounded-full text-[9px] font-black tracking-widest uppercase ${getStatusStyle(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
                      <div>
                        <span className="text-on-surface-variant/60 block mb-1">الفئة:</span>
                        <span className="text-on-surface font-bold text-sm">{ticket.category}</span>
                      </div>
                      <div className="text-left">
                        <span className="text-on-surface-variant/60 block mb-1">الوقت:</span>
                        <span className="text-on-surface font-mono opacity-80">{ticket.timestamp}</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t ghost-border border-outline-variant/10">
                      <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-3">
                        {ticket.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-dashed border-outline-variant/10 flex items-center justify-between">
                       <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px] text-primary">phone_iphone</span>
                          <span className="text-xs font-bold text-on-surface-variant">{ticket.phone_number}</span>
                       </div>
                       <button className="text-primary text-xs font-black uppercase tracking-widest">التفاصيل ←</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
