import axiosInstance from "@/lib/axios";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";

const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB

export interface DownloadProgress {
  [key: string]: {
    percentage: number;
    loading: boolean;
    file_name: string;
    paused: boolean;
    chunks: { loaded: number; total: number }[];
  };
}

export function useDownload() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const params = searchParams.get("path") || "";
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress>({});

  
  const handleDownload = async (fileName: string) => {
    setDownloadProgress((prev) => ({
      ...prev,
      [fileName]: {
        percentage: 0,
        loading: true,
        file_name: fileName,
        paused: false,
        chunks: [],
      },
    }));
  
    try {
      const headRes = await axiosInstance.get(
        `/files/download`,
        {
          params: { file_name: fileName, path: params },
        }
      )
  
  
      const fileSize = parseInt(headRes.headers["content-length"], 10);
      if (isNaN(fileSize) || fileSize <= 0) {
        throw new Error("Invalid content-length header");
      }
  
      const totalChunks = Math.ceil(fileSize / CHUNK_SIZE);
      const initialChunks = Array(totalChunks).fill({ loaded: 0, total: CHUNK_SIZE });
      setDownloadProgress((prev) => ({
        ...prev,
        [fileName]: { ...prev[fileName], chunks: initialChunks },
      }));
  
      const chunks: Blob[] = [];
      for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, fileSize) - 1;
  
        const response = await axiosInstance.get(
          "/files/download",
          {
            params: { file_name: fileName, path: params },
            headers: { Range: `bytes=${start}-${end}` },
            responseType: "blob",
            withCredentials: true,
            onDownloadProgress: (e) => {
              setDownloadProgress((prev) => {
                const newChunks = [...prev[fileName].chunks];
                newChunks[i] = { loaded: e.loaded, total: e.total || CHUNK_SIZE };
                return {
                  ...prev,
                  [fileName]: {
                    ...prev[fileName],
                    chunks: newChunks,
                    percentage: Math.round(
                      (newChunks.reduce((sum, c) => sum + c.loaded, 0) / fileSize) * 100
                    ),
                  },
                };
              });
            },
          }
        );
        chunks.push(response.data);
      }
  
      const blob = new Blob(chunks);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.click();
      window.URL.revokeObjectURL(url);
  
      setDownloadProgress((prev) => ({
        ...prev,
        [fileName]: { ...prev[fileName], percentage: 100, loading: false },
      }));
      toast.success(`${fileName} downloaded!`);
    } catch (error) {
      console.error("Download error:", error);
      toast.error(`Failed to download ${fileName}`);
      setDownloadProgress((prev) => ({
        ...prev,
        [fileName]: { ...prev[fileName], loading: false },
      }));
    }
  };
  return { handleDownload, downloadProgress };
}