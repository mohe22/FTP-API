import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useEffect, useState } from "react";

interface GroupStatus {
  [group_name: string]: boolean; 
}

export default function EditFileGroup({ filePath,refetch }: { filePath: string,refetch:()=>void }) {
  const { data: groupStatus, isLoading } = useQuery({
    queryKey: ["get-file-groups", filePath],
    queryFn: async () => {
      const response = await axiosInstance.get(`/files/get-file-groups`, {
        params: {
          path: filePath,
        },
      });
      return response.data.message as GroupStatus; 
    },
  });

  const form = useForm({
    defaultValues: {
      groups: [] as { group_name: string; is_associated: boolean }[],
    },
  });

  const [changedGroups, setChangedGroups] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (groupStatus) {
      // Transform the groupStatus object into an array of groups
      const groups = Object.entries(groupStatus).map(([group_name, is_associated]) => ({
        group_name,
        is_associated,
      }));
      form.reset({ groups });
    }
  }, [groupStatus]);

  const onSubmit = async (data: { groups: { group_name: string; is_associated: boolean }[] }) => {
    try {
      // Find groups that have been modified
      const updatedGroups = data.groups
        .filter((group, index) => {
          const initialGroup = Object.entries(groupStatus || {})[index];
          return (
            initialGroup &&
            initialGroup[1] !== group.is_associated 
          );
        })
        .map((group) => ({
          group_name: group.group_name,
          is_associated: group.is_associated,
        }));
    
        
      if (updatedGroups.length > 0) {
        await axiosInstance.patch(
            `/files/update-file-groups`,
            { groups: updatedGroups },
            { params: { path: filePath } } 
          );
          refetch()
          toast.success("Group permissions updated successfully!");
      } else {
        toast.info("No changes detected.");
      }
    } catch (error: any) {
      const msg = error.response?.data?.detail || "Unexpected Error";
      toast.error(msg);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {form.watch("groups")?.map((group, groupIndex) => (
            <div
              key={group.group_name}
              className="flex items-center justify-between border p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-4">
                <FormField
                  control={form.control}
                  name={`groups.${groupIndex}.is_associated`}
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            setChangedGroups((prev) => new Set(prev).add(group.group_name));
                          }}
                        />
                      </FormControl>
                      <FormLabel className="text-lg font-medium">
                        {group.group_name}
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          ))}
          <Button type="submit" className="mt-4 w-full sm:w-auto">
            Save Changes
          </Button>
        </form>
      </Form>
    </div>
  );
}