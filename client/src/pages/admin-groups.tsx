import { GroupsTable } from "@/components/admin-dashboard/admin-group/groups-table";


export default function AdminGroups() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Group Management</h1>
      </div>
      <div className="mt-4">
        <GroupsTable />
      </div>
    </div>
  )
}

