"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import Loader from "@/components/ui/Loader";
import { useRouter } from "next/navigation";

type MonthlyRecord = {
  id: number;
  flat_id: number;
  flat_no: string;
  flat_type: string;
  owner: string;
  month: number;
  year: number;
  amount: number;
  status: "paid" | "pending";
  paid_at: string | null;
};

export default function MonthlyRecordsPage() {
  const today = new Date();
  const [month, setMonth] = useState(String(today.getMonth() + 1));
  const [year, setYear] = useState(String(today.getFullYear()));
  const [data, setData] = useState<MonthlyRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  async function fetchMonthlyRecords(
    selectedMonth: string,
    selectedYear: string,
  ) {
    try {
      setLoading(true);

      const res = await fetch(
        `http://localhost:5000/api/monthly-records?month=${selectedMonth}&year=${selectedYear}`,
      );

      const result = await res.json().catch(() => null);

      if (!res.ok) {
        toast.error(result?.message || "Failed to fetch monthly records");
        return;
      }

      setData(result);
    } catch {
      toast.error("Something went wrong while fetching records");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMonthlyRecords(month, year);
  }, [month, year]);

  function handleMarkPaid(id: number) {
    router.push(`/admin/payment-entry?record_id=${id}`);
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Monthly Subscription Records</h1>
        <p className="mt-1 text-sm text-gray-600">
          View payment status for each flat and manually mark subscriptions as
          paid.
        </p>
      </div>

      <div className="mb-6 flex gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Month</label>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="rounded border px-3 py-2"
          >
            {Array.from({ length: 12 }, (_, i) => {
              const monthName = new Date(0, i).toLocaleString("en-US", { month: "long" });
              return (
                <option key={i + 1} value={String(i + 1)}>
                  {monthName}
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Year</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="rounded border px-3 py-2"
          />
        </div>
      </div>

      {loading && <Loader text="Loading monthly records..." />}

      {!loading && (
        <div className="overflow-x-auto rounded-lg border">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="border-b px-4 py-3 text-left">Flat No</th>
                <th className="border-b px-4 py-3 text-left">Flat Type</th>
                <th className="border-b px-4 py-3 text-left">Owner</th>
                <th className="border-b px-4 py-3 text-left">Amount</th>
                <th className="border-b px-4 py-3 text-left">Status</th>
                <th className="border-b px-4 py-3 text-left">Paid At</th>
                <th className="border-b px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {data.length > 0 ? (
                data.map((record) => (
                  <tr key={record.id}>
                    <td className="border-b px-4 py-3">{record.flat_no}</td>
                    <td className="border-b px-4 py-3">{record.flat_type}</td>
                    <td className="border-b px-4 py-3">{record.owner}</td>
                    <td className="border-b px-4 py-3">
                      ₹{Number(record.amount).toLocaleString("en-IN")}
                    </td>
                    <td className="border-b px-4 py-3">
                      <span
                        className={`rounded px-2 py-1 text-sm font-medium ${record.status === "paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                          }`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="border-b px-4 py-3">
                      {record.paid_at
                        ? new Date(record.paid_at).toLocaleString("en-IN")
                        : "-"}
                    </td>
                    <td className="border-b px-4 py-3">
                      {record.status === "pending" ? (
                        <button
                          onClick={() => handleMarkPaid(record.id)}
                          className="rounded bg-green-600 px-3 py-1 text-white font-semibold hover:bg-green-700 transition"
                        >
                          Pay
                        </button>
                      ) : (
                        <span className="rounded bg-gray-200 px-3 py-1 text-sm font-medium text-gray-600">
                          Paid
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center">
                    No monthly records found for this month
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
