"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

type Summary = {
  total_records: string;
  total_due: string;
  paid_records: string;
  pending_records: string;
  paid_amount: string;
  pending_amount: string;
};

type ModeBreakdown = {
  payment_mode: string;
  total: string;
};

type MonthlyBreakdown = {
  month: number;
  paid_amount: string;
  pending_amount: string;
};

export default function ReportsPage() {
  const today = new Date();
  const [reportType, setReportType] = useState<"monthly" | "yearly">("monthly");
  const [month, setMonth] = useState(String(today.getMonth() + 1));
  const [year, setYear] = useState(String(today.getFullYear()));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [summary, setSummary] = useState<Summary | null>(null);
  const [paymentModeBreakdown, setPaymentModeBreakdown] = useState<
    ModeBreakdown[]
  >([]);
  const [monthlyBreakdown, setMonthlyBreakdown] = useState<MonthlyBreakdown[]>(
    [],
  );

  async function fetchReport() {
    try {
      setLoading(true);
      setError("");

      const url =
        reportType === "monthly"
          ? `http://localhost:5000/api/reports/monthly?month=${month}&year=${year}`
          : `http://localhost:5000/api/reports/yearly?year=${year}`;

      const res = await fetch(url);
      const result = await res.json().catch(() => null);

      if (!res.ok) {
        toast.error(result?.message || "Failed to fetch report");
      }

      toast.success("Successfully downloaded the report!");
      setSummary(result.summary || null);
      setPaymentModeBreakdown(result.paymentModeBreakdown || []);
      setMonthlyBreakdown(result.monthlyBreakdown || []);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReport();
  }, [reportType, month, year]);

  function handleDownloadCSV() {
    const url =
      reportType === "monthly"
        ? `http://localhost:5000/api/reports/monthly/csv?month=${month}&year=${year}`
        : `http://localhost:5000/api/reports/yearly/csv?year=${year}`;

    window.open(url, "_blank");
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Reports</h1>
          <p className="mt-1 text-sm text-gray-600">
            View monthly and yearly financial summaries.
          </p>
        </div>

        <button
          onClick={handleDownloadCSV}
          className="rounded bg-black px-4 py-2 text-white"
        >
          Download CSV
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Report Type</label>
          <select
            value={reportType}
            onChange={(e) =>
              setReportType(e.target.value as "monthly" | "yearly")
            }
            className="rounded border px-3 py-2"
          >
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>

        {reportType === "monthly" && (
          <div>
            <label className="mb-1 block text-sm font-medium">Month</label>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="rounded border px-3 py-2"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={String(i + 1)}>
                  {i + 1}
                </option>
              ))}
            </select>
          </div>
        )}

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

      {loading && <div>Loading report...</div>}
      {error && <div className="mb-4 text-red-500">{error}</div>}

      {!loading && summary && (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-6">
            <div className="rounded border bg-white p-4">
              <p className="text-sm text-gray-500">Total Due</p>
              <p className="mt-1 text-xl font-semibold">
                ₹{Number(summary.total_due).toLocaleString("en-IN")}
              </p>
            </div>

            <div className="rounded border bg-white p-4">
              <p className="text-sm text-gray-500">Collected</p>
              <p className="mt-1 text-xl font-semibold text-green-700">
                ₹{Number(summary.paid_amount).toLocaleString("en-IN")}
              </p>
            </div>

            <div className="rounded border bg-white p-4">
              <p className="text-sm text-gray-500">Pending</p>
              <p className="mt-1 text-xl font-semibold text-yellow-700">
                ₹{Number(summary.pending_amount).toLocaleString("en-IN")}
              </p>
            </div>

            <div className="rounded border bg-white p-4">
              <p className="text-sm text-gray-500">Total Records</p>
              <p className="mt-1 text-xl font-semibold">
                {summary.total_records}
              </p>
            </div>

            <div className="rounded border bg-white p-4">
              <p className="text-sm text-gray-500">Paid Records</p>
              <p className="mt-1 text-xl font-semibold">
                {summary.paid_records}
              </p>
            </div>

            <div className="rounded border bg-white p-4">
              <p className="text-sm text-gray-500">Pending Records</p>
              <p className="mt-1 text-xl font-semibold">
                {summary.pending_records}
              </p>
            </div>
          </div>

          <div className="mb-6 rounded border bg-white p-4">
            <h2 className="mb-4 text-lg font-semibold">
              Payment Mode Breakdown
            </h2>
            {paymentModeBreakdown.length > 0 ? (
              <div className="space-y-2">
                {paymentModeBreakdown.map((item) => (
                  <div
                    key={item.payment_mode}
                    className="flex items-center justify-between border-b py-2 last:border-b-0"
                  >
                    <span>{item.payment_mode}</span>
                    <span className="font-medium">
                      ₹{Number(item.total).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No payments found.</p>
            )}
          </div>

          {reportType === "yearly" && (
            <div className="rounded border bg-white p-4">
              <h2 className="mb-4 text-lg font-semibold">Monthly Breakdown</h2>
              {monthlyBreakdown.length > 0 ? (
                <table className="min-w-full border-collapse">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border-b px-4 py-3 text-left">Month</th>
                      <th className="border-b px-4 py-3 text-left">
                        Collected
                      </th>
                      <th className="border-b px-4 py-3 text-left">Pending</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyBreakdown.map((row) => (
                      <tr key={row.month}>
                        <td className="border-b px-4 py-3">{row.month}</td>
                        <td className="border-b px-4 py-3">
                          ₹{Number(row.paid_amount).toLocaleString("en-IN")}
                        </td>
                        <td className="border-b px-4 py-3">
                          ₹{Number(row.pending_amount).toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-sm text-gray-500">No yearly data found.</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
