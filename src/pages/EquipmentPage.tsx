import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Database } from '@/lib/database.types'
import { EquipmentFormDialog } from '@/components/forms/EquipmentFormDialog'
import { Skeleton } from '@/components/ui/skeleton'

type Equipment = Database['public']['Tables']['equipment']['Row']

export function EquipmentPage() {
  const { data: equipment, isLoading } = useQuery({
    queryKey: ['equipment'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .order('name')

      if (error) throw error
      return data as Equipment[]
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Equipment</h1>
          <p className="text-muted-foreground">Manage your company assets</p>
        </div>
        <EquipmentFormDialog
          trigger={
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Equipment
            </Button>
          }
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-10 w-full mt-4" />
              </CardContent>
            </Card>
          ))
        ) : (
          equipment?.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{item.name}</CardTitle>
                  <CardDescription>{item.serial_number}</CardDescription>
                </div>
                {item.is_scrapped && (
                  <Badge variant="destructive">Scrapped</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm">
                <span className="text-muted-foreground">Category:</span> {item.category}
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Location:</span> {item.location}
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" asChild className="flex-1">
                  <Link to={`/equipment/${item.id}`}>View Details</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          ))
        )}
      </div>

      {!isLoading && equipment?.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No equipment found</p>
            <EquipmentFormDialog
              trigger={
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Equipment
                </Button>
              }
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
