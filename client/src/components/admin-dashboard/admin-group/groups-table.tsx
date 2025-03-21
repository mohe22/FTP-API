import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { MoreHorizontal, Edit, Trash, Eye, Users } from "lucide-react";
import BoxContainer from "@/components/box-container";
import { GroupTableToolbar } from "./group-table-toolbar";
import useGroupsManager, { Group } from "@/hooks/use-groups-manager";
import useModal from "@/hooks/use-model";

export function GroupsTable() {
  const {
    filteredGroups,
    isLoading,
    isError,
    deleteGroup,
    searchQuery,
    setSearchQuery,
    createGroup,
  } = useGroupsManager();
  const [model, showModal] = useModal();


  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error fetching groups.</div>;
  }

  return (
    <div className="space-y-4">
      <GroupTableToolbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        createGroup={createGroup}
      />

      <BoxContainer className="p-0 rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Members</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGroups?.map((group: Group) => (
              <TableRow key={group.id}>
                <TableCell className="font-medium">
                  {group.group_name}
                </TableCell>
                <TableCell className=" truncate max-w-52">{group.Description}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    {group.members_count}
                  </div>
                </TableCell>
                <TableCell>{group.created_at}</TableCell>
                <TableCell>
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
                        <a href={`/admin-dashboard/groups/${group.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <a href={`/admin-dashboard/groups/${group.id}?edit=true`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() =>
                          showModal(
                            "Are you sure you want to delete this group?",
                            "This action cannot be undone. This will permanently delete the group and remove it from our servers.",
                            (onClose) => (
                              <div className="flex flex-col space-y-2">
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
                                    deleteGroup(group.id.toString());
                                    onClose();
                                  }}
                                >
                                  Delete
                                </Button>
                              </div>
                            )
                          )
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
      </BoxContainer>

      {model}
    </div>
  );
}