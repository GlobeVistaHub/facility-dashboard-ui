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
    async function fetchTickets() {
      if (!isReady || !isSignedIn) {
        setLoading(false);
        return;
      }

      // If signed in but not an admin, don't even try to fetch
      if (!isAdmin) {
        setLoading(false);
        return;
      }

      try {
        const token = await getToken({ template: "supabase" });
        if (!token) {
          throw new Error("فشل الحصول على رمز المصادقة");
        }

        const supabase = createClerkSupabaseClient(token);
        const { data, error: supabaseError } = await supabase
          .from("tickets")
          .select("*")
          .order("created_at", { ascending: false });

        if (supabaseError) {
          throw supabaseError;
        }

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
      } catch (err: any) {
        console.error("Supabase error:", err);
        setError(err.message || "فشل الاتصال بقاعدة البيانات");
      } finally {
        setLoading(false);
      }
    }

    fetchTickets();
  }, [getToken, isReady, isSignedIn, isAdmin]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "جديد":
        return "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50";
      case "قيد التنفيذ":
        return "bg-amber-500/20 text-amber-400 border border-amber-500/50";
      case "مكتمل":
        return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50";
      default:
        return "bg-slate-500/20 text-slate-400 border border-slate-500/50";
    }
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-xl overflow-hidden shadow-xl" dir="rtl">
      <div className="p-6 border-b border-slate-800 flex justify-between items-center">
        <h2 className="text-xl font-bold bg-gradient-to-l from-white to-slate-400 bg-clip-text text-transparent">جدول طلبات الصيانة النشطة</h2>
        <div className="p-2 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors">
          <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
        </div>
      </div>

      <div className="overflow-x-auto min-h-[400px]">
        <table className="w-full text-right">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-sm">
              <th className="px-6 py-4">رقم التذكرة</th>
              <th className="px-6 py-4">رقم الهاتف</th>
              <th className="px-6 py-4">الفئة</th>
              <th className="px-6 py-4 text-right">الوصف</th>
              <th className="px-6 py-4 text-center">الحالة</th>
              <th className="px-6 py-4 text-left">الوقت</th>
            </tr>
          </thead>
          <tbody>
            {!isReady || loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse border-b border-slate-800/30">
                  <td className="px-6 py-4"><div className="h-4 bg-slate-800 rounded w-20"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-slate-800 rounded w-32"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-slate-800 rounded w-16"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-slate-800 rounded w-48"></div></td>
                  <td className="px-6 py-4 flex justify-center"><div className="h-6 bg-slate-800 rounded-full w-20"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-slate-800 rounded w-24"></div></td>
                </tr>
              ))
            ) : !isSignedIn ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500 text-lg">يرجى تسجيل الدخول لعرض تذاكر الصيانة</td>
              </tr>
            ) : !isAdmin ? (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-4 bg-red-500/10 rounded-full">
                      <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m4-11a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="text-2xl font-bold text-red-400">عذراً، انت لا تملك صلاحية الوصول للإدارة</div>
                    <div className="text-slate-400 max-w-sm">يرجى التواصل مع مدير النظام للحصول على صلاحيات الآدمن (RBAC).</div>
                  </div>
                </td>
              </tr>
            ) : tickets.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500 text-lg">لا توجد تذاكر صيانة نشطة الآن</td>
              </tr>
            ) : (
              tickets.map((ticket, index) => (
                <tr key={ticket.ticket_number || index} className="border-b border-slate-800/30 hover:bg-slate-800/30 transition-all duration-200 group">
                  <td className="px-6 py-4 font-mono text-cyan-400 group-hover:scale-110 origin-right transition-transform">{ticket.ticket_number}</td>
                  <td className="px-6 py-4 text-slate-300">{ticket.phone_number}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-400 group-hover:text-white transition-colors">{ticket.category}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-400 line-clamp-1 max-w-[300px] text-right">{ticket.description}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <span className={`px-4 py-1 rounded-full text-xs font-medium ${getStatusStyle(ticket.status)} shadow-lg shadow-black/20`}>
                        {ticket.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500 font-mono whitespace-nowrap text-left">{ticket.timestamp}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
