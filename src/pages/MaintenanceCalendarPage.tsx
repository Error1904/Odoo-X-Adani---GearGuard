import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from 'date-fns'
import { MaintenanceRequestFormDialog } from '@/components/forms/MaintenanceRequestFormDialog'

export function MaintenanceCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  })

  const { data: preventiveRequests } = useQuery({
    queryKey: ['preventive-requests', format(monthStart, 'yyyy-MM')],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance_requests')
        .select(`
          *,
          equipment:equipment_id(name),
          assigned_to:assigned_to_id(full_name)
        `)
        .eq('request_type', 'preventive')
        .gte('scheduled_date', format(monthStart, 'yyyy-MM-dd'))
        .lte('scheduled_date', format(monthEnd, 'yyyy-MM-dd'))

      if (error) throw error
      return data
    },
  })

  const getRequestsForDate = (date: Date) => {
    return preventiveRequests?.filter((r: any) =>
      r.scheduled_date && isSameDay(new Date(r.scheduled_date), date)
    ) || []
  }

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Maintenance Calendar</h1>
          <p className="text-muted-foreground">View and schedule preventive maintenance</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{format(currentDate, 'MMMM yyyy')}</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentDate(new Date())}
                >
                  Today
                </Button>
                <Button variant="outline" size="icon" onClick={handleNextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-medium text-muted-foreground p-2"
                >
                  {day}
                </div>
              ))}

              {calendarDays.map((day) => {
                const requests = getRequestsForDate(day)
                const isCurrentMonth = isSameMonth(day, currentDate)
                const isToday = isSameDay(day, new Date())
                const isSelected = selectedDate && isSameDay(day, selectedDate)

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => handleDateClick(day)}
                    className={`
                      min-h-[80px] p-2 rounded-lg border text-left transition-colors
                      ${!isCurrentMonth ? 'bg-muted/20 text-muted-foreground' : ''}
                      ${isToday ? 'border-primary border-2' : ''}
                      ${isSelected ? 'bg-accent' : 'hover:bg-accent/50'}
                    `}
                  >
                    <div className="text-sm font-medium mb-1">
                      {format(day, 'd')}
                    </div>
                    <div className="space-y-1">
                      {requests.slice(0, 2).map((request: any) => (
                        <div
                          key={request.id}
                          className="text-xs p-1 rounded bg-primary/10 text-primary truncate"
                        >
                          {request.subject}
                        </div>
                      ))}
                      {requests.length > 2 && (
                        <div className="text-xs text-muted-foreground">
                          +{requests.length - 2} more
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {selectedDate ? format(selectedDate, 'PPP') : 'Select a date'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedDate && (
              <>
                <MaintenanceRequestFormDialog
                  scheduledDate={selectedDate}
                  trigger={
                    <Button className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      Schedule Maintenance
                    </Button>
                  }
                />

                <div className="space-y-2">
                  {getRequestsForDate(selectedDate).length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No maintenance scheduled for this day
                    </p>
                  ) : (
                    getRequestsForDate(selectedDate).map((request: any) => (
                      <Card key={request.id}>
                        <CardContent className="p-3 space-y-1">
                          <div className="font-medium text-sm">{request.subject}</div>
                          <div className="text-xs text-muted-foreground">
                            {typeof request.equipment === 'object' && request.equipment?.name}
                          </div>
                          {request.assigned_to && (
                            <div className="text-xs text-muted-foreground">
                              Assigned to:{' '}
                              {typeof request.assigned_to === 'object' &&
                                request.assigned_to?.full_name}
                            </div>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {request.status}
                          </Badge>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
