'use client';

import React, { useState, useEffect } from 'react';
import { useTimetableStore } from '@/lib/stores/useTimetableStoreNew';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Clock, Calendar, RefreshCw, Edit, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';

interface WeekTemplate {
  id: string;
  name: string;
  numberOfDays: number;
  termId?: string;
  term?: {
    name: string;
    startDate: string;
    endDate: string;
  };
  dayTemplates?: Array<{
    id: string;
    dayOfWeek: number;
    startTime: string;
    periodCount: number;
    gradeLevels?: Array<{ id: string; name: string }>;
    streams?: Array<{ id: string; stream: { name: string } }>;
    periods?: Array<{
      id: string;
      periodNumber: number;
      startTime: string;
      endTime: string;
    }>;
  }>;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function WeekTemplateManager() {
  const { loadWeekTemplates, updateWeekTemplate, rebuildWeekTemplatePeriods } = useTimetableStore();
  const { toast } = useToast();
  
  const [templates, setTemplates] = useState<WeekTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<WeekTemplate | null>(null);
  
  // Update dialog state
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [updateStartTime, setUpdateStartTime] = useState('08:00');
  
  // Rebuild dialog state
  const [showRebuildDialog, setShowRebuildDialog] = useState(false);
  const [rebuildStartTime, setRebuildStartTime] = useState('08:00');
  const [rebuildPeriodCount, setRebuildPeriodCount] = useState(8);
  const [rebuildPeriodDuration, setRebuildPeriodDuration] = useState(40);
  const [showForceConfirm, setShowForceConfirm] = useState(false);
  const [rebuildError, setRebuildError] = useState<string | null>(null);

  // Load templates on mount
  useEffect(() => {
    loadTemplates(false);
  }, []);

  const loadTemplates = async (includeDetails = false) => {
    setLoading(true);
    try {
      const result = await loadWeekTemplates(includeDetails);
      setTemplates(result);
      setShowDetails(includeDetails);
      toast({
        title: 'Success',
        description: `Loaded ${result.length} week template(s)`,
      });
    } catch (error) {
      console.error('Failed to load week templates:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load week templates',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTemplate = async () => {
    if (!selectedTemplate) return;
    
    setLoading(true);
    try {
      const result = await updateWeekTemplate({
        id: selectedTemplate.id,
        defaultStartTime: updateStartTime,
      });
      
      toast({
        title: 'Success',
        description: 'Week template updated successfully',
      });
      
      setShowUpdateDialog(false);
      // Reload templates with details to see the changes
      await loadTemplates(true);
    } catch (error) {
      console.error('Failed to update week template:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update week template',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRebuildPeriods = async (force = false) => {
    if (!selectedTemplate) return;
    
    setLoading(true);
    setRebuildError(null);
    
    try {
      const result = await rebuildWeekTemplatePeriods({
        id: selectedTemplate.id,
        startTime: rebuildStartTime,
        periodCount: rebuildPeriodCount,
        periodDuration: rebuildPeriodDuration,
        force,
      });
      
      toast({
        title: 'Success',
        description: 'Week template periods rebuilt successfully',
      });
      
      setShowRebuildDialog(false);
      setShowForceConfirm(false);
      // Reload templates with details to see the changes
      await loadTemplates(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to rebuild periods';
      
      // Check if this is the "entries exist" error
      if (errorMessage.includes('cannot rebuild periods') && errorMessage.includes('timetable entries exist')) {
        setRebuildError(errorMessage);
        setShowForceConfirm(true);
      } else {
        console.error('Failed to rebuild week template periods:', error);
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
        setShowRebuildDialog(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const openUpdateDialog = (template: WeekTemplate) => {
    setSelectedTemplate(template);
    // Try to get start time from first day template if available
    const firstDay = template.dayTemplates?.[0];
    if (firstDay?.startTime) {
      setUpdateStartTime(firstDay.startTime.substring(0, 5)); // Get HH:mm from HH:mm:ss
    }
    setShowUpdateDialog(true);
  };

  const openRebuildDialog = (template: WeekTemplate) => {
    setSelectedTemplate(template);
    setRebuildError(null);
    const firstDay = template.dayTemplates?.[0];
    if (firstDay) {
      setRebuildStartTime(firstDay.startTime.substring(0, 5));
      setRebuildPeriodCount(firstDay.periodCount || 8);
    }
    setShowRebuildDialog(true);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Week Template Manager
          </CardTitle>
          <CardDescription>
            View and manage weekly timetable templates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={() => loadTemplates(false)} 
              disabled={loading}
              variant="outline"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Load Templates (Basic)
                </>
              )}
            </Button>
            <Button 
              onClick={() => loadTemplates(true)} 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Load Templates (Full Details)
                </>
              )}
            </Button>
          </div>

          {templates.length === 0 && !loading && (
            <p className="text-sm text-muted-foreground">
              No week templates found. Click the button above to load templates.
            </p>
          )}

          {templates.length > 0 && (
            <div className="space-y-4">
              {templates.map((template) => (
                <Card key={template.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription>
                          {template.numberOfDays} days
                          {template.term && ` • ${template.term.name}`}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openUpdateDialog(template)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Update Time
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openRebuildDialog(template)}
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Rebuild Periods
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  {showDetails && template.dayTemplates && (
                    <CardContent>
                      <div className="space-y-3">
                        {template.dayTemplates
                          .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
                          .map((day) => (
                            <div key={day.id} className="border rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">
                                    {DAYS[day.dayOfWeek - 1]}
                                  </Badge>
                                  <span className="text-sm font-medium">
                                    <Clock className="inline h-3 w-3 mr-1" />
                                    {day.startTime}
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    {day.periodCount} periods
                                  </span>
                                </div>
                              </div>
                              
                              {day.gradeLevels && day.gradeLevels.length > 0 && (
                                <div className="text-xs text-muted-foreground mb-1">
                                  Grades: {day.gradeLevels.map(g => g.name).join(', ')}
                                </div>
                              )}
                              
                              {day.periods && day.periods.length > 0 && (
                                <div className="grid grid-cols-4 gap-2 mt-2">
                                  {day.periods.map((period) => (
                                    <div 
                                      key={period.id}
                                      className="text-xs bg-muted rounded p-2"
                                    >
                                      <div className="font-medium">Period {period.periodNumber}</div>
                                      <div className="text-muted-foreground">
                                        {period.startTime.substring(0, 5)} - {period.endTime.substring(0, 5)}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Update Template Dialog */}
      <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Week Template</DialogTitle>
            <DialogDescription>
              Update the default start time for {selectedTemplate?.name}. This will reset all day templates and periods.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="update-start-time">Default Start Time</Label>
              <Input
                id="update-start-time"
                type="time"
                value={updateStartTime}
                onChange={(e) => setUpdateStartTime(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpdateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateTemplate} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rebuild Periods Dialog */}
      <Dialog open={showRebuildDialog} onOpenChange={setShowRebuildDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rebuild Week Template Periods</DialogTitle>
            <DialogDescription>
              This will delete all existing periods and recreate them with new settings.
              {!showForceConfirm && ' This may delete existing timetable data.'}
            </DialogDescription>
          </DialogHeader>
          
          {rebuildError && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm text-destructive">
              {rebuildError}
            </div>
          )}
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rebuild-start-time">Start Time</Label>
              <Input
                id="rebuild-start-time"
                type="time"
                value={rebuildStartTime}
                onChange={(e) => setRebuildStartTime(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="rebuild-period-count">Number of Periods</Label>
              <Input
                id="rebuild-period-count"
                type="number"
                min="1"
                max="20"
                value={rebuildPeriodCount}
                onChange={(e) => setRebuildPeriodCount(parseInt(e.target.value))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="rebuild-period-duration">Period Duration (minutes)</Label>
              <Input
                id="rebuild-period-duration"
                type="number"
                min="5"
                max="180"
                step="5"
                value={rebuildPeriodDuration}
                onChange={(e) => setRebuildPeriodDuration(parseInt(e.target.value))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowRebuildDialog(false);
              setShowForceConfirm(false);
              setRebuildError(null);
            }}>
              Cancel
            </Button>
            {showForceConfirm ? (
              <Button 
                variant="destructive" 
                onClick={() => handleRebuildPeriods(true)} 
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Force Rebuild (Delete Data)
              </Button>
            ) : (
              <Button onClick={() => handleRebuildPeriods(false)} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Rebuild Periods
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

