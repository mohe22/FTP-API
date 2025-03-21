import {  CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCircle, UserCheck, UserX } from "lucide-react";
import BoxContainer from "../box-container";

interface UserStatusCardsProps {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
}

export function UserStatusCards({
  totalUsers,
  activeUsers,
  inactiveUsers,
}: UserStatusCardsProps) {
 

  return (
    <div className="w-full grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <BoxContainer className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <UserCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalUsers}</div>
          <p className="text-xs text-muted-foreground">+12 from last month</p>
        </CardContent>
      </BoxContainer>
      <BoxContainer>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeUsers}</div>
          <p className="text-xs text-muted-foreground">
            {Math.round((activeUsers / totalUsers) * 100)}% of total users
          </p>
        </CardContent>
      </BoxContainer>
      <BoxContainer>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Inactive Users</CardTitle>
          <UserX className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{inactiveUsers}</div>
          <p className="text-xs text-muted-foreground">
            {Math.round((inactiveUsers / totalUsers) * 100)}% of total users
          </p>
        </CardContent>
      </BoxContainer>
    </div>
  );
}