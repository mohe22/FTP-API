import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GroupDetails } from "@/components/admin-dashboard/admin-group/group-details";
import GroupMembers from "@/components/admin-dashboard/admin-group/group-members";
import GroupPermissions from "@/components/admin-dashboard/admin-group/group-permissions";

export default function AdminSingleGroup() {
  const { id } = useParams();


  

  

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <a href="/admin-dashboard/groups">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </a>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Group Details</h1>
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>
        <TabsContent value="details" className="space-y-4">
          <GroupDetails groupId={id!} />
        </TabsContent>
        <TabsContent value="members" className="space-y-4">
          <GroupMembers groupId={id!} />
        </TabsContent>
        <TabsContent value="permissions" className="space-y-4">
          <GroupPermissions groupId={id!} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
