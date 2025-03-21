import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarIcon, Filter } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import BoxContainer from "@/components/box-container";
import axiosInstance from "@/lib/axios";

interface Activity {
  id: number;
  activity_type: string;
  activity_time: string;
  details: string;
  category: "profile" | "group" | "security" | "data" | "settings";
  ip_address: string | null;
  user_id: string;
  changed_by_username:string,
  
}

interface UserActivityLogProps {
  userId: string;
}

export function UserActivityLog({ userId }: UserActivityLogProps) {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [activityType, setActivityType] = useState<string | undefined>(undefined);

  const {
    data: activities,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["get-activity", userId],
    queryFn: async () => {
      const response = await axiosInstance(
        `/admin/users/activity/${userId}`)
    
      return response.data.message as Activity[];
    },
  });

  
  

  // Filter activities based on date and activity type
  const filteredActivities = activities
    ? activities.filter((activity) => {
        const activityDate = new Date(activity.activity_time);
        const dateMatches = date
          ? activityDate.toDateString() === date.toDateString()
          : true;
        const typeMatches = activityType
          ? activity.category === activityType
          : true;
        return dateMatches && typeMatches;
      })
    : [];

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
  
  // Clear filters
  const clearFilters = () => {
    setDate(undefined);
    setActivityType(undefined);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error fetching activity logs.</div>;
  }

  return (
    <BoxContainer>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Activity Log</CardTitle>
            <CardDescription>View user activity history and events.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {/* Date Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            {/* Activity Type Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  {activityType || "All types"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 py-1 px-0.5">
                <div className="grid gap-2">
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={() => setActivityType("auth")}
                  >
                    Authentication
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={() => setActivityType("profile")}
                  >
                    Profile
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={() => setActivityType("user")}
                  >
                    User Management
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={() => setActivityType("group")}
                  >
                    Group Management
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={() => setActivityType("security")}
                  >
                    Security
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={() => setActivityType("data")}
                  >
                    Data
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={() => setActivityType("settings")}
                  >
                    Settings
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {/* Clear Filters */}
            {(date || activityType) && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredActivities.length > 0 ? (
            filteredActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{activity.activity_type}</span>
                    <Badge 
                    
                      variant={getBadgeVariant(activity.category)}>
                      {activity.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {activity.details} 
                  </p>
                  <p className="text-sm text-muted-foreground">
                    change made by <strong className="text-blue-300">{activity.changed_by_username}:{activity.ip_address}</strong>
                  </p>
                </div>
                <div className="text-sm text-muted-foreground">
                  {new Date(activity.activity_time).toLocaleString()}
                </div>
              </div>
            ))
          ) : (
            <div className="py-6 text-center text-muted-foreground">
              No activity found for the selected filters.
            </div>
          )}
        </div>
      </CardContent>
    </BoxContainer>
  );
}