"use client";

import { useCallback, useState } from "react";
import {
  ADMIN_CHANGE_USER_PASSWORD_MUTATION,
  graphqlRequest,
} from "@/lib/graphql/teacherAdmin";

export function useStudentAdminActions() {
  const [isSettingPassword, setIsSettingPassword] = useState(false);

  const setStudentPassword = useCallback(
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
    setStudentPassword,
    isSettingPassword,
  };
}
