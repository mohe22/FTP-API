import { DashboardSidebar } from "@/components/admin-dashboard/side-bar/dashboard-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import ProtectedRoute from "./protected-route";
import Nav from "@/components/admin-dashboard/nav/nav";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
   <ProtectedRoute onlyAdmin={true} redirectPath="/">
    <main className="flex flex-col h-screen ">
        <div className="fixed top-0 left-0 w-full z-50">
          <Nav />
        </div>

        <SidebarProvider className="flex flex-row flex-1 pt-16">
          <DashboardSidebar />

          <div className="flex-1  mt-7 mx-5">
            {children}
          </div>
        </SidebarProvider>
      </main>
    </ProtectedRoute>
  );
}