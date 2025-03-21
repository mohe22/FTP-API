import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import BoxContainer from "@/components/box-container";
import { User, UserSchema } from "@/lib/definition";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/components/loading";
import axiosInstance from "@/lib/axios";

interface UserProfileProps {
  userData: User;
}

interface Group {
  id: number;
  group_name: string;
}

export function UserProfile({ userData }: UserProfileProps) {
  const form = useForm<User>({
    resolver: zodResolver(UserSchema),
    defaultValues: {
      avatar: userData.avatar || "",
      bio: userData.bio || "",
      email: userData.email || "",
      groups: userData.groups || [],
      id: userData.id || 0,
      is_admin: userData.is_admin || false,
      last_active: userData.last_active || "",
      location: userData.location || "",
      phone: userData.phone || "",
      status: userData.status || "Active",
      username: userData.username || "",
    },
  });

  const {
    data: groups,
  } = useQuery({
    queryKey: ["get-group"],
    queryFn: async () => {
   
      const response = await axiosInstance.get(`/admin/groups/get`);

      return response.data.message as Group[];
    },
  });

  const onSubmit = async (data: User) => {
    try {
      const updatedData = {
        ...data,
        groups: data.groups
          .map((group) => group.trim())
          .filter((group) => group.length > 0),
      };
      await axiosInstance.patch(`/admin/users/update/${userData.id}`, updatedData);
      toast.success("The user profile has been updated successfully.");
    } catch (error: any) {
      const msg = error.response?.data?.detail || "Unexpected Error";
      toast.error(msg);
    }
  };

  // Function to handle adding a group
  const handleAddGroup = (groupName: string) => {
    const currentGroups = form.getValues("groups");
    if(!currentGroups.includes(groupName)){
      form.setValue("groups", [...currentGroups, groupName]);
    }

  };

  
  // Function to handle deleting a group
  const handleDeleteGroup = (groupName: string) => {
    const currentGroups = form.getValues("groups");
    form.setValue(
      "groups",
      currentGroups.filter((group) => group !== groupName)
    );
  };
 
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <BoxContainer>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>
              View and update user profile information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-x-6 sm:space-y-0">
              <Avatar className="h-32 w-32">
                <AvatarImage src={form.getValues("avatar")!} />
                <AvatarFallback className="text-4xl">
                  {form
                    .getValues("username")
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">
                  {form.getValues("username")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {form.getValues("email")}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" type="button" size="sm">
                    Upload Picture
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    className="text-destructive"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel>Groups</FormLabel>
                <div className="flex flex-row gap-2">
                  <Select onValueChange={handleAddGroup}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a group" />
                    </SelectTrigger>
                    <SelectContent>
                      {groups &&
                        groups.map((group: Group) => (
                          <SelectItem  key={group.id} value={group.group_name}>
                            {group.group_name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <div className="flex flex-wrap gap-2">
                    {form.watch("groups").map((group) => (
                      <Badge key={group} className="flex items-center gap-1">
                        {group}
                        <button
                          type="button"
                          onClick={() => handleDeleteGroup(group)}
                          className="hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </FormItem>

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter location" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea rows={4} placeholder="Enter bio" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => form.reset()}
            >
              Cancel
            </Button>
            <Button type="submit" className="cursor-pointer">
              {form.formState.isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Save Changes"
              )}
            </Button>
          </CardFooter>
        </BoxContainer>
      </form>
    </Form>
  );
}