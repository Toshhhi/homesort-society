import DashboardLayout from "@/components/layout/DashboardLayout";

export default function ResidentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout title="Homesort" role="resident">
      {children}
    </DashboardLayout>
  );
}
