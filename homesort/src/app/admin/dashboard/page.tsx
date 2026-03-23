"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/auth";
import Loader from "@/components/ui/Loader";
import { Building2, IndianRupee, Clock, Bell } from "lucide-react";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";

type DashboardStats = {
  name?: string;
  totalFlats: number;
  collectedThisMonth: number;
  pendingPayments: number;
  notificationsSent: number;
  currentMonth: number;
  currentYear: number;
  paidCount: number;
  totalMonthlyRecords: number;
  collectionRate: number;
};

export default function AdminDashboardPage() {
  const router = useRouter();

  const [userChecked, setUserChecked] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ADDED: auth check for admin
  async function checkUser() {
    const user = await getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    if (user.role !== "admin") {
      router.push("/dashboard");
      return;
    }

    setUserChecked(true);
  }

  // ADDED: fetch real dashboard stats from backend
  async function fetchDashboardStats() {
    try {
      setLoading(true);
      setError("");

      const user = await getUser();
      const emailQuery = user?.email ? `?email=${encodeURIComponent(user.email)}` : "";
      const res = await fetch(`http://localhost:5000/api/dashboard${emailQuery}`);
      const result = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(result?.message || "Failed to fetch dashboard stats");
      }

      setStats(result);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function init() {
      await checkUser();
    }

    init();
  }, []);

  useEffect(() => {
    if (userChecked) {
      fetchDashboardStats();
    }
  }, [userChecked]);

  if (!userChecked || loading) {
    return <Loader text="Loading dashboard..." />;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  if (!stats) {
    return <div className="p-6 text-red-500">No dashboard data found.</div>;
  }

  const paymentStatusData = [
    { name: "Paid", value: stats.paidCount },
    { name: "Pending", value: stats.pendingPayments },
  ];

  const monthlyData = [
    { name: "Paid", value: stats.paidCount },
    { name: "Pending", value: stats.pendingPayments },
    { name: "Total", value: stats.totalMonthlyRecords },
  ];

  const COLORS = ["#22c55e", "#f59e0b"];
  return (
    <div className="flex w-full flex-col gap-6">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-brand-darker">
          Welcome, {stats.name ? stats.name : "Admin"}
        </h2>
        <p className="mt-2 text-base text-brand-gray">
          Here is an overview of your society subscription management system.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="flex w-full items-center justify-between rounded-2xl border border-brand-silver/10 bg-brand-surface p-6 shadow-sm transition-all hover:shadow-md hover:border-brand-accent/30 group">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-brand-gray group-hover:text-brand-silver transition-colors">
              Total Flats
            </p>
            <h3 className="mt-1 text-2xl font-black text-white">
              {stats.totalFlats}
            </h3>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-accent/20 text-brand-accent shadow-sm">
            <Building2 className="h-6 w-6" />
          </div>
        </div>

        <div className="flex w-full items-center justify-between rounded-2xl border border-brand-silver/10 bg-brand-surface p-6 shadow-sm transition-all hover:shadow-md hover:border-brand-accent/30 group">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-brand-gray group-hover:text-brand-silver transition-colors">
              Collected This Month
            </p>
            <h3 className="mt-1 text-2xl font-black text-white">
              ₹{stats.collectedThisMonth.toLocaleString("en-IN")}
            </h3>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-accent/20 text-brand-accent shadow-sm">
            <IndianRupee className="h-6 w-6" />
          </div>
        </div>

        <div className="flex w-full items-center justify-between rounded-2xl border border-brand-silver/10 bg-brand-surface p-6 shadow-sm transition-all hover:shadow-md hover:border-brand-accent/30 group">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-brand-gray group-hover:text-brand-silver transition-colors">
              Pending Payments
            </p>
            <h3 className="mt-1 text-2xl font-black text-white">
              {stats.pendingPayments}
            </h3>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/20 text-orange-400 shadow-sm">
            <Clock className="h-6 w-6" />
          </div>
        </div>

        <div className="flex w-full items-center justify-between rounded-2xl border border-brand-silver/10 bg-brand-surface p-6 shadow-sm transition-all hover:shadow-md hover:border-brand-accent/30 group">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-brand-gray group-hover:text-brand-silver transition-colors">
              Notifications Sent
            </p>
            <h3 className="mt-1 text-2xl font-black text-white">
              {stats.notificationsSent}
            </h3>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-brand-silver shadow-sm">
            <Bell className="h-6 w-6" />
          </div>
        </div>
      </div>
      
      <div className="rounded-2xl border border-brand-silver/10 bg-brand-surface p-6 shadow-sm">
        <h3 className="text-xl font-bold text-white">Monthly Insights</h3>
        <p className="mt-1 text-sm text-brand-gray">
          Overview for {stats.currentMonth}/{stats.currentYear}
        </p>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-white/5 p-4">
            <p className="text-sm text-brand-gray">Paid Records</p>
            <p className="mt-1 text-2xl font-black text-white">
              {stats.paidCount}
            </p>
          </div>

          <div className="rounded-xl bg-white/5 p-4">
            <p className="text-sm text-brand-gray">Total Records</p>
            <p className="mt-1 text-2xl font-black text-white">
              {stats.totalMonthlyRecords}
            </p>
          </div>

          <div className="rounded-xl bg-white/5 p-4">
            <p className="text-sm text-brand-gray">Collection Rate</p>
            <p className="mt-1 text-2xl font-black text-white">
              {stats.collectionRate}%
            </p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-brand-silver/10 bg-brand-surface p-6 shadow-sm">
          <h3 className="mb-4 text-xl font-bold text-white">Payment Status</h3>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentStatusData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  label
                >
                  {paymentStatusData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
     
        <div className="rounded-2xl border border-brand-silver/10 bg-brand-surface p-6 shadow-sm">
          <h3 className="mb-4 text-xl font-bold text-white">
            Monthly Overview
          </h3>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
