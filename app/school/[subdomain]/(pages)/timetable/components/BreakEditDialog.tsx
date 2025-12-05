'use client';

import { useState, useEffect } from 'react';
import { useTimetableStore } from '@/lib/stores/useTimetableStoreNew';
import type { Break } from '@/lib/types/timetable';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from '@/components/ui/drawer';
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
import { X, Trash2 } from 'lucide-react';

interface BreakEditDialogProps {
  breakData: (Break & { isNew?: boolean }) | null;
  onClose: () => void;
}

const BREAK_TYPES = [
  { value: 'short_break', label: 'Short Break', icon: '☕', color: 'bg-blue-500' },
  { value: 'long_break', label: 'Long Break', icon: '⏰', color: 'bg-cyan-500' },
  { value: 'lunch', label: 'Lunch', icon: '🍽️', color: 'bg-orange-500' },
  { value: 'afternoon_break', label: 'Afternoon Break', icon: '🌤️', color: 'bg-yellow-500' },
  { value: 'games', label: 'Games', icon: '⚽', color: 'bg-green-500' },
  { value: 'assembly', label: 'Assembly', icon: '📢', color: 'bg-purple-500' },
  { value: 'recess', label: 'Recess', icon: '🏃', color: 'bg-pink-500' },
  { value: 'snack', label: 'Snack Time', icon: '🍎', color: 'bg-red-500' },
] as const;

// Expanded emoji options for breaks - most relevant first
const EMOJI_OPTIONS = [
  // Most common break-related emojis (shown first)
  '☕', '🍽️', '⏰', '🌤️', '⚽', '📢', '🏃', '🍎',
  // More options
  '🎯', '🎨', '🎵', '🎬', '🎪', '🎭', '🎤', '🏀', '🏐', '🏓',
  '🏸', '🎾', '🏊', '🧘', '🧘‍♀️', '📚', '✏️', '📝', '📖', '📗',
  '📘', '📙', '📕', '📓', '📔', '🌮', '🍕', '🍔', '🍟', '🌭',
  '🍗', '🍖', '🥗', '🥪', '🍱', '🍊', '🍋', '🍌', '🍉', '🍇',
  '🍓', '🍈', '🍒', '🍑', '🎉', '🎊', '🎈', '🎁', '🎀', '🎂',
  '🍰', '🧁', '🍪', '🍫', '☀️', '🌙', '⭐', '🌟', '💫', '✨',
  '🌈', '☁️', '⛅', '🎧', '🎮', '🕹️', '🎲', '🃏', '🚀', '🏖️',
  '🌴', '🏔️', '⛰️', '🌊', '🏄', '🏄‍♀️', '🏄‍♂️', '🏊‍♀️', '🏊‍♂️',
] as const;

const DAYS = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
];

