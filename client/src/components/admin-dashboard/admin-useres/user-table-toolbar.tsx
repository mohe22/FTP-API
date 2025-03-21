import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, X } from "lucide-react";
import BoxContainer from "@/components/box-container";
import useModal from "@/hooks/use-model";
import CreateUserForm from "@/components/forms/create-user-form";
import { UserFormType } from "@/lib/definition";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

interface UserTableToolbarProps {
  onSearch: (query: string) => void;
  onStatusFilter: (status: string) => void;
  onGroupFilter: (group: string) => void;
  onClearFilters: () => void;
  searchQuery: string;
  statusFilter: string;
  groupFilter: string;
  AddUser: (data: UserFormType) => void;
}

export function UserTableToolbar({
  onSearch,
  onStatusFilter,
  onGroupFilter,
  onClearFilters,
  searchQuery,
  statusFilter,
  groupFilter,
  AddUser,
}: UserTableToolbarProps) {
  const [model, showModal] = useModal();
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const clearFilters = () => {
    onClearFilters();
  };

  const { data: groups } = useQuery({
    queryKey: ["get-group"],
    queryFn: async () => {
      const response = await axiosInstance.get(`/admin/groups/get`);
      
      return response.data.message 
    },
  });
  return (
    <BoxContainer className="flex flex-col gap-4 p-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 items-center gap-2">
        <form
          onSubmit={handleSearch}
          className="flex flex-1 items-center gap-2"
        >
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search users..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={onStatusFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Select value={groupFilter} onValueChange={onGroupFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Group" />
            </SelectTrigger>
            <SelectContent>
              {groups?.map((group:{group_name: string}) => (
                <SelectItem key={group.group_name} value={group.group_name}>
                  {group.group_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(searchQuery || statusFilter !== "all" || groupFilter !== "all") && (
            <Button
              variant="ghost"
              size="icon"
              onClick={clearFilters}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear filters</span>
            </Button>
          )}
        </div>
        <Button
          onClick={() =>
            showModal("Create User", "Create a new user", (onClose) => (
              <CreateUserForm AddUser={AddUser} onClose={onClose} />
            ))
          }
        >
          <Plus className="mr-2 h-4 w-4" />
          New User
        </Button>
      </div>
      {model}
    </BoxContainer>
  );
}
