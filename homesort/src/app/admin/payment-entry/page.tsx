"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import Loader from "@/components/ui/Loader";

type FlatOption = {
   id: number;
   flat_no: string;
   flat_type: string;
   owner: string;
};

export default function PaymentEntryPage() {
   const today = new Date();

   const [flats, setFlats] = useState<FlatOption[]>([]);
   const [loading, setLoading] = useState(true);
   const [saving, setSaving] = useState(false);
   const [error, setError] = useState("");
   const [success, setSuccess] = useState("");

   const [formData, setFormData] = useState({
      flat_id: "",
      month: String(today.getMonth() + 1),
      year: String(today.getFullYear()),
      amount: "",
      payment_mode: "Cash",
      payment_date: today.toISOString().split("T")[0],
      transaction_id: "",
   });

   async function fetchFlats() {
      try {
         setLoading(true);
         setError("");

         const res = await fetch("http://localhost:5000/api/flats");
         const result = await res.json().catch(() => null);

         if (!res.ok) {
            throw new Error(result?.message || "Failed to fetch flats");
         }

         setFlats(result);
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
      fetchFlats();
   }, []);

   function handleChange(
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
   ) {
      const { name, value } = e.target;
      setFormData((prev) => ({
         ...prev,
         [name]: value,
      }));
   }

   async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault();

      try {
         setSaving(true);
         setError("");
         setSuccess("");

         const payload = {
            flat_id: Number(formData.flat_id),
            month: Number(formData.month),
            year: Number(formData.year),
            amount: Number(formData.amount),
            payment_mode: formData.payment_mode,
            payment_date: formData.payment_date,
            transaction_id:
               formData.payment_mode === "UPI" ? formData.transaction_id : null,
         };

         const res = await fetch("http://localhost:5000/api/payment-entry", {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
         });

         const result = await res.json().catch(() => null);

         if (!res.ok) {
            toast.error(result?.message || "Failed to record payment");
         }

         toast.success("Payment recorded successfully");

         setFormData({
            flat_id: "",
            month: String(today.getMonth() + 1),
            year: String(today.getFullYear()),
            amount: "",
            payment_mode: "Cash",
            payment_date: today.toISOString().split("T")[0],
            transaction_id: "",
         });
      } catch (err) {
         if (err instanceof Error) {
            setError(err.message);
         } else {
            setError("Something went wrong while recording payment");
         }
      } finally {
         setSaving(false);
      }
   }

   if (loading) return <Loader text="Loading payment entry form..." />;

   return (
      <div className="p-6">
         <div className="mb-6">
            <h1 className="text-2xl font-semibold">Payment Entry</h1>
            <p className="mt-1 text-sm text-gray-600">
               Record offline payments for flats that paid by cash or UPI.
            </p>
         </div>

         <div className="max-w-2xl rounded-lg border bg-white p-6 shadow-sm">
            {error && <div className="mb-4 text-red-500">{error}</div>}
            {success && <div className="mb-4 text-green-600">{success}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
               <div>
                  <label className="mb-1 block text-sm font-medium">Flat</label>
                  <select
                     name="flat_id"
                     value={formData.flat_id}
                     onChange={handleChange}
                     required
                     className="w-full rounded border px-3 py-2"
                  >
                     <option value="">Select flat</option>
                     {flats.map((flat) => (
                        <option key={flat.id} value={flat.id}>
                           {flat.flat_no} - {flat.flat_type} - {flat.owner}
                        </option>
                     ))}
                  </select>
               </div>

               <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                     <label className="mb-1 block text-sm font-medium">Month</label>
                     <select
                        name="month"
                        value={formData.month}
                        onChange={handleChange}
                        required
                        className="w-full rounded border px-3 py-2"
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
                        name="year"
                        value={formData.year}
                        onChange={handleChange}
                        required
                        className="w-full rounded border px-3 py-2"
                     />
                  </div>
               </div>

               <div>
                  <label className="mb-1 block text-sm font-medium">Amount</label>
                  <input
                     type="number"
                     name="amount"
                     value={formData.amount}
                     onChange={handleChange}
                     required
                     min="0"
                     className="w-full rounded border px-3 py-2"
                  />
               </div>

               <div>
                  <label className="mb-1 block text-sm font-medium">
                     Payment Mode
                  </label>
                  <select
                     name="payment_mode"
                     value={formData.payment_mode}
                     onChange={handleChange}
                     required
                     className="w-full rounded border px-3 py-2"
                  >
                     <option value="Cash">Cash</option>
                     <option value="UPI">UPI</option>
                  </select>
               </div>

               {formData.payment_mode === "UPI" && (
                  <div>
                     <label className="mb-1 block text-sm font-medium">
                        Transaction ID
                     </label>
                     <input
                        type="text"
                        name="transaction_id"
                        value={formData.transaction_id}
                        onChange={handleChange}
                        required
                        className="w-full rounded border px-3 py-2"
                     />
                  </div>
               )}

               <div>
                  <label className="mb-1 block text-sm font-medium">
                     Payment Date
                  </label>
                  <input
                     type="date"
                     name="payment_date"
                     value={formData.payment_date}
                     onChange={handleChange}
                     required
                     className="w-full rounded border px-3 py-2"
                  />
               </div>

               <button
                  type="submit"
                  disabled={saving}
                  className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
               >
                  {saving ? "Saving..." : "Record Payment"}
               </button>
            </form>
         </div>
      </div>
   );
}
