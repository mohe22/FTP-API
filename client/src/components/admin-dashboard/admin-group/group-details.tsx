import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import BoxContainer from "@/components/box-container";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { UpdateGroupDetails, UpdateGroupDetailsType } from "@/lib/definition";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import Loading from "@/components/loading";
import axiosInstance from "@/lib/axios";

interface GroupDetailsProps {
  groupId: string;
}

export function GroupDetails({ groupId }: GroupDetailsProps) {
  const form = useForm<UpdateGroupDetailsType>({
    resolver: zodResolver(UpdateGroupDetails),
    defaultValues: {
      group_name: "",
      description: "",
      created_at: "",
    },
  });

  const { data: group, isLoading } = useQuery<UpdateGroupDetailsType>({
    queryKey: ["get-group-details", groupId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/admin/groups/get/${groupId}`);
   
      return response.data.message as UpdateGroupDetailsType;
    },
  });

  useEffect(() => {
    if (group) {
      form.reset({
        group_name: group.group_name || "",
        description: group.description || "",
        created_at: group.created_at || "",
      });
    }
  }, [group, form]);

  const handleSave = async (values: UpdateGroupDetailsType) => {
    try {
        await axiosInstance.patch(`/admin/groups/update/${groupId}`, {
          group_name: values.group_name,
          description: values.description,
        });

    
        toast("The group details have been updated successfully.");

    } catch (error:any) {
      const msg = error.response?.data?.detail || "Unexpected Error";
      toast.error(msg)
    }
  };

  console.log(group);
  
  if(isLoading){
    return (
      <div className="flex justify-center items-center h-screen">
        <Loading/>
      </div>
    )
  }
  return (
    <BoxContainer>
      <CardHeader>
        <CardTitle>Group Information</CardTitle>
        <CardDescription>
          View and update group details. {group ? `Created at ${group.created_at}` : ""}
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSave)}>
          <CardContent className="space-y-6">
            <div className=" space-y-2 w-full">
              <FormField
                control={form.control}
                name="group_name"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Group Name</FormLabel>
                    <FormControl>
                      <Input id="group_name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea id="description" rows={4} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex items-center justify-end gap-x-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => form.reset()}
              >
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </CardContent>
        </form>
      </Form>
    </BoxContainer>
  );
}
