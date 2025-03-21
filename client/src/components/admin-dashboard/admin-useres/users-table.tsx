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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal, Edit, Trash, Eye } from "lucide-react";
import { UserTableToolbar } from "./user-table-toolbar";
import useUserManager, { UsersLists } from "@/hooks/use-user-manager";
import useModal from "@/hooks/use-model";


export function UsersTable() {
  const {
    gettingUsers,
    filteredUsers,
   searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    groupFilter,
    setGroupFilter,
    deleteUser,
    AddUser
  } = useUserManager();


  const [model, showModal] = useModal()
 

  if (gettingUsers) {
    return <div>loading</div>;
  }

  
  return (
    <div>
      <UserTableToolbar
        onSearch={(query) => setSearchQuery(query)}
        onStatusFilter={(status) => setStatusFilter(status)}
        onGroupFilter={(group) => setGroupFilter(group)}
        onClearFilters={() => {
          setSearchQuery("");
          setStatusFilter("all");
          setGroupFilter("all");
        }}
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        groupFilter={groupFilter}
        AddUser={AddUser}
      />

      <div className="bg-sidebar mt-5 rounded-sm border ">
        <Table >
          <TableHeader>
            <TableRow>
            
              <TableHead className="whitespace-nowrap">User</TableHead>
              <TableHead className="whitespace-nowrap">Groups</TableHead>
              <TableHead className="whitespace-nowrap">Status</TableHead>
              <TableHead className="whitespace-nowrap">Created at</TableHead>
              <TableHead className="w-12 whitespace-nowrap"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user: UsersLists) => (
              <TableRow key={user.id}>
            
                <TableCell className="whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    {user?.avatar && <Avatar>
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback>
                        {user?.username
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>}
                    <div className="flex flex-col">
                      <span className="font-medium">{user.username}</span>
                      <span className="text-sm  truncate lg:flex hidden  text-muted-foreground break-words">
                        {user.email}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {user.groups && user.groups.join(", ")}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <Badge
                    variant={user.status === "active" ? "default" : "secondary"}
                    className={
                      user.status === "active"
                        ? "bg-green-500 hover:bg-green-600"
                        : ""
                    }
                  >
                    {user.status}
                  </Badge>
                </TableCell>
  
                <TableCell className="whitespace-nowrap">
                  {user.created_at}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <a href={`/admin-dashboard/users/${user.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <a href={`/admin-dashboard/users/${user.id}?edit=true`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={
                          () =>{
                            showModal(
                              "Delete User",
                              "Are you sure you want to delete this user?",
                              (onClose) => (
                                <div className=" space-y-4 flex flex-col">
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      onClose();
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    onClick={() => {
                                      deleteUser(user.id.toString());
                                      onClose();
                                    }}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              )

                            )
                          } 
                        }
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {model}
    
    </div>
  );
}
