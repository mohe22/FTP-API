import { cn } from "@/lib/utils";
import { Card } from "./ui/card";

export default function BoxContainer({children,className}:{children:React.ReactNode,className?:string}) {
  return (
    <Card className={
      cn(
        " border border-sidebar-border bg-sidebar shadow-sm rounded-sm ",
        className
      )
    }>
      {children}
    </Card>
  )
}
