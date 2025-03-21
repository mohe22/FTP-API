

import { useState, useEffect } from "react"
import {  CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import BoxContainer from "../box-container"

export function ActiveUsersChart() {
  const [activeTab, setActiveTab] = useState("daily")
  const [chartData, setChartData] = useState<number[]>([])

  // Generate random chart data based on the selected time period
  useEffect(() => {
    const generateData = () => {
      const dataPoints = activeTab === "daily" ? 24 : activeTab === "weekly" ? 7 : 30
      return Array.from({ length: dataPoints }, () => Math.floor(Math.random() * 50) + 10)
    }

    setChartData(generateData())
  }, [activeTab])

  // Find the max value for scaling
  const maxValue = Math.max(...chartData)

  return (
    <BoxContainer>
      <CardHeader className="flex flex-row items-center justify-between  pb-2">
        <CardTitle>Active Users</CardTitle>
        <Tabs defaultValue="daily" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] mb-6 w-full">
          <div className="flex h-full items-end gap-2">
            {chartData.map((value, i) => (
              <div
                key={i}
                className="relative flex-1 rounded-md bg-primary"
                style={{ height: `${(value / maxValue) * 100}%` }}
              >
                <div className="absolute -top-7 w-full text-center text-xs text-muted-foreground">{value}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-between text-xs text-muted-foreground">
            {activeTab === "daily" && (
              <>
                <div>12 AM</div>
                <div>6 AM</div>
                <div>12 PM</div>
                <div>6 PM</div>
                <div>11 PM</div>
              </>
            )}
            {activeTab === "weekly" && (
              <>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
                <div>Sun</div>
              </>
            )}
            {activeTab === "monthly" && (
              <>
                <div>1</div>
                <div>5</div>
                <div>10</div>
                <div>15</div>
                <div>20</div>
                <div>25</div>
                <div>30</div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </BoxContainer>
  )
}

