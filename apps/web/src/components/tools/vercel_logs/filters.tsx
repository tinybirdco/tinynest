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

interface PipeResponse {
  data: Array<{ value: string }>
  meta: Array<{ name: string, type: string }>
  rows: number
  statistics: {
    elapsed: number
    rows_read: number
    bytes_read: number
  }
}

export function Filter({ token, pipeName, label, value, onChange, className }: FilterProps) {
  const [options, setOptions] = useState<FilterOption[]>([])

  useEffect(() => {
    async function fetchOptions() {
      try {
        const result = await pipe<PipeResponse>(token, pipeName)
        if (!result || !Array.isArray(result.data)) {
          console.warn(`Invalid response for ${label} options:`, result)
          setOptions([])
          return
        }
        
        setOptions([
          { value: '_all', label: `All ${label}s` },
          ...result.data.map(item => ({ 
            value: item.value,
            label: item.value 
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

interface VercelFiltersProps {
  token: string
  className?: string
  environment: string
  host: string
  project: string
  eventType: string
  source: string
  onEnvironmentChange: (value: string) => void
  onHostChange: (value: string) => void
  onProjectChange: (value: string) => void
  onEventTypeChange: (value: string) => void
  onSourceChange: (value: string) => void
}

export function VercelFilters({ 
    token, 
    className,
    environment,
    host,
    project,
    eventType,
    source,
    onEnvironmentChange,
    onHostChange,
    onProjectChange,
    onEventTypeChange,
    onSourceChange
}: VercelFiltersProps) {
    return (
        <div className={cn("flex flex-wrap gap-2", className)}>
            <Filter
                token={token}
                pipeName="vercel_environments"
                label="Environment"
                value={environment}
                onChange={onEnvironmentChange}
            />
            {/* <Filter
                token={token}
                pipeName="vercel_hosts"
                label="Host"
                value={host}
                onChange={onHostChange}
            /> */}
            <Filter
                token={token}
                pipeName="vercel_projects"
                label="Project"
                value={project}
                onChange={onProjectChange}
            />
            {/* <Filter
                token={token}
                pipeName="vercel_event_types"
                label="Event Type"
                value={eventType}
                onChange={onEventTypeChange}
            />
            <Filter
                token={token}
                pipeName="vercel_sources"
                label="Source"
                value={source}
                onChange={onSourceChange}
            /> */}
        </div>
    )
} 