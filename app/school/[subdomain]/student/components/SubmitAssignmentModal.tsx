"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  Upload,
  FileText,
  Calendar,
  User,
  CheckCircle,
  Loader2,
  Trash2,
  Timer,
} from "lucide-react";
import { startMyTest } from '@/lib/student/studentTests';
import { useTestTimer } from '@/lib/student/useTestTimer';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { StudentAssignmentItem } from '@/lib/student/types';

interface SubmitAssignmentModalProps {
  subdomain: string;
  assignment: StudentAssignmentItem;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    assignmentId: string,
    files: File[],
    comments: string,
  ) => Promise<void>;
}

export default function SubmitAssignmentModal({
  subdomain,
  assignment,
  isOpen,
  onClose,
  onSubmit,
}: SubmitAssignmentModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [startedAt, setStartedAt] = useState<string | null>(
    assignment.startedAt ?? null,
  );
  const [startingTest, setStartingTest] = useState(false);

  const duration = assignment.duration ?? 0;
  const { remainingLabel, isExpired, hasTimer } = useTestTimer(
    duration,
    startedAt,
  );

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (hasTimer && isExpired) {
      toast.error('Test time limit has expired. You can no longer submit.');
      return;
    }

    if (selectedFiles.length === 0 && !comments.trim()) {
      toast.error("Please add a file or comments to submit.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(assignment.id, selectedFiles, comments);
      // Reset form
      setSelectedFiles([]);
      setComments("");
      onClose();
    } catch (error) {
      console.error("Error submitting assignment:", error);
      toast.error("Failed to submit assignment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!isOpen || !subdomain || startedAt || duration <= 0) return;

    let cancelled = false;
    const run = async () => {
      setStartingTest(true);
      try {
        const submission = await startMyTest(subdomain, assignment.id);
        if (!cancelled && submission.started_at) {
          setStartedAt(submission.started_at);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to start test timer';
        toast.error(msg);
      } finally {
        if (!cancelled) setStartingTest(false);
      }
    };
    void run();

    return () => {
      cancelled = true;
    };
  }, [isOpen, subdomain, assignment.id, startedAt, duration]);

  // Auto-submit when timer expires
  useEffect(() => {
    if (!hasTimer || !isExpired || isSubmitting) return;
    if (selectedFiles.length === 0 && !comments.trim()) {
      toast.error('Time expired. No work was submitted.');
      onClose();
      return;
    }
    toast.warning('Time expired — auto-submitting your work…');
    const timer = setTimeout(() => {
      void handleSubmit();
    }, 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExpired, hasTimer]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="max-h-[90vh] w-full max-w-2xl overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-base font-semibold text-foreground">
            Submit Assignment
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close"
            disabled={isSubmitting}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Assignment Details */}
          <div className="space-y-3 rounded-lg border border-border bg-muted/50 p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-foreground">
                {assignment.title}
              </h3>
              <Badge variant="secondary">{assignment.subject}</Badge>
            </div>

            <p className="text-sm text-muted-foreground">
              {assignment.description}
            </p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>
                  Due: {new Date(assignment.dueDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <User className="h-4 w-4" />
                <span>{assignment.teacher}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FileText className="h-4 w-4" />
                <span>Max score: {assignment.maxScore}</span>
              </div>
            </div>

            {hasTimer ? (
              <div
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium",
                  isExpired
                    ? 'bg-destructive/10 text-destructive'
                    : startingTest
                      ? 'bg-muted text-muted-foreground'
                      : 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
                )}
              >
                <Timer className="h-4 w-4" />
                {startingTest
                  ? 'Starting timed session...'
                  : isExpired
                    ? 'Time expired — submission blocked'
                    : `Time remaining: ${remainingLabel}`}
              </div>
            ) : null}

            {assignment.attachments && assignment.attachments.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">
                  Required materials
                </p>
                <div className="flex flex-wrap gap-2">
                  {assignment.attachments.map((attachment, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {attachment}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* File Upload */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Upload files</Label>

            <div
              className={cn(
                "rounded-lg border-2 border-dashed p-6 text-center transition-colors",
                dragActive
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50",
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="mx-auto mb-3 h-7 w-7 text-muted-foreground" />
              <p className="mb-3 text-sm text-muted-foreground">
                Drag and drop files here, or click to browse
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("file-upload")?.click()}
                disabled={isSubmitting}
              >
                Choose files
              </Button>
              <input
                id="file-upload"
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.zip,.rar"
              />
            </div>

            {/* Selected Files */}
            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Selected files</Label>
                <div className="space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between gap-3 rounded-lg bg-muted/50 p-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">
                            {file.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFile(index)}
                        className="h-8 w-8 shrink-0"
                        aria-label={`Remove ${file.name}`}
                        disabled={isSubmitting}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Comments */}
          <div className="space-y-2">
            <Label htmlFor="comments" className="text-sm font-medium">
              Comments (optional)
            </Label>
            <Textarea
              id="comments"
              placeholder="Add any comments or notes about your submission..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                isSubmitting ||
                startingTest ||
                isExpired ||
                (selectedFiles.length === 0 && !comments.trim())
              }
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Submit Assignment
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
