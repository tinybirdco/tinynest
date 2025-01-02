"use client"

import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { format } from "date-fns"


interface OverviewProps {
  data: Array<{
    hour: string;
    triggered: number;
    resolved: number;
    escalated: number;
  }>;
  categories: string[];
  colors: Record<string, string>;
  index: string;
  valueKey?: string;
  categoryKey?: string;
}

export default function Overview({ data, categories, colors }: OverviewProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
      <CartesianGrid 
            horizontal={true}
            vertical={false}
            className="stroke-muted"
        />
        <XAxis 
          dataKey="hour"
          stroke="var(--muted-foreground)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(time) => format(new Date(time), 'MMM d, HH:00')}

        />
        <YAxis
          stroke="var(--muted-foreground)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip />
        <Legend />
        {categories.map((category) => (
          <Bar
            key={category}
            dataKey={category}
            name={category}
            fill={colors[category]}
            stackId="stack"
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
} 