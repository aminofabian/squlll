"use client";

import { useCallback, useEffect, useState } from "react";
import { getCookie } from "@/lib/utils";
import {
  changeSuperAdminPassword,
  fetchPlatformHealth,
  type PlatformHealth,
  type SuperAdminAccount,
} from "./settingsApi";

function readAccountFromCookies(): SuperAdminAccount {
  const email = getCookie("email");
  const name = getCookie("userName");
  const role = getCookie("userRole");

  return {
    email: email ? decodeURIComponent(email) : "",
    name: name ? decodeURIComponent(name) : "",
    role: role ? decodeURIComponent(role).replace(/_/g, " ") : "Super admin",
  };
}

export function useSuperAdminSettings() {
  const [account, setAccount] = useState<SuperAdminAccount | null>(null);
  const [health, setHealth] = useState<PlatformHealth | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(true);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    setAccount(readAccountFromCookies());
  }, []);

  const refreshHealth = useCallback(async () => {
    setLoadingHealth(true);
    setHealthError(null);
    try {
      const next = await fetchPlatformHealth();
      setHealth(next);
    } catch (err) {
      setHealthError(
        err instanceof Error ? err.message : "Failed to check platform health",
      );
    } finally {
      setLoadingHealth(false);
    }
  }, []);

  useEffect(() => {
    refreshHealth();
  }, [refreshHealth]);

  const updatePassword = useCallback(
    async (input: {
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
    }) => {
      setChangingPassword(true);
      try {
        return await changeSuperAdminPassword(input);
      } finally {
        setChangingPassword(false);
      }
    },
    [],
  );

  return {
    account,
    health,
    loadingHealth,
    healthError,
    changingPassword,
    refreshHealth,
    updatePassword,
  };
}
