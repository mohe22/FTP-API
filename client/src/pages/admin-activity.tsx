import { ActivityLogTable } from "@/components/admin-dashboard/activity";

export default function AdminActivity() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Activity Logs</h1>
      </div>
      <div className="space-y-4">
        <ActivityLogTable />
      </div>
    </div>
  )
}
