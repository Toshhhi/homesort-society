import Navbar from "./Navbar";
import ResidentSidebar from "./ResidentSideBar";
import AdminSidebar from "./AdminSidebar";
type DashboardLayoutProps = {
  title: string;
  role: "admin" | "resident";
  children: React.ReactNode;
};

export default function DashboardLayout({
  title,
  role,
  children,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-brand-bg text-brand-darker font-sans selection:bg-brand-accent/20">
      {/* Top navbar */}
      <Navbar title={title} role={role} />

      {/* Sidebar + page content */}
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
        {/* Show sidebar based on role */}
        {role === "admin" ? <AdminSidebar /> : <ResidentSidebar />}

        {/* Main page content */}
        <main className="flex-1 overflow-y-auto px-6 py-8 md:px-8 lg:py-10 transition-all duration-300">
          <div className="max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
