import { CreateGroupSchema, CreateGroupSchemaType } from "@/lib/definition";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "../ui/textarea";
import { Loader2 } from "lucide-react";

export default function CreateGroup({ onClose,handleCreateGroup }: { onClose: () => void,    handleCreateGroup:(data:CreateGroupSchemaType)=>void}) {
  const form = useForm<CreateGroupSchemaType>({
    resolver: zodResolver(CreateGroupSchema),
    defaultValues: {
        name:"",
        description:""
    },
  });

  const onSubmit = async (data: CreateGroupSchemaType) => {
    handleCreateGroup(data)
    onClose();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

    
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descriptions</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter Group description" {...field} />
              </FormControl>
              <FormDescription>
                A short description about Group (optional).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          {form.formState.isLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            "Creating Grpup"
          )}
        </Button>
      </form>
    </Form>
  );
}
