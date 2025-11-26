'use client';

import { useState, useEffect } from 'react';
import { useTimetableStore } from '@/lib/stores/useTimetableStoreNew';
import type { Break } from '@/lib/types/timetable';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface BreakEditDialogProps {
  breakData: (Break & { isNew?: boolean }) | null;
  onClose: () => void;
}

const BREAK_TYPES = [
  { value: 'short_break', label: 'Short Break', icon: '☕', color: 'bg-blue-500' },
  { value: 'lunch', label: 'Lunch', icon: '🍽️', color: 'bg-orange-500' },
  { value: 'assembly', label: 'Assembly', icon: '📢', color: 'bg-purple-500' },
] as const;

const DAYS = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
];

export function BreakEditDialog({ breakData, onClose }: BreakEditDialogProps) {
  const { timeSlots, updateBreak, addBreak, deleteBreak } = useTimetableStore();
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'short_break' as 'short_break' | 'lunch' | 'assembly',
    dayOfWeek: 1,
    afterPeriod: 1,
    durationMinutes: 15,
    icon: '☕',
    color: 'bg-blue-500',
  });

  const [applyToAllDays, setApplyToAllDays] = useState(false);

  useEffect(() => {
    if (breakData && !breakData.isNew) {
      setFormData({
        name: breakData.name,
        type: breakData.type,
        dayOfWeek: breakData.dayOfWeek,
        afterPeriod: breakData.afterPeriod,
        durationMinutes: breakData.durationMinutes,
        icon: breakData.icon || '☕',
        color: breakData.color || 'bg-blue-500',
      });
    } else if (breakData && breakData.isNew) {
      // Pre-fill with sensible defaults
      const selectedType = BREAK_TYPES[0];
      setFormData({
        name: selectedType.label,
        type: selectedType.value,
        dayOfWeek: breakData.dayOfWeek || 1,
        afterPeriod: breakData.afterPeriod || 3,
        durationMinutes: 15,
        icon: selectedType.icon,
        color: selectedType.color,
      });
    }
  }, [breakData]);

  const handleSave = () => {
    if (!breakData) return;

    if (breakData.isNew) {
      // Add new break(s)
      if (applyToAllDays) {
        // Create break for all days
        DAYS.forEach((day) => {
          addBreak({
            name: formData.name,
            type: formData.type,
            dayOfWeek: day.value,
            afterPeriod: formData.afterPeriod,
            durationMinutes: formData.durationMinutes,
            icon: formData.icon,
            color: formData.color,
          });
        });
      } else {
        // Create break for single day
        addBreak({
          name: formData.name,
          type: formData.type,
          dayOfWeek: formData.dayOfWeek,
          afterPeriod: formData.afterPeriod,
          durationMinutes: formData.durationMinutes,
          icon: formData.icon,
          color: formData.color,
        });
      }
    } else {
      // Update existing break
      updateBreak(breakData.id, {
        name: formData.name,
        type: formData.type,
        afterPeriod: formData.afterPeriod,
        durationMinutes: formData.durationMinutes,
        icon: formData.icon,
        color: formData.color,
        // Note: Can't change dayOfWeek for existing break
      });
    }
    onClose();
  };

  const handleDelete = () => {
    if (breakData && !breakData.isNew && confirm('Are you sure you want to delete this break?')) {
      deleteBreak(breakData.id);
      onClose();
    }
  };

  const handleTypeChange = (type: 'short_break' | 'lunch' | 'assembly') => {
    const selectedType = BREAK_TYPES.find((t) => t.value === type);
    if (selectedType) {
      setFormData({
        ...formData,
        type,
        name: selectedType.label,
        icon: selectedType.icon,
        color: selectedType.color,
      });
    }
  };

  if (!breakData) return null;

  const isNew = breakData.isNew;

  return (
    <Dialog open={!!breakData} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>
            {isNew ? 'Add New Break' : 'Edit Break'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Break Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Break Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => handleTypeChange(value as any)}
            >
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BREAK_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <span>{type.icon}</span>
                      <span>{type.label}</span>
                      <span className={`w-3 h-3 rounded ${type.color}`} />
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Break Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Break Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Morning Break"
            />
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              min="5"
              max="120"
              value={formData.durationMinutes}
              onChange={(e) =>
                setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 15 })
              }
            />
            <p className="text-xs text-gray-500">Typical: 15 min (short break), 45 min (lunch)</p>
          </div>

          {/* After Period */}
          <div className="space-y-2">
            <Label htmlFor="afterPeriod">Occurs After Period</Label>
            <Select
              value={formData.afterPeriod.toString()}
              onValueChange={(value) =>
                setFormData({ ...formData, afterPeriod: parseInt(value) })
              }
            >
              <SelectTrigger id="afterPeriod">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((slot) => (
                  <SelectItem key={slot.id} value={slot.periodNumber.toString()}>
                    After Period {slot.periodNumber} ({slot.time})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Day Selection (only for new breaks) */}
          {isNew && (
            <>
              <div className="space-y-2">
                <Label htmlFor="dayOfWeek">Day of Week</Label>
                <Select
                  value={formData.dayOfWeek.toString()}
                  onValueChange={(value) =>
                    setFormData({ ...formData, dayOfWeek: parseInt(value) })
                  }
                  disabled={applyToAllDays}
                >
                  <SelectTrigger id="dayOfWeek">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS.map((day) => (
                      <SelectItem key={day.value} value={day.value.toString()}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Apply to All Days */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="applyToAllDays"
                  checked={applyToAllDays}
                  onChange={(e) => setApplyToAllDays(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="applyToAllDays" className="cursor-pointer">
                  Apply to all weekdays (Monday-Friday)
                </Label>
              </div>
            </>
          )}

          {/* Custom Icon */}
          <div className="space-y-2">
            <Label htmlFor="icon">Icon (emoji)</Label>
            <Input
              id="icon"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              placeholder="e.g. ☕ 🍽️ 📢"
              maxLength={2}
            />
          </div>

          {/* Preview */}
          <div className={`p-4 rounded-lg ${formData.color} bg-opacity-10 border-2 border-opacity-20`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{formData.icon}</span>
              <div>
                <div className="font-semibold">{formData.name}</div>
                <div className="text-sm text-gray-600">
                  {formData.durationMinutes} minutes • After Period {formData.afterPeriod}
                </div>
              </div>
            </div>
          </div>

          {/* Info Display */}
          {!isNew && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Day:</span>
                <span className="font-medium">{DAYS[formData.dayOfWeek - 1]?.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium capitalize">{formData.type.replace('_', ' ')}</span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          {!isNew && (
            <Button variant="destructive" onClick={handleDelete} className="mr-auto">
              Delete
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!formData.name.trim()}>
            {isNew ? 'Add Break' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

