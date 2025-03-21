
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { File, Folder, ImageIcon, FileText, FileArchive, Download, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function InterfaceShowcase() {
  const [activeTab, setActiveTab] = useState("table")

  const mockFiles = [
    { name: "Documents", type: "folder", size: "-", modified: "2023-12-10" },
    { name: "Images", type: "folder", size: "-", modified: "2023-12-15" },
    { name: "report.pdf", type: "pdf", size: "2.5 MB", modified: "2023-12-20" },
    { name: "presentation.pptx", type: "document", size: "4.2 MB", modified: "2023-12-18" },
    { name: "data.xlsx", type: "spreadsheet", size: "1.8 MB", modified: "2023-12-22" },
    { name: "archive.zip", type: "archive", size: "15.7 MB", modified: "2023-12-05" },
    { name: "profile.jpg", type: "image", size: "3.1 MB", modified: "2023-12-12" },
  ]

  const getFileIcon = (type: string) => {
    switch (type) {
      case "folder":
        return <Folder className="h-5 w-5 text-blue-600" />
      case "image":
        return <ImageIcon className="h-5 w-5 text-blue-600" />
      case "pdf":
        return <FileText className="h-5 w-5 text-blue-600" />
      case "document":
        return <FileText className="h-5 w-5 text-blue-600" />
      case "spreadsheet":
        return <FileText className="h-5 w-5 text-blue-600" />
      case "archive":
        return <FileArchive className="h-5 w-5 text-blue-600" />
      default:
        return <File className="h-5 w-5 text-blue-600" />
    }
  }

  return (
    <section id="interface" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Intuitive User Interface</h2>
            <p className="text-lg text-muted-foreground">
              Our modern interface makes file management a breeze with multiple view options and intuitive controls.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="bg-background border rounded-xl shadow-lg overflow-hidden max-w-5xl mx-auto"
        >
          <div className="p-4 border-b bg-muted/30">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <div className="ml-2 text-sm font-medium">SecureShare FTP Client</div>
            </div>
          </div>

          <div className="p-6">
            <Tabs defaultValue="table" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex justify-between items-center mb-6">
                <TabsList>
                  <TabsTrigger
                    value="table"
                    className="data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900/30"
                  >
                    Table View
                  </TabsTrigger>
                  <TabsTrigger
                    value="tree"
                    className="data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900/30"
                  >
                    Tree View
                  </TabsTrigger>
                </TabsList>
                <div className="text-sm text-muted-foreground">Current path: /home/user</div>
              </div>

              <AnimatePresence mode="wait">
                <TabsContent value="table" className="mt-0">
                  <motion.div
                    key="table"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Size</TableHead>
                            <TableHead>Modified</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {mockFiles.map((file, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {getFileIcon(file.type)}
                                  <span>{file.name}</span>
                                </div>
                              </TableCell>
                              <TableCell className="capitalize">{file.type}</TableCell>
                              <TableCell>{file.size}</TableCell>
                              <TableCell>{file.modified}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {file.type !== "folder" && (
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <Download className="h-4 w-4" />
                                      <span className="sr-only">Download</span>
                                    </Button>
                                  )}
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Share2 className="h-4 w-4" />
                                    <span className="sr-only">Share</span>
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </motion.div>
                </TabsContent>

                <TabsContent value="tree" className="mt-0">
                  <motion.div
                    key="tree"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {mockFiles.map((file, index) => (
                        <motion.div
                          key={index}
                          whileHover={{ scale: 1.03 }}
                          className="border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex flex-col items-center gap-2 text-center">
                            <div className="p-3 rounded-lg bg-muted/50">{getFileIcon(file.type)}</div>
                            <div className="font-medium truncate w-full">{file.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {file.type === "folder" ? "Directory" : file.size}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </TabsContent>
              </AnimatePresence>
            </Tabs>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

