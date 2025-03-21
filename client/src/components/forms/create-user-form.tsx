import { CreateUserSchema, UserFormType } from "@/lib/definition";
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
import { Switch } from "../ui/switch";
import { Loader2 } from "lucide-react";

export default function CreateUserForm({ onClose ,AddUser}: { onClose: () => void,AddUser:(data:UserFormType)=>void }) {
  const form = useForm<UserFormType>({
    resolver: zodResolver(CreateUserSchema),
    defaultValues: {
      username: "",
      password: "",
      email: "",
      location: "",
      phone: "",
      bio: "",
      is_admin: false,
      avatar: null,
    },
  });

  const onSubmit = async (data: UserFormType) => {
    AddUser(data)
    onClose();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Username Field */}
        <div className="flex flex-row items-center w-full gap-x-2">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="Enter username" {...field} />
                </FormControl>
                {/* <FormDescription>
                This is your public display name.
              </FormDescription> */}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Enter email" {...field} />
                </FormControl>
                {/* <FormDescription>
                Please enter a valid email address.
              </FormDescription> */}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-row gap-x-2 w-full items-center">
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="Enter location" {...field} />
                </FormControl>
                <FormDescription>Your location (optional).</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Phone Field */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="Enter phone number" {...field} />
                </FormControl>
                <FormDescription>Your phone number (optional).</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter password"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Password must be at least 8 characters long.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Bio Field */}
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter bio" {...field} />
              </FormControl>
              <FormDescription>
                A short description about yourself (optional).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Is Admin Field */}
        <FormField
          control={form.control}
          name="is_admin"
          render={({ field }) => (
            <FormItem className="flex flex-row  justify-between items-start">
              <FormLabel>Is Admin</FormLabel>
              <div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button type="submit" className="w-full">
          {form.formState.isLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            "Creating User..."
          )}
        </Button>
      </form>
    </Form>
  );
}
