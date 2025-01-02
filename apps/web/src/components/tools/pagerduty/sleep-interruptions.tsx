import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import BarList from "@/components/bar-list"

interface Responder {
  html_url: string
  id: string
  self: string
  summary: string
  type: string
}

interface SleepInterruptionsProps {
  data: Array<{
    responder: Responder[]
    interruptions: number
    avg_response_time: number
    hours?: number
  }>
}

export default function SleepInterruptions({ data = [] }: SleepInterruptionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sleep Hours Interruptions</CardTitle>
      </CardHeader>
      <CardContent>
        <BarList
          data={data?.map((item) => ({
            name: item.responder[0].summary,
            value: item.interruptions,
            extra: `${formatDuration(item.avg_response_time)} avg response • ${item.hours}h total effort`,
          })) || []}
        />
      </CardContent>
    </Card>
  )
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`
  return `${Math.round(seconds / 3600)}h`
} 