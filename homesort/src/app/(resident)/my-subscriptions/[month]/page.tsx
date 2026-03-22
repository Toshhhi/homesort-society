"use client";

import { useEffect, useState } from "react";
import { getUser } from "@/lib/auth";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";

type SubscriptionDetail = {
  id: number;
  month: number;
  year: number;
  amount: number;
  status: "paid" | "pending";
  payment_mode: string | null;
  receipt_url: string | null;
  paid_at: string | null;
  created_at: string;
  flat_no: string;
  flat_type: string;
  owner: string;
  breakdown: {
    label: string;
    amount: number;
  }[];
};

export default function SubscriptionDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [detail, setDetail] = useState<SubscriptionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchDetail() {
    try {
      setLoading(true);

      const user = await getUser();

      if (!user?.email) {
        toast.error("User not found. Please log in again.");
        return;
      }

      const month = params.month;
      const year = searchParams.get("year");

      if (!month) {
        toast.error("Month is required!");
        return;
      }
      if (!year) {
        toast.error("Year is required");
        return;
      }

      const res = await fetch(
        `http://localhost:5000/api/resident-subscriptions/${encodeURIComponent(user.email)}/${month}/${year}`,
      );

      const result = await res.json().catch(() => null);

      if (!res.ok) {
        toast.error(result?.message || "Failed to fetch subscription detail");
        return;
      }

      setDetail(result);
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
    fetchDetail();
  }, [params, searchParams]);

  function getMonthLabel(month: number, year: number) {
    return new Date(year, month - 1).toLocaleString("en-IN", {
      month: "long",
      year: "numeric",
    });
  }

  if (loading) {
    return <div className="p-6">Loading subscription detail...</div>;
  }

  if (!detail) {
    return <div className="p-6 text-gray-500">No detail found.</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">
          {getMonthLabel(detail.month, detail.year)} Bill
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Detailed view of your monthly subscription.
        </p>
      </div>

      <div className="space-y-6">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Subscription Summary</h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500">Flat Number</p>
              <p className="font-medium">{detail.flat_no}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Flat Type</p>
              <p className="font-medium">{detail.flat_type}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Owner</p>
              <p className="font-medium">{detail.owner}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="font-medium">{detail.status}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Payment Mode</p>
              <p className="font-medium">{detail.payment_mode || "-"}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Payment Date</p>
              <p className="font-medium">
                {detail.paid_at
                  ? new Date(detail.paid_at).toLocaleString("en-IN")
                  : "-"}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">
            Full Breakdown of Charges
          </h2>

          <div className="space-y-3">
            {detail.breakdown.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between border-b pb-2"
              >
                <span>{item.label}</span>
                <span>₹{Number(item.amount).toLocaleString("en-IN")}</span>
              </div>
            ))}

            <div className="flex items-center justify-between pt-2 font-semibold">
              <span>Total</span>
              <span>₹{Number(detail.amount).toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Receipt</h2>

            <button
              onClick={() => router.push("/my-subscriptions")}
              className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              ← Back
            </button>
          </div>

          {detail.receipt_url ? (
            <a
              href={detail.receipt_url}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 underline"
            >
              View Receipt
            </a>
          ) : (
            <p className="text-sm text-gray-500">No receipt available.</p>
          )}
        </div>
      </div>
    </div>
  );
}
