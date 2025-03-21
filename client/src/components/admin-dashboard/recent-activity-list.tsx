import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";
import BoxContainer from "../box-container";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
// utils/timeAgo.ts
export function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1,
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval === 1 ? "" : "s"} ago`;
    }
  }

  return "Just now";
}
interface RecentActivityListProps {
  recentActivity: Array<{
    activity_type: string;
    details: string;
    activity_time: string;
    username: string;
    avatar: string;
  }>;
}

export function RecentActivityList({ recentActivity }: RecentActivityListProps) {
  return (
    <BoxContainer>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
        <Activity className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center  relative">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={activity.avatar} alt={activity.username} />
                  <AvatarFallback>
                    {activity.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">
                    {activity.username} - {activity.activity_type}
                  </p>
                  <p className="text-sm text-muted-foreground">{activity.details}</p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground truncate absolute top-0 right-0">
                {timeAgo(activity.activity_time)} {/* Use timeAgo here */}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </BoxContainer>
  );
}