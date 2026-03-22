"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/auth";

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

      const res = await fetch("http://localhost:5000/api/dashboard");
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
    return <div className="p-6">Loading dashboard...</div>;
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
          Welcome, Admin
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
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
