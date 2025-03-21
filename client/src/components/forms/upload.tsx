import type React from "react";
import { useState, useRef, JSX } from "react";
import {
  Upload,
  X,
  Image,
  UploadCloudIcon,
  Video,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";


const FileUploadZone = ({
  handleDownload,
  onclose
  
}: {
  handleDownload: (files: File[]) => Promise<void>;
  onclose: () => void
}): JSX.Element => {
  const [draggedZone, setDraggedZone] = useState<number | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (index: number) => (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedZone(index);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedZone(null);
  };

  const handleUpload = async () => {
    
    await handleDownload(files);
    onclose();
  };
  const handleDrop = (index: number) => async (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedZone(null);
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      setFiles((prevFiles) => [...prevFiles, ...droppedFiles]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
    }
  };
  const removeFile = (index: number) => {
    setFiles((prevFiles) => {
      const newFiles = [...prevFiles];
      newFiles.splice(index, 1);
      return newFiles;
    });
  };
  const zones = [
    {
      title: "Upload Images",
      subtitle: "Drop images here",
      icon: Image,
      gradient: "from-purple-400 via-pink-500 to-red-500",
      rotate: "-rotate-2",
    },
    {
      title: "Upload Videos",
      subtitle: "Drop videos here",
      icon: Video,
      gradient: "from-blue-400 via-teal-500 to-green-500",
      rotate: "",
    },
    {
      title: "Upload Files",
      subtitle: "Drop files here",
      icon: UploadCloudIcon,
      gradient: "from-yellow-400 via-orange-500 to-red-500",
      rotate: "rotate-3",
    },
  ];


  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleUpload();
      }}
    >
      <Card className="mx-auto w-full overflow-hidden rounded-[1rem]">
        <CardContent className="p-6 cursor:pointer">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
            {zones.map((zone, index) => (
              <div key={index} className={`relative ${zone.rotate}`}>
                <motion.div
                  onDragEnter={handleDragEnter(index)}
                  onDragOver={(e: { preventDefault: () => any }) =>
                    e.preventDefault()
                  }
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop(index)}
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative h-full"
                >
                  <div
                    className={`
                      absolute inset-0 -z-10 rounded-xl bg-gradient-to-br ${
                        zone.gradient
                      }
                      opacity-0 blur-md transition-opacity duration-300
                      ${
                        draggedZone === index
                          ? "opacity-70"
                          : "group-hover:opacity-70"
                      }
                    `}
                  />
                  <Card className="relative h-full rounded-[1rem] overflow-hidden border-2 border-dashed border-gray-200 dark:border-gray-800 transition-colors duration-300 group-hover:border-transparent">
                    <CardContent className="flex h-full flex-col items-center justify-center p-6 text-center">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        className="rounded-full bg-gray-100 dark:bg-gray-800 p-3 mb-4"
                      >
                        <zone.icon className="h-8 w-8 text-gray-500" />
                      </motion.div>
                      <h3 className="mb-1 text-sm font-medium">{zone.title}</h3>
                      <p className="text-xs text-gray-500">{zone.subtitle}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            ))}
          </div>
            
          <AnimatePresence>
                {files.map((file, index) => (
                  <motion.div
                    key={`${file.name}-${index}`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center relative justify-between bg-gray-100 dark:bg-gray-800 rounded-[1rem] p-2 mb-2"
                  >
                    <span className="truncate text-sm text-gray-700 dark:text-gray-300 ml-2">
                      {file.name}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      onClick={() => removeFile(index)}
                      className="h-6 w-6 p-0 right-2 cursor-pointer absolute hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>

                   
                  </motion.div>
                ))}
              </AnimatePresence>

          <div className="text-center">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              multiple
            />
            <div className="flex flex-col">
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="rounded-[1rem] mt-5"
                type="button"
              >
                <Upload className="mr-2 h-4 w-4" />
                 Choose Files
              </Button>
              {files.length > 0 && (
                <Button
                  variant={"outline"}
                  type="submit"
                  className="rounded-[1rem] cursor-pointer mt-4 w-full"
                >
                  Upload
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};

export default FileUploadZone;
