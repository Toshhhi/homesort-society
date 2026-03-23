"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/auth";
import { toast } from "sonner";
import Loader from "@/components/ui/Loader";
import { CheckCircle, IndianRupee, History, Bell } from "lucide-react";
import {
  requestNotificationPermission,
  listenForForegroundMessages,
} from "@/lib/notifications";

type ResidentDashboardStats = {
  name?: string;
  currentStatus: "paid" | "pending";
  pendingAmount: number;
  lastPaymentAmount: number | null;
  lastPaymentDate: string | null;
};

type Notification = {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
};

export default function ResidentDashboardPage() {
  const router = useRouter();

  const [userChecked, setUserChecked] = useState(false);
  const [stats, setStats] = useState<ResidentDashboardStats | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const userEmailRef = useRef<string | null>(null);

  async function checkUser() {
    const user = await getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    if (user.role !== "resident") {
      router.push("/admin/dashboard");
      return;
    }

    userEmailRef.current = user.email;
    setUserChecked(true);
    requestNotificationPermission(user.email);

    listenForForegroundMessages((title, message) => {
      toast(title, {
        description: message,
        duration: 5000,
        icon: "🔔",
        style: {
          background: "#1a1a2e",
          color: "#fff",
          border: "1px solid rgba(255,255,255,0.1)",
        },
      });

      fetchNotifications(user.email);
    });
  }

  async function fetchNotifications(email: string) {
    try {
      const res = await fetch(
        `http://localhost:5000/api/notifications/resident/${encodeURIComponent(email)}`
      );
      const result = await res.json().catch(() => null);

      if (res.ok) setNotifications(result);
    } catch {
      // non-critical
    }
  }

  async function fetchDashboardStats() {
    try {
      setLoading(true);

      const user = await getUser();

      if (!user?.email) {
        toast.error("User not found. Please log in again.");
        return;
      }

      const [statsRes, notifsRes] = await Promise.all([
        fetch(
          `http://localhost:5000/api/resident-dashboard/${encodeURIComponent(user.email)}`
        ),
        fetch(
          `http://localhost:5000/api/notifications/resident/${encodeURIComponent(user.email)}`
        ),
      ]);

      const statsResult = await statsRes.json().catch(() => null);
      const notifsResult = await notifsRes.json().catch(() => null);

      if (!statsRes.ok) {
        toast.error(statsResult?.message || "Failed to fetch dashboard stats");
        return;
      }

      setStats(statsResult);
      if (notifsRes.ok) setNotifications(notifsResult);
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (userChecked) {
      fetchDashboardStats();
    }
  }, [userChecked]);

  if (!userChecked || loading) {
    return <Loader text="Loading dashboard..." />;
  }

  if (!stats) {
    return <div className="p-6 text-red-500">No dashboard data found.</div>;
  }

  const isPaid = stats.currentStatus?.toLowerCase().trim() === "paid";

  return (
    <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-2 lg:items-stretch">
      {/* left */}
      <div className="flex h-full w-full flex-col gap-6">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-brand-darker">
            Welcome {stats.name ? stats.name : "Resident"}
          </h2>
          <p className="mt-2 text-base text-brand-gray">
            Here is a quick summary of your subscription and payment details.
          </p>
        </div>

        <div className="flex flex-1 flex-col gap-4">
          {/* current status */}
          <div className="group flex w-full items-center justify-between rounded-2xl border border-brand-silver/10 bg-brand-surface p-5 shadow-sm transition-all hover:border-brand-accent/30 hover:shadow-md">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-brand-gray transition-colors group-hover:text-brand-silver">
                Current Status
              </p>
              <h3
                className={`mt-1 text-2xl font-black capitalize ${isPaid ? "text-green-400" : "text-yellow-400"
                  }`}
              >
                {stats.currentStatus}
              </h3>
              <p className="mt-0.5 text-xs text-brand-gray">
                {isPaid ? "This month is settled" : "Payment due this month"}
              </p>
            </div>

            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full shadow-sm ${isPaid
                  ? "bg-brand-accent/20 text-brand-accent"
                  : "bg-yellow-500/20 text-yellow-400"
                }`}
            >
              <CheckCircle className="h-6 w-6" />
            </div>
          </div>

          {/* pending amount */}
          <div className="group flex w-full items-center justify-between rounded-2xl border border-brand-silver/10 bg-brand-surface p-5 shadow-sm transition-all hover:border-brand-accent/30 hover:shadow-md">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-brand-gray transition-colors group-hover:text-brand-silver">
                Pending Amount
              </p>
              <h3 className="mt-1 text-2xl font-black text-white">
                ₹{Number(stats.pendingAmount).toLocaleString("en-IN")}
              </h3>
              <p className="mt-0.5 text-xs text-brand-gray">
                {stats.pendingAmount > 0
                  ? "Amount due for payment"
                  : "No dues outstanding"}
              </p>
            </div>

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/5 text-brand-silver shadow-sm">
              <IndianRupee className="h-6 w-6" />
            </div>
          </div>

          {/* last payment */}
          <div className="group flex w-full items-center justify-between rounded-2xl border border-brand-silver/10 bg-brand-surface p-5 shadow-sm transition-all hover:border-brand-accent/30 hover:shadow-md">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-brand-gray transition-colors group-hover:text-brand-silver">
                Last Payment
              </p>
              <h3 className="mt-1 text-2xl font-black text-white">
                {stats.lastPaymentAmount !== null
                  ? `₹${Number(stats.lastPaymentAmount).toLocaleString("en-IN")}`
                  : "—"}
              </h3>
              <p className="mt-0.5 text-xs text-brand-gray">
                {stats.lastPaymentDate
                  ? new Date(stats.lastPaymentDate).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                  : "No payments yet"}
              </p>
            </div>

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-accent/20 text-brand-accent shadow-sm">
              <History className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* right */}
      <div className="w-full">
        <div className="flex h-full w-full flex-col rounded-2xl border border-brand-silver/10 bg-brand-surface shadow-sm">
          {/* header */}
          <div className="flex items-center gap-3 border-b border-brand-silver/10 px-6 py-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-accent/20 text-brand-accent">
              <Bell className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">Notifications</h3>

            {notifications.length > 0 && (
              <span className="ml-auto rounded-full bg-brand-accent px-2.5 py-0.5 text-xs font-bold text-white">
                {notifications.length}
              </span>
            )}
          </div>

          {/* body */}
          {notifications.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/5">
                <Bell className="h-7 w-7 text-brand-silver/30" />
              </div>
              <p className="text-sm font-medium text-white">All caught up!</p>
              <p className="mt-1 text-xs text-brand-gray">No notifications yet</p>
            </div>
          ) : (
            <div className="flex flex-1 flex-col overflow-y-auto">
              {notifications.map((notif, index) => (
                <div
                  key={notif.id}
                  className={`flex gap-4 px-6 py-4 transition-all hover:bg-white/5 ${index !== notifications.length - 1
                      ? "border-b border-brand-silver/10"
                      : ""
                    }`}
                >
                  <div className="mt-1.5 flex shrink-0 flex-col items-center">
                    <div className="h-2 w-2 rounded-full bg-brand-accent" />
                    {index !== notifications.length - 1 && (
                      <div className="mt-1 w-px flex-1 bg-brand-silver/10" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1 pb-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-white">
                        {notif.title}
                      </p>
                      <span className="shrink-0 rounded-full bg-brand-accent/10 px-2 py-0.5 text-xs text-brand-accent">
                        {notif.type}
                      </span>
                    </div>

                    <p className="mt-1 text-xs leading-relaxed text-brand-gray">
                      {notif.message}
                    </p>

                    <p className="mt-2 text-xs text-brand-silver/40">
                      {new Date(notif.created_at).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}