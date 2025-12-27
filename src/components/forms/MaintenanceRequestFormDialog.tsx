import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface MaintenanceRequestFormDialogProps {
  trigger?: React.ReactNode
  equipmentId?: string
  scheduledDate?: Date
}

export function MaintenanceRequestFormDialog({
  trigger,
  equipmentId,
  scheduledDate
}: MaintenanceRequestFormDialogProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState({
    subject: '',
    equipment_id: equipmentId || '',
    team_id: '',
    request_type: 'corrective' as 'corrective' | 'preventive',
    scheduled_date: scheduledDate ? scheduledDate.toISOString().split('T')[0] : '',
    priority: 'normal' as 'low' | 'normal' | 'high',
  })

  const { data: equipment } = useQuery({
    queryKey: ['equipment'],
    queryFn: async () => {
      const { data, error } = await supabase.from('equipment').select('*')
      if (error) throw error
      return data
    },
  })

  const { data: teams } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const { data, error } = await supabase.from('teams').select('*')
      if (error) throw error
      return data
    },
  })

  const { data: profiles } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*')
      if (error) throw error
      return data
    },
  })

  // Auto-fill team when equipment is selected
  useEffect(() => {
    if (formData.equipment_id && equipment) {
      const selectedEquipment: any = equipment.find((e: any) => e.id === formData.equipment_id)
      if (selectedEquipment && selectedEquipment.maintenance_team_id) {
        setFormData(prev => ({ ...prev, team_id: selectedEquipment.maintenance_team_id }))
      }
    }
  }, [formData.equipment_id, equipment])

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      // Get the first profile as created_by (in a real app, this would be the logged-in user)
      const createdBy = (profiles as any)?.[0]?.id

      if (!createdBy) {
        throw new Error('No profile found. Please create a team member first.')
      }

      const { error } = await (supabase as any)
        .from('maintenance_requests')
        .insert({
          ...data,
          created_by: createdBy,
          scheduled_date: data.scheduled_date || null,
        })

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] })
      queryClient.invalidateQueries({ queryKey: ['preventive-requests'] })
      setOpen(false)
      setFormData({
        subject: '',
        equipment_id: equipmentId || '',
        team_id: '',
        request_type: 'corrective',
        scheduled_date: scheduledDate ? scheduledDate.toISOString().split('T')[0] : '',
        priority: 'normal',
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate preventive maintenance has scheduled date
    if (formData.request_type === 'preventive' && !formData.scheduled_date) {
      alert('Preventive maintenance requires a scheduled date')
      return
    }

    createMutation.mutate(formData)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>New Request</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Maintenance Request</DialogTitle>
          <DialogDescription>
            Report an issue or schedule preventive maintenance
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="e.g., Oil leak detected"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="request_type">Request Type *</Label>
              <Select
                value={formData.request_type}
                onValueChange={(value: any) => setFormData({ ...formData, request_type: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="corrective">Corrective (Breakdown)</SelectItem>
                  <SelectItem value="preventive">Preventive (Scheduled)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority *</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="equipment_id">Equipment *</Label>
            <Select
              value={formData.equipment_id}
              onValueChange={(value) => setFormData({ ...formData, equipment_id: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select equipment" />
              </SelectTrigger>
              <SelectContent>
                {equipment?.map((item: any) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name} ({item.serial_number})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="team_id">Assigned Team *</Label>
            <Select
              value={formData.team_id}
              onValueChange={(value) => setFormData({ ...formData, team_id: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Auto-filled from equipment" />
              </SelectTrigger>
              <SelectContent>
                {teams?.map((team: any) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formData.team_id && (
              <p className="text-xs text-muted-foreground">
                Team auto-filled from equipment settings
              </p>
            )}
          </div>

          {formData.request_type === 'preventive' && (
            <div className="space-y-2">
              <Label htmlFor="scheduled_date">Scheduled Date *</Label>
              <Input
                id="scheduled_date"
                type="date"
                required={formData.request_type === 'preventive'}
                value={formData.scheduled_date}
                onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
              />
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create Request'}
            </Button>
          </DialogFooter>

          {createMutation.isError && (
            <p className="text-sm text-red-600">
              {(createMutation.error as Error).message}
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}
