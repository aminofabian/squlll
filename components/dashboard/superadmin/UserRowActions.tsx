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
      <div className="hidden items-center justify-end gap-1 sm:flex">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2.5 text-xs rounded-lg"
          onClick={onToggleStatus}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
          ) : isActive ? (
            <XCircle className="mr-1 h-3.5 w-3.5 text-amber-500" />
          ) : (
            <CheckCircle className="mr-1 h-3.5 w-3.5 text-green-500" />
          )}
          {isActive ? "Suspend" : "Activate"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 rounded-lg px-2.5 text-xs text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
          onClick={onDelete}
          disabled={loading}
        >
          <Trash2 className="mr-1 h-3.5 w-3.5" />
          Delete
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
