import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Eye, Trash2 } from "lucide-react";
import BoxContainer from "@/components/box-container";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import ActivityLogFilters from "./activityLog-filters";
import useModal from "@/hooks/use-model";
import { toast } from "sonner";

interface ActivityLog {
  activity_id: string;
  activity_type: string;
  activity_time: string;
  details: string;
  category: string;
  endpoint: string;
  http_method: string;
  ip_address: string;
  Browser: string;
  OS: string;
  user_id: string;
  username: string;
  avatar: string;
}

export function ActivityLogTable() {
  const queryClient = useQueryClient();
  const [model, showModal] = useModal();
  const [skip, setSkip] = useState(0);
  const [filters, setFilters] = useState({
    searchQuery: "",
    typeFilter: "",
    dateFrom: undefined as string | undefined,
    dateTo: undefined as string | undefined,
  });
  const limit = 10;

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case "Authentication":
        return "default";
      case "profile":
        return "green";
      case "user":
        return "outline";
      case "group":
        return "outline";
      case "Security Updated":
      case "security":
        return "destructive";
      case "data":
        return "secondary";
      case "settings":
        return "outline";
      case "system":
        return "default";
      default:
        return "secondary";
    }
  };

  const handleViewDetails = (log: ActivityLog) => {
    showModal(
      "Activity Log Details",
      "Detailed information about this activity.",
      () => (
        <div>
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={log.avatar} />
              <AvatarFallback>
                {log.username
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{log.username}</p>
              <p className="text-sm text-muted-foreground">
                User ID: {log.user_id}
              </p>
            </div>
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Action:</p>
              <p className="text-sm">{log.activity_type}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Type:</p>
              <Badge variant={getBadgeVariant(log.category)}>
                {log.category}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Timestamp:</p>
              <p className="text-sm">
                {new Date(log.activity_time).toLocaleString()}
              </p>
            </div>
            <div className="pt-2">
              <p className="text-sm font-medium">Details:</p>
              <p className="text-sm">{log.details}</p>
            </div>
            <div className="pt-2">
              <p className="text-sm font-medium">Additional Information:</p>
              <div className="rounded-md bg-muted p-3 text-sm">
                <p>IP Address: {log.ip_address}</p>
                <p>Browser: {log.Browser}</p>
                <p>OS: {log.OS}</p>
                <p>end-point:{log.endpoint}</p>
                <p>http-method:{log.http_method}</p>
              </div>
            </div>
          </div>
        </div>
      )
    );
  };

  const { data, isLoading } = useQuery({
    queryKey: ["list-activity", skip, filters],
    queryFn: async () => {
      const response = await axiosInstance.get<ActivityLog[]>(
        "/admin/activity/get-activities",
        {
          params: {
            skip,
            limit,
            username: filters.searchQuery,
            details: filters.searchQuery,
            activity_type: filters.typeFilter,
            date_from: filters.dateFrom,
            date_to: filters.dateTo,
          },
        }
      );
      return response.data;
    },
  });

  const deleteActivityMutation = useMutation({
    mutationFn: (activityId: string) =>
      axiosInstance.delete(`/admin/activity/delete-activity/${activityId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["list-activity"] });
      toast.success("Activity deleted successfully");
    },
    onError: () => toast.error("Failed to delete activity"),
  });

  const deleteAllActivitiesMutation = useMutation({
    mutationFn: () =>
      axiosInstance.delete("/admin/activity/delete-all-activities"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["list-activity"] });
      setSkip(0);
      toast.success("All activities deleted successfully");
    },
    onError: () => toast.error("Failed to delete all activities"),
  });

  const handleDeleteActivity = (activityId: string) => {
    toast.error("delete the activity", {
      description: "Are you sure you want to delete this activity?",
      action: {
        label: "Delete anyway",
        onClick: () => {
          deleteActivityMutation.mutate(activityId);
        },
      },
    });
  };

  const handleDeleteAllActivities = () => {

    toast.error("Delete everything", {
      description:"Are you sure you want to delete ALL activities? This action cannot be undone!"      ,
      action: {
        label: "Delete anyway",
        onClick: () => {
          deleteAllActivitiesMutation.mutate();
        },
      },
    });
  };

  const handleNextPage = () => {
    setSkip((prev) => prev + limit);
  };

  const handlePrevPage = () => {
    setSkip((prev) => Math.max(0, prev - limit));
  };

  const handleSearch = (filters: {
    searchQuery: string;
    typeFilter: string;
    dateFrom?: string;
    dateTo?: string;
  }) => {
    setFilters({
      searchQuery: filters.searchQuery,
      typeFilter: filters.typeFilter,
      dateFrom: filters.dateFrom ?? undefined,
      dateTo: filters.dateTo ?? undefined,
    });
    setSkip(0);
  };


  return (
    <div className="flex flex-col space-y-2">
      <BoxContainer className="px-3">
        <ActivityLogFilters onSearch={handleSearch} />
      </BoxContainer>

      <BoxContainer className="p-0 rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.map((log) => (
              <TableRow key={log.activity_id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={log.avatar} />
                      <AvatarFallback>
                        {log.username
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{log.username}</span>
                  </div>
                </TableCell>
                <TableCell>{log.activity_type}</TableCell>
                <TableCell>
                  <Badge variant={getBadgeVariant(log.category)}>
                    {log.category}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(log.activity_time).toLocaleString()}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleViewDetails(log)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteActivity(log.activity_id)}
                      disabled={deleteActivityMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-red-300" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </BoxContainer>

      <div className="flex items-center justify-between my-2">
        <Button
          variant="destructive"
          onClick={handleDeleteAllActivities}
          disabled={deleteAllActivitiesMutation.isPending || !data?.length}
        >
          {deleteAllActivitiesMutation.isPending
            ? "Deleting..."
            : "Delete All Activities"}
        </Button>

        <div className="flex gap-2">
          <Button onClick={handlePrevPage} disabled={skip === 0 || isLoading}>
            Previous
          </Button>
          <Button
            onClick={handleNextPage}
            disabled={isLoading || (data && data.length < limit)}
          >
            Next
          </Button>
        </div>
      </div>

      {model}
    </div>
  );
}
