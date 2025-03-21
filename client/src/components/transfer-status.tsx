import { useState } from "react";
import { ArrowUp } from "lucide-react";
import { FileExtensionIcon } from "@/utils/file-extension-icon";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@radix-ui/react-scroll-area";

interface TransferStatusProps {
  mainItem:{
    percentage: number;
    loading: boolean;
    file_name: string;
    paused: boolean;
    chunks?: {
        loaded: number;
        total: number;
    }[];
  }
  Items:{
    percentage: number;
    loading: boolean;
    file_name: string;
    paused: boolean
    chunks?: {
      loaded: number;
      total: number;
  }[];
  }[]
  className?: string;
}

export default function TransferStatus({ mainItem, Items, className }: TransferStatusProps) {
  const [isPanelVisible, setIsPanelVisible] = useState(false);

  const togglePanelVisibility = () => {
    setIsPanelVisible((prev) => !prev);
  };

  if (!mainItem) return null;

  return (
    <AnimatePresence>
      <motion.div
        className={`fixed bottom-0 right-12 max-w-[250px] lg:max-w-[350px] w-full rounded-sm border bg-muted shadow-lg z-50 overflow-hidden ${className}`}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="flex flex-row justify-between p-2 items-center">
          <div className="flex flex-row gap-x-2">
            {mainItem.file_name && <FileExtensionIcon className="size-4 mt-1" file_name={mainItem.file_name} />}
            <div className="flex flex-col">
                
              <span className="text-sm">{mainItem.file_name}</span>
              <span className="text-xs text-muted-foreground">{mainItem.percentage}%</span>
            </div>
          </div>

          <motion.div animate={{ rotate: isPanelVisible ? 180 : 0 }} transition={{ duration: 0.3, ease: "easeInOut" }}>
            <ArrowUp className="size-4 mb-0.5 cursor-pointer" onClick={togglePanelVisibility} />
          </motion.div>
        </div>

        <AnimatePresence>
          {isPanelVisible && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <ScrollArea className="h-[200px] overflow-y-scroll overflow-x-hidden">
                <div className="p-2 border-t">
                  <div className="space-y-2">
                    {Items.map((file, index) => (
                      <div key={index} className="flex items-center gap-x-3">
                        <FileExtensionIcon className="size-4" file_name={file.file_name!} />
                        <div className="flex-1">
                          <span className="text-sm">{file.file_name}</span>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-blue-500 my-2 h-1.5 rounded-full"
                              style={{ width: `${file.percentage}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">{file.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollArea>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}