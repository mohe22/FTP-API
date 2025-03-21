import axiosInstance from "@/lib/axios";
import { UserFormType } from "@/lib/definition";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export interface UsersLists {
  email: string;
  groups: string[];
  id: number | string;
  is_admin: boolean;
  status: "active" | "inactive";
  username: string;
  avatar?:any
  last_active?: string;
  created_at?: string;
}

export default function useUserManager() {
  const [filteredUsers, setFilteredUsers] = useState<UsersLists[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [groupFilter, setGroupFilter] = useState<string>("all");


  
  const { data: users, isLoading: gettingUsers } = useQuery<UsersLists[]>({
    queryKey: ["list-users"],
    queryFn: async () => {
      const response = await axiosInstance.get("/admin/users/get");      
      return response.data.message;
    },
  });

  useEffect(() => {
    if (!users) return;

    let filtered = users;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }



    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((user) => user.status === statusFilter);
    }

    // Filter by group
    if (groupFilter !== "all") {
      filtered = filtered.filter((user) => user.groups.includes(groupFilter));
    }

    setFilteredUsers(filtered);
  }, [users, searchQuery, statusFilter, groupFilter]);

  useEffect(() => {
    if (users) {
      setFilteredUsers(users);
    }
  }, [users]);



  const deleteUser = useMutation({
    mutationFn: async (userToDelete: string) => {
      return await axiosInstance.delete(`/admin/users/delete/${userToDelete}`);      

    },
    onSuccess: (_, groupId) => {
      setFilteredUsers((prev) =>
        prev.filter((group) => group.id !== parseInt(groupId))
      ); 

      toast.success("user deleted successfully.");
    },
    onError: () => {
      toast.error("Failed to delete user.");
    },
  });


  const AddUser = useMutation({
    mutationFn: async (data: UserFormType) => {
      return axiosInstance.post("/admin/users/create",data)
      },
    onSuccess: (newUser,data) => {     
      // @ts-ignore
      setFilteredUsers((prev) => [...prev, {
        ...data,
        id:newUser.data.user_id
      }]);
      toast.success("user added successfully.");
    },
    onError: (erorr:any) => {
      const msg = erorr.response?.data?.detail || "Unexpected Error";
      toast.error(msg);
    },
  });


  
  return {
    gettingUsers,
    filteredUsers,
    deleteUser:deleteUser.mutate,
    AddUser:AddUser.mutate,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    groupFilter,
    setGroupFilter,

  };
}