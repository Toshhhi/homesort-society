"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getUser } from "@/lib/auth";

type SubscriptionRecord = {
  id: number;
  month: number;
  year: number;
  amount: number;
  status: "paid" | "pending";
  payment_mode: string | null;
  receipt_url: string | null;
  paid_at: string | null;
  created_at: string;
};

export default function ResidentSubscriptionsPage() {
  const router = useRouter();

  const [records, setRecords] = useState<SubscriptionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchSubscriptions() {
    try {
      setLoading(true);

      const user = await getUser();

      if (!user?.email) {
        toast.error("User not found. Please log in again.");
        return;
      }

      const res = await fetch(
        `http://localhost:5000/api/resident-subscriptions/${encodeURIComponent(user.email)}`,
      );

      const result = await res.json().catch(() => null);

      if (!res.ok) {
        toast.error(result?.message || "Failed to fetch subscriptions");
        return;
      }

      setRecords(result);
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
    fetchSubscriptions();
  }, []);

  function getMonthLabel(month: number, year: number) {
    return new Date(year, month - 1).toLocaleString("en-IN", {
      month: "long",
      year: "numeric",
    });
  }

  function handleRowClick(month: number, year: number) {
    router.push(`/my-subscriptions/${month}?year=${year}`);
  }

  if (loading) {
    return <div className="p-6">Loading subscriptions...</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Monthly Bills</h1>
        <p className="mt-1 text-sm text-gray-600">
          View your monthly subscription history, payment status, and receipts.
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="border-b px-4 py-3 text-left">Month</th>
              <th className="border-b px-4 py-3 text-left">Amount</th>
              <th className="border-b px-4 py-3 text-left">Status</th>
              <th className="border-b px-4 py-3 text-left">Payment Mode</th>
              <th className="border-b px-4 py-3 text-left">Paid At</th>
              <th className="border-b px-4 py-3 text-left">Receipt</th>
            </tr>
          </thead>

          <tbody>
            {records.length > 0 ? (
              records.map((record) => (
                <tr
                  key={record.id}
                  onClick={() => handleRowClick(record.month, record.year)}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <td className="border-b px-4 py-3">
                    {getMonthLabel(record.month, record.year)}
                  </td>

                  <td className="border-b px-4 py-3">
                    ₹{Number(record.amount).toLocaleString("en-IN")}
                  </td>

                  <td className="border-b px-4 py-3">
                    <span
                      className={`rounded px-2 py-1 text-sm font-medium ${
                        record.status?.toLowerCase().trim() === "paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {record.status}
                    </span>
                  </td>

                  <td className="border-b px-4 py-3">
                    {record.payment_mode || "-"}
                  </td>

                  <td className="border-b px-4 py-3">
                    {record.paid_at
                      ? new Date(record.paid_at).toLocaleString("en-IN")
                      : "-"}
                  </td>

                  <td className="border-b px-4 py-3">
                    {record.receipt_url ? (
                      <a
                        href={record.receipt_url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-blue-600 underline"
                      >
                        View Receipt
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                  No subscription records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
