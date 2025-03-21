import { RecentActivityList } from "@/components/admin-dashboard/recent-activity-list";
import { UserStatusCards } from "@/components/admin-dashboard/user-status-cards";
import axiosInstance from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
export default function AdminDashboard() {
  const { data } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      const response = await axiosInstance.get("/admin/dashboard-stats");
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });


  return (
    <div className="w-full grid gap-4">
      <UserStatusCards
        totalUsers={data?.total_users || 0}
        activeUsers={data?.active_users || 0}
        inactiveUsers={data?.inactive_users || 0}
      />
      <RecentActivityList recentActivity={data?.recent_activity || []} />
    </div>
  );
}
