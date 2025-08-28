import { Filter } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { feeTypes, paymentStatuses, classes, getFeeTypeIcon } from '../utils'

interface FiltersSectionProps {
  selectedFeeType: string
  setSelectedFeeType: (type: string) => void
  selectedStatus: string
  setSelectedStatus: (status: string) => void
  selectedClass: string
  setSelectedClass: (cls: string) => void
  dueDateFilter: string
  setDueDateFilter: (filter: string) => void
}

export const FiltersSection = ({
  selectedFeeType,
  setSelectedFeeType,
  selectedStatus,
  setSelectedStatus,
  selectedClass,
  setSelectedClass,
  dueDateFilter,
  setDueDateFilter
}: FiltersSectionProps) => {
  return (
    <div className="border-2 border-primary/20 rounded-xl p-6 bg-primary/5">
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-primary" />
          <h3 className="font-mono font-bold text-slate-900 dark:text-slate-100">
            Filter & Sort Records
          </h3>
        </div>

        {/* Filter Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Fee Type Filter */}
          <div className="space-y-2">
            <Label className="text-xs font-mono uppercase tracking-wide text-slate-700 dark:text-slate-300">
              Fee Type
            </Label>
            <Select value={selectedFeeType} onValueChange={setSelectedFeeType}>
              <SelectTrigger className="border-primary/30 bg-white dark:bg-slate-900 font-mono">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-mono">All Types</SelectItem>
                {feeTypes.map(type => {
                  const IconComponent = getFeeTypeIcon(type)
                  return (
                    <SelectItem key={type} value={type} className="font-mono">
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4" />
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Payment Status Filter */}
          <div className="space-y-2">
            <Label className="text-xs font-mono uppercase tracking-wide text-slate-700 dark:text-slate-300">
              Payment Status
            </Label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="border-primary/30 bg-white dark:bg-slate-900 font-mono">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-mono">All Statuses</SelectItem>
                {paymentStatuses.map(status => (
                  <SelectItem key={status} value={status} className="font-mono">
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Class Filter */}
          <div className="space-y-2">
            <Label className="text-xs font-mono uppercase tracking-wide text-slate-700 dark:text-slate-300">
              Class
            </Label>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="border-primary/30 bg-white dark:bg-slate-900 font-mono">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-mono">All Classes</SelectItem>
                {classes.map(cls => (
                  <SelectItem key={cls} value={cls} className="font-mono">{cls}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Due Date Filter */}
          <div className="space-y-2">
            <Label className="text-xs font-mono uppercase tracking-wide text-slate-700 dark:text-slate-300">
              Due Date
            </Label>
            <Select value={dueDateFilter} onValueChange={setDueDateFilter}>
              <SelectTrigger className="border-primary/30 bg-white dark:bg-slate-900 font-mono">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-mono">All Dates</SelectItem>
                <SelectItem value="next7days" className="font-mono">Due in Next 7 Days</SelectItem>
                <SelectItem value="overdue" className="font-mono">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  )
}
