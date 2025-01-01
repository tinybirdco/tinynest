import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { DateRange } from 'react-day-picker'
import { DateRangePicker } from '@/components/ui/date-range-picker'

interface TimeRangeProps {
    timeRange: string
    onTimeRangeChange: (range: string) => void
    dateRange: DateRange | undefined
    onDateRangeChange: (range: DateRange | undefined) => void
    className?: string
}

export function TimeRange({ 
    timeRange, 
    onTimeRangeChange, 
    dateRange, 
    onDateRangeChange,
    className 
}: TimeRangeProps) {
    return (
        <div className={cn("flex items-center gap-2", className)}>
            <div className="flex gap-1">
                <Button
                    variant={timeRange === 'hourly' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onTimeRangeChange('hourly')}
                >
                    Hourly
                </Button>
                <Button
                    variant={timeRange === 'daily' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onTimeRangeChange('daily')}
                >
                    Daily
                </Button>
                <Button
                    variant={timeRange === 'monthly' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onTimeRangeChange('monthly')}
                >
                    Monthly
                </Button>
            </div>
            <DateRangePicker
                initialDateRange={dateRange}
                onChange={onDateRangeChange}
            />
        </div>
    )
} 