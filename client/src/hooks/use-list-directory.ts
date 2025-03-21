import axiosInstance from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function useListDirectory() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const path = searchParams.get("path") || "";
  const navigate = useNavigate();
 
  const client = useQueryClient();

  const handleGetMoreInfo = (name: string) => {
    navigate(`${location.pathname}?path=${path}&details=${name}`);
  };
  
  const handleFolderClick = (folderName: string) => {
    const newPath = path ? `${path}/${folderName}` : folderName;
    navigate(`${location.pathname}?path=${newPath}`);
  };

  const { data: DirectoryList, isLoading: isLoadingDirectory } = useQuery({
    queryKey: ["list-directory", path],
    queryFn: async () => {
      const response = await axiosInstance.get("/files/list-directory", {
        params: {
          path: path ? path : "",
        },
      });
      return response.data.message;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const { mutate: moveFileTo, isPending: isMoving } = useMutation({
    mutationFn: async ({ from, to }: { from: string; to: string }) => {
      const response = await axiosInstance.post("/files/move", null, {
        params: {
          fromPath: `${path}/${from}`,
          toPath: `${path}/${to}`,
        },
      });
      return response.data.message;
    },
    onSuccess(data, variables) {
      client.invalidateQueries({ queryKey: ["list-directory", path] });
      toast.success(`File moved successfully to ${variables.to}`);
    },
    onError: (error: any) => {
      const errMsg =
        error.response?.data?.detail ||
        "An error occurred while moving the file.";
      toast.error("Move failed", {
        description: errMsg,
      });
    },
  });

  const { mutate: createDirectory } = useMutation({
    mutationFn: async ({ name }: { name: string }) => {
      const response = await axiosInstance.put("/files/create-directory", null, {
        params: {
          path: `${path}/${name}`,
        },
      });
      return response.data;
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["list-directory", path] });
      toast.success("Folder created successfully");
    },
    onError: (error: any) => {
      const errMsg =
        error.response?.data?.detail ||
        "An error occurred while creating the directory or folder.";
      toast.error("Creation failed", {
        description: errMsg,
      });
    },
  });

  const { mutate: deleteFile, isPending: deletePending } = useMutation({
    mutationFn: async ({ name, force }: { name: string; force?: boolean }) => {
      const response = await axiosInstance.delete("/files/delete", {
        params: {
          path: `${path}/${name}`,
          force: force || false,
        },
      });
      return response.data;
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["list-directory", path] });
      toast.success("File or folder deleted successfully");
    },
    onError: (error: any, data: { name: string; force?: boolean }) => {
      const errMsg =
        error.response?.data?.detail ||
        "An error occurred while deleting the file or folder.";
      if (errMsg.includes("Folder is not empty")) {
        toast.error("Cannot delete folder", {
          description: errMsg,
          action: {
            label: "Delete anyway",
            onClick: () => {
              deleteFile({ name: data.name, force: true });
            },
          },
        });
      } else {
        toast.error("Deletion failed", {
          description: errMsg,
        });
      }
    },
  });

  return {
    DirectoryList,
    isLoadingDirectory,
    handleFolderClick,
    deleteFile,
    deletePending,
    createDirectory,
    moveFileTo,
    isMoving,
    handleGetMoreInfo
  };
}