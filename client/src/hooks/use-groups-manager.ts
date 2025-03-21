import axiosInstance from "@/lib/axios";
import { CreateGroupSchemaType } from "@/lib/definition";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export interface Group {
  id: number;
  group_name: string;
  Description: string;
  members_count: number;
  created_at: string;
}

export default function useGroupsManager() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([]); 

  const {
    data: groups,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["get-all-groups"],
    queryFn: async () => {
      const response = await axiosInstance.get(`/admin/groups/get-with-details`);
 
      return response.data.message as Group[];
    },
  });

  useEffect(() => {
    if (!groups) return;

    let filtered = groups;

    if (searchQuery) {
      filtered = groups.filter(
        (group) =>
          group.group_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          group.Description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredGroups(filtered); 
  }, [searchQuery, groups]);

  // Delete a group
  const deleteGroupMutation = useMutation({
    mutationFn: async (groupId: string) => {
      await axiosInstance.delete(`/admin/groups/delete/${groupId}`);
    },
    onSuccess: (_, groupId) => {
      setFilteredGroups((prev) =>
        prev.filter((group) => group.id !== parseInt(groupId))
      ); 

      toast.success("Group deleted successfully.");
    },
    onError: () => {
      toast.error("Failed to delete group.");
    },
  });

  // Create a new group
  const createGroupMutation = useMutation({
    mutationFn: async (newGroup: CreateGroupSchemaType): Promise<boolean> => {
      await axiosInstance.post(`/admin/groups/create`, newGroup);
      return true
      
    },


    onSuccess: (_,group) => {

      setFilteredGroups((prev) =>[...prev,{
        id: filteredGroups.length + 1,
        group_name: group.name,
        Description: group.description,
        members_count: 0, 
        created_at: new Date().toISOString(),
      }])
      toast.success("Group created successfully.");
    },
    onError: (error:any) => {
      const msg = error.response?.data?.detail || "Unexpected Error";
      toast.error(msg);
    },
  });

  return {
    isLoading,
    filteredGroups, 
    isError,
    deleteGroup: deleteGroupMutation.mutate,
    createGroup: createGroupMutation.mutate,
    searchQuery,
    setSearchQuery,
  };
}
