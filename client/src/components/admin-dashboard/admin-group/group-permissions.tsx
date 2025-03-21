import  { useState, useEffect } from "react";
import BoxContainer from "@/components/box-container";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";

export default function GroupPermissions({ groupId }: { groupId: string }) {
  const permissions = [
    {
      name: "Full Control",
      description: "Allows complete control over the resource, including modifying permissions and ownership.",
    },
    {
      name: "Modify",
      description: "Allows reading, writing, executing, and deleting the resource.",
    },
    {
      name: "Read & Execute",
      description: "Allows reading and executing the resource, but not modifying or deleting it.",
    },
    {
      name: "Read",
      description: "Allows viewing the resource, but not modifying, executing, or deleting it.",
    },
    {
      name: "Write",
      description: "Allows modifying the resource, but not reading, executing, or deleting it.",
    },
    {
      name: "Delete",
      description: "Allows deleting the resource.",
    },
  ];

  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  useEffect(() => {
    const fetchGroupPermissions = async () => {
      try {
        const response = await axiosInstance.get(
          `/admin/groups/get-with-permissions/${groupId}`
        )
       
        const groupPermissions = response.data.permissions || [];
        setSelectedPermissions(groupPermissions);
      } catch (error:any) {
        const msg = error.response?.data?.detail || "Unexpected Error";
        toast.error(msg)
      }
    };

    fetchGroupPermissions();
  }, [groupId]);

  const handlePermissionToggle = (permission: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };

  const handleSavePermissions = async () => {
    try {
      await axiosInstance.patch(
        `/admin/groups/update-permissions/${groupId}`,
        { permissions: selectedPermissions }
      )
   
      toast.info("Permissions saved successfully!");
    } catch (error:any) {
        const msg = error.response?.data?.detail || "Unexpected Error";
        toast.error(msg)
    
    }
  };

  return (
    <BoxContainer>
      <CardHeader>
        <CardTitle>Group Permissions</CardTitle>
        <CardDescription>
          Configure what members of this group can access and modify.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {permissions.map((permission) => (
            <div
              key={permission.name}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div>
                <span className="text-sm font-medium">{permission.name}</span>
                <p className="text-sm text-muted-foreground">
                  {permission.description}
                </p>
              </div>
              <Switch
                checked={selectedPermissions.includes(permission.name)}
                onCheckedChange={() => handlePermissionToggle(permission.name)}
              />
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-row justify-end gap-x-2">
          <Button onClick={handleSavePermissions}>Save Permissions</Button>
        </div>
      </CardContent>
    </BoxContainer>
  );
}