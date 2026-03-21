"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
// import Navbar from "./Navbar";

const adminLinks = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Flats", href: "/admin/flats" },
  { label: "Subscriptions", href: "/admin/subscriptions" },
  { label: "Monthly Records", href: "/admin/monthly-subscriptions" },
  { label: "Payment Entry", href: "/admin/payment-entry" },
  { label: "Reports", href: "/admin/reports" },
  { label: "Notifications", href: "/admin/notifications" },
  { label: "Profile", href: "/admin/profile" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  async function handleLogout() {
    await fetch("http://localhost:5000/api/logout", {
      credentials: "include",
    });
    router.push("/login");
  }
return (
    <aside className="no-scrollbar flex h-[calc(100vh-4rem)] w-64 flex-col border-r border-brand-surface bg-brand-darker px-4 py-6 shadow-xl">
      {/* TOP */}
      <div className="flex-1">
        <div className="mb-10 px-2"></div>

        <nav className="flex flex-col gap-3">
          {adminLinks.map((link) => {
            const isActive = pathname === link.href;

            return (
              <Link
                key={`${link.label}-${link.href}`}
                href={link.href}
                className={`group flex items-center rounded-xl px-4 py-3.5 text-base font-medium transition-all duration-300 hover:translate-x-1 ${
                  isActive
                    ? "bg-brand-surface text-brand-white shadow-md shadow-brand-surface/50"
                    : "text-brand-silver hover:bg-brand-surface hover:text-brand-white"
                }`}
              >
                <div
                  className={`mr-4 h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                    isActive
                      ? "bg-brand-accent shadow-[0_0_8px_0_var(--color-brand-accent)]"
                      : "bg-brand-surface group-hover:bg-brand-accent"
                  }`}
                ></div>
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* BOTTOM LOGOUT */}
      <div className="border-t border-brand-surface pt-4">
        <button
          onClick={handleLogout}
          className="w-full rounded-xl bg-red-500 px-4 py-2 text-white hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
