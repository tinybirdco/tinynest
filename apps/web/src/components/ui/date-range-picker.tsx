"use client"

import { useState } from 'react'
import { format, subDays, startOfDay, endOfDay } from 'date-fns'
import { Calendar } from './calendar'
import { Button } from './button'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { cn } from '@/lib/utils'
import { CalendarIcon } from 'lucide-react'
import { Checkbox } from './checkbox'
import { Label } from './label'
import { Input } from "./input"

export interface DateRange {
  from: Date
  to: Date
}

interface DateRangePickerProps {
  onChange?: (range: DateRange) => void
  className?: string
  initialDateRange?: DateRange
}

const presetRanges = [
  { label: 'Last 7 Days', days: 7 },
  { label: 'Last 14 Days', days: 14 },
  { label: 'Last 30 Days', days: 30 },
  { label: 'Last 60 Days', days: 60 },
]

export function DateRangePicker({
  onChange,
  className,
  initialDateRange,
}: DateRangePickerProps) {
  const [dateRange, setDateRange] = useState<DateRange>(initialDateRange)
  const [isOpen, setIsOpen] = useState(false)
  const [tempDate, setTempDate] = useState<Date | null>(null)
  const [compareLastPeriod, setCompareLastPeriod] = useState(false)
  const [fromInput, setFromInput] = useState(format(initialDateRange.from, "yyyy-MM-dd HH:mm:ss"))
  const [toInput, setToInput] = useState(format(initialDateRange.to, "yyyy-MM-dd HH:mm:ss"))

  const handleRangeSelect = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      setDateRange(range)
    }
  }

  const handlePresetClick = (days: number) => {
    const to = new Date()
    const from = subDays(to, days)
    setDateRange({ from, to })
  }

  const handleApply = () => {
    onChange?.(dateRange)
    setIsOpen(false)
  }

  const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFromInput(value)
    
    const date = new Date(value)
    if (!isNaN(date.getTime())) {
      setDateRange(prev => ({
        ...prev,
        from: startOfDay(date)
      }))
    }
  }

  const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setToInput(value)
    
    const date = new Date(value)
    if (!isNaN(date.getTime())) {
      setDateRange(prev => ({
        ...prev,
        to: endOfDay(date)
      }))
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-[200px] justify-start text-sm",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {format(dateRange.from, "MMM dd")} - {format(dateRange.to, "MMM dd")}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          <div className="w-[140px] p-2 bg-muted/5 border-r">
            <div className="px-1 text-sm text-muted-foreground mb-2">
              Custom Range
            </div>
            {presetRanges.map((range) => (
              <Button
                key={range.days}
                variant="ghost"
                className="w-full justify-start text-sm font-normal h-8"
                onClick={() => handlePresetClick(range.days)}
              >
                {range.label}
              </Button>
            ))}
          </div>

          <div>
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={handleRangeSelect}
              numberOfMonths={1}
              initialFocus
              className="p-2"
            />

            <div className="border-t p-3">
              <div className="space-y-2">
                <div>
                  <Label className="text-sm">From</Label>
                  <div className="flex items-center">
                    <span className="mr-2 text-sm text-muted-foreground">UTC</span>
                    <Input
                      type="text"
                      value={fromInput}
                      onChange={handleFromChange}
                      className="rounded-md text-sm"
                      placeholder="YYYY-MM-DD HH:mm:ss"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center">
                    <Label className="text-sm">To</Label>
                    <Button
                      variant="link"
                      className="h-auto p-0 text-xs text-black hover:text-black/80"
                      onClick={() => {
                        const now = new Date()
                        setToInput(format(now, "yyyy-MM-dd HH:mm:ss"))
                        setDateRange(prev => ({ ...prev, to: now }))
                      }}
                    >
                      Set to latest
                    </Button>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2 text-sm text-muted-foreground">UTC</span>
                    <Input
                      type="text"
                      value={toInput}
                      onChange={handleToChange}
                      className="rounded-md text-sm"
                      placeholder="YYYY-MM-DD HH:mm:ss"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox
                    id="compare"
                    checked={compareLastPeriod}
                    onCheckedChange={(checked) => 
                      setCompareLastPeriod(checked as boolean)
                    }
                    className="h-4 w-4"
                  />
                  <Label htmlFor="compare" className="text-sm">Compare to last period</Label>
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                    className="h-8 text-sm"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleApply}
                    className="h-8 text-sm bg-black hover:bg-black/90 text-white"
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}