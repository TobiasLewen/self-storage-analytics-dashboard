import * as React from 'react'
import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import type { DateRange } from 'react-day-picker'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface DateRangePickerProps {
  date?: DateRange
  onDateChange?: (date: DateRange | undefined) => void
  className?: string
}

export function DateRangePicker({
  date,
  onDateChange,
  className,
}: DateRangePickerProps) {
  const [selectedDate, setSelectedDate] = React.useState<DateRange | undefined>(date)

  React.useEffect(() => {
    setSelectedDate(date)
  }, [date])

  const handleSelect = (range: DateRange | undefined) => {
    setSelectedDate(range)
    onDateChange?.(range)
  }

  const presets = [
    {
      label: 'Letzte 7 Tage',
      getValue: () => {
        const end = new Date()
        const start = new Date()
        start.setDate(start.getDate() - 7)
        return { from: start, to: end }
      },
    },
    {
      label: 'Letzte 30 Tage',
      getValue: () => {
        const end = new Date()
        const start = new Date()
        start.setDate(start.getDate() - 30)
        return { from: start, to: end }
      },
    },
    {
      label: 'Letzte 3 Monate',
      getValue: () => {
        const end = new Date()
        const start = new Date()
        start.setMonth(start.getMonth() - 3)
        return { from: start, to: end }
      },
    },
    {
      label: 'Letzte 6 Monate',
      getValue: () => {
        const end = new Date()
        const start = new Date()
        start.setMonth(start.getMonth() - 6)
        return { from: start, to: end }
      },
    },
    {
      label: 'Letztes Jahr',
      getValue: () => {
        const end = new Date()
        const start = new Date()
        start.setFullYear(start.getFullYear() - 1)
        return { from: start, to: end }
      },
    },
    {
      label: 'Dieses Jahr',
      getValue: () => {
        const end = new Date()
        const start = new Date(end.getFullYear(), 0, 1)
        return { from: start, to: end }
      },
    },
  ]

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              'w-[300px] justify-start text-left font-normal',
              !selectedDate && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate?.from ? (
              selectedDate.to ? (
                <>
                  {format(selectedDate.from, 'dd.MM.yyyy')} -{' '}
                  {format(selectedDate.to, 'dd.MM.yyyy')}
                </>
              ) : (
                format(selectedDate.from, 'dd.MM.yyyy')
              )
            ) : (
              <span>Zeitraum wählen</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex">
            <div className="border-r border-border p-3 space-y-2">
              <div className="text-sm font-medium mb-2">Voreinstellungen</div>
              {presets.map((preset) => (
                <Button
                  key={preset.label}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start font-normal"
                  onClick={() => handleSelect(preset.getValue())}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
            <div>
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={selectedDate?.from}
                selected={selectedDate}
                onSelect={handleSelect}
                numberOfMonths={2}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
