import { useEffect, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from '@/lib/utils'
import { pipe } from '@/lib/tinybird'

interface FilterOption {
  value: string
  label: string
}

interface FilterProps {
  token: string
  pipeName: string
  label: string
  value?: string
  onChange: (value: string) => void
  className?: string
}

export function Filter({ token, pipeName, label, value, onChange, className }: FilterProps) {
  const [options, setOptions] = useState<FilterOption[]>([])

  useEffect(() => {
    async function fetchOptions() {
      try {
        const result = await pipe<{ data: Array<{ service_name: string, service_id: string }> }>(token, pipeName)
        if (!result || !Array.isArray(result.data)) {
          console.warn(`Invalid response for ${label} options:`, result)
          setOptions([])
          return
        }
        
        setOptions([
          { value: '_all', label: `All Services` },
          ...result.data.map(item => ({ 
            value: item.service_id,
            label: item.service_name 
          }))
        ])
      } catch (error) {
        console.error(`Failed to fetch ${label} options:`, error)
        setOptions([])
      }
    }

    if (token) fetchOptions()
  }, [token, pipeName, label])

  return (
    <Select 
      value={value || '_all'} 
      onValueChange={(val) => onChange(val === '_all' ? '' : val)}
    >
      <SelectTrigger className={cn("w-[200px]", className)}>
        <SelectValue placeholder={`Select ${label}`} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
} 