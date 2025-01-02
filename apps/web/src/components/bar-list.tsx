"use client"

interface BarListProps {
  data: Array<{
    name: string
    value: number
    extra?: string
  }>
}

export default function BarList({ data }: BarListProps) {
  const max = Math.max(...data.map((item) => item.value))
  
  return (
    <div className="space-y-2">
      {data.map((item) => (
        <div key={item.name} className="flex items-center">
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">{item.name}</p>
            {item.extra && (
              <p className="text-sm text-muted-foreground">{item.extra}</p>
            )}
          </div>
          <div className="ml-4 w-24 text-sm text-right">{item.value}</div>
          <div className="ml-2 w-48 h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary"
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
} 