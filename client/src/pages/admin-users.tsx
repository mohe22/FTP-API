import { UsersTable } from "@/components/admin-dashboard/admin-useres/users-table";


export default function AdminUsers() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
      </div>
      <div className="space-y-4">
        <UsersTable />
      </div>
    </div>
  )
}

