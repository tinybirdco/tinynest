import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { format } from "date-fns"

interface InterruptionsChartProps {
  data: Array<{
    day: string
    interruptions: number
    day_type: 'business' | 'off'
  }>
}

export default function InterruptionsChart({ data }: InterruptionsChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Interruptions
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid 
              horizontal={true}
              vertical={false}
              className="stroke-muted"
            />
            <XAxis 
              dataKey="day" 
              tickFormatter={(time) => format(new Date(time), 'MMM d')}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis 
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={70}
            />
            <Tooltip 
              labelFormatter={(value) => new Date(value).toLocaleString()}
              formatter={(value, name: string) => [value, name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')]}
            />
            <Legend />
            <Bar dataKey="business_hours" stackId="a" fill="hsl(var(--primary))" name="Business Hours" />
            <Bar dataKey="sleep_hours" stackId="a" fill="#93c5fd" name="Sleep Hours" />
            <Bar dataKey="off_hours" stackId="a" fill="#6b7280" name="Off Hours" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
} 