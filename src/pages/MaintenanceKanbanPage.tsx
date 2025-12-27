import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { format, isPast } from 'date-fns'
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core'
import { useState } from 'react'

function DraggableCard({ request, isOverdue }: { request: any; isOverdue: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: request.id,
  })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
      }
    : undefined

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`cursor-move hover:shadow-lg transition-shadow ${
        isOverdue ? 'border-red-500' : ''
      }`}
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-medium">
            {request.subject}
          </CardTitle>
          <Badge className={(PRIORITY_COLORS as any)[request.priority]}>
            {request.priority}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-2">
        <div className="text-sm text-muted-foreground">
          {typeof request.equipment === 'object' && request.equipment?.name}
        </div>
        {request.assigned_to && (
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs">
              {typeof request.assigned_to === 'object' &&
                request.assigned_to?.full_name?.charAt(0)}
            </div>
            <span className="text-xs">
              {typeof request.assigned_to === 'object' &&
                request.assigned_to?.full_name}
            </span>
          </div>
        )}
        {request.scheduled_date && (
          <div
            className={`text-xs ${
              isOverdue ? 'text-red-600 font-medium' : 'text-muted-foreground'
            }`}
          >
            {format(new Date(request.scheduled_date), 'PPP')}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function DroppableColumn({
  column,
  requests,
  isOverdue,
}: {
  column: { id: MaintenanceStatus; label: string }
  requests: any[]
  isOverdue: (request: any) => boolean
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{column.label}</h3>
        <Badge variant="secondary">{requests.length}</Badge>
      </div>

      <div
        ref={setNodeRef}
        className={`space-y-3 min-h-[400px] rounded-lg p-3 transition-colors ${
          isOver ? 'bg-primary/10' : 'bg-muted/20'
        }`}
      >
        {requests.map((request: any) => (
          <DraggableCard
            key={request.id}
            request={request}
            isOverdue={isOverdue(request)}
          />
        ))}
      </div>
    </div>
  )
}
import { MaintenanceRequestFormDialog } from '@/components/forms/MaintenanceRequestFormDialog'

type MaintenanceStatus = 'new' | 'in_progress' | 'repaired' | 'scrap'

const COLUMNS: { id: MaintenanceStatus; label: string }[] = [
  { id: 'new', label: 'New' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'repaired', label: 'Repaired' },
  { id: 'scrap', label: 'Scrap' },
]

const PRIORITY_COLORS = {
  low: 'bg-blue-100 text-blue-800',
  normal: 'bg-gray-100 text-gray-800',
  high: 'bg-red-100 text-red-800',
}

export function MaintenanceKanbanPage() {
  const [searchParams] = useSearchParams()
  const equipmentFilter = searchParams.get('equipment')
  const queryClient = useQueryClient()
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const { data: requests } = useQuery({
    queryKey: ['maintenance-requests', equipmentFilter],
    queryFn: async () => {
      let query = supabase
        .from('maintenance_requests')
        .select(`
          *,
          equipment:equipment_id(name),
          assigned_to:assigned_to_id(full_name)
        `)

      if (equipmentFilter) {
        query = query.eq('equipment_id', equipmentFilter)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: MaintenanceStatus }) => {
      const { error } = await (supabase as any)
        .from('maintenance_requests')
        .update({ status })
        .eq('id', id)

      if (error) throw error

      // If status is 'scrap', update the equipment
      if (status === 'scrap') {
        const request: any = requests?.find((r: any) => r.id === id)
        if (request) {
          await (supabase as any)
            .from('equipment')
            .update({ is_scrapped: true })
            .eq('id', request.equipment_id)
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] })
      queryClient.invalidateQueries({ queryKey: ['equipment'] })
    },
  })

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) {
      console.log('No drop target')
      return
    }

    const requestId = active.id as string
    const newStatus = over.id as MaintenanceStatus

    console.log('Updating request:', requestId, 'to status:', newStatus)
    updateStatusMutation.mutate({ id: requestId, status: newStatus })
  }

  const isOverdue = (request: any) => {
    if (!request.scheduled_date) return false
    if (request.status === 'repaired') return false
    return isPast(new Date(request.scheduled_date))
  }

  const getRequestsByStatus = (status: MaintenanceStatus) => {
    return requests?.filter((r: any) => r.status === status) || []
  }

  const activeRequest = requests?.find((r: any) => r.id === activeId)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Maintenance Requests</h1>
          <p className="text-muted-foreground">Manage and track maintenance work</p>
        </div>
        <MaintenanceRequestFormDialog
          equipmentId={equipmentFilter || undefined}
          trigger={
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Request
            </Button>
          }
        />
      </div>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid gap-4 md:grid-cols-4">
          {COLUMNS.map((column) => (
            <DroppableColumn
              key={column.id}
              column={column}
              requests={getRequestsByStatus(column.id)}
              isOverdue={isOverdue}
            />
          ))}
        </div>

        <DragOverlay>
          {activeRequest && (
            <Card className="cursor-move opacity-50 w-64">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-medium">
                  {(activeRequest as any).subject}
                </CardTitle>
              </CardHeader>
            </Card>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
