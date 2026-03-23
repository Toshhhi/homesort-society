"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/auth";
import { toast } from "sonner";
import Loader from "@/components/ui/Loader";
import { CheckCircle, IndianRupee, History } from "lucide-react";

type ResidentDashboardStats = {
  name?: string;
  currentStatus: "paid" | "pending";
  pendingAmount: number;
  lastPaymentAmount: number | null;
  lastPaymentDate: string | null;
};

export default function ResidentDashboardPage() {
  const router = useRouter();

  const [userChecked, setUserChecked] = useState(false);
  const [stats, setStats] = useState<ResidentDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

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

    setUserChecked(true);
  }

  async function fetchDashboardStats() {
    try {
      setLoading(true);

      const user = await getUser();

      if (!user?.email) {
        toast.error("User not found. Please log in again.");
        return;
      }

      const res = await fetch(
        `http://localhost:5000/api/resident-dashboard/${encodeURIComponent(user.email)}`,
      );

      const result = await res.json().catch(() => null);

      if (!res.ok) {
        toast.error(result?.message || "Failed to fetch dashboard stats");
        return;
      }

      setStats(result);
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
    <div className="flex w-full max-w-lg flex-col gap-6">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-brand-darker">
          Welcome {stats.name ? stats.name : "Resident"}
        </h2>
        <p className="mt-2 text-base text-brand-gray">
          Here is a quick summary of your subscription and payment details.
        </p>
      </div>

      <div className="flex w-full flex-col gap-5">
        <div className="group flex w-full items-center justify-between rounded-2xl border border-brand-silver/10 bg-brand-surface p-6 shadow-sm transition-all hover:border-brand-accent/30 hover:shadow-md">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-brand-gray transition-colors group-hover:text-brand-silver">
              Current Status
            </p>
            <h3
              className={`mt-1 text-2xl font-black capitalize ${isPaid ? "text-green-400" : "text-yellow-400"
                }`}
            >
              {stats.currentStatus}
            </h3>
          </div>
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full shadow-sm ${isPaid
                ? "bg-brand-accent/20 text-brand-accent"
                : "bg-yellow-500/20 text-yellow-400"
              }`}
          >
            <CheckCircle className="h-6 w-6" />
          </div>
        </div>

        <div className="group flex w-full items-center justify-between rounded-2xl border border-brand-silver/10 bg-brand-surface p-6 shadow-sm transition-all hover:border-brand-accent/30 hover:shadow-md">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-brand-gray transition-colors group-hover:text-brand-silver">
              Pending Amount
            </p>
            <h3 className="mt-1 text-2xl font-black text-white">
              ₹{Number(stats.pendingAmount).toLocaleString("en-IN")}
            </h3>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-brand-silver shadow-sm">
            <IndianRupee className="h-6 w-6" />
          </div>
        </div>

        <div className="group flex w-full items-center justify-between rounded-2xl border border-brand-silver/10 bg-brand-surface p-6 shadow-sm transition-all hover:border-brand-accent/30 hover:shadow-md">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-brand-gray transition-colors group-hover:text-brand-silver">
              Last Payment
            </p>
            <h3 className="mt-1 text-2xl font-black text-white">
              {stats.lastPaymentAmount !== null
                ? `₹${Number(stats.lastPaymentAmount).toLocaleString("en-IN")}`
                : "-"}
            </h3>
            {stats.lastPaymentDate && (
              <p className="mt-1 text-xs text-brand-gray">
                {new Date(stats.lastPaymentDate).toLocaleDateString("en-IN")}
              </p>
            )}
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-accent/20 text-brand-accent shadow-sm">
            <History className="h-6 w-6" />
          </div>
        </div>
      </div>
    </div>
  );
}