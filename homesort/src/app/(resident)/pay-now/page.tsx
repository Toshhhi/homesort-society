"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Loader from "@/components/ui/Loader";
import { getUser } from "@/lib/auth";
import { toast } from "sonner";

type PaymentState = "idle" | "processing" | "success";

type ResidentDashboardStats = {
  name?: string;
  currentStatus: "paid" | "pending";
  pendingAmount: number;
  lastPaymentAmount: number | null;
  lastPaymentDate: string | null;
};

export default function PayNowPage() {
  const router = useRouter();
  const [paymentState, setPaymentState] = useState<PaymentState>("idle");
  const [method, setMethod] = useState<"card" | "upi">("card");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ResidentDashboardStats | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string>("");

  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const user = await getUser();
        if (!user?.email) {
          toast.error("User not found. Please log in again.");
          router.push("/login");
          return;
        }
        setUserEmail(user.email);
        const res = await fetch(`http://localhost:5000/api/resident-dashboard/${encodeURIComponent(user.email)}`);
        const result = await res.json().catch(() => null);
        if (res.ok) {
          setStats(result);
        } else {
          toast.error(result?.message || "Failed to load dashboard stats");
        }
      } catch (err) {
        toast.error("Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [router]);

  const billAmount = stats?.pendingAmount || 0;
  const monthLabel = "Pending Dues";

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    if (!userEmail || billAmount <= 0) return;

    setPaymentState("processing");

    try {
      const res = await fetch(`http://localhost:5000/api/resident-dashboard/${encodeURIComponent(userEmail)}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: billAmount,
          payment_mode: method,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "Payment failed");
      }

      setTransactionId(data.payment?.transaction_id || `TXN${Math.random().toString(36).substring(2, 10).toUpperCase()}`);
      setPaymentState("success");
      toast.success("Payment successful!");
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Payment failed. Please try again.");
      }
      setPaymentState("idle");
    }
  }

  if (loading) {
    return <Loader text="Loading your billing details..." />;
  }

  if (!stats || billAmount <= 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center animate-in fade-in duration-500">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-500/10 text-green-500">
          <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-3xl font-extrabold text-black mb-3">All clear!</h2>
        <p className="text-brand-gray max-w-sm mb-8 text-lg">
          You have no pending payments at the moment. Your subscription is fully paid!
        </p>
        <button
          onClick={() => router.push("/my-subscriptions")}
          className="rounded-xl bg-brand-surface border border-brand-silver/20 px-6 py-3 font-semibold text-white shadow-lg hover:bg-brand-silver/10 transition-all active:translate-y-1"
        >
          View My Subscriptions
        </button>
      </div>
    );
  }

  if (paymentState === "processing") {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 fade-in animate-in">
        <Loader text="Securely processing your payment..." />
        <p className="mt-4 text-sm text-brand-gray animate-pulse">
          Please do not refresh the page or press the back button.
        </p>
      </div>
    );
  }

  if (paymentState === "success") {
    return (
      <div className="mx-auto mt-10 max-w-lg rounded-2xl border border-brand-silver/10 bg-brand-surface p-8 shadow-2xl relative overflow-hidden fade-in zoom-in-95 animate-in duration-300">
        <div className="absolute top-0 left-0 w-full h-2 bg-green-500"></div>

        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 text-green-500">
            <svg
              className="h-8 w-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
          <p className="text-brand-gray mb-8">
            Your subscription for {monthLabel} has been paid.
          </p>

          <div className="w-full rounded-xl bg-brand-dark p-6 text-left border border-brand-silver/10 space-y-4">
            <div className="flex justify-between border-b border-brand-silver/10 pb-4">
              <span className="text-brand-gray">Transaction ID</span>
              <span className="font-mono text-white tracking-wider">{transactionId}</span>
            </div>

            <div className="flex justify-between pb-2">
              <span className="text-brand-gray">Paid Amount</span>
              <span className="font-bold text-white text-lg">₹{billAmount.toLocaleString("en-IN")}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-brand-gray">Payment Method</span>
              <span className="text-white uppercase">{method}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-brand-gray">Date & Time</span>
              <span className="text-white">{new Date().toLocaleString("en-IN")}</span>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full">
            <button
              onClick={() => router.push("/my-subscriptions")}
              className="flex-1 rounded-xl bg-brand-dark py-3 font-semibold text-white border border-brand-silver/20 hover:bg-white/5 transition-all"
            >
              Back to Subscriptions
            </button>
            <button
              onClick={() => window.print()}
              className="flex-1 rounded-xl bg-brand-accent py-3 font-semibold text-white hover:bg-[#049b88] transition-all shadow-md shadow-brand-accent/20"
            >
              Download Receipt
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto fade-in animate-in duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-black mb-2">
          Secure Checkout
        </h1>
        <p className="text-brand-gray">
          Complete your monthly subscription payment easily and securely.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Payment Form */}
        <div className="lg:col-span-2 rounded-3xl border border-brand-silver/10 bg-brand-surface p-6 shadow-xl">
          <div className="mb-6 flex space-x-4 border-b border-brand-silver/10 pb-4">
            <button
              type="button"
              onClick={() => setMethod("card")}
              className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all ${method === "card"
                ? "bg-brand-accent text-white shadow-lg shadow-brand-accent/20"
                : "bg-brand-dark text-brand-silver hover:text-white border border-brand-silver/10"
                }`}
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span>Card</span>
            </button>
            <button
              type="button"
              onClick={() => setMethod("upi")}
              className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all ${method === "upi"
                ? "bg-brand-accent text-white shadow-lg shadow-brand-accent/20"
                : "bg-brand-dark text-brand-silver hover:text-white border border-brand-silver/10"
                }`}
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span>UPI Apps</span>
            </button>
          </div>

          <form onSubmit={handlePay}>
            {method === "card" ? (
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-brand-silver">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    className="w-full rounded-xl border border-brand-silver/20 bg-brand-dark px-4 py-3 text-white placeholder-brand-gray/50 focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent transition-all"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-brand-silver">
                    Card Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      maxLength={19}
                      placeholder="0000 0000 0000 0000"
                      className="w-full rounded-xl border border-brand-silver/20 bg-brand-dark px-4 py-3 text-white placeholder-brand-gray/50 focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent transition-all pl-12"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-silver">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-brand-silver">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="MM/YY"
                      maxLength={5}
                      className="w-full rounded-xl border border-brand-silver/20 bg-brand-dark px-4 py-3 text-white placeholder-brand-gray/50 focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent transition-all"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-brand-silver">
                      CVV
                    </label>
                    <input
                      type="password"
                      required
                      maxLength={4}
                      placeholder="•••"
                      className="w-full rounded-xl border border-brand-silver/20 bg-brand-dark px-4 py-3 text-white placeholder-brand-gray/50 focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent transition-all"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 flex flex-col items-center justify-center p-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="w-48 h-48 bg-white p-2 rounded-2xl shadow-lg border-4 border-brand-dark">
                  {/* Mock QR Code Pattern */}
                  <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxyZWN0IHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTAgMGgxMHYxMEgweiBNMTAgMTAgSDIwdjEwSDEweiBNMjAgMiBoMTB2MTBoLTEweiIgZmlsbD0iYmxhY2siLz4KPC9zdmc+')] bg-repeat opacity-80 rounded-xl mix-blend-multiply"></div>
                </div>

                <div className="text-center w-full max-w-sm">
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-brand-silver">
                    Or Enter VPA (UPI ID)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="username@upi"
                    className="w-full rounded-xl border border-brand-silver/20 bg-brand-dark px-4 py-3 text-white placeholder-brand-gray/50 focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent transition-all text-center"
                  />
                  <p className="mt-4 text-sm text-brand-gray">
                    Scan the QR code with any UPI app to pay instantly.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-8 border-t border-brand-silver/10 pt-6">
              <button
                type="submit"
                className="w-full rounded-xl bg-brand-accent py-4 font-bold text-white shadow-lg shadow-brand-accent/20 transition-all hover:bg-[#049b88] hover:-translate-y-0.5 active:translate-y-0"
              >
                Pay ₹{billAmount.toLocaleString("en-IN")}
              </button>
            </div>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="rounded-3xl border border-brand-silver/10 bg-brand-surface p-6 shadow-xl sticky top-6">
            <h3 className="text-lg font-bold text-white mb-6">Payment Summary</h3>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center pb-4 border-b border-brand-silver/10">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 flex border-[1.5px] items-center justify-center rounded-lg bg-brand-dark border-brand-silver/20 text-brand-accent">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-white">Maintenance Bill</p>
                    <p className="text-brand-gray text-xs">{monthLabel}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between text-brand-gray">
                <span>Subtotal</span>
                <span className="text-white">₹{billAmount.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-brand-gray">
                <span>Platform Fee</span>
                <span className="text-white">₹0.00</span>
              </div>

              <div className="pt-4 mt-2 border-t border-brand-silver/10 flex justify-between items-center text-lg font-bold text-white">
                <span>Total</span>
                <span className="text-brand-accent">₹{billAmount.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="mt-8 rounded-xl bg-brand-dark border border-brand-silver/10 p-4 flex items-start gap-3">
              <svg className="w-5 h-5 text-brand-accent shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-white">Secure Payment</p>
                <p className="text-xs text-brand-gray mt-1 leading-relaxed">
                  Your payment information is encrypted and securely processed. We do not store your card details.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
