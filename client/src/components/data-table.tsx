import React, { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import BoxContainer from "./box-container";
import FilePath from "./file-path";
import Upload from "./button/upload";
import CreateDirectory from "./button/create-directory";
import { FileDetails } from "./file-details";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onDrop?: (file: TData, folder: TData) => void;
}

export function FileTable<TData, TValue>({
  columns,
  data,
  onDrop,
}: DataTableProps<TData, TValue>) {
  const [filterValue, setFilterValue] = useState("");
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter: filterValue,
    },
    onGlobalFilterChange: setFilterValue,
  });

  const handleDragStart = (e: React.DragEvent, file: TData) => {
    e.dataTransfer.setData("text/plain", JSON.stringify(file));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, folder: TData) => {
    e.preventDefault();
    const file = JSON.parse(e.dataTransfer.getData("text/plain"));
    onDrop && onDrop(file, folder);
  };
  return (
    <div className="flex sm:flex-row flex-col gap-x-2 w-full">
      <div className="flex  flex-1 flex-col space-y-4 pt-1 mt-4">
        <BoxContainer className=" p-2 w-full">
          <Input
            placeholder={`Powefull Search...`}
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            className=" placeholder:font-[500]"
          />
        </BoxContainer>
        <div className="flex mx-2   flex-row items-center justify-between">
          <FilePath />
          <div className="flex flex-row  items-center ">
            <Upload />
            <CreateDirectory />
          </div>
        </div>
        <BoxContainer className="rounded-md border p-0">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => {
                  const isFolder = (row.original as any).is_folder;
                  return (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      onDragOver={isFolder ? handleDragOver : undefined}
                      onDrop={
                        isFolder
                          ? (e) => handleDrop(e, row.original)
                          : undefined
                      }
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          draggable={true}
                          onDragStart={(e) => handleDragStart(e, row.original)}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </BoxContainer>
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
      <FileDetails 
        
      />
    </div>
  );
}
