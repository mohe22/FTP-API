import axiosInstance from "@/lib/axios";
import { SplitFile } from "@/lib/split-file";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";



export interface UploadProgress {
  [key: string]: {
    percentage: number;
    loading: boolean;
    file_name: string;
    paused: boolean; 
  };
}

export function useUpload() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const params = searchParams.get("path") || "";
  const CHUNK_SIZE = 10 * 1024 * 1024; 
  const client = useQueryClient();
  const [loading, setLoading] = useState<UploadProgress>({});

  const handleUpload = async (files: File[]) => {
    const initialLoadingState:UploadProgress= {};
    files.forEach((file, index) => {
      initialLoadingState[index] = {
        percentage: 0,
        loading: false,
        file_name: file.name,
        paused: false
      };
    });
    setLoading(initialLoadingState);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setLoading((prev) => ({
        ...prev,
        [i]: { percentage: 0, loading: true,file_name:file.name,paused:false },
      }));

      const chunks = SplitFile(file, CHUNK_SIZE);
      const totalSize = file.size;
      let uploadedSize = 0;

      const uploadChunk = async (chunk: Blob, index: number, retries = 3) => {
        const formData = new FormData();
        formData.append("chunk_data", chunk, file.name);
        
        try {
          const response = await axiosInstance.post(
            "/files/upload-chunk",
            formData,
            {
              withCredentials: true,
              params: {
                file_id: file.name,
                chunk_number: index,
                total_chunks: chunks.length,
                path: params,
              },
              onUploadProgress: (progressEvent) => {
                const chunkUploadedSize = progressEvent.loaded;
                uploadedSize = Math.min(uploadedSize + chunkUploadedSize, totalSize);

                const percentCompleted = Math.round((uploadedSize / totalSize) * 100);
                const cappedPercentage = Math.min(percentCompleted, 100);

                setLoading((prev) => ({
                  ...prev,
                  [i]: { percentage: cappedPercentage, loading: true,file_name:file.name,paused:false },
                }));
              },
            }
          );

          if (response.status !== 200) {
            throw new Error(`Failed to upload chunk ${index} of file ${file.name}`);
          }
        } catch (error: any) {
          if (retries > 0) {
            console.warn(`Retrying chunk ${index} of file ${file.name}. Attempts left: ${retries}`);
            await uploadChunk(chunk, index, retries - 1);
          } else {
            throw new Error(`Failed to upload chunk ${index} of file ${file.name} after multiple attempts: ${error.message}`);
          }
        }
      };

      try {
        const chunkPromises = chunks.map((chunk, index) => uploadChunk(chunk, index));
        await Promise.all(chunkPromises);
        setLoading((prev) => ({
          ...prev,
          [i]: { percentage: 100, loading: false,file_name:file.name,paused:false },
        }));
        client.invalidateQueries({ queryKey: ["list-directory", params] });
        toast.success(`File ${file.name} uploaded successfully!`);
      } catch (error: any) {
        console.error(`Error uploading file ${file.name}:`, error);
        setLoading((prev) => ({
          ...prev,
          [i]: { percentage: 0, loading: false,file_name:file.name,paused:false },
        }));
        alert(`Error loading file ${file.name}: ${error.message}`);
      }
    }
  };




  return { handleUpload, loading };
}