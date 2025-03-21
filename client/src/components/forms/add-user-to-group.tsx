import React, { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Card, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useInView } from "react-intersection-observer";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";

const fetchUsers = async ({ pageParam = 0 }) => {

  const response = await axiosInstance.get(
    "/admin/users/get-scroll",
    {
      params: { skip: pageParam, limit: 10 },
    }
  )

  return response.data;
};

export default function AddUserToGroup() {
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const { ref, inView } = useInView();
  const { id } =useParams()


  const handleAddUsersToGroup = async () => {
    try {
  
      await axiosInstance.post(
        `/admin/groups/add-user/${id}`,
        { user_ids: selectedUsers } 

      )
      
      toast.info("user add to group")
      
      setSelectedUsers([]);
    } catch (error:any) {
        const msg = error.response?.data?.detail || "Unexpected Error";
        toast.error(msg)
    }
  };
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["users"],
      queryFn: fetchUsers,
      getNextPageParam: (lastPage, allPages) => {
        return lastPage.length ? allPages.length * 10 : undefined;
      },
      initialPageParam: 0,
    });

  React.useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const handleSelectUser = (userId: number) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <div>
      <div className="space-y-4">
        {data?.pages.map((page, pageIndex) => (
          <React.Fragment key={pageIndex}>
            {page.map((user: any) => (
              <Card key={user.id} className="p-0">
                <div className="p-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={user.avatar || undefined} />
                        <AvatarFallback>
                          {user.username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle>{user.username}</CardTitle>
                      </div>
                    </div>
                    <Checkbox
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={() => handleSelectUser(user.id)}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </React.Fragment>
        ))}
      </div>

      <div ref={ref} className="py-4 text-center">
        {isFetchingNextPage ? (
          <p>Loading more users...</p>
        ) : hasNextPage ? (
          <Button onClick={() => fetchNextPage()}>Load More</Button>
        ) : (
          <p>No more users to load.</p>
        )}
      </div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm">
          Selected Users:{" "}
          <span className="text-muted-foreground">{selectedUsers.length}</span>
        </span>
        <div className="flex flex-row gap-x-1">
        <Button variant="outline" onClick={() => setSelectedUsers([])}>
          Deselect All
        </Button>
        <Button  onClick={handleAddUsersToGroup}>
          Add user
        </Button>
        </div>
      </div>
    </div>
  );
}
