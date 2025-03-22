import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useParams, Link } from "react-router-dom";
import { UserProfile } from "@/components/admin-dashboard/admin-useres/user-profile";
import { UserActivityLog } from "@/components/admin-dashboard/admin-useres/user-activity-log";
import { UserSecuritySettings } from "@/components/admin-dashboard/admin-useres/user-security-settings";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/components/loading";
import axiosInstance from "@/lib/axios";

export default function AdminSingleUser() {
  const { id } = useParams();
  
  const {
    data: userData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["user", id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/admin/users/get/${id}`);
  
      return response.data.message ;
    },
  });


  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <p className="text-red-500">Error: {error.message}</p>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      {/* Back button and page title */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link to="/admin-dashboard/users">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">User Details</h1>
      </div>

      {/* Tabs for profile, activity, and security */}
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Profile tab content */}
        <TabsContent value="profile" className="space-y-4">
          <UserProfile userData={userData!} />
        </TabsContent>

        {/* Activity tab content */}
        <TabsContent value="activity" className="space-y-4">
          <UserActivityLog userId={id!} />
        </TabsContent>
     
        <TabsContent value="security" className="space-y-4">
          <UserSecuritySettings 
            userId={id!} 
          
            data={{
              sessionTimeout: userData.session_time_out,
              twoFactorEnabled: userData.Two_factor_auth,
              allowedIPs: userData.Allowed_ips,
              loginAttempts: userData.max_logged_in,
              ipRestriction:userData.ip_restriction
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}