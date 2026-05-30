"use client";

import { useCallback, useState } from "react";
import {
  ADMIN_CHANGE_USER_PASSWORD_MUTATION,
  DELETE_TEACHER_MUTATION,
  graphqlRequest,
} from "@/lib/graphql/teacherAdmin";

export function useTeacherAdminActions() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSettingPassword, setIsSettingPassword] = useState(false);

  const deleteTeacherRecord = useCallback(
    async (teacherId: string, tenantId: string) => {
      if (!teacherId?.trim()) {
        throw new Error("Teacher ID is required");
      }
      if (!tenantId?.trim()) {
        throw new Error("Tenant ID is required");
      }

      setIsDeleting(true);
      try {
        await graphqlRequest<{ deleteTeacher: string }>(
          DELETE_TEACHER_MUTATION,
          { id: teacherId, tenantId },
        );
      } finally {
        setIsDeleting(false);
      }
    },
    [],
  );

  const setTeacherPassword = useCallback(
    async (userId: string, newPassword: string) => {
      if (!userId?.trim()) {
        throw new Error("User account is required to set a password");
      }
      if (newPassword.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      setIsSettingPassword(true);
      try {
        const data = await graphqlRequest<{
          adminChangeUserPassword: boolean;
        }>(ADMIN_CHANGE_USER_PASSWORD_MUTATION, {
          userId,
          newPassword,
        });

        if (!data.adminChangeUserPassword) {
          throw new Error("Failed to update password");
        }
      } finally {
        setIsSettingPassword(false);
      }
    },
    [],
  );

  return {
    deleteTeacherRecord,
    setTeacherPassword,
    isDeleting,
    isSettingPassword,
  };
}