export function BreakEditDialog({ breakData, onClose }: BreakEditDialogProps) {
  const { timeSlots, updateBreak, addBreak, deleteBreak, createBreaks } = useTimetableStore();
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'short_break' as typeof BREAK_TYPES[number]['value'],
    dayOfWeek: 1,
    afterPeriod: 1,
    durationMinutes: 15,
    icon: '☕',
    color: 'bg-blue-500',
  });

  // Use string for duration input to prevent "1" getting stuck
  const [durationInput, setDurationInput] = useState('15');
  const [applyToAllDays, setApplyToAllDays] = useState(false);
  const [showMoreEmojis, setShowMoreEmojis] = useState(false);

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
      setDurationInput(breakData.durationMinutes.toString());
      setShowMoreEmojis(false);
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
      setDurationInput('15');
      setShowMoreEmojis(false);
    }
  }, [breakData]);

  // Handle duration input change - allow typing without getting stuck
  const handleDurationChange = (value: string) => {
    setDurationInput(value);
    // Only update formData if it's a valid number
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 5 && numValue <= 120) {
      setFormData({ ...formData, durationMinutes: numValue });
    }
  };

  // Validate and set duration on blur
  const handleDurationBlur = () => {
    const numValue = parseInt(durationInput, 10);
    if (isNaN(numValue) || numValue < 5) {
      setDurationInput('15');
      setFormData({ ...formData, durationMinutes: 15 });
    } else if (numValue > 120) {
      setDurationInput('120');
      setFormData({ ...formData, durationMinutes: 120 });
    } else {
      setFormData({ ...formData, durationMinutes: numValue });
    }
  };

  const handleSave = async () => {
    if (!breakData) return;

    // Ensure duration is valid before saving
    const finalDuration = parseInt(durationInput, 10) || 15;
    const validDuration = Math.max(5, Math.min(120, finalDuration));

    if (breakData.isNew) {
      setIsSaving(true);
      try {
        // Add new break(s) via API
        if (applyToAllDays) {
          // Create break for all days
          const breaksToCreate = DAYS.map((day) => ({
            name: formData.name,
            type: formData.type,
            dayOfWeek: day.value,
            afterPeriod: formData.afterPeriod,
            durationMinutes: validDuration,
            icon: formData.icon,
            color: formData.color,
          }));
          await createBreaks(breaksToCreate);
        } else {
          // Create break for single day
          await createBreaks([{
            name: formData.name,
            type: formData.type,
            dayOfWeek: formData.dayOfWeek,
            afterPeriod: formData.afterPeriod,
            durationMinutes: validDuration,
            icon: formData.icon,
            color: formData.color,
          }]);
        }
        onClose();
      } catch (error) {
        console.error('Error creating break:', error);
        // Fallback to local storage if API fails
        if (applyToAllDays) {
          DAYS.forEach((day) => {
            addBreak({
              name: formData.name,
              type: formData.type,
              dayOfWeek: day.value,
              afterPeriod: formData.afterPeriod,
              durationMinutes: validDuration,
              icon: formData.icon,
              color: formData.color,
            });
          });
        } else {
          addBreak({
            name: formData.name,
            type: formData.type,
            dayOfWeek: formData.dayOfWeek,
            afterPeriod: formData.afterPeriod,
            durationMinutes: validDuration,
            icon: formData.icon,
            color: formData.color,
          });
        }
        onClose();
      } finally {
        setIsSaving(false);
      }
    } else {
      // Update existing break
      updateBreak(breakData.id, {
        name: formData.name,
        type: formData.type,
        afterPeriod: formData.afterPeriod,
        durationMinutes: validDuration,
        icon: formData.icon,
        color: formData.color,
        // Note: Can't change dayOfWeek for existing break
      });
      onClose();
    }
  };

  const handleDelete = () => {
    if (breakData && !breakData.isNew && confirm('Are you sure you want to delete this break?')) {
      deleteBreak(breakData.id);
      onClose();
    }
  };

  const handleTypeChange = (type: typeof BREAK_TYPES[number]['value']) => {
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
    <Drawer open={!!breakData} onOpenChange={onClose} direction="right">
      <DrawerContent className="w-full sm:w-[500px] lg:w-[600px] h-full flex flex-col">
        <DrawerHeader className="bg-white dark:bg-slate-900 border-b border-primary/20 px-6 py-4">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-xl font-bold text-primary flex items-center gap-3">
              <span className="text-2xl">{formData.icon}</span>
              <span>{isNew ? 'Add New Break' : 'Edit Break'}</span>
            </DrawerTitle>
            <DrawerClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary hover:bg-primary/10 rounded"
              >
                <X className="h-5 w-5" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 bg-slate-50 dark:bg-slate-900">
          {/* Break Type and Break Name - One Row on Large */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Break Type */}
            <div className="space-y-1.5">
              <Label htmlFor="type" className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <span>Break Type</span>
                <span className="text-xs text-slate-500 font-normal">required</span>
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleTypeChange(value as any)}
              >
                <SelectTrigger id="type" className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-1 focus:ring-primary h-10">
                  <div className="flex items-center gap-2 w-full">
                    {(() => {
                      const selectedType = BREAK_TYPES.find(t => t.value === formData.type);
                      return selectedType ? (
                        <>
                          <span className="text-base">{selectedType.icon}</span>
                          <span className="font-medium text-slate-900 dark:text-slate-100">{selectedType.label}</span>
                          <span className={`w-2.5 h-2.5 ${selectedType.color} ml-auto`} />
                        </>
                      ) : (
                        <SelectValue />
                      );
                    })()}
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {BREAK_TYPES.map((type) => (
                    <SelectItem 
                      key={type.value} 
                      value={type.value}
                      className="cursor-pointer focus:bg-primary/10 data-[highlighted]:bg-primary/10"
                    >
                      <div className="flex items-center gap-3 py-0.5">
                        <span className="text-lg">{type.icon}</span>
                        <span className="font-medium">{type.label}</span>
                        <span className={`w-3 h-3 ${type.color} ml-auto`} />
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Break Name */}
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <span>Break Name</span>
                <span className="text-xs text-slate-500 font-normal">required</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Morning Break"
                className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-1 focus:ring-primary h-10"
              />
            </div>
          </div>

          {/* Duration and After Period - One Row on Large */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Duration */}
            <div className="space-y-1.5">
              <Label htmlFor="duration" className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <span>Duration</span>
                <span className="text-xs text-slate-500 font-normal">minutes</span>
              </Label>
              <div className="relative">
                <Input
                  id="duration"
                  type="text"
                  inputMode="numeric"
                  value={durationInput}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    handleDurationChange(value);
                  }}
                  onBlur={handleDurationBlur}
                  className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-1 focus:ring-primary pr-12 h-10"
                  placeholder="15"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium">
                  min
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <span className="text-slate-400">•</span>
                <span>Typical: 15 min (short break), 45 min (lunch)</span>
              </p>
            </div>

            {/* After Period */}
            <div className="space-y-1.5">
              <Label htmlFor="afterPeriod" className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <span>Occurs After</span>
                <span className="text-xs text-slate-500 font-normal">period</span>
              </Label>
              <Select
                value={formData.afterPeriod.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, afterPeriod: parseInt(value) })
                }
              >
                <SelectTrigger id="afterPeriod" className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-1 focus:ring-primary h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot) => (
                    <SelectItem 
                      key={slot.id} 
                      value={slot.periodNumber.toString()}
                      className="cursor-pointer focus:bg-primary/10"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">Period {slot.periodNumber}</span>
                        <span className="text-xs text-slate-500">({slot.time})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Day Selection (only for new breaks) */}
          {isNew && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="dayOfWeek" className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <span>Day of Week</span>
                  {applyToAllDays && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 border border-primary/20 font-medium">
                      All Days Selected
                    </span>
                  )}
                </Label>
                <Select
                  value={formData.dayOfWeek.toString()}
                  onValueChange={(value) =>
                    setFormData({ ...formData, dayOfWeek: parseInt(value) })
                  }
                  disabled={applyToAllDays}
                >
                  <SelectTrigger 
                    id="dayOfWeek" 
                    className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50 h-10"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS.map((day) => (
                      <SelectItem 
                        key={day.value} 
                        value={day.value.toString()}
                        className="cursor-pointer focus:bg-primary/10"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 dark:text-slate-100">{day.label}</span>
                          {formData.dayOfWeek === day.value && (
                            <span className="text-primary text-sm ml-auto">✓</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Apply to All Days */}
              <div 
                className={`
                  flex items-center space-x-3 p-3 border transition-all cursor-pointer bg-white dark:bg-slate-800
                  ${applyToAllDays 
                    ? 'border-primary bg-primary/5' 
                    : 'border-slate-300 dark:border-slate-600 hover:border-primary/40'
                  }
                `}
                onClick={() => setApplyToAllDays(!applyToAllDays)}
              >
                <input
                  type="checkbox"
                  id="applyToAllDays"
                  checked={applyToAllDays}
                  onChange={(e) => setApplyToAllDays(e.target.checked)}
                  className="w-4 h-4 border-slate-300 dark:border-slate-600 text-primary focus:ring-primary focus:ring-1 cursor-pointer"
                />
                <Label htmlFor="applyToAllDays" className="cursor-pointer text-slate-700 dark:text-slate-300 font-medium flex-1 text-sm">
                  Apply to all weekdays (Monday-Friday)
                </Label>
                {applyToAllDays && (
                  <span className="text-primary text-base font-semibold">✓</span>
                )}
              </div>
            </>
          )}

          {/* Icon Picker */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Choose Icon</Label>
            <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 p-4">
              {!showMoreEmojis ? (
                <>
                  <div className="grid grid-cols-3 gap-2">
                    {EMOJI_OPTIONS.slice(0, 3).map((emoji, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon: emoji })}
                        className={`
                          w-full h-14 text-2xl flex items-center justify-center rounded
                          transition-all duration-150 border-2
                          ${formData.icon === emoji
                            ? 'bg-primary text-white border-primary shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 hover:border-primary/40 hover:bg-slate-100 dark:hover:bg-slate-600'
                          }
                        `}
                        title={`Select ${emoji}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowMoreEmojis(true)}
                    className="w-full mt-3 py-2 px-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium transition-colors duration-150 border border-slate-300 dark:border-slate-600 flex items-center justify-center gap-2 text-sm rounded"
                  >
                    <span>Show More Icons</span>
                    <span className="text-xs bg-slate-200 dark:bg-slate-600 px-2 py-0.5 border border-slate-300 dark:border-slate-500">
                      {EMOJI_OPTIONS.length - 3} more
                    </span>
                  </button>
                </>
              ) : (
                <div className="max-h-[300px] overflow-y-auto">
                  <div className="grid grid-cols-8 sm:grid-cols-10 gap-1.5">
                    {EMOJI_OPTIONS.map((emoji, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon: emoji })}
                        className={`
                          w-9 h-9 text-lg flex items-center justify-center rounded
                          transition-all duration-150 border
                          ${formData.icon === emoji
                            ? 'bg-primary text-white border-primary shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 hover:border-primary/40 hover:bg-slate-100 dark:hover:bg-slate-600'
                          }
                        `}
                        title={`Select ${emoji}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowMoreEmojis(false)}
                    className="w-full mt-3 py-2 px-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium transition-colors duration-150 border border-slate-300 dark:border-slate-600 text-sm rounded"
                  >
                    Show Less
                  </button>
                </div>
              )}
            </div>
            <p className="text-xs text-slate-500">Click an emoji to select it</p>
          </div>

          {/* Preview */}
          <div className="bg-white dark:bg-slate-800 border-l-4 border-primary p-4 border border-slate-300 dark:border-slate-600">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-3xl border border-slate-300 dark:border-slate-600">
                {formData.icon}
              </div>
              <div className="flex-1">
                <div className="font-bold text-base text-slate-900 dark:text-slate-100 mb-1">{formData.name}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                  {durationInput || formData.durationMinutes} minutes • After Period {formData.afterPeriod}
                </div>
              </div>
            </div>
          </div>

          {/* Info Display */}
          {!isNew && (
            <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 p-4 space-y-2 text-sm">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Day:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{DAYS[formData.dayOfWeek - 1]?.label}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Type:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100 capitalize">{formData.type.replace('_', ' ')}</span>
              </div>
            </div>
          )}
        </div>

        <DrawerFooter className="bg-white dark:bg-slate-900 border-t border-slate-300 dark:border-slate-600 px-6 py-4 gap-3">
          <div className="flex items-center justify-between w-full gap-3">
            {!isNew && (
              <Button
                variant="destructive"
                onClick={handleDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium h-10 border border-red-700 rounded"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
            <div className={`flex gap-3 ${!isNew ? 'flex-1 justify-end' : 'w-full'}`}>
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isSaving}
                className="flex-1 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium h-10 rounded"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!formData.name.trim() || isSaving}
                className="flex-1 bg-primary hover:bg-primary/90 text-white font-medium h-10 border border-primary disabled:opacity-50 rounded"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin mr-2"></div>
                    Creating...
                  </>
                ) : (
                  isNew ? 'Add Break' : 'Save Changes'
                )}
              </Button>
            </div>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

