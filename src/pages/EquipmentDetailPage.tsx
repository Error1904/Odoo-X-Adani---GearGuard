import { useQuery } from '@tanstack/react-query'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Wrench } from 'lucide-react'
import { format } from 'date-fns'
import { MaintenanceRequestFormDialog } from '@/components/forms/MaintenanceRequestFormDialog'

export function EquipmentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: equipment, isLoading } = useQuery({
    queryKey: ['equipment', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .eq('id', id!)
        .single()

      if (error) throw error
      return data as any
    },
  })

  // Smart button: Count of open maintenance requests for this equipment
  const { data: openRequestsCount } = useQuery({
    queryKey: ['equipment-open-requests', id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('maintenance_requests')
        .select('*', { count: 'exact', head: true })
        .eq('equipment_id', id!)
        .in('status', ['new', 'in_progress'])

      if (error) throw error
      return count || 0
    },
  })

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  if (!equipment) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p className="text-muted-foreground">Equipment not found</p>
        <Button onClick={() => navigate('/equipment')}>Back to Equipment</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/equipment')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{equipment.name}</h1>
          <p className="text-muted-foreground">{equipment.serial_number}</p>
        </div>
        {equipment.is_scrapped && (
          <Badge variant="destructive">Scrapped</Badge>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Equipment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Category</div>
              <div>{equipment.category}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Department</div>
              <div>{equipment.department}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Location</div>
              <div>{equipment.location}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Purchase Date</div>
              <div>{format(new Date(equipment.purchase_date), 'PPP')}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Warranty End Date</div>
              <div>{format(new Date(equipment.warranty_end_date), 'PPP')}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Smart Button with Badge */}
            <Button
              asChild
              className="w-full justify-between"
              variant="outline"
              size="lg"
            >
              <Link to={`/maintenance/kanban?equipment=${id}`}>
                <span className="flex items-center gap-2">
                  <Wrench className="h-4 w-4" />
                  Maintenance
                </span>
                {openRequestsCount !== undefined && openRequestsCount > 0 && (
                  <Badge variant="default">{openRequestsCount}</Badge>
                )}
              </Link>
            </Button>

            <MaintenanceRequestFormDialog
              equipmentId={id}
              trigger={
                <Button className="w-full">
                  Create Maintenance Request
                </Button>
              }
            />

            <Button variant="outline" asChild className="w-full">
              <Link to={`/equipment/${id}/edit`}>
                Edit Equipment
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
