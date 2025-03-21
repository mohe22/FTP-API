import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import BoxContainer from "@/components/box-container";
import useModal from "@/hooks/use-model";
import { CreateGroupSchemaType } from "@/lib/definition";
import CreateGroup from "@/components/forms/create-group";

export function GroupTableToolbar(
  {
    searchQuery,
    setSearchQuery,
    createGroup
  }:{
    searchQuery: string;
    setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
    createGroup:(data:CreateGroupSchemaType)=>void
  }
) {

  const [model,showModal] = useModal()
 



  return (
    <BoxContainer className="flex flex-col gap-4 p-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 items-center gap-2">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search groups..."
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

      <div className="flex flex-col sm:flex-row">
        <Button onClick={
          ()=>{
            showModal(
              "Create New Group",
              "Add a new user group to organize and manage permissions.",
              (onClose)=>(
                <CreateGroup
                  onClose={onClose}
                  handleCreateGroup={createGroup}
                />
              )
            )
          }
        }>
          <Plus className="mr-2 h-4 w-4" />
          New Group
        </Button>

      </div>
      {model}
    </BoxContainer>
  );
}