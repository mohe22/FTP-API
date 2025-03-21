import { Plus } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import useListDirectory from "@/hooks/use-list-directory";
import { useForm } from "react-hook-form";
import { Input } from "../ui/input";
import { useState } from "react";

export default function CreateDirectory() {
  const { createDirectory } = useListDirectory();
  const { register, handleSubmit, reset } = useForm<{ folderName: string }>();
  const [isOpen, setIsOpen] = useState(false);

  const onSubmit = async (data: { folderName: string }) => {
    createDirectory({ name: data.folderName });
    reset();
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size={"sm"}>
          <Plus className="lg:flex hidden" />
          <span>New Folder</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
          <DialogDescription>
            Enter a name for the new folder.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <Input
            {...register("folderName", { required: "Folder name is required" })}
            placeholder="Enter folder name"
          />
          <Button type="submit" className="w-full">
            Create Folder
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}