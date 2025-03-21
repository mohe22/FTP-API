
import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Users, UserPlus, UserMinus, Shield, Activity, Settings } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export function AdminFeatures() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  const mockUsers = [
    { id: 1, username: "john_doe", status: "active", lastLogin: "2023-12-22 14:30", permissions: "Read/Write" },
    { id: 2, username: "jane_smith", status: "active", lastLogin: "2023-12-21 09:15", permissions: "Read Only" },
    { id: 3, username: "admin_user", status: "active", lastLogin: "2023-12-22 16:45", permissions: "Admin" },
    { id: 4, username: "guest_user", status: "inactive", lastLogin: "2023-12-10 11:20", permissions: "Read Only" },
  ]

  const adminFeatures = [
    {
      icon: <Users className="h-10 w-10 text-blue-600" />,
      title: "User Management",
      description: "Create, modify, and delete user accounts with ease.",
    },
    {
      icon: <Shield className="h-10 w-10 text-blue-600" />,
      title: "Permission Control",
      description: "Set granular permissions for files and folders.",
    },
    {
      icon: <Activity className="h-10 w-10 text-blue-600" />,
      title: "Activity Monitoring",
      description: "Track user activity and file operations in real-time.",
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  }

  return (
    <section id="admin" className="py-20 bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Admin Controls</h2>
            <p className="text-lg text-muted-foreground">
              Take full control of your FTP server with comprehensive administrative tools and features.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <motion.div
            ref={ref}
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="grid grid-cols-1 gap-6"
          >
            {adminFeatures.map((feature, index) => (
              <motion.div key={index} variants={itemVariants} className="bg-background border rounded-xl p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-muted/50">{feature.icon}</div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Admin Dashboard</CardTitle>
                <CardDescription>Manage users and monitor server activity</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="users">
                  <TabsList className="mb-4">
                    <TabsTrigger value="users">Users</TabsTrigger>
                    <TabsTrigger value="activity">Activity</TabsTrigger>
                  </TabsList>
                  <TabsContent value="users">
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Username</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Last Login</TableHead>
                            <TableHead>Permissions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {mockUsers.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell className="font-medium">{user.username}</TableCell>
                              <TableCell>
                                <Badge variant={user.status === "active" ? "default" : "secondary"}>
                                  {user.status}
                                </Badge>
                              </TableCell>
                              <TableCell>{user.lastLogin}</TableCell>
                              <TableCell>{user.permissions}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <motion.div whileHover={{ scale: 1.05 }} className="flex-1">
                        <Card className="bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800">
                          <CardContent className="p-4 flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Add User</p>
                            </div>
                            <UserPlus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </CardContent>
                        </Card>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} className="flex-1">
                        <Card className="bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800">
                          <CardContent className="p-4 flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Edit Permissions</p>
                            </div>
                            <Settings className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </CardContent>
                        </Card>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} className="flex-1">
                        <Card className="bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800">
                          <CardContent className="p-4 flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Remove User</p>
                            </div>
                            <UserMinus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </CardContent>
                        </Card>
                      </motion.div>
                    </div>
                  </TabsContent>
                  <TabsContent value="activity">
                    <div className="space-y-4">
                      <div className="p-4 border rounded-lg bg-muted/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">john_doe uploaded report.pdf</span>
                          <span className="text-xs text-muted-foreground">2 minutes ago</span>
                        </div>
                        <div className="h-2 bg-blue-100 dark:bg-blue-900/30 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 w-full"></div>
                        </div>
                      </div>
                      <div className="p-4 border rounded-lg bg-muted/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">jane_smith downloaded data.xlsx</span>
                          <span className="text-xs text-muted-foreground">15 minutes ago</span>
                        </div>
                        <div className="h-2 bg-blue-100 dark:bg-blue-900/30 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 w-full"></div>
                        </div>
                      </div>
                      <div className="p-4 border rounded-lg bg-muted/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">admin_user modified permissions</span>
                          <span className="text-xs text-muted-foreground">1 hour ago</span>
                        </div>
                        <div className="h-2 bg-blue-100 dark:bg-blue-900/30 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 w-full"></div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

