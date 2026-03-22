"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Subscription = {
  id: number;
  flat_type: string;
  monthly_amount: number;
  effective_from: string;
  created_at: string;
};

export default function SubscriptionsPage() {
  const router = useRouter();
  const [data, setData] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchSubscriptions() {
    try {
      setLoading(true);

      const res = await fetch("http://localhost:5000/api/subscriptions");

      if (!res.ok) {
        toast.error("Failed to fetch subscriptions");
        return;
      }
      
      const result = await res.json();
      setData(result);
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

  function handleEdit(plan: Subscription) {
    router.push(`/admin/subscriptions/${plan.id}`);
  }

  if (loading) return <div className="p-6">Loading subscriptions...</div>;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Subscription Plans</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage monthly subscription rates flat type wise.
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="border-b px-4 py-3 text-left">Flat Type</th>
              <th className="border-b px-4 py-3 text-left">Monthly Amount</th>
              <th className="border-b px-4 py-3 text-left">Effective From</th>
              <th className="border-b px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((plan) => (
                <tr key={plan.id}>
                  <td className="border-b px-4 py-3">{plan.flat_type}</td>
                  <td className="border-b px-4 py-3">
                    ₹{Number(plan.monthly_amount).toLocaleString("en-IN")}
                  </td>
                  <td className="border-b px-4 py-3">
                    {plan.effective_from
                      ? new Date(plan.effective_from).toLocaleDateString(
                          "en-IN",
                        )
                      : "-"}
                  </td>
                  <td className="border-b px-4 py-3">
                    <button
                      onClick={() => handleEdit(plan)}
                      className="rounded bg-blue-500 px-3 py-1 text-white"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center">
                  No subscription plans found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
