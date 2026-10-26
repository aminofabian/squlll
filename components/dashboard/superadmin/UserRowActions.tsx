"use client";

import {
  CheckCircle,
  Loader2,
  MoreHorizontal,
  Trash2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserRowActionsProps {
  status: string;
  loading?: boolean;
  onToggleStatus: () => void;
  onDelete: () => void;
}

export function UserRowActions({
  status,
  loading,
  onToggleStatus,
  onDelete,
}: UserRowActionsProps) {
  const isActive = status === "ACTIVE";

  return (
    <>
      <div className="hidden items-center justify-end gap-0.5 sm:flex">
        <Button
          variant="ghost"
          size="sm"
          title={isActive ? "Suspend user" : "Activate user"}
          aria-label={isActive ? "Suspend user" : "Activate user"}
          className="h-8 w-8 rounded-lg p-0"
          onClick={onToggleStatus}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : isActive ? (
            <XCircle className="h-3.5 w-3.5 text-amber-500" />
          ) : (
            <CheckCircle className="h-3.5 w-3.5 text-green-500" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          title="Delete user"
          aria-label="Delete user"
          className="h-8 w-8 rounded-lg p-0 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
          onClick={onDelete}
          disabled={loading}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="flex justify-end sm:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 rounded-lg p-0"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MoreHorizontal className="h-4 w-4" />
              )}
              <span className="sr-only">Open actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={onToggleStatus}>
              {isActive ? (
                <>
                  <XCircle className="mr-2 h-4 w-4 text-amber-500" />
                  Suspend user
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  Activate user
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onDelete}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete user
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
