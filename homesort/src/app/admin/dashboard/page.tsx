import DashboardLayout from "@/components/layout/DashboardLayout";
import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminDashboardPage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    // <DashboardLayout title="Dashboard" role="admin">
    <div className="flex w-full max-w-lg flex-col gap-6">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-brand-darker">
          Welcome, Admin
        </h2>
        <p className="mt-2 text-base text-brand-gray">
          Here is an overview of your society subscription management system.
        </p>
      </div>

      <div className="flex flex-col gap-5 w-full">
        <div className="flex w-full items-center justify-between rounded-2xl border border-brand-silver/10 bg-brand-surface p-6 shadow-sm transition-all hover:shadow-md hover:border-brand-accent/30 group">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-brand-gray group-hover:text-brand-silver transition-colors">
              Total Flats
            </p>
            <h3 className="mt-1 text-2xl font-black text-white">120</h3>
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
            <h3 className="mt-1 text-2xl font-black text-white">₹1,50,000</h3>
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
            <h3 className="mt-1 text-2xl font-black text-white">18</h3>
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
            <h3 className="mt-1 text-2xl font-black text-white">42</h3>
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
    </div>
    // </DashboardLayout>
  );
}
