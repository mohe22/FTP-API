import Loading from "@/components/loading";
import {
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import BoxContainer from "@/components/box-container";

import { Button } from "@/components/ui/button";
import { Plus, Search, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import useModal from "@/hooks/use-model";
import AddUserToGroup from "@/components/forms/add-user-to-group";
import axiosInstance from "@/lib/axios";

interface Member {
  id: number;
  avatar: string | null;
  username: string;
  email: string | null;
  phone: string | null;
  location: string | null;
  status: "active" | "inactive";
}

export default function GroupMembers({ groupId }: { groupId: string }) {
  const [model, showModal] = useModal();
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: members,
    isLoading,
    isError,
    refetch
  } = useQuery<Member[]>({
    queryKey: ["get-group-details", groupId],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `/admin/groups/get-with-members/${groupId}`
      )  
      return response.data.message;
    },
  });

  
 

  const filteredMembers =
    members && members.length > 0
      ? members.filter((member) =>
          member.username.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : [];


  if (isLoading && !members) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <p>Error fetching group members.</p>
      </div>
    );
  }

  return (
    <BoxContainer>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Group Members</CardTitle>
            <CardDescription>Manage users in this group.</CardDescription>
          </div>
          <Button
            onClick={() => {
              showModal(
                "add members to group",
                "select users to add to this group",
                () => (
                    <AddUserToGroup refetch={refetch}/>
                
                )
              );
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Members
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search members..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button type="submit" variant="secondary">
              Search
            </Button>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={member.avatar || undefined} />
                          <AvatarFallback>
                            {member.username
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium">{member.username}</span>
                          <span className="text-sm text-muted-foreground">
                            {member.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          member.status === "active" ? "default" : "destructive"
                        }
                      >
                        {member.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{member.location || "N/A"}</TableCell>
                    <TableCell>{member.phone || "N/A"}</TableCell>
                    <TableCell>
                      <a href={`/admin-dashboard/users/${member.id}`}>
                        <Button variant="ghost" size="icon">
                          <ArrowRight className="h-4 w-4 rotate-[-50deg]" />
                        </Button>
                      </a>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No members found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {model}
    </BoxContainer>
  );
}
