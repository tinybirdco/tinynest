import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

interface Responder {
  html_url: string
  id: string
  self: string
  summary: string
  type: string
}

interface ResponseEffortChartProps {
  data: Array<{
    responder: Responder[]
    hours: number
  }>
}

export default function ResponseEffortChart({ data }: ResponseEffortChartProps) {
  const chartData = data.map(item => ({
    responder: item.responder[0].summary,
    hours: item.hours
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Response Effort by Responder</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={chartData} 
            layout="vertical"
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid 
              horizontal={false}
              vertical={true}
              className="stroke-muted"
            />
            <XAxis type="number" unit=" hours"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis 
              type="category" 
              dataKey="responder" 
              width={100}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <Tooltip 
              formatter={(value: number) => [`${value} hours`, 'Time spent']}
            />
            <Bar 
              dataKey="hours" 
              fill="hsl(var(--primary))"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
} 