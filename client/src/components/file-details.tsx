import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { FileExtensionIcon } from "@/utils/file-extension-icon";
import { useUser } from "@/hooks/user";
import { LinkIcon, Plus, X } from "lucide-react";
import { Badge } from "./ui/badge";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import BoxContainer from "./box-container";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { FolderIcon } from "@/utils/data";
import useModal from "@/hooks/use-model";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import EditFileGroup from "./forms/edit-file-group";

interface File {
  type: string;
  size: string;
  extension: string;
  last_scan: string;
  scan_status: string;
  name: string;
  full_path: string;
  last_modified: string;
  created: string;
  owner_name:string,
  contents?: {
    files: number;
    folders: number;
  };
  groups: {
    id: number;
    group_name: string;
    permissions: {
      read: boolean;
      write: boolean;
      execute: boolean;
      delete: boolean;
      change_owner: boolean;
      full_control: boolean;
      special_permissions: boolean;
      Modify: boolean;
    };
  }[];
}

export function FileDetails() {
  const location = useLocation();
  const nav = useNavigate();
  const { user } = useUser();
  const is_admin = user?.is_admin;
  const searchParams = new URLSearchParams(location.search);
  const path = searchParams.get("path") || "";
  const details = searchParams.get("details") || "";
  const [Modal, showModal] = useModal();

  const form = useForm({
    defaultValues: {
      groups: [] as File["groups"],
    },
  });

  const { data: file, isLoading ,refetch } = useQuery({
    queryKey: ["file-details", details],
    queryFn: async () => {
      const response = await axiosInstance.get("/files/get-file", {
        params: {
          path: `${path}/${details}`,
        },
      });
      return response.data as File;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (file) {
      form.reset({ groups: file.groups });
    }
  }, [file]);
  const transformPermissions = (permissions: {
    read: boolean;
    write: boolean;
    execute: boolean;
    delete: boolean;
    change_owner: boolean;
    full_control: boolean;
    special_permissions: boolean;
    Modify: boolean;
  }): string[] => {
    const permissionList: string[] = [];
    if (permissions.read) permissionList.push("Read");
    if (permissions.write) permissionList.push("Write");
    if (permissions.execute) permissionList.push("execute");
    if (permissions.delete) permissionList.push("Delete");
    if (permissions.full_control) permissionList.push("Full Control");
    if (permissions.Modify) permissionList.push("Modify");
    return permissionList;
  };

  const hasPermissionsChanged = (
    initialPermissions: File["groups"][number]["permissions"],
    currentPermissions: File["groups"][number]["permissions"]
  ): boolean => {
    return (
      initialPermissions.read !== currentPermissions.read ||
      initialPermissions.write !== currentPermissions.write ||
      initialPermissions.execute !== currentPermissions.execute ||
      initialPermissions.delete !== currentPermissions.delete ||
      initialPermissions.full_control !== currentPermissions.full_control ||
      initialPermissions.Modify !== currentPermissions.Modify
    );
  };
  const onSubmit = async (data: { groups: File["groups"] }) => {
    try {
      // Find groups that have been modified
      const updatedGroups = data.groups.filter((group, index) => {
        const initialGroup = file?.groups[index];
        return (
          initialGroup &&
          hasPermissionsChanged(initialGroup.permissions, group.permissions)
        );
      });

      for (const group of updatedGroups) {
        const permissions = transformPermissions(group.permissions);
        await axiosInstance.patch(
          `/admin/groups/update-permissions/${group.id}`,
          { permissions }
        );
      }

      toast.success("Permissions updated successfully!");
    } catch (error: any) {
      const msg = error.response?.data?.detail || "Unexpected Error";
      toast.error(msg);
    }
  };
  if (!details) return null;

  if (isLoading || !file) {
    return (
      <BoxContainer className="mt-4 lg:max-w-sm w-full p-2">
        <div className="p-3">
          <CardHeader className="p-0 mb-2">
            <CardTitle>
              <div className="flex items-center gap-2 truncate">
                <Skeleton className="h-6 w-24" />
              </div>
            </CardTitle>
            <CardDescription>
              <Skeleton className="h-4 w-32" />
            </CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="space-y-4 p-0 pt-2">
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index}>
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 3 }).map((_, groupIndex) => (
                <div key={groupIndex}>
                  <Skeleton className="h-4 w-16 mb-2" />
                  <div className="space-y-2">
                    {Array.from({ length: 7 }).map((_, permissionIndex) => (
                      <div
                        key={permissionIndex}
                        className="flex items-center space-x-2"
                      >
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </div>
      </BoxContainer>
    );
  }


  
  return (
    <BoxContainer className="mt-4 lg:max-w-lg w-full p-2">
      <div className="p-3">
        <CardHeader className="p-0 mb-2">
          <CardTitle className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2 truncate">
              <div>
                {file.type === "Folder" ? (
                  <FolderIcon />
                ) : (
                  FileExtensionIcon({ file_name: file.name })
                )}
              </div>
              <span className="truncate">{file.name}</span>
            </div>
            <Button 
              onClick={
                () => {
                  const searchParams = new URLSearchParams(location.search);
                  searchParams.delete("details"); 
                  nav({ search: searchParams.toString() });
                }
                
              }
              size={"icon"} className=" size-6" variant={"outline"}>
              <X/>
            </Button>
          </CardTitle>
          <CardDescription>
            {file.type === "Folder"
              ? `Contains: ${file.contents?.files || 0} Files, ${
                  file.contents?.folders || 0
                } Folders`
              : file.type}
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="space-y-4 p-0 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Size</p>
              <p className="text-sm text-muted-foreground">{file.size}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Type</p>
              <p className="text-sm text-muted-foreground capitalize">
                {file.type}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Created</p>
              <p className="text-sm text-muted-foreground">{file.created}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Modified</p>
              <p className="text-sm text-muted-foreground">
                {file.last_modified}
              </p>
            </div>
            {file.type === "Folder" && (
              <div>
                <p className="text-sm font-medium">Contains</p>
                <p className="text-sm text-muted-foreground">
                  {file.contents?.folders || 0} folders,{" "}
                  {file.contents?.files || 0} files
                </p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium">Path</p>
              <p className="text-sm text-muted-foreground break-all">
                {file.full_path}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Owner</p>
              <p className="text-sm text-muted-foreground break-all">
                {file.owner_name}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Last Scan</p>
              <p className="text-sm text-muted-foreground">{file.last_scan}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Scan Status</p>
              <Badge>{file.scan_status}</Badge>
            </div>
          </div>
          <Separator />
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid grid-cols-2 gap-2">
                {form.watch("groups").map((group, groupIndex) => (
                  <div key={groupIndex}>
                    {is_admin ? (
                      <a
                        href={`/admin-dashboard/groups/${group.id}`}
                        className="text-sm my-2.5 font-medium flex flex-row gap-x-1 hover:text-white transition-colors items-center"
                      >
                        {group.group_name}
                        <LinkIcon className="size-3 ml-1" />
                      </a>
                    ) : (
                      <p className="text-sm my-2.5 font-medium">
                        {group.group_name}
                      </p>
                    )}
                    <div className="space-y-2">
                      {/* Full Control */}
                      <FormField
                        control={form.control}
                        name={`groups.${groupIndex}.permissions.full_control`}
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!is_admin}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-medium leading-none">
                              Full Control
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                      {/* Read */}
                      <FormField
                        control={form.control}
                        name={`groups.${groupIndex}.permissions.read`}
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!is_admin}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-medium leading-none">
                              Read
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                      {/* Write */}
                      <FormField
                        control={form.control}
                        name={`groups.${groupIndex}.permissions.write`}
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!is_admin}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-medium leading-none">
                              Write
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                      {/* Modify */}
                      <FormField
                        control={form.control}
                        name={`groups.${groupIndex}.permissions.Modify`}
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!is_admin}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-medium leading-none">
                              Modify
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                      {/* Execute */}
                      <FormField
                        control={form.control}
                        name={`groups.${groupIndex}.permissions.execute`}
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!is_admin}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-medium leading-none">
                              Execute
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                      {/* Delete */}
                      <FormField
                        control={form.control}
                        name={`groups.${groupIndex}.permissions.delete`}
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!is_admin}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-medium leading-none">
                              Delete
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                   
                    </div>
                  </div>
                ))}

                {is_admin && (
                  <div
                    onClick={() => {
                      showModal(
                        "Add groups",
                        "Select groups to add the group permissions will be applied to.",
                        () => <EditFileGroup filePath={`${path}/${details}`} refetch={refetch}/>
                      );
                    }}
                    className="border border-dotted p-2 text-muted-foreground text-sm hover:text-white hover:border-white transition-colors cursor-pointer h-full my-2.5 rounded-sm max-w-52 w-full flex items-center gap-x-2 justify-center"
                  >
                    <span>Add groups</span>
                    <Plus className="size-5" />
                  </div>
                )}
              </div>
              {is_admin && (
                <Button
                  type="submit"
                  className="mt-6 cursor-pointer"
                  size={"sm"}
                  variant={"outline"}
                >
                  Apply
                </Button>
              )}
            </form>
          </Form>
        </CardContent>
      </div>
      {Modal}
    </BoxContainer>
  );
}
