import {  FileTable } from "@/components/data-table";
import Nav from "@/components/nav";
import useListDirectory from "@/hooks/use-list-directory";
import {  MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import Loading from "@/components/loading";

import { Checkbox } from "@/components/ui/checkbox";
import { FileExtensionIcon } from "@/utils/file-extension-icon";
import { useDownload } from "@/hooks/use-download";
import TransferStatus from "@/components/transfer-status";
import { FolderIcon } from "@/utils/data";

interface Files {
  is_folder: string;
  size: string;
  time: string;
  name: string;
}

export const columns: ColumnDef<Files>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllRowsSelected()}
        onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const file_name: string = row.getValue("name");
      const isFolder = row.original.is_folder;
      const { handleFolderClick } = useListDirectory();

      return (
        <div
          onClick={() => isFolder && handleFolderClick(file_name)}
          className="flex hover:underline cursor-pointer transition-all flex-row items-center gap-x-2"
        >
          {isFolder ? (
            <FolderIcon />
          ) : (
            <FileExtensionIcon file_name={file_name} />
          )}
          {file_name}
        </div>
      );
    },
  },
  {
    accessorKey: "size",
    header: "Size",
    cell: ({ row }) => <div>{row.getValue("size")}</div>,
  },
  {
    accessorKey: "time",
    header: "Time",
    cell: ({ row }) => <div>{row.getValue("time")}</div>,
  },

  {
    id: "actions",
    header: "Actions",
    enableHiding: false,
    cell: ({ row }) => {
      const { deleteFile ,handleGetMoreInfo} = useListDirectory();
      const { handleDownload, downloadProgress } = useDownload();
      const file = row.original;

      const getFirstActiveFileLoading = Object.values(downloadProgress).find(
        (file) => file.loading === true
      );
      console.log(file);
      
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => deleteFile({ name: file.name })}>
              Delete
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={()=>handleGetMoreInfo(file.name)}>View details</DropdownMenuItem>
            {!file.is_folder && <DropdownMenuItem onClick={() => handleDownload(file.name)}>
              Download
            </DropdownMenuItem>}
          </DropdownMenuContent>
          {downloadProgress && getFirstActiveFileLoading && (
            <TransferStatus
              mainItem={getFirstActiveFileLoading}
              Items={Object.values(downloadProgress)}
            />
          )}
        </DropdownMenu>
      );
    },
  },
];
export default function Home() {
  const { DirectoryList, isLoadingDirectory, moveFileTo } = useListDirectory();

  const handleDrop = (file: Files, folder: Files) => {
    if (folder.is_folder) {
      moveFileTo({ from: file.name, to: folder.name as string });
    }
  };

  if (!DirectoryList || isLoadingDirectory) {
    return (
      <div>
        <div className="h-screen w-screen flex items-center justify-center">
          <Loading />
        </div>
      </div>
    );
  }

  return (
    <main>
      <Nav />
      <div className="flex flex-col m-5  ">
          <FileTable
            columns={columns}
            data={DirectoryList}
            onDrop={handleDrop}
          />
      </div>
    </main>
  );
}
